export const index = 0;
let component_cache;
export const component = async () =>
  (component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default);
export const imports = [
  '_app/immutable/nodes/0.Ddj9kImO.js',
  '_app/immutable/chunks/4UhCeU0a.js',
  '_app/immutable/chunks/CzCAzTT7.js',
  '_app/immutable/chunks/CvhIc73j.js',
  '_app/immutable/chunks/CL4eq0AM.js',
  '_app/immutable/chunks/CJzlUvWO.js',
  '_app/immutable/chunks/C5ry_r2u.js',
];
export const stylesheets = ['_app/immutable/assets/0.BisrUqhv.css'];
export const fonts = [];
