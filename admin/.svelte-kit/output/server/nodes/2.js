export const index = 2;
let component_cache;
export const component = async () =>
  (component_cache ??= (await import('../entries/pages/_page.svelte.js')).default);
export const imports = [
  '_app/immutable/nodes/2.D0WObPfD.js',
  '_app/immutable/chunks/4UhCeU0a.js',
  '_app/immutable/chunks/CzCAzTT7.js',
  '_app/immutable/chunks/CvhIc73j.js',
  '_app/immutable/chunks/CL4eq0AM.js',
  '_app/immutable/chunks/CJzlUvWO.js',
  '_app/immutable/chunks/BVbjVH2H.js',
  '_app/immutable/chunks/BFMHchxU.js',
  '_app/immutable/chunks/DEZG9HIN.js',
  '_app/immutable/chunks/BxspXJx0.js',
  '_app/immutable/chunks/C5ry_r2u.js',
  '_app/immutable/chunks/BFgyOq4w.js',
];
export const stylesheets = [
  '_app/immutable/assets/ArticleTable.Bsm767KO.css',
  '_app/immutable/assets/2.D4hs8wRQ.css',
];
export const fonts = [];
