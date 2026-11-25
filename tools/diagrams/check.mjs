/**
 * Geometry checks for a rendered diagram.
 *
 * Mermaid never warns about collisions, so a label sitting on a stroke looks fine to
 * the renderer and wrong to the reader. This loads a `.mmd`, renders it at a real
 * size, and reports labels that overlap each other or fall outside the canvas.
 *
 *   node tools/diagrams/check.mjs figures/1a-read-write.mmd
 *
 * Exits non-zero when something overlaps, so it can gate a build.
 */
import { readFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const CDN = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';

const CHECKS = String.raw`
(() => {
  const root = document.querySelector("#out svg");
  if (!root) return { error: "no svg" };
  const canvas = root.getBoundingClientRect();

  const boxes = [];
  // "g.node" skips nodes nested inside a subgraph, which undercounts the figure and
  // makes a collision check pass when it should fail. ".nodeLabel" is the actual text
  // box for every node, clustered or not.
  const elements = [
    ...[...root.querySelectorAll(".nodeLabel")].map((el) => ({ el, kind: "node" })),
    ...[...root.querySelectorAll("g.edgeLabel")].map((el) => ({ el, kind: "edge" })),
  ];
  const nodes = elements.map(({ el, kind }, index) => ({
    el, index, kind, box: el.getBoundingClientRect(),
  }));

  const overlaps = [];
  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const a = nodes[i].box;
      const b = nodes[j].box;
      const x = Math.min(a.right, b.right) - Math.max(a.left, b.left);
      const y = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      // A few pixels of touch is rounding, not a collision.
      if (x > 2 && y > 2) overlaps.push({ a: nodes[i].index, b: nodes[j].index, x: Math.round(x), y: Math.round(y) });
    }
  }

  const outside = nodes
    .filter((n) => n.box.left < canvas.left - 1 || n.box.top < canvas.top - 1
      || n.box.right > canvas.right + 1 || n.box.bottom > canvas.bottom + 1)
    .map((n) => n.index);

  return { nodes: nodes.length, overlaps, outside };
})()
`;

async function main() {
  const src = process.argv[2];
  if (!src) throw new Error('usage: check.mjs <file.mmd>');

  const source = readFileSync(src, 'utf8');
  const sourceTag = `<script>window.__SRC__ = ${JSON.stringify(source).replace(/</g, '\\u003c')};</script>`;
  const html = `<!doctype html><meta charset="utf-8">
<div id="out"></div>
${sourceTag}
<script type="module">
  import mermaid from ${JSON.stringify(CDN)};
  try {
    mermaid.initialize({ startOnLoad: false, securityLevel: "antiscript" });
    const { svg } = await mermaid.render("diagram", window.__SRC__);
    document.getElementById("out").innerHTML = svg;
    window.__READY__ = true;
  } catch (err) {
    window.__ERROR__ = String(err && err.stack ? err.stack : err);
  }
</script>`;

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1400, height: 1200 } });
    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.waitForFunction('window.__READY__ === true || window.__ERROR__', null, {
      timeout: 60_000,
    });

    const pageError = await page.evaluate(() => window.__ERROR__);
    if (pageError) throw new Error(`render failed: ${pageError}`);

    const result = await page.evaluate(CHECKS);
    const isClean = result.overlaps.length === 0 && result.outside.length === 0;
    console.log(`${src}: ${result.nodes} labelled elements`);
    if (result.overlaps.length) console.log('  overlaps:', JSON.stringify(result.overlaps));
    if (result.outside.length) console.log('  outside canvas:', JSON.stringify(result.outside));
    console.log(isClean ? '  OK' : '  FAILED');
    process.exitCode = isClean ? 0 : 1;
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
