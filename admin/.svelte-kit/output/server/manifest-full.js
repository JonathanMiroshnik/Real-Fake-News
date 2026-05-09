export const manifest = (() => {
  function __memo(fn) {
    let value;
    return () => (value ??= value = fn());
  }

  return {
    appDir: '_app',
    appPath: '_app',
    assets: new Set([]),
    mimeTypes: {},
    _: {
      client: {
        start: '_app/immutable/entry/start.BCdVqHm6.js',
        app: '_app/immutable/entry/app.BiVDcEgC.js',
        imports: [
          '_app/immutable/entry/start.BCdVqHm6.js',
          '_app/immutable/chunks/CL4eq0AM.js',
          '_app/immutable/chunks/CzCAzTT7.js',
          '_app/immutable/entry/app.BiVDcEgC.js',
          '_app/immutable/chunks/CzCAzTT7.js',
          '_app/immutable/chunks/4UhCeU0a.js',
          '_app/immutable/chunks/CJzlUvWO.js',
          '_app/immutable/chunks/BFgyOq4w.js',
        ],
        stylesheets: [],
        fonts: [],
        uses_env_dynamic_public: false,
      },
      nodes: [
        __memo(() => import('./nodes/0.js')),
        __memo(() => import('./nodes/1.js')),
        __memo(() => import('./nodes/2.js')),
        __memo(() => import('./nodes/3.js')),
        __memo(() => import('./nodes/4.js')),
        __memo(() => import('./nodes/5.js')),
      ],
      remotes: {},
      routes: [
        {
          id: '/',
          pattern: /^\/$/,
          params: [],
          page: { layouts: [0], errors: [1], leaf: 2 },
          endpoint: null,
        },
        {
          id: '/articles',
          pattern: /^\/articles\/?$/,
          params: [],
          page: { layouts: [0], errors: [1], leaf: 3 },
          endpoint: null,
        },
        {
          id: '/articles/edit/[key]',
          pattern: /^\/articles\/edit\/([^/]+?)\/?$/,
          params: [{ name: 'key', optional: false, rest: false, chained: false }],
          page: { layouts: [0], errors: [1], leaf: 4 },
          endpoint: null,
        },
        {
          id: '/settings',
          pattern: /^\/settings\/?$/,
          params: [],
          page: { layouts: [0], errors: [1], leaf: 5 },
          endpoint: null,
        },
      ],
      prerendered_routes: new Set([]),
      matchers: async () => {
        return {};
      },
      server_assets: {},
    },
  };
})();
