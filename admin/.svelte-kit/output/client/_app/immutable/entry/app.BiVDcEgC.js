const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      '../nodes/0.Ddj9kImO.js',
      '../chunks/4UhCeU0a.js',
      '../chunks/CzCAzTT7.js',
      '../chunks/CvhIc73j.js',
      '../chunks/CL4eq0AM.js',
      '../chunks/CJzlUvWO.js',
      '../chunks/C5ry_r2u.js',
      '../assets/0.BisrUqhv.css',
      '../nodes/1.CRSwB4o4.js',
      '../chunks/9GrOo0P6.js',
      '../nodes/2.D0WObPfD.js',
      '../chunks/BVbjVH2H.js',
      '../chunks/BFMHchxU.js',
      '../chunks/DEZG9HIN.js',
      '../chunks/BxspXJx0.js',
      '../chunks/BFgyOq4w.js',
      '../assets/ArticleTable.Bsm767KO.css',
      '../assets/2.D4hs8wRQ.css',
      '../nodes/3.D3ysW-Ki.js',
      '../assets/3.BQfP0lxM.css',
      '../nodes/4.jgWBSVcw.js',
      '../assets/4.C3PtGA9p.css',
      '../nodes/5.Dr7l0wni.js',
      '../assets/5.CltEXzmq.css',
    ]),
) => i.map((i) => d[i]);
import {
  z as U,
  a6 as Y,
  a5 as z,
  a7 as H,
  o as J,
  y as K,
  u as Q,
  av as W,
  S as X,
  s as A,
  L as Z,
  a as d,
  aE as $,
  ag as tt,
  Q as et,
  A as rt,
  T as st,
  C as at,
  E as nt,
  B as L,
  x as ot,
  F as w,
  J as it,
  G as ct,
  I as ut,
  K as lt,
  H as S,
  N as ft,
} from '../chunks/CzCAzTT7.js';
import {
  h as dt,
  m as mt,
  u as ht,
  f as V,
  a as y,
  c as T,
  t as _t,
  s as vt,
} from '../chunks/4UhCeU0a.js';
import { B as gt, i as x } from '../chunks/CJzlUvWO.js';
import { p } from '../chunks/BFgyOq4w.js';
function C(s, t, a) {
  U && Y();
  var c = new gt(s);
  z(() => {
    var n = t() ?? null;
    c.ensure(n, n && ((e) => a(e, n)));
  }, H);
}
function D(s, t) {
  return s === t || s?.[X] === t;
}
function j(s = {}, t, a, c) {
  return (
    J(() => {
      var n, e;
      return (
        K(() => {
          ((n = e),
            (e = []),
            Q(() => {
              s !== a(...e) && (t(s, ...e), n && D(a(...n), s) && t(null, ...n));
            }));
        }),
        () => {
          W(() => {
            e && D(a(...e), s) && t(null, ...e);
          });
        }
      );
    }),
    s
  );
}
function Et(s) {
  return class extends yt {
    constructor(t) {
      super({ component: s, ...t });
    }
  };
}
class yt {
  #e;
  #t;
  constructor(t) {
    var a = new Map(),
      c = (e, r) => {
        var o = et(r, !1, !1);
        return (a.set(e, o), o);
      };
    const n = new Proxy(
      { ...(t.props || {}), $$events: {} },
      {
        get(e, r) {
          return d(a.get(r) ?? c(r, Reflect.get(e, r)));
        },
        has(e, r) {
          return r === Z ? !0 : (d(a.get(r) ?? c(r, Reflect.get(e, r))), Reflect.has(e, r));
        },
        set(e, r, o) {
          return (A(a.get(r) ?? c(r, o), o), Reflect.set(e, r, o));
        },
      },
    );
    ((this.#t = (t.hydrate ? dt : mt)(t.component, {
      target: t.target,
      anchor: t.anchor,
      props: n,
      context: t.context,
      intro: t.intro ?? !1,
      recover: t.recover,
    })),
      (!t?.props?.$$host || t.sync === !1) && $(),
      (this.#e = n.$$events));
    for (const e of Object.keys(this.#t))
      e === '$set' ||
        e === '$destroy' ||
        e === '$on' ||
        tt(this, e, {
          get() {
            return this.#t[e];
          },
          set(r) {
            this.#t[e] = r;
          },
          enumerable: !0,
        });
    ((this.#t.$set = (e) => {
      Object.assign(n, e);
    }),
      (this.#t.$destroy = () => {
        ht(this.#t);
      }));
  }
  $set(t) {
    this.#t.$set(t);
  }
  $on(t, a) {
    this.#e[t] = this.#e[t] || [];
    const c = (...n) => a.call(this, ...n);
    return (
      this.#e[t].push(c),
      () => {
        this.#e[t] = this.#e[t].filter((n) => n !== c);
      }
    );
  }
  $destroy() {
    this.#t.$destroy();
  }
}
const bt = 'modulepreload',
  Pt = function (s, t) {
    return new URL(s, t).href;
  },
  N = {},
  b = function (t, a, c) {
    let n = Promise.resolve();
    if (a && a.length > 0) {
      let O = function (u) {
        return Promise.all(
          u.map((f) =>
            Promise.resolve(f).then(
              (m) => ({ status: 'fulfilled', value: m }),
              (m) => ({ status: 'rejected', reason: m }),
            ),
          ),
        );
      };
      const r = document.getElementsByTagName('link'),
        o = document.querySelector('meta[property=csp-nonce]'),
        k = o?.nonce || o?.getAttribute('nonce');
      n = O(
        a.map((u) => {
          if (((u = Pt(u, c)), u in N)) return;
          N[u] = !0;
          const f = u.endsWith('.css'),
            m = f ? '[rel="stylesheet"]' : '';
          if (c)
            for (let h = r.length - 1; h >= 0; h--) {
              const i = r[h];
              if (i.href === u && (!f || i.rel === 'stylesheet')) return;
            }
          else if (document.querySelector(`link[href="${u}"]${m}`)) return;
          const l = document.createElement('link');
          if (
            ((l.rel = f ? 'stylesheet' : bt),
            f || (l.as = 'script'),
            (l.crossOrigin = ''),
            (l.href = u),
            k && l.setAttribute('nonce', k),
            document.head.appendChild(l),
            f)
          )
            return new Promise((h, i) => {
              (l.addEventListener('load', h),
                l.addEventListener('error', () => i(new Error(`Unable to preload CSS for ${u}`))));
            });
        }),
      );
    }
    function e(r) {
      const o = new Event('vite:preloadError', { cancelable: !0 });
      if (((o.payload = r), window.dispatchEvent(o), !o.defaultPrevented)) throw r;
    }
    return n.then((r) => {
      for (const o of r || []) o.status === 'rejected' && e(o.reason);
      return t().catch(e);
    });
  },
  pt = {};
var Rt = V(
    '<div id="svelte-announcer" aria-live="assertive" aria-atomic="true" style="position: absolute; left: 0; top: 0; clip: rect(0 0 0 0); clip-path: inset(50%); overflow: hidden; white-space: nowrap; width: 1px; height: 1px"><!></div>',
  ),
  kt = V('<!> <!>', 1);
function Ot(s, t) {
  rt(t, !0);
  let a = p(t, 'components', 23, () => []),
    c = p(t, 'data_0', 3, null),
    n = p(t, 'data_1', 3, null);
  (st(() => t.stores.page.set(t.page)),
    at(() => {
      (t.stores, t.page, t.constructors, a(), t.form, c(), n(), t.stores.page.notify());
    }));
  let e = L(!1),
    r = L(!1),
    o = L(null);
  nt(() => {
    const i = t.stores.page.subscribe(() => {
      d(e) &&
        (A(r, !0),
        ot().then(() => {
          A(o, document.title || 'untitled page', !0);
        }));
    });
    return (A(e, !0), i);
  });
  const k = S(() => t.constructors[1]);
  var O = kt(),
    u = w(O);
  {
    var f = (i) => {
        const _ = S(() => t.constructors[0]);
        var v = T(),
          P = w(v);
        (C(
          P,
          () => d(_),
          (g, E) => {
            j(
              E(g, {
                get data() {
                  return c();
                },
                get form() {
                  return t.form;
                },
                get params() {
                  return t.page.params;
                },
                children: (R, At) => {
                  var I = T(),
                    M = w(I);
                  (C(
                    M,
                    () => d(k),
                    (q, F) => {
                      j(
                        F(q, {
                          get data() {
                            return n();
                          },
                          get form() {
                            return t.form;
                          },
                          get params() {
                            return t.page.params;
                          },
                        }),
                        (G) => (a()[1] = G),
                        () => a()?.[1],
                      );
                    },
                  ),
                    y(R, I));
                },
                $$slots: { default: !0 },
              }),
              (R) => (a()[0] = R),
              () => a()?.[0],
            );
          },
        ),
          y(i, v));
      },
      m = (i) => {
        const _ = S(() => t.constructors[0]);
        var v = T(),
          P = w(v);
        (C(
          P,
          () => d(_),
          (g, E) => {
            j(
              E(g, {
                get data() {
                  return c();
                },
                get form() {
                  return t.form;
                },
                get params() {
                  return t.page.params;
                },
              }),
              (R) => (a()[0] = R),
              () => a()?.[0],
            );
          },
        ),
          y(i, v));
      };
    x(u, (i) => {
      t.constructors[1] ? i(f) : i(m, !1);
    });
  }
  var l = it(u, 2);
  {
    var h = (i) => {
      var _ = Rt(),
        v = ut(_);
      {
        var P = (g) => {
          var E = _t();
          (ft(() => vt(E, d(o))), y(g, E));
        };
        x(v, (g) => {
          d(r) && g(P);
        });
      }
      (lt(_), y(i, _));
    };
    x(l, (i) => {
      d(e) && i(h);
    });
  }
  (y(s, O), ct());
}
const Ct = Et(Ot),
  jt = [
    () =>
      b(
        () => import('../nodes/0.Ddj9kImO.js'),
        __vite__mapDeps([0, 1, 2, 3, 4, 5, 6, 7]),
        import.meta.url,
      ),
    () =>
      b(() => import('../nodes/1.CRSwB4o4.js'), __vite__mapDeps([8, 1, 2, 9, 4]), import.meta.url),
    () =>
      b(
        () => import('../nodes/2.D0WObPfD.js'),
        __vite__mapDeps([10, 1, 2, 3, 4, 5, 11, 12, 13, 14, 6, 15, 16, 17]),
        import.meta.url,
      ),
    () =>
      b(
        () => import('../nodes/3.D3ysW-Ki.js'),
        __vite__mapDeps([18, 1, 2, 5, 3, 4, 12, 13, 14, 6, 15, 16, 19]),
        import.meta.url,
      ),
    () =>
      b(
        () => import('../nodes/4.jgWBSVcw.js'),
        __vite__mapDeps([20, 1, 2, 3, 4, 5, 11, 12, 13, 21]),
        import.meta.url,
      ),
    () =>
      b(
        () => import('../nodes/5.Dr7l0wni.js'),
        __vite__mapDeps([22, 1, 2, 9, 3, 4, 5, 11, 13, 23]),
        import.meta.url,
      ),
  ],
  It = [],
  Dt = { '/': [2], '/articles': [3], '/articles/edit/[key]': [4], '/settings': [5] },
  B = {
    handleError: ({ error: s }) => {
      console.error(s);
    },
    reroute: () => {},
    transport: {},
  },
  wt = Object.fromEntries(Object.entries(B.transport).map(([s, t]) => [s, t.decode])),
  Nt = Object.fromEntries(Object.entries(B.transport).map(([s, t]) => [s, t.encode])),
  Vt = !1,
  Bt = (s, t) => wt[s](t);
export {
  Bt as decode,
  wt as decoders,
  Dt as dictionary,
  Nt as encoders,
  Vt as hash,
  B as hooks,
  pt as matchers,
  jt as nodes,
  Ct as root,
  It as server_loads,
};
