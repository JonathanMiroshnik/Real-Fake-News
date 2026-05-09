import { d as _e, f as p, a as l, s as d, c as me } from '../chunks/4UhCeU0a.js';
import { i as ge } from '../chunks/9GrOo0P6.js';
import {
  A as he,
  E as xe,
  I as a,
  J as r,
  N as T,
  a as i,
  G as be,
  o as we,
  Q as w,
  $ as ye,
  K as s,
  s as o,
  F as Te,
} from '../chunks/CzCAzTT7.js';
import { h as Pe, r as ke, p as $e, e as Ae, i as Ee } from '../chunks/CvhIc73j.js';
import { i as P, s as Ie, a as Me } from '../chunks/CJzlUvWO.js';
import { b as Se } from '../chunks/BVbjVH2H.js';
import { g as Ce, b as Q } from '../chunks/DEZG9HIN.js';
var Ue = p('<div class="error-banner svelte-1i19ct2"> </div>'),
  je = p('<div class="success-banner svelte-1i19ct2"> </div>'),
  De = p(
    '<div class="loading-state svelte-1i19ct2"><div class="spinner svelte-1i19ct2"></div> <p>Loading texts...</p></div>',
  ),
  Fe = p('<p class="empty svelte-1i19ct2">No texts added yet</p>'),
  Ne = p(
    '<li class="svelte-1i19ct2"><span class="text-number svelte-1i19ct2"></span> <span class="text-content svelte-1i19ct2"> </span></li>',
  ),
  Re = p('<ul class="svelte-1i19ct2"></ul>'),
  Be = p(
    '<div class="settings-page svelte-1i19ct2"><header class="page-header svelte-1i19ct2"><h1 class="svelte-1i19ct2">Settings</h1> <p class="subtitle svelte-1i19ct2">Manage text items and configuration</p></header> <!> <!> <div class="settings-grid svelte-1i19ct2"><div class="settings-card svelte-1i19ct2"><h2 class="svelte-1i19ct2">Text Management</h2> <div class="text-input-container svelte-1i19ct2"><input type="text" placeholder="Enter text to add..." class="svelte-1i19ct2"/> <button class="svelte-1i19ct2">Add Text</button></div> <div class="texts-display svelte-1i19ct2"><!></div></div> <div class="settings-card svelte-1i19ct2"><h2 class="svelte-1i19ct2">Configuration</h2> <div class="config-info svelte-1i19ct2"><div class="info-item svelte-1i19ct2"><label class="svelte-1i19ct2">API Base URL</label> <code class="svelte-1i19ct2"> </code></div> <div class="info-item svelte-1i19ct2"><label class="svelte-1i19ct2">Backend Mode</label> <code class="svelte-1i19ct2"> </code></div> <div class="info-item svelte-1i19ct2"><label class="svelte-1i19ct2">Frontend Mode</label> <code class="svelte-1i19ct2"> </code></div> <div class="info-item svelte-1i19ct2"><label class="svelte-1i19ct2">Text Items Count</label> <code class="svelte-1i19ct2"> </code></div></div></div></div></div>',
  );
function Qe(q, z) {
  he(z, !1);
  const V = () => Me($e, '$page', X),
    [X, Y] = Ie();
  let _ = '',
    n = w([]),
    f = w(''),
    v = w(!1),
    m = w(''),
    g = w('');
  const Z = 'pwd',
    y = Ce();
  async function ee() {
    if (!(!_ || !Q)) {
      o(v, !0);
      try {
        const e = `${y}/admin/texts?password=${encodeURIComponent(_)}`,
          t = await fetch(e);
        if (!t.ok) {
          const x = await t.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(x.error || `HTTP ${t.status}: Failed to fetch texts`);
        }
        const c = await t.json();
        o(n, c.texts || []);
      } catch (e) {
        (console.error('Error fetching texts:', e), o(n, []));
      } finally {
        o(v, !1);
      }
    }
  }
  async function C() {
    if (!(!_ || !i(f).trim() || !Q)) {
      (o(v, !0), o(m, ''), o(g, ''));
      try {
        const e = `${y}/admin/texts?password=${encodeURIComponent(_)}`,
          t = await fetch(e, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: i(f).trim() }),
          });
        if (!t.ok) {
          const x = await t.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(x.error || `HTTP ${t.status}: Failed to add text`);
        }
        const c = await t.json();
        (o(n, c.texts || []),
          o(f, ''),
          o(g, 'Text added successfully!'),
          setTimeout(() => o(g, ''), 3e3));
      } catch (e) {
        (console.error('Error adding text:', e),
          e instanceof TypeError && e.message.includes('fetch')
            ? o(m, 'Network error: Is the backend server running on ' + y + '?')
            : o(m, e instanceof Error ? e.message : 'Failed to add text'));
      } finally {
        o(v, !1);
      }
    }
  }
  (xe(() => {
    ((_ = V().url.searchParams.get(Z) || 'debug'), ee());
  }),
    ge());
  var k = Be();
  Pe('1i19ct2', (e) => {
    we(() => {
      ye.title = 'Settings - Admin Panel';
    });
  });
  var U = r(a(k), 2);
  {
    var te = (e) => {
      var t = Ue(),
        c = a(t, !0);
      (s(t), T(() => d(c, i(m))), l(e, t));
    };
    P(U, (e) => {
      i(m) && e(te);
    });
  }
  var j = r(U, 2);
  {
    var se = (e) => {
      var t = je(),
        c = a(t, !0);
      (s(t), T(() => d(c, i(g))), l(e, t));
    };
    P(j, (e) => {
      i(g) && e(se);
    });
  }
  var D = r(j, 2),
    $ = a(D),
    A = r(a($), 2),
    h = a(A);
  (ke(h),
    (h.__keydown = (e) => {
      e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), C());
    }));
  var F = r(h, 2);
  ((F.__click = C), s(A));
  var N = r(A, 2),
    ae = a(N);
  {
    var re = (e) => {
        var t = De();
        l(e, t);
      },
      ie = (e) => {
        var t = me(),
          c = Te(t);
        {
          var x = (u) => {
              var b = Fe();
              l(u, b);
            },
            ve = (u) => {
              var b = Re();
              (Ae(
                b,
                5,
                () => i(n),
                Ee,
                (de, pe, fe) => {
                  var S = Ne(),
                    W = a(S);
                  W.textContent = `${fe + 1}.`;
                  var G = r(W, 2),
                    ue = a(G, !0);
                  (s(G), s(S), T(() => d(ue, i(pe))), l(de, S));
                },
              ),
                s(b),
                l(u, b));
            };
          P(
            c,
            (u) => {
              i(n).length === 0 ? u(x) : u(ve, !1);
            },
            !0,
          );
        }
        l(e, t);
      };
    P(ae, (e) => {
      i(v) && i(n).length === 0 ? e(re) : e(ie, !1);
    });
  }
  (s(N), s($));
  var R = r($, 2),
    B = r(a(R), 2),
    E = a(B),
    O = r(a(E), 2),
    oe = a(O, !0);
  (s(O), s(E));
  var I = r(E, 2),
    H = r(a(I), 2),
    ce = a(H, !0);
  (s(H), s(I));
  var M = r(I, 2),
    J = r(a(M), 2),
    le = a(J, !0);
  (s(J), s(M));
  var K = r(M, 2),
    L = r(a(K), 2),
    ne = a(L, !0);
  (s(L),
    s(K),
    s(B),
    s(R),
    s(D),
    s(k),
    T(
      (e) => {
        ((h.disabled = i(v)),
          (F.disabled = e),
          d(oe, y),
          d(ce, 'Production'),
          d(le, 'Production'),
          d(ne, i(n).length));
      },
      [() => i(v) || !i(f).trim()],
    ),
    Se(
      h,
      () => i(f),
      (e) => o(f, e),
    ),
    l(q, k),
    be(),
    Y());
}
_e(['keydown', 'click']);
export { Qe as component };
