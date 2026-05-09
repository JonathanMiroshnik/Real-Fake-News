import { d as M, c as j, a as f, f as m, s as h } from './4UhCeU0a.js';
import {
  A as N,
  F as q,
  G as Q,
  I as l,
  J as d,
  a as s,
  K as r,
  N as D,
  H as X,
} from './CzCAzTT7.js';
import { e as Y, a as U, i as ee, p as te } from './CvhIc73j.js';
import { i as K, s as ae, a as se } from './CJzlUvWO.js';
import { s as re } from './C5ry_r2u.js';
import { p as B } from './BFgyOq4w.js';
import { a as ne } from './DEZG9HIN.js';
import { g as le, b as ie } from './CL4eq0AM.js';
var oe = m('<span class="ellipsis svelte-14nrfpk"> </span>'),
  ce = m('<button> </button>'),
  ve = m(
    '<div class="pagination svelte-14nrfpk"><button class="pagination-btn prev svelte-14nrfpk" aria-label="Previous page">← Previous</button> <div class="page-numbers svelte-14nrfpk"></div> <button class="pagination-btn next svelte-14nrfpk" aria-label="Next page">Next →</button></div>',
  );
function xe(I, c) {
  N(c, !0);
  let n = B(c, 'currentPage', 15, 1),
    o = B(c, 'totalPages', 3, 1);
  function k(t) {
    t >= 1 && t <= o() && t !== n() && (n(t), c.onPageChange && c.onPageChange(t));
  }
  function w() {
    n() > 1 && k(n() - 1);
  }
  function C() {
    n() < o() && k(n() + 1);
  }
  const F = X(() => {
    const t = [];
    if (o() <= 7) for (let e = 1; e <= o(); e++) t.push(e);
    else if ((t.push(1), n() <= 4)) {
      for (let e = 2; e <= 5; e++) t.push(e);
      (t.push('...'), t.push(o()));
    } else if (n() >= o() - 3) {
      t.push('...');
      for (let e = o() - 4; e <= o(); e++) t.push(e);
    } else {
      t.push('...');
      for (let e = n() - 1; e <= n() + 1; e++) t.push(e);
      (t.push('...'), t.push(o()));
    }
    return t;
  });
  var A = j(),
    S = q(A);
  {
    var y = (t) => {
      var p = ve(),
        e = l(p);
      e.__click = w;
      var a = d(e, 2);
      (Y(
        a,
        21,
        () => s(F),
        ee,
        (x, v) => {
          var b = j(),
            E = q(b);
          {
            var G = (u) => {
                var i = oe(),
                  g = l(i, !0);
                (r(i), D(() => h(g, s(v))), f(u, i));
              },
              L = (u) => {
                var i = ce();
                let g;
                i.__click = () => k(s(v));
                var P = l(i, !0);
                (r(i),
                  D(() => {
                    ((g = re(i, 1, 'page-number svelte-14nrfpk', null, g, {
                      active: s(v) === n(),
                    })),
                      U(i, 'aria-label', `Go to page ${s(v) ?? ''}`),
                      U(i, 'aria-current', s(v) === n() ? 'page' : void 0),
                      h(P, s(v)));
                  }),
                  f(u, i));
              };
            K(E, (u) => {
              typeof s(v) == 'string' ? u(G) : u(L, !1);
            });
          }
          f(x, b);
        },
      ),
        r(a));
      var _ = d(a, 2);
      ((_.__click = C),
        r(p),
        D(() => {
          ((e.disabled = n() === 1), (_.disabled = n() === o()));
        }),
        f(t, p));
    };
    K(S, (t) => {
      o() > 1 && t(y);
    });
  }
  (f(I, A), Q());
}
M(['click']);
var ue = m('<span class="featured-badge svelte-e90fcu" title="Featured Article Today">⭐</span>'),
  de = m(
    '<tr class="svelte-e90fcu"><td class="svelte-e90fcu"><div class="title-cell svelte-e90fcu"><a target="_blank" rel="noopener noreferrer" class="article-link svelte-e90fcu"> </a> <!></div></td><td class="svelte-e90fcu"><span class="category-badge svelte-e90fcu"> </span></td><td class="svelte-e90fcu"><span class="writer-type-badge svelte-e90fcu"> </span></td><td class="date-cell svelte-e90fcu"> </td><td class="svelte-e90fcu"><div class="action-buttons svelte-e90fcu"><button class="edit-btn svelte-e90fcu">✏️ Edit</button> <button class="delete-btn svelte-e90fcu">🗑️ Delete</button></div></td></tr>',
  ),
  fe = m(
    '<div class="table-container svelte-e90fcu"><table class="svelte-e90fcu"><thead class="svelte-e90fcu"><tr><th class="svelte-e90fcu">Title</th><th class="svelte-e90fcu">Category</th><th class="svelte-e90fcu">Writer Type</th><th class="svelte-e90fcu">Date</th><th class="svelte-e90fcu">Actions</th></tr></thead><tbody class="svelte-e90fcu"></tbody></table></div>',
  );
function Pe(I, c) {
  N(c, !0);
  const n = () => se(te, '$page', o),
    [o, k] = ae(),
    w = X(() => n().url.searchParams.get('pwd') || '');
  function C(e) {
    if (!e) return;
    const a = s(w) ? `?pwd=${encodeURIComponent(s(w))}` : '';
    le(`${ie}/articles/edit/${e}${a}`);
  }
  function F(e) {
    return e ? `${ne()}/article/${e}` : '#';
  }
  function A(e) {
    if (!e) return 'N/A';
    try {
      const a = new Date(e);
      return a.toLocaleDateString() + ' ' + a.toLocaleTimeString();
    } catch {
      return e;
    }
  }
  function S(e) {
    if (!e.isFeatured || !e.featuredDate) return !1;
    const a = new Date().toISOString().split('T')[0];
    return e.featuredDate === a;
  }
  var y = fe(),
    t = l(y),
    p = d(l(t));
  (Y(
    p,
    21,
    () => c.articles.map((e, a) => ({ ...e, _index: c.startIndex + a })),
    (e) => (e.key ? e.key : `article-${e._index}`),
    (e, a) => {
      var _ = de(),
        x = l(_),
        v = l(x),
        b = l(v),
        E = l(b, !0);
      r(b);
      var G = d(b, 2);
      {
        var L = (T) => {
          var J = ue();
          f(T, J);
        };
        K(G, (T) => {
          S(s(a)) && T(L);
        });
      }
      (r(v), r(x));
      var u = d(x),
        i = l(u),
        g = l(i, !0);
      (r(i), r(u));
      var P = d(u),
        V = l(P),
        Z = l(V, !0);
      (r(V), r(P));
      var z = d(P),
        $ = l(z, !0);
      r(z);
      var O = d(z),
        R = l(O),
        H = l(R);
      H.__click = () => C(s(a).key);
      var W = d(H, 2);
      ((W.__click = () => c.onDelete(s(a).key)),
        r(R),
        r(O),
        r(_),
        D(
          (T, J) => {
            (U(b, 'href', T),
              h(E, s(a).title || 'Untitled'),
              h(g, s(a).category || 'Uncategorized'),
              U(V, 'data-type', s(a).writerType || 'AI'),
              h(Z, s(a).writerType || 'AI'),
              h($, J),
              (H.disabled = c.loading),
              (W.disabled = c.loading));
          },
          [() => F(s(a).key), () => A(s(a).timestamp)],
        ),
        f(e, _));
    },
  ),
    r(p),
    r(t),
    r(y),
    f(I, y),
    Q(),
    k());
}
M(['click']);
export { Pe as A, xe as P };
