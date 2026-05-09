export const index = 4;
let component_cache;
export const component = async () =>
  (component_cache ??= (await import('../entries/pages/articles/edit/_key_/_page.svelte.js'))
    .default);
export const imports = [
  '_app/immutable/nodes/4.jgWBSVcw.js',
  '_app/immutable/chunks/4UhCeU0a.js',
  '_app/immutable/chunks/CzCAzTT7.js',
  '_app/immutable/chunks/CvhIc73j.js',
  '_app/immutable/chunks/CL4eq0AM.js',
  '_app/immutable/chunks/CJzlUvWO.js',
  '_app/immutable/chunks/BVbjVH2H.js',
  '_app/immutable/chunks/BFMHchxU.js',
  '_app/immutable/chunks/DEZG9HIN.js',
];
export const stylesheets = ['_app/immutable/assets/4.C3PtGA9p.css'];
export const fonts = [];
