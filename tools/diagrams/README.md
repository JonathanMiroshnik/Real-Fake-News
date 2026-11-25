# Diagrams

Mermaid → inline-SVG figures for the `explainers/` walkthroughs.

A figure here is a `.mmd` file plus one command. The output is a `<figure>` block
containing a base64 `<img>`, so the page needs no CDN and no script at view time.

```bash
node tools/diagrams/render.mjs tools/diagrams/figures/slop-meter-before.mmd \
  --out /tmp/fig1a --alt "Before state: …"
# writes /tmp/fig1a.svg and /tmp/fig1a.figure.html
```

Paste the `.figure.html` contents into the explainer and write the caption in your own
words. `--alt` is not optional in spirit: `contracts/design.md` requires alt text on
images, and the picture is invisible to a screen reader without it.

Requires Playwright's Chromium once: `npx playwright install chromium`.

## The two traps

Both fail **silently**. The file is valid, the picture is missing.

1. **Mermaid emits HTML-void `<br>`.** In an SVG document that is invalid XML, and a
   browser rejects the _entire_ image (a blank box, no error). `render.mjs` rewrites
   every `<br>` to `<br></br>`. If you hand-edit an SVG, do the same.
2. **`wrappingWidth` must live in the `.mmd`.** A `%%{init}%%` directive in the source
   _overrides_ `mermaid.initialize()`. Setting it only in JS looks applied and is not.

Two more that cost time here:

3. **`<svg width="100%">` has no intrinsic size**, so an `<img>` renders it at the
   300×150 fallback. `render.mjs` pins `width`/`height` from the `viewBox`.
4. **Do not add a second `style` attribute** to the root `<svg>`; Mermaid already sets
   one, and a duplicate is "Attribute style redefined" — the whole image dies.

## Always check the picture, not the file

"SVG written" means nothing. Load it through the `<img>` path and read `naturalWidth`:

```js
const img = document.querySelector('figure img');
img.naturalWidth > 0 ? 'ok' : 'broken';
```

`check.mjs <file.mmd>` renders and reports overlapping or out-of-canvas labels; it
exits non-zero, so it can gate a build. Mermaid never reports collisions itself — a
label sitting on a stroke renders "fine" and reads wrong.

## Layout is judgement, not configuration

`theme.mjs` gives you the palette, spacing and type. It does **not** give you a good
layout: that depends on your content. Things that fixed real problems:

- `wrappingWidth` 190 for dense boxes; lower it if boxes are wide and short.
- `TB` for a read-only pipeline, `LR` for lanes. Lanes (subgraphs) only help when the
  content really has that shape.
- A long edge label will drape across nodes. Break the edge, or move the fact into the
  target node's label, or drop it.
- An invisible tie (`H ~~~ W`) places two nodes on the same rank when the graph wants
  them side by side.
- Give a node 3–4 short `<br/>`-separated facts, not a paragraph.

Hand-authored inline SVG is fine for a small figure that has no graph structure —
`slop-meter-diff-review.html`'s timeline is one, at ~5 KB. Reach for Mermaid when the
content is nodes and edges, not before.

## Naming

`figures/<slug>.mmd`. Class names come from `theme.mjs`: `plain`, `added`, `bad`,
`note`, `absent`. Do not invent per-figure colours; add a class to `theme.mjs` instead,
so the next figure matches.

Note that these hex values live in `theme.mjs` because an SVG in an `<img>` inherits
nothing from the page — this is the theme layer `contracts/design.md` asks for, kept
in one file rather than copied into every diagram.
