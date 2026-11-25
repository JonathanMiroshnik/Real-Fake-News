/**
 * Shared look for every diagram in this repo. One place for the palette, spacing
 * and type, so a new figure inherits the existing quality instead of re-deriving it.
 *
 * Colours mirror the explainer CSS variables (`--paper`, `--ink`, `--add-bg`, ...).
 * `contracts/design.md` says do not hardcode hex in components; diagrams cannot use
 * the page's CSS custom properties (an SVG in an <img> inherits nothing), so this
 * module is the theme layer those figures read from.
 */

export const PALETTE = {
  paper: '#f7f4ee',
  ink: '#17181a',
  inkSoft: '#4d5157',
  rule: '#e4ded3',
  panel: '#fffefb',
  accent: '#8a1c12',
  accentText: '#a52020',
  addBg: '#e2f1e5',
  addInk: '#14431f',
  addLine: '#1d6b3a',
  warnBg: '#fbf0d8',
  warnInk: '#5c3c00',
  warnLine: '#8a5a12',
  noteBg: '#fdf4f2',
};

/** Semantic node classes. Use these names; do not invent one-off colours per figure. */
export const NODE_CLASSES = {
  plain: `fill:${PALETTE.panel},stroke:${PALETTE.inkSoft},stroke-width:1.6px,color:${PALETTE.ink}`,
  added: `fill:${PALETTE.addBg},stroke:${PALETTE.addLine},stroke-width:1.8px,color:${PALETTE.addInk}`,
  bad: `fill:${PALETTE.panel},stroke:${PALETTE.accent},stroke-width:1.8px,color:${PALETTE.accentText}`,
  note: `fill:${PALETTE.warnBg},stroke:${PALETTE.warnLine},stroke-width:1.5px,color:${PALETTE.warnInk}`,
  // An unused "problem" lane: dashed red, no fill, so it reads as absent from the flow.
  absent: `fill:${PALETTE.noteBg},stroke:${PALETTE.accent},stroke-width:1.5px,stroke-dasharray:6 4`,
};

const FONT = 'Iowan Old Style, Palatino, Georgia, serif';

/**
 * Mermaid `%%{init}%%` directive. `wrappingWidth` MUST live here: a directive in the
 * source overrides `mermaid.initialize()`, so setting it only in JS silently loses.
 */
export function buildTheme({ wrappingWidth = 190 } = {}) {
  return {
    theme: 'base',
    flowchart: {
      curve: 'linear',
      nodeSpacing: 46,
      rankSpacing: 52,
      padding: 8,
      wrappingWidth,
    },
    themeVariables: {
      fontFamily: FONT,
      fontSize: '13px',
      lineColor: PALETTE.inkSoft,
      edgeLabelBackground: PALETTE.paper,
      primaryTextColor: PALETTE.ink,
    },
  };
}

/** Render the directive line for a `.mmd` file's first line. */
export function buildDirective(options) {
  return `%%{init: ${JSON.stringify(buildTheme(options))}}%%`;
}

/** `classDef` lines for the classes a figure actually uses. */
export function buildClassDefs(names) {
  return names
    .filter((name) => NODE_CLASSES[name])
    .map((name) => `  classDef ${name} ${NODE_CLASSES[name]}`)
    .join('\n');
}
