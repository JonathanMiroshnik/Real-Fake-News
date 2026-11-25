/**
 * Render a Mermaid `.mmd` file to a static SVG and emit a drop-in <figure> block.
 *
 *   node tools/diagrams/render.mjs figures/1a-read-write.mmd --out /tmp/fig
 *
 * Output is self-contained: an <img> with a base64 SVG data URI, so it loads from
 * file:// with no CDN and no script. All styling is inlined inside the SVG, because
 * an SVG referenced by <img> inherits nothing from the page.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { chromium } from '@playwright/test';

const DEFAULT_MERMAID_VERSION = '11';

function parseArgs(argv) {
  const flags = { src: null, out: null, alt: '', mermaid: DEFAULT_MERMAID_VERSION };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--out') flags.out = argv[++i];
    else if (arg === '--alt') flags.alt = argv[++i];
    else if (arg === '--mermaid') flags.mermaid = argv[++i];
    else flags.src = arg;
  }
  if (!flags.src) throw new Error('usage: render.mjs <file.mmd> --out <prefix> [--alt text]');
  flags.out = flags.out ?? join(dirname(flags.src), basename(flags.src, '.mmd'));
  return flags;
}

/**
 * The page Mermaid runs in. It is served from the network via CDN only inside this
 * headless build step, never in the shipped document.
 */
function buildPage(mermaidVersion, source) {
  const cdn = `https://cdn.jsdelivr.net/npm/mermaid@${mermaidVersion}/dist/mermaid.esm.min.mjs`;
  // The source is injected as a script tag. Passing it through the URL corrupts the
  // `%%{init}%%` directive, and addInitScript does not run for setContent documents.
  const sourceTag = `<script>window.__SRC__ = ${JSON.stringify(source).replace(/</g, '\\u003c')};</script>`;
  return `<!doctype html><meta charset="utf-8">
<style>body{margin:0;background:#f7f4ee}</style>
<div id="out"></div>
${sourceTag}
<script type="module">
  import mermaid from ${JSON.stringify(cdn)};
  window.__STATE__ = { status: "imported" };
  try {
    mermaid.initialize({ startOnLoad: false, securityLevel: "antiscript" });
    const { svg } = await mermaid.render("diagram", window.__SRC__);
    document.getElementById("out").innerHTML = svg;
    window.__STATE__ = { status: "ok", svg: document.querySelector("#out svg").outerHTML };
  } catch (err) {
    window.__STATE__ = { status: "error", message: String(err && err.stack ? err.stack : err) };
  }
</script>`;
}

/**
 * Mermaid emits HTML-void <br> inside its foreignObject labels. That is invalid XML,
 * and a browser rejects the *whole* image (naturalWidth 0, a blank box, no error).
 * Re-emit it as a balanced pair.
 */
function repairBrTags(svg) {
  return svg.replace(/<br(\s*\/)?>/g, '<br></br>');
}

/**
 * Give the root <svg> an intrinsic size. Mermaid emits width="100%" plus a viewBox,
 * and an SVG with no intrinsic width loads in an <img> at the 300x150 fallback —
 * the file is valid, the picture is wrong.
 */
function pinIntrinsicSize(svg) {
  const viewBox = svg.match(/viewBox="([\d.\s-]+)"/);
  if (!viewBox) return svg;
  const [, , width, height] = viewBox[1].split(/\s+/).map(Number);
  const rounded = `width="${Math.ceil(width)}" height="${Math.ceil(height)}"`;
  return svg.replace(/<svg([^>]*?)>/, (match, attrs) => {
    // Mermaid already sets a style attribute; a second one is invalid XML and kills
    // the whole image, so merge rather than append.
    const hasStyle = /\sstyle="/.test(attrs);
    const cleaned = attrs.replace(/\s(?:width|height)="[^"]*"/g, '');
    const style = hasStyle ? '' : ' style="max-width:100%;height:auto"';
    return `<svg${cleaned} ${rounded}${style}>`;
  });
}

function stripExternalRefs(svg) {
  return svg.replace(/\s(?:xlink:)?href="(?!#)[^"]*"/g, '');
}

function buildFigure(svgMarkup, alt) {
  const dataUri = `data:image/svg+xml;base64,${Buffer.from(svgMarkup, 'utf8').toString('base64')}`;
  const escapedAlt = alt.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  return `<figure>\n<img alt="${escapedAlt}" src="${dataUri}" />\n</figure>\n`;
}

async function main() {
  const flags = parseArgs(process.argv.slice(2));
  const source = readFileSync(flags.src, 'utf8');

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1400, height: 1200 } });
    await page.setContent(buildPage(flags.mermaid, source), { waitUntil: 'networkidle' });

    const state = await page
      .waitForFunction(
        () => window.__STATE__ && window.__STATE__.status !== 'imported' && window.__STATE__,
        null,
        { timeout: 60_000 },
      )
      .then((handle) => handle.jsonValue());

    if (state.status !== 'ok') throw new Error(`render failed: ${state.message}`);
    const svg = pinIntrinsicSize(stripExternalRefs(repairBrTags(state.svg)));
    const figure = buildFigure(svg, flags.alt);

    writeFileSync(`${flags.out}.svg`, svg);
    writeFileSync(`${flags.out}.figure.html`, figure);
    console.log(`${flags.src} -> ${flags.out}.svg (${(svg.length / 1024).toFixed(1)} KB)`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
