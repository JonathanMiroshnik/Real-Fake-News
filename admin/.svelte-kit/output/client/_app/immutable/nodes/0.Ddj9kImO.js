import { d as W, c as G, a as u, f as _, s as w } from '../chunks/4UhCeU0a.js';
import {
  a5 as z,
  a7 as E,
  A as T,
  E as X,
  C as Q,
  s as b,
  F,
  G as J,
  B as K,
  N as Z,
  o as L,
  $ as U,
  I as t,
  J as I,
  K as e,
  a as l,
} from '../chunks/CzCAzTT7.js';
import { h as Y, p as V, a as O, e as aa, i as sa } from '../chunks/CvhIc73j.js';
import { B as ea, a as ta, i as na, s as la } from '../chunks/CJzlUvWO.js';
import { s as ra } from '../chunks/C5ry_r2u.js';
import { b as q, g as oa } from '../chunks/CL4eq0AM.js';
function ia(m, c, ...n) {
  var p = new ea(m);
  z(() => {
    const r = c() ?? null;
    p.ensure(r, r && ((o) => r(o, ...n)));
  }, E);
}
const ca =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj4KICA8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzY2N2VlYSIvPgogIDx0ZXh0IHg9IjUwIiB5PSI3MCIgZm9udC1zaXplPSI2MCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIj5BPC90ZXh0Pgo8L3N2Zz4KCgo=';
var va = _('<link rel="icon"/>'),
  ha = _(
    '<li class="svelte-12qhfyh"><button><span class="icon svelte-12qhfyh"> </span> <span class="label svelte-12qhfyh"> </span></button></li>',
  ),
  ua = _(
    '<div class="admin-layout svelte-12qhfyh"><nav class="sidebar svelte-12qhfyh"><div class="sidebar-header svelte-12qhfyh"><h1 class="svelte-12qhfyh">Admin Panel</h1></div> <ul class="nav-list svelte-12qhfyh"></ul></nav> <main class="main-content svelte-12qhfyh"><!></main></div>',
  );
function Ia(m, c) {
  T(c, !0);
  const n = () => ta(V, '$page', p),
    [p, r] = la(),
    o = 'pwd',
    R = [
      { path: '/', label: 'Dashboard', icon: '📊' },
      { path: '/articles', label: 'Articles', icon: '📰' },
      { path: '/settings', label: 'Settings', icon: '⚙️' },
    ];
  let i = K('');
  (X(() => {
    {
      const a = n().url.searchParams.get(o);
      a !== null ? b(i, a, !0) : b(i, '', !0);
    }
  }),
    Q(() => {
      {
        const a = n().url.searchParams.get(o);
        a !== null && b(i, a, !0);
      }
    }));
  function $(a) {
    return n().url.pathname === `${q}${a}`;
  }
  function x(a) {
    const s = new URL(n().url);
    ((s.pathname = `${q}${a}`), l(i) && s.searchParams.set(o, l(i)), oa(s.toString()));
  }
  var A = G();
  Y('12qhfyh', (a) => {
    var s = va();
    (Z(() => O(s, 'href', ca)),
      L(() => {
        U.title = 'Admin Panel';
      }),
      u(a, s));
  });
  var S = F(A);
  {
    var j = (a) => {
      var s = ua(),
        f = t(s),
        y = I(t(f), 2);
      (aa(
        y,
        21,
        () => R,
        sa,
        (D, v) => {
          var d = ha(),
            h = t(d);
          let C;
          h.__click = () => x(l(v).path);
          var g = t(h),
            H = t(g, !0);
          e(g);
          var M = I(g, 2),
            k = t(M, !0);
          (e(M),
            e(h),
            e(d),
            Z(
              (N) => {
                ((C = ra(h, 1, 'nav-item svelte-12qhfyh', null, C, N)),
                  w(H, l(v).icon),
                  w(k, l(v).label));
              },
              [() => ({ active: $(l(v).path) })],
            ),
            u(D, d));
        },
      ),
        e(y),
        e(f));
      var P = I(f, 2),
        B = t(P);
      (ia(B, () => c.children), e(P), e(s), u(a, s));
    };
    na(S, (a) => {
      a(j, !1);
    });
  }
  (u(m, A), J(), r());
}
W(['click']);
export { Ia as component };
