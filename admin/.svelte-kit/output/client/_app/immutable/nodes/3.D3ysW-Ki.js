import { d as Ae, f as I, a as E, s as G, c as $e } from '../chunks/4UhCeU0a.js';
import {
  A as ye,
  B as w,
  c as te,
  C as N,
  a as e,
  s as r,
  E as Ee,
  J as u,
  N as C,
  G as ze,
  H as W,
  o as be,
  $ as Ie,
  I as p,
  K as f,
  F as ae,
} from '../chunks/CzCAzTT7.js';
import { a as Te, i as D, s as Me } from '../chunks/CJzlUvWO.js';
import { h as ke, p as Fe } from '../chunks/CvhIc73j.js';
import { b as xe } from '../chunks/BFMHchxU.js';
import { g as Ce, b as S } from '../chunks/DEZG9HIN.js';
import { P as De, A as Se } from '../chunks/BxspXJx0.js';
var Ue = I('<div class="error-banner svelte-a1a7z4"> </div>'),
  Re = I(
    '<div class="loading-state svelte-a1a7z4"><div class="spinner svelte-a1a7z4"></div> <p>Loading articles...</p></div>',
  ),
  Be = I('<div class="empty-state svelte-a1a7z4"><p>No articles found</p></div>'),
  je = I(
    '<div class="loading-state svelte-a1a7z4"><div class="spinner svelte-a1a7z4"></div> <p> </p></div>',
  ),
  He = I(
    '<div class="pagination-controls-top svelte-a1a7z4"><div class="items-per-page svelte-a1a7z4"><label for="items-per-page-select" class="svelte-a1a7z4">Items per page:</label> <select id="items-per-page-select" class="svelte-a1a7z4"><option>10</option><option>25</option><option>50</option><option>100</option></select></div> <div class="pagination-info svelte-a1a7z4"> </div></div> <!> <!>',
    1,
  ),
  Le = I(
    '<div class="articles-page svelte-a1a7z4"><header class="page-header svelte-a1a7z4"><h1 class="svelte-a1a7z4">Article Management</h1> <button class="refresh-btn svelte-a1a7z4">🔄 Refresh</button></header> <!> <div class="content-card svelte-a1a7z4"><!></div></div>',
  );
function qe(re, se) {
  ye(se, !0);
  const J = () => Te(Fe, '$page', oe),
    [oe, ne] = Me();
  let z = w(te(new Map())),
    l = w(0),
    h = w(!1),
    m = w(''),
    d = w(''),
    n = w(1),
    P = w(10),
    _ = w(te(new Set()));
  const K = parseInt('2', 10),
    O = 'pwd',
    T = Ce();
  async function U() {
    if (!e(d) || !S) return 0;
    try {
      const t = `${T}/admin/articles/count?password=${encodeURIComponent(e(d))}`,
        a = await fetch(t, { cache: 'no-store' });
      if (!a.ok) {
        const g = await a.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(g.error || `HTTP ${a.status}: Failed to fetch count`);
      }
      return (await a.json()).totalCount || 0;
    } catch (t) {
      return (console.error('Error fetching total count:', t), 0);
    }
  }
  async function ie(t) {
    if (!e(d) || !S || t.length === 0) return;
    const a = t.filter((s) => !e(_).has(s));
    if (a.length !== 0) {
      (r(h, !0), r(m, ''));
      try {
        const s = a.join(','),
          g = `${T}/admin/articles?password=${encodeURIComponent(e(d))}&pages=${s}&itemsPerPage=${e(P)}&_t=${Date.now()}`;
        console.log('Fetching pages:', a, 'from URL:', g);
        const v = await fetch(g, { cache: 'no-store' });
        if (!v.ok) {
          const o = await v.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(o.error || `HTTP ${v.status}: Failed to fetch articles`);
        }
        const $ = ((await v.json()).articles || []).sort((o, i) => {
            const k = o.timestamp ? new Date(o.timestamp).getTime() : 0;
            return (i.timestamp ? new Date(i.timestamp).getTime() : 0) - k;
          }),
          M = [...a].sort((o, i) => o - i);
        let y = 0;
        for (const o of M) {
          const i = $.slice(y, y + e(P));
          i.length > 0
            ? (e(z).set(o, i), e(_).add(o), (y += i.length))
            : (e(z).set(o, []), e(_).add(o));
        }
        console.log('Fetched pages:', a, 'articles:', $.length);
      } catch (s) {
        (console.error('Error fetching pages:', s),
          s instanceof TypeError && s.message.includes('fetch')
            ? r(m, 'Network error: Is the backend server running on ' + T + '?')
            : r(m, s instanceof Error ? s.message : 'An error occurred', !0));
      } finally {
        r(h, !1);
      }
    }
  }
  async function b(t) {
    if (e(_).has(t)) return;
    const a = [],
      s = Math.max(1, t - K),
      g = Math.min(e(R), t + K);
    for (let v = s; v <= g; v++) e(_).has(v) || a.push(v);
    a.length > 0 && (await ie(a));
  }
  async function ce(t) {
    (r(n, t, !0), await b(t));
  }
  async function le(t) {
    if (!(!t || !e(d) || !S) && confirm('Are you sure you want to delete this article?')) {
      (r(h, !0), r(m, ''));
      try {
        const a = `${T}/admin/articles/${t}?password=${encodeURIComponent(e(d))}`,
          s = await fetch(a, { method: 'DELETE' });
        if (!s.ok) {
          const g = await s.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(g.error || `HTTP ${s.status}: Failed to delete article`);
        }
        (r(z, new Map(), !0), r(_, new Set(), !0), r(l, await U(), !0), await b(e(n)));
      } catch (a) {
        (console.error('Error deleting article:', a),
          a instanceof TypeError && a.message.includes('fetch')
            ? r(m, 'Network error: Is the backend server running on ' + T + '?')
            : r(m, a instanceof Error ? a.message : 'Failed to delete article', !0));
      } finally {
        r(h, !1);
      }
    }
  }
  async function de() {
    (r(z, new Map(), !0), r(_, new Set(), !0), r(l, await U(), !0), await b(e(n)));
  }
  const R = W(() => Math.ceil(e(l) / e(P))),
    F = W(() => e(z).get(e(n)) || []),
    B = W(() => (e(n) - 1) * e(P));
  (N(() => {
    e(l) > 0 && e(n) >= 1 && e(n) <= e(R) && b(e(n));
  }),
    N(() => {
      e(P) > 0 && (r(z, new Map(), !0), r(_, new Set(), !0), e(l) > 0 && b(e(n)));
    }));
  function ve() {
    r(n, 1);
  }
  (N(() => {
    {
      const t = J().url.searchParams.get(O);
      t !== null ? r(d, t, !0) : r(d, '', !0);
    }
  }),
    Ee(async () => {
      console.log('onMount called', { browser: S });
      const t = J().url.searchParams.get(O);
      (t !== null ? r(d, t, !0) : r(d, '', !0),
        console.log('Password set:', e(d) ? '***' : 'empty'),
        r(l, await U(), !0),
        e(l) > 0 && (await b(e(n))));
    }));
  var j = Le();
  ke('a1a7z4', (t) => {
    be(() => {
      Ie.title = 'Articles - Admin Panel';
    });
  });
  var H = p(j),
    Z = u(p(H), 2);
  ((Z.__click = de), f(H));
  var q = u(H, 2);
  {
    var ue = (t) => {
      var a = Ue(),
        s = p(a, !0);
      (f(a), C(() => G(s, e(m))), E(t, a));
    };
    D(q, (t) => {
      e(m) && t(ue);
    });
  }
  var Q = u(q, 2),
    ge = p(Q);
  {
    var pe = (t) => {
        var a = Re();
        E(t, a);
      },
      fe = (t) => {
        var a = $e(),
          s = ae(a);
        {
          var g = (A) => {
              var $ = Be();
              E(A, $);
            },
            v = (A) => {
              var $ = He(),
                M = ae($),
                y = p(M),
                o = u(p(y), 2);
              o.__change = ve;
              var i = p(o);
              i.value = i.__value = 10;
              var k = u(i);
              k.value = k.__value = 25;
              var x = u(k);
              x.value = x.__value = 50;
              var V = u(x);
              ((V.value = V.__value = 100), f(o), f(y));
              var X = u(y, 2),
                he = p(X);
              (f(X), f(M));
              var Y = u(M, 2);
              {
                var me = (c) => {
                    var L = je(),
                      ee = u(p(L), 2),
                      Pe = p(ee);
                    (f(ee), f(L), C(() => G(Pe, `Loading page ${e(n) ?? ''}...`)), E(c, L));
                  },
                  _e = (c) => {
                    Se(c, {
                      get articles() {
                        return e(F);
                      },
                      get loading() {
                        return e(h);
                      },
                      onDelete: le,
                      get startIndex() {
                        return e(B);
                      },
                    });
                  };
                D(Y, (c) => {
                  e(h) && e(F).length === 0 ? c(me) : c(_e, !1);
                });
              }
              var we = u(Y, 2);
              (De(we, {
                get totalPages() {
                  return e(R);
                },
                onPageChange: ce,
                get currentPage() {
                  return e(n);
                },
                set currentPage(c) {
                  r(n, c, !0);
                },
              }),
                C(
                  (c) => G(he, `Showing ${e(B) + 1}-${c ?? ''} of ${e(l) ?? ''} articles`),
                  [() => Math.min(e(B) + e(F).length, e(l))],
                ),
                xe(
                  o,
                  () => e(P),
                  (c) => r(P, c),
                ),
                E(A, $));
            };
          D(
            s,
            (A) => {
              e(l) === 0 ? A(g) : A(v, !1);
            },
            !0,
          );
        }
        E(t, a);
      };
    D(ge, (t) => {
      e(h) && e(l) === 0 && e(F).length === 0 ? t(pe) : t(fe, !1);
    });
  }
  (f(Q), f(j), C(() => (Z.disabled = e(h))), E(re, j), ze(), ne());
}
Ae(['click', 'change']);
export { qe as component };
