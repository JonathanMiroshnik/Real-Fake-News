export const index = 1;
let component_cache;
export const component = async () =>
  (component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default);
export const imports = [
  '_app/immutable/nodes/1.CRSwB4o4.js',
  '_app/immutable/chunks/4UhCeU0a.js',
  '_app/immutable/chunks/CzCAzTT7.js',
  '_app/immutable/chunks/9GrOo0P6.js',
  '_app/immutable/chunks/CL4eq0AM.js',
];
export const stylesheets = [];
export const fonts = [];
