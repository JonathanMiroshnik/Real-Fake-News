import { d as Be, c as ue, a as f, f as _, s as R } from '../chunks/4UhCeU0a.js';
import {
  A as Oe,
  B as p,
  c as ve,
  C as ze,
  a as e,
  s as r,
  E as Je,
  F as Z,
  G as Ke,
  o as Le,
  H as B,
  $ as We,
  I as c,
  J as l,
  K as i,
  M as qe,
  N as O,
} from '../chunks/CzCAzTT7.js';
import { h as Qe, p as Ve, r as Xe, e as Ye, i as Ze } from '../chunks/CvhIc73j.js';
import { i as U, s as et, a as tt } from '../chunks/CJzlUvWO.js';
import { b as rt } from '../chunks/BVbjVH2H.js';
import { b as at } from '../chunks/BFMHchxU.js';
import { g as st, b as T } from '../chunks/DEZG9HIN.js';
import { A as nt, P as ot } from '../chunks/BxspXJx0.js';
var it = _(
    '<div class="unauthorized svelte-1uha8ag"><h1 class="svelte-1uha8ag">Access Denied</h1> <p class="svelte-1uha8ag">This page requires authorization.</p></div>',
  ),
  ct = _('<div class="error svelte-1uha8ag"> </div>'),
  lt = _('<div class="loading svelte-1uha8ag">Loading articles...</div>'),
  dt = _('<div class="empty svelte-1uha8ag">No articles found</div>'),
  ut = _(
    '<div class="pagination-controls-top svelte-1uha8ag"><div class="items-per-page svelte-1uha8ag"><label for="items-per-page-select-dashboard" class="svelte-1uha8ag">Items per page:</label> <select id="items-per-page-select-dashboard" class="svelte-1uha8ag"><option>10</option><option>25</option><option>50</option><option>100</option></select></div> <div class="pagination-info svelte-1uha8ag"> </div></div> <!> <!>',
    1,
  ),
  vt = _('<p class="empty svelte-1uha8ag">No texts added yet</p>'),
  gt = _('<li class="svelte-1uha8ag"> </li>'),
  ht = _('<ul class="svelte-1uha8ag"></ul>'),
  ft = _(
    '<div class="admin-panel svelte-1uha8ag"><header class="svelte-1uha8ag"><h1 class="svelte-1uha8ag">Admin Panel</h1> <!></header> <div class="sections svelte-1uha8ag"><section class="generation-section svelte-1uha8ag"><h2 class="svelte-1uha8ag">Content Generation</h2> <div class="generation-buttons svelte-1uha8ag"><button class="generate-button generate-article svelte-1uha8ag"> </button> <button class="generate-button generate-recipe svelte-1uha8ag"> </button></div> <p class="generation-hint svelte-1uha8ag">Generate a new article from recent news or a new recipe from random foods.</p></section> <section class="article-section svelte-1uha8ag"><h2 class="svelte-1uha8ag">Article Management</h2> <!></section> <section class="text-section svelte-1uha8ag"><h2 class="svelte-1uha8ag">Text Management</h2> <div class="text-input-container svelte-1uha8ag"><input type="text" placeholder="Enter text to add..." class="svelte-1uha8ag"/> <button class="svelte-1uha8ag">Add Text</button></div> <div class="texts-display svelte-1uha8ag"><!></div></section></div></div>',
  );
function Et(ge, he) {
  Oe(he, !0);
  const fe = () => tt(Ve, '$page', pe),
    [pe, me] = et(),
    _e = !1;
  let m = p(ve([])),
    E = p(ve([])),
    y = p(''),
    d = p(!1),
    n = p(''),
    u = p(''),
    ee = p(!1),
    x = p(1),
    k = p(10);
  const h = st(),
    we = 'pwd';
  async function z() {
    if (!(!e(u) || !T)) {
      (r(d, !0), r(n, ''));
      try {
        const t = `${h}/admin/articles?password=${encodeURIComponent(e(u))}&_t=${Date.now()}`,
          a = await fetch(t, { cache: 'no-store' });
        if (!a.ok) {
          const b = await a.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(b.error || `HTTP ${a.status}: Failed to fetch articles`);
        }
        if (a.status === 304) {
          console.log('Response cached (304), using existing articles');
          return;
        }
        const g = (await a.json()).articles || [];
        r(
          m,
          g.sort((b, $) => {
            const P = b.timestamp ? new Date(b.timestamp).getTime() : 0;
            return ($.timestamp ? new Date($.timestamp).getTime() : 0) - P;
          }),
          !0,
        );
      } catch (t) {
        (console.error('Error fetching articles:', t),
          t instanceof TypeError && t.message.includes('fetch')
            ? r(n, 'Network error: Is the backend server running on ' + h + '?')
            : r(n, t instanceof Error ? t.message : 'An error occurred', !0),
          r(m, [], !0));
      } finally {
        r(d, !1);
      }
    }
  }
  async function ye(t) {
    if (!(!t || !e(u) || !T) && confirm('Are you sure you want to delete this article?')) {
      (r(d, !0), r(n, ''));
      try {
        const a = `${h}/admin/articles/${t}?password=${encodeURIComponent(e(u))}`,
          o = await fetch(a, { method: 'DELETE' });
        if (!o.ok) {
          const g = await o.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(g.error || `HTTP ${o.status}: Failed to delete article`);
        }
        await z();
      } catch (a) {
        (console.error('Error deleting article:', a),
          a instanceof TypeError && a.message.includes('fetch')
            ? r(n, 'Network error: Is the backend server running on ' + h + '?')
            : r(n, a instanceof Error ? a.message : 'Failed to delete article', !0));
      } finally {
        r(d, !1);
      }
    }
  }
  async function xe() {
    if (!(!e(u) || !T)) {
      r(d, !0);
      try {
        const t = `${h}/admin/texts?password=${encodeURIComponent(e(u))}`,
          a = await fetch(t);
        if (!a.ok) {
          const g = await a.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(g.error || `HTTP ${a.status}: Failed to fetch texts`);
        }
        const o = await a.json();
        r(E, o.texts || [], !0);
      } catch (t) {
        (console.error('Error fetching texts:', t), r(E, [], !0));
      } finally {
        r(d, !1);
      }
    }
  }
  async function te() {
    if (!(!e(u) || !e(y).trim() || !T)) {
      (r(d, !0), r(n, ''));
      try {
        const t = `${h}/admin/texts?password=${encodeURIComponent(e(u))}`,
          a = await fetch(t, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: e(y).trim() }),
          });
        if (!a.ok) {
          const g = await a.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(g.error || `HTTP ${a.status}: Failed to add text`);
        }
        const o = await a.json();
        (r(E, o.texts || [], !0), r(y, ''));
      } catch (t) {
        (console.error('Error adding text:', t),
          t instanceof TypeError && t.message.includes('fetch')
            ? r(n, 'Network error: Is the backend server running on ' + h + '?')
            : r(n, t instanceof Error ? t.message : 'Failed to add text', !0));
      } finally {
        r(d, !1);
      }
    }
  }
  let C = p(!1);
  async function be() {
    if (!(!e(u) || !T)) {
      (r(C, !0), r(n, ''));
      try {
        const t = `${h}/admin/generate/article?password=${encodeURIComponent(e(u))}`,
          a = await fetch(t, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
        if (!a.ok) {
          const g = await a.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(g.error || `HTTP ${a.status}: Failed to generate article`);
        }
        const o = await a.json();
        if (o.success) (await z(), r(n, ''), alert('Article generated successfully!'));
        else throw new Error(o.error || 'Failed to generate article');
      } catch (t) {
        (console.error('Error generating article:', t),
          t instanceof TypeError && t.message.includes('fetch')
            ? r(n, 'Network error: Is the backend server running on ' + h + '?')
            : r(n, t instanceof Error ? t.message : 'Failed to generate article', !0));
      } finally {
        r(C, !1);
      }
    }
  }
  let N = p(!1);
  async function Te() {
    if (!(!e(u) || !T)) {
      (r(N, !0), r(n, ''));
      try {
        const t = `${h}/admin/generate/recipe?password=${encodeURIComponent(e(u))}`,
          a = await fetch(t, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
        if (!a.ok) {
          const g = await a.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(g.error || `HTTP ${a.status}: Failed to generate recipe`);
        }
        const o = await a.json();
        if (o.success) (r(n, ''), alert('Recipe generated successfully!'));
        else throw new Error(o.error || 'Failed to generate recipe');
      } catch (t) {
        (console.error('Error generating recipe:', t),
          t instanceof TypeError && t.message.includes('fetch')
            ? r(n, 'Network error: Is the backend server running on ' + h + '?')
            : r(n, t instanceof Error ? t.message : 'Failed to generate recipe', !0));
      } finally {
        r(N, !1);
      }
    }
  }
  const re = B(() => Math.ceil(e(m).length / e(k))),
    M = B(() => (e(x) - 1) * e(k)),
    ae = B(() => e(M) + e(k)),
    Ee = B(() => e(m).slice(e(M), e(ae)));
  ze(() => {
    e(m).length > 0 && e(x) > e(re) && r(x, 1);
  });
  function ke() {
    r(x, 1);
  }
  Je(() => {
    const t = fe().url.searchParams.get(we);
    (t !== null ? r(u, t, !0) : r(u, ''), r(ee, !0), z(), xe());
  });
  var $e = { ssr: _e },
    se = ue();
  Qe('1uha8ag', (t) => {
    Le(() => {
      We.title = 'Admin Panel';
    });
  });
  var Pe = Z(se);
  {
    var Ae = (t) => {
        var a = it();
        f(t, a);
      },
      Ie = (t) => {
        var a = ft(),
          o = c(a),
          g = l(c(o), 2);
        {
          var b = (s) => {
            var v = ct(),
              D = c(v, !0);
            (i(v), O(() => R(D, e(n))), f(s, v));
          };
          U(g, (s) => {
            e(n) && s(b);
          });
        }
        i(o);
        var $ = l(o, 2),
          P = c($),
          J = l(c(P), 2),
          A = c(J);
        A.__click = be;
        var je = c(A, !0);
        i(A);
        var S = l(A, 2);
        S.__click = Te;
        var Fe = c(S, !0);
        (i(S), i(J), qe(2), i(P));
        var K = l(P, 2),
          Re = l(c(K), 2);
        {
          var Ue = (s) => {
              var v = lt();
              f(s, v);
            },
            Ce = (s) => {
              var v = ue(),
                D = Z(v);
              {
                var W = (w) => {
                    var G = dt();
                    f(w, G);
                  },
                  j = (w) => {
                    var G = ut(),
                      q = Z(G),
                      Q = c(q),
                      H = l(c(Q), 2);
                    H.__change = ke;
                    var V = c(H);
                    V.value = V.__value = 10;
                    var X = l(V);
                    X.value = X.__value = 25;
                    var Y = l(X);
                    Y.value = Y.__value = 50;
                    var ce = l(Y);
                    ((ce.value = ce.__value = 100), i(H), i(Q));
                    var le = l(Q, 2),
                      Ge = c(le);
                    (i(le), i(q));
                    var de = l(q, 2);
                    nt(de, {
                      get articles() {
                        return e(Ee);
                      },
                      get loading() {
                        return e(d);
                      },
                      onDelete: ye,
                      get startIndex() {
                        return e(M);
                      },
                    });
                    var He = l(de, 2);
                    (ot(He, {
                      get totalPages() {
                        return e(re);
                      },
                      get currentPage() {
                        return e(x);
                      },
                      set currentPage(F) {
                        r(x, F, !0);
                      },
                    }),
                      O(
                        (F) =>
                          R(Ge, `Showing ${e(M) + 1}-${F ?? ''} of ${e(m).length ?? ''} articles`),
                        [() => Math.min(e(ae), e(m).length)],
                      ),
                      at(
                        H,
                        () => e(k),
                        (F) => r(k, F),
                      ),
                      f(w, G));
                  };
                U(
                  D,
                  (w) => {
                    e(m).length === 0 ? w(W) : w(j, !1);
                  },
                  !0,
                );
              }
              f(s, v);
            };
          U(Re, (s) => {
            e(d) && e(m).length === 0 ? s(Ue) : s(Ce, !1);
          });
        }
        i(K);
        var ne = l(K, 2),
          L = l(c(ne), 2),
          I = c(L);
        (Xe(I),
          (I.__keydown = (s) => {
            s.key === 'Enter' && !s.shiftKey && (s.preventDefault(), te());
          }));
        var oe = l(I, 2);
        ((oe.__click = te), i(L));
        var ie = l(L, 2),
          Ne = c(ie);
        {
          var Me = (s) => {
              var v = vt();
              f(s, v);
            },
            Se = (s) => {
              var v = ht();
              (Ye(
                v,
                21,
                () => e(E),
                Ze,
                (D, W) => {
                  var j = gt(),
                    w = c(j, !0);
                  (i(j), O(() => R(w, e(W))), f(D, j));
                },
              ),
                i(v),
                f(s, v));
            };
          U(Ne, (s) => {
            e(E).length === 0 ? s(Me) : s(Se, !1);
          });
        }
        (i(ie),
          i(ne),
          i($),
          i(a),
          O(
            (s) => {
              ((A.disabled = e(C) || e(d)),
                R(je, e(C) ? 'Generating...' : '📰 Generate Article'),
                (S.disabled = e(N) || e(d)),
                R(Fe, e(N) ? 'Generating...' : '🍳 Generate Recipe'),
                (I.disabled = e(d)),
                (oe.disabled = s));
            },
            [() => e(d) || !e(y).trim()],
          ),
          rt(
            I,
            () => e(y),
            (s) => r(y, s),
          ),
          f(t, a));
      };
    U(Pe, (t) => {
      e(ee) ? t(Ie, !1) : t(Ae);
    });
  }
  f(ge, se);
  var De = Ke($e);
  return (me(), De);
}
Be(['click', 'change', 'keydown']);
export { Et as component };
