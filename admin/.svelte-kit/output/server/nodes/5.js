export const index = 5;
let component_cache;
export const component = async () =>
  (component_cache ??= (await import('../entries/pages/settings/_page.svelte.js')).default);
export const imports = [
  '_app/immutable/nodes/5.Dr7l0wni.js',
  '_app/immutable/chunks/4UhCeU0a.js',
  '_app/immutable/chunks/CzCAzTT7.js',
  '_app/immutable/chunks/9GrOo0P6.js',
  '_app/immutable/chunks/CvhIc73j.js',
  '_app/immutable/chunks/CL4eq0AM.js',
  '_app/immutable/chunks/CJzlUvWO.js',
  '_app/immutable/chunks/BVbjVH2H.js',
  '_app/immutable/chunks/DEZG9HIN.js',
];
export const stylesheets = ['_app/immutable/assets/5.CltEXzmq.css'];
export const fonts = [];
