// Guards the rules in docs/explainers.md by failing, not by advising. An agent that never read this
// session still cannot commit a diagram whose geometry was typed by hand, or one that turns to
// white-on-white when the reader's OS is in dark mode.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const EXPLAINER_DIR = "explainers";
const SOURCE_SUFFIX = ".src.html";

// A hand-placed figure is one whose SVG carries an explicit `0 0 W H` viewBox an author typed. Pele's
// output is exempt: it is generated from a `flowchart` block, and `render.mjs` writes it, so it never
// reaches this list. Small drawings count too — a 700px hand-placed graph drifts just as badly.
const HAND_DRAWN = /<svg\b[^>]*viewBox="0 0 (\d{2,} \d{2,})"/g;
const FLOWCHART = /^\s*flowchart\s+(TB|TD|BT|LR|RL)\b/m;
const MERMAID_FENCE = /```mermaid\b/;

// Hand-drawn SVGs kept on purpose, keyed by file and the viewBox an author would have to type. The
// Fig 2 timeline is a fixed-aspect drawing with no boxes-and-arrows to drift, so it is allowed; any
// *other* hand-placed SVG must be justified here by a human, which is the point of the allowlist.
const ALLOWED_HAND_DRAWN = new Map([["slop-meter-diff-review.src.html", ["1180 320"]]]);

const problems = [];
const fail = (file, message) => problems.push(`${file}: ${message}`);

/** Every explainer source page under explainers/. */
function listSources() {
  let entries;
  try {
    entries = readdirSync(EXPLAINER_DIR);
  } catch {
    return [];
  }
  return entries.filter((name) => name.endsWith(SOURCE_SUFFIX)).map((name) => join(EXPLAINER_DIR, name));
}

/** True when this viewBox was approved by a human in ALLOWED_HAND_DRAWN. */
function isAllowedHandDrawn(file, viewBox) {
  const allowed = ALLOWED_HAND_DRAWN.get(file.split("/").pop()) ?? [];
  return allowed.includes(viewBox);
}

/** A graph figure is drawn by an engine when a flowchart declaration is present. */
function hasFlowchart(text) {
  return FLOWCHART.test(text) || MERMAID_FENCE.test(text);
}

/**
 * Rules that only need the file's text. Hand-placed SVGs are checked individually rather than per
 * file, so one flowchart cannot excuse a hand-typed figure sitting elsewhere on the same page.
 */
function checkSource(file, text) {
  if (!hasFlowchart(text) && /<svg\b/.test(text)) {
    fail(file, "no `flowchart` declaration, so every graph on this page has hand-typed coordinates.");
  }

  for (const match of text.matchAll(HAND_DRAWN)) {
    const viewBox = match[1];
    if (!isAllowedHandDrawn(file, viewBox)) {
      fail(
        file,
        `hand-placed <svg viewBox="0 0 ${viewBox}">. Draw the graph as a "flowchart TB" block, ` +
          "or add this viewBox to ALLOWED_HAND_DRAWN if a human agreed it must stay hand-drawn.",
      );
    }
  }
}

/**
 * The source page only holds a `flowchart` block; the Pele SVG exists after `render.mjs` runs. Check
 * the built page too, so a missing ink pin fails here and not on the reader's dark-mode screen.
 */
function checkBuiltPage(file, sourceText) {
  const built = file.replace(SOURCE_SUFFIX, ".html");
  let builtText;
  try {
    builtText = readFileSync(built, "utf8");
  } catch {
    return; // not rendered yet; the render step is what creates it
  }
  const rendersFlow = builtText.includes('class="pele');
  const pinsDiagramInk = sourceText.includes("--pele-fg: var(--ink)");
  if (rendersFlow && !pinsDiagramInk) {
    fail(
      built,
      "renders a Pele diagram but the source does not pin --pele-fg to var(--ink). " +
        "The kit points diagram ink at --text, which flips to near-white in dark mode while Pele " +
        "paints the node pills light — white-on-white. See docs/explainers.md.",
    );
  }
}

const sources = listSources();
if (sources.length === 0) {
  console.log(`✓ check:explainers — no pages in ${EXPLAINER_DIR}/`);
  process.exit(0);
}

for (const file of sources) {
  const text = readFileSync(file, "utf8");
  checkSource(file, text);
  checkBuiltPage(file, text);
}

if (problems.length > 0) {
  console.error(`✗ check:explainers — ${problems.length} problem(s):\n`);
  for (const problem of problems) console.error(`  ${problem}`);
  console.error("\nSee docs/explainers.md for the rule behind each line above.");
  process.exit(1);
}

console.log(`✓ check:explainers — ${sources.length} page(s) pass`);
