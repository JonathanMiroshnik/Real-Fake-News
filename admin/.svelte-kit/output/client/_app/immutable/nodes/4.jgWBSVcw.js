import { d as _t, f as h, a as g, s as S, c as Ne, e as Ue, r as ht } from '../chunks/4UhCeU0a.js';
import {
  A as yt,
  C as jt,
  s as r,
  E as Tt,
  J as s,
  a as e,
  G as It,
  o as kt,
  I as i,
  B as d,
  $ as $t,
  K as o,
  H as St,
  N as x,
  F as Oe,
  M as Ie,
  O as ke,
} from '../chunks/CzCAzTT7.js';
import {
  h as At,
  p as Et,
  r as X,
  e as xt,
  i as Dt,
  s as $e,
  a as Re,
} from '../chunks/CvhIc73j.js';
import { a as Ft, i as A, s as Pt } from '../chunks/CJzlUvWO.js';
import { b as Z } from '../chunks/BVbjVH2H.js';
import { b as He } from '../chunks/BFMHchxU.js';
import { b as ee, g as Ct } from '../chunks/DEZG9HIN.js';
import { g as Nt, b as Ut } from '../chunks/CL4eq0AM.js';
var Ot = h('<div class="error-banner svelte-iw8rjb"> </div>'),
  Rt = h('<div class="success-banner svelte-iw8rjb"> </div>'),
  Ht = h(
    '<div class="loading-state svelte-iw8rjb"><div class="spinner svelte-iw8rjb"></div> <p>Loading article...</p></div>',
  ),
  Mt = h(
    '<div class="image-preview svelte-iw8rjb"><p class="preview-label svelte-iw8rjb">Preview:</p> <img alt="Preview" class="svelte-iw8rjb"/></div>',
  ),
  Bt = h(
    '<div class="file-info svelte-iw8rjb"><p class="svelte-iw8rjb"> </p> <!> <button type="button" class="upload-btn svelte-iw8rjb"> </button></div>',
  ),
  Lt = h(
    '<div class="image-preview svelte-iw8rjb"><p class="preview-label svelte-iw8rjb">Current Image:</p> <img alt="Article" class="svelte-iw8rjb"/></div>',
  ),
  Jt = h('<option class="svelte-iw8rjb"> </option>'),
  Kt = h(
    '<div class="content-card svelte-iw8rjb"><form><div class="form-group svelte-iw8rjb"><label for="key" class="svelte-iw8rjb">Article Key</label> <input type="text" id="key" disabled class="readonly-field svelte-iw8rjb"/> <p class="field-hint svelte-iw8rjb">This field cannot be changed</p></div> <div class="form-group svelte-iw8rjb"><label for="title" class="svelte-iw8rjb">Title</label> <input type="text" id="title" placeholder="Article title" class="dark-input svelte-iw8rjb"/></div> <div class="form-group svelte-iw8rjb"><label for="shortDescription" class="svelte-iw8rjb">Short Description</label> <textarea id="shortDescription" placeholder="Short description or summary" rows="3" class="dark-input svelte-iw8rjb"></textarea></div> <div class="form-group svelte-iw8rjb"><label for="content" class="svelte-iw8rjb">Content</label> <textarea id="content" placeholder="Article content (markdown supported)" rows="20" class="dark-input svelte-iw8rjb"></textarea></div> <div class="form-group svelte-iw8rjb"><label for="headImage" class="svelte-iw8rjb">Image</label> <div class="upload-section svelte-iw8rjb"><label for="image-upload" class="upload-label svelte-iw8rjb"><input type="file" id="image-upload" accept="image/*" style="display: none;" class="svelte-iw8rjb"/> <span class="upload-button svelte-iw8rjb">📁 Choose Image File</span></label> <!></div> <div class="manual-input-section svelte-iw8rjb"><label for="headImage" class="manual-label svelte-iw8rjb">Or enter image filename manually:</label> <input type="text" id="headImage" placeholder="Image filename (e.g., img-123.png)" class="dark-input svelte-iw8rjb"/></div> <!></div> <div class="form-group svelte-iw8rjb"><label for="category" class="svelte-iw8rjb">Category</label> <select id="category" class="dark-input svelte-iw8rjb"><option class="svelte-iw8rjb">Select a category</option><!></select></div> <div class="form-group svelte-iw8rjb"><label for="writerType" class="svelte-iw8rjb">Writer Type</label> <select id="writerType" class="dark-input svelte-iw8rjb"><option class="svelte-iw8rjb">AI</option><option class="svelte-iw8rjb">Human</option><option class="svelte-iw8rjb">Synthesis</option></select></div> <div class="form-group svelte-iw8rjb"><label for="timestamp" class="svelte-iw8rjb">Timestamp</label> <input type="datetime-local" id="timestamp" class="dark-input svelte-iw8rjb"/> <p class="field-hint svelte-iw8rjb"> </p></div> <div class="form-group svelte-iw8rjb"><label for="originalNewsItem" class="svelte-iw8rjb">Original News Item</label> <textarea id="originalNewsItem" disabled class="readonly-field svelte-iw8rjb" rows="8" readonly=""></textarea> <p class="field-hint svelte-iw8rjb">This field is read-only and displays the original news item data</p></div> <div class="form-actions svelte-iw8rjb"><button type="button" class="featured-btn svelte-iw8rjb"> </button> <button type="submit" class="save-btn svelte-iw8rjb"> </button></div></form></div>',
  ),
  Wt = h('<div class="empty-state svelte-iw8rjb"><p>Article not found</p></div>'),
  Gt = h(
    '<div class="edit-page svelte-iw8rjb"><header class="page-header svelte-iw8rjb"><h1 class="svelte-iw8rjb">Edit Article</h1> <button class="back-btn svelte-iw8rjb">← Back to Articles</button></header> <!> <!> <!></div>',
  );
function tr(Me, Be) {
  yt(Be, !0);
  const te = () => Ft(Et, '$page', Le),
    [Le, Je] = Pt(),
    Ke = ['Politics', 'Sports', 'Culture', 'Economics', 'Technology', 'Food'];
  let l = d(null),
    U = d(!1),
    p = d(!1),
    O = d(!1),
    V = d(!1),
    f = d(''),
    w = d(''),
    m = d(''),
    D = d(''),
    F = d(''),
    I = d(''),
    R = d(''),
    H = d(''),
    M = d('AI'),
    P = d(''),
    E = d(null),
    B = d(null);
  const re = 'pwd',
    y = Ct(),
    C = St(() => te().params.key);
  async function We() {
    if (!(!e(C) || !e(m) || !ee)) {
      (r(U, !0), r(f, ''));
      try {
        const t = `${y}/admin/articles/${e(C)}?password=${encodeURIComponent(e(m))}`,
          a = await fetch(t, { cache: 'no-store' });
        if (!a.ok) {
          const v = await a.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(v.error || `HTTP ${a.status}: Failed to fetch article`);
        }
        const c = await a.json();
        if (c.success && c.article)
          (r(l, c.article, !0),
            e(l) &&
              (r(D, e(l).title || '', !0),
              r(F, e(l).content || '', !0),
              r(I, e(l).headImage || '', !0),
              r(R, e(l).category || '', !0),
              r(H, e(l).shortDescription || '', !0),
              r(M, e(l).writerType || 'AI', !0),
              r(P, e(l).timestamp || '', !0)));
        else throw new Error('Article not found');
      } catch (t) {
        (console.error('Error fetching article:', t),
          t instanceof TypeError && t.message.includes('fetch')
            ? r(f, 'Network error: Is the backend server running on ' + y + '?')
            : r(f, t instanceof Error ? t.message : 'Failed to fetch article', !0));
      } finally {
        r(U, !1);
      }
    }
  }
  async function Ge() {
    if (!(!e(C) || !e(m) || !ee)) {
      (r(p, !0), r(f, ''), r(w, ''));
      try {
        const t = `${y}/admin/articles/${e(C)}?password=${encodeURIComponent(e(m))}`,
          a = await fetch(t, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: e(D).trim(),
              content: e(F).trim(),
              headImage: e(I).trim(),
              category: e(R).trim(),
              shortDescription: e(H).trim(),
              writerType: e(M),
              timestamp: e(P).trim(),
            }),
          });
        if (!a.ok) {
          const v = await a.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(v.error || `HTTP ${a.status}: Failed to update article`);
        }
        if ((await a.json()).success)
          (r(w, 'Article saved successfully!'),
            e(l) &&
              ((e(l).title = e(D)),
              (e(l).content = e(F)),
              (e(l).headImage = e(I)),
              (e(l).category = e(R)),
              (e(l).shortDescription = e(H)),
              (e(l).writerType = e(M)),
              (e(l).timestamp = e(P))),
            setTimeout(() => {
              r(w, '');
            }, 3e3));
        else throw new Error('Failed to save article');
      } catch (t) {
        (console.error('Error saving article:', t),
          t instanceof TypeError && t.message.includes('fetch')
            ? r(f, 'Network error: Is the backend server running on ' + y + '?')
            : r(f, t instanceof Error ? t.message : 'Failed to save article', !0));
      } finally {
        r(p, !1);
      }
    }
  }
  function ze(t) {
    return t ? `${y}/images/${encodeURIComponent(t)}` : '';
  }
  function Ve(t) {
    if (!t) return '';
    try {
      const a = new Date(t);
      if (isNaN(a.getTime())) return '';
      const c = a.getFullYear(),
        v = String(a.getMonth() + 1).padStart(2, '0'),
        _ = String(a.getDate()).padStart(2, '0'),
        k = String(a.getHours()).padStart(2, '0'),
        $ = String(a.getMinutes()).padStart(2, '0');
      return `${c}-${v}-${_}T${k}:${$}`;
    } catch {
      return '';
    }
  }
  function Ye(t) {
    if (!t) return '';
    try {
      const a = new Date(t);
      return isNaN(a.getTime()) ? '' : a.toISOString();
    } catch {
      return '';
    }
  }
  function qe(t) {
    const a = t.target;
    r(P, Ye(a.value), !0);
  }
  function Qe() {
    return Ve(e(P));
  }
  function Xe(t) {
    if (!t) return 'None';
    try {
      return JSON.stringify(t, null, 2);
    } catch {
      return String(t);
    }
  }
  function Ze(t) {
    const c = t.target.files?.[0];
    if (c) {
      r(E, c, !0);
      const v = new FileReader();
      ((v.onload = (_) => {
        r(B, _.target?.result, !0);
      }),
        v.readAsDataURL(c));
    }
  }
  async function et() {
    if (!(!e(E) || !e(m) || !ee)) {
      (r(O, !0), r(f, ''), r(w, ''));
      try {
        const t = new FormData();
        t.append('image', e(E));
        const a = `${y}/admin/images/upload?password=${encodeURIComponent(e(m))}`,
          c = await fetch(a, { method: 'POST', body: t });
        if (!c.ok) {
          const _ = await c.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(_.error || `HTTP ${c.status}: Failed to upload image`);
        }
        const v = await c.json();
        if (v.success && v.filename) {
          (r(I, v.filename, !0), r(w, 'Image uploaded successfully!'), r(E, null), r(B, null));
          const _ = document.getElementById('image-upload');
          (_ && (_.value = ''),
            setTimeout(() => {
              r(w, '');
            }, 3e3));
        } else throw new Error('Failed to upload image');
      } catch (t) {
        (console.error('Error uploading image:', t),
          t instanceof TypeError && t.message.includes('fetch')
            ? r(f, 'Network error: Is the backend server running on ' + y + '?')
            : r(f, t instanceof Error ? t.message : 'Failed to upload image', !0));
      } finally {
        r(O, !1);
      }
    }
  }
  async function tt() {
    if (!(!e(C) || !e(m) || !ee)) {
      (r(V, !0), r(f, ''), r(w, ''));
      try {
        const t = `${y}/admin/articles/${e(C)}/featured?password=${encodeURIComponent(e(m))}`,
          a = await fetch(t, { method: 'PUT', headers: { 'Content-Type': 'application/json' } });
        if (!a.ok) {
          const v = await a.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(v.error || `HTTP ${a.status}: Failed to set as featured`);
        }
        if ((await a.json()).success)
          (r(w, 'Article set as featured successfully!'),
            e(l) &&
              ((e(l).isFeatured = !0),
              (e(l).featuredDate = new Date().toISOString().split('T')[0])),
            setTimeout(() => {
              r(w, '');
            }, 3e3));
        else throw new Error('Failed to set as featured');
      } catch (t) {
        (console.error('Error setting as featured:', t),
          t instanceof TypeError && t.message.includes('fetch')
            ? r(f, 'Network error: Is the backend server running on ' + y + '?')
            : r(f, t instanceof Error ? t.message : 'Failed to set as featured', !0));
      } finally {
        r(V, !1);
      }
    }
  }
  function Se() {
    if (!e(l)?.isFeatured || !e(l)?.featuredDate) return !1;
    const t = new Date().toISOString().split('T')[0];
    return e(l).featuredDate === t;
  }
  (jt(() => {
    {
      const t = te().url.searchParams.get(re);
      t !== null ? r(m, t, !0) : r(m, '', !0);
    }
  }),
    Tt(() => {
      const t = te().url.searchParams.get(re);
      (t !== null ? r(m, t, !0) : r(m, '', !0), We());
    }));
  var ae = Gt();
  At('iw8rjb', (t) => {
    kt(() => {
      $t.title = 'Edit Article - Admin Panel';
    });
  });
  var se = i(ae),
    rt = s(i(se), 2);
  ((rt.__click = () => Nt(`${Ut}/articles?${re}=${encodeURIComponent(e(m))}`)), o(se));
  var Ae = s(se, 2);
  {
    var at = (t) => {
      var a = Ot(),
        c = i(a, !0);
      (o(a), x(() => S(c, e(f))), g(t, a));
    };
    A(Ae, (t) => {
      e(f) && !e(U) && t(at);
    });
  }
  var Ee = s(Ae, 2);
  {
    var st = (t) => {
      var a = Rt(),
        c = i(a, !0);
      (o(a), x(() => S(c, e(w))), g(t, a));
    };
    A(Ee, (t) => {
      e(w) && t(st);
    });
  }
  var it = s(Ee, 2);
  {
    var ot = (t) => {
        var a = Ht();
        g(t, a);
      },
      lt = (t) => {
        var a = Ne(),
          c = Oe(a);
        {
          var v = (k) => {
              var $ = Kt(),
                L = i($),
                J = i(L),
                N = s(i(J), 2);
              (X(N), Ie(2), o(J));
              var K = s(J, 2),
                ie = s(i(K), 2);
              (X(ie), o(K));
              var oe = s(K, 2),
                le = s(i(oe), 2);
              (ke(le), o(oe));
              var ne = s(oe, 2),
                ce = s(i(ne), 2);
              (ke(ce), o(ne));
              var de = s(ne, 2),
                ve = s(i(de), 2),
                ue = i(ve),
                xe = i(ue);
              ((xe.__change = Ze), Ie(2), o(ue));
              var nt = s(ue, 2);
              {
                var ct = (n) => {
                  var b = Bt(),
                    u = i(b),
                    j = i(u);
                  o(u);
                  var T = s(u, 2);
                  {
                    var bt = (z) => {
                      var Te = Mt(),
                        wt = s(i(Te), 2);
                      (o(Te), x(() => Re(wt, 'src', e(B))), g(z, Te));
                    };
                    A(T, (z) => {
                      e(B) && z(bt);
                    });
                  }
                  var Q = s(T, 2);
                  Q.__click = et;
                  var gt = i(Q, !0);
                  (o(Q),
                    o(b),
                    x(
                      (z) => {
                        (S(j, `Selected: ${e(E).name ?? ''} (${z ?? ''} MB)`),
                          (Q.disabled = e(O) || e(p)),
                          S(gt, e(O) ? 'Uploading...' : '⬆️ Upload Image'));
                      },
                      [() => (e(E).size / 1024 / 1024).toFixed(2)],
                    ),
                    g(n, b));
                };
                A(nt, (n) => {
                  e(E) && n(ct);
                });
              }
              o(ve);
              var pe = s(ve, 2),
                fe = s(i(pe), 2);
              (X(fe), o(pe));
              var dt = s(pe, 2);
              {
                var vt = (n) => {
                  var b = Lt(),
                    u = s(i(b), 2);
                  (o(b),
                    x((j) => Re(u, 'src', j), [() => ze(e(I))]),
                    Ue('error', u, (j) => {
                      const T = j.currentTarget;
                      T.style.display = 'none';
                    }),
                    ht(u),
                    g(n, b));
                };
                A(dt, (n) => {
                  e(I) && !e(B) && n(vt);
                });
              }
              o(de);
              var me = s(de, 2),
                Y = s(i(me), 2),
                be = i(Y);
              be.value = be.__value = '';
              var ut = s(be);
              (xt(
                ut,
                17,
                () => Ke,
                Dt,
                (n, b) => {
                  var u = Jt(),
                    j = i(u, !0);
                  o(u);
                  var T = {};
                  (x(() => {
                    (S(j, e(b)), T !== (T = e(b)) && (u.value = (u.__value = e(b)) ?? ''));
                  }),
                    g(n, u));
                },
              ),
                o(Y),
                o(me));
              var ge = s(me, 2),
                q = s(i(ge), 2),
                we = i(q);
              we.value = we.__value = 'AI';
              var _e = s(we);
              _e.value = _e.__value = 'Human';
              var De = s(_e);
              ((De.value = De.__value = 'Synthesis'), o(q), o(ge));
              var he = s(ge, 2),
                W = s(i(he), 2);
              (X(W), (W.__input = qe));
              var Fe = s(W, 2),
                pt = i(Fe);
              (o(Fe), o(he));
              var ye = s(he, 2),
                Pe = s(i(ye), 2);
              (ke(Pe), Ie(2), o(ye));
              var Ce = s(ye, 2),
                G = i(Ce);
              G.__click = tt;
              var ft = i(G, !0);
              o(G);
              var je = s(G, 2),
                mt = i(je, !0);
              (o(je),
                o(Ce),
                o(L),
                o($),
                x(
                  (n, b, u, j, T) => {
                    ($e(N, e(l).key || ''),
                      (ie.disabled = e(p)),
                      (le.disabled = e(p)),
                      (ce.disabled = e(p)),
                      (xe.disabled = e(O) || e(p)),
                      (fe.disabled = e(p)),
                      (Y.disabled = e(p)),
                      (q.disabled = e(p)),
                      $e(W, n),
                      (W.disabled = e(p)),
                      S(pt, `Current value: ${(e(P) || 'Not set') ?? ''}`),
                      $e(Pe, b),
                      (G.disabled = u),
                      S(ft, j),
                      (je.disabled = T),
                      S(mt, e(p) ? 'Saving...' : '💾 Save Changes'));
                  },
                  [
                    Qe,
                    () => Xe(e(l).originalNewsItem),
                    () => e(V) || e(p) || Se(),
                    () =>
                      e(V)
                        ? 'Setting...'
                        : Se()
                          ? '⭐ Currently Featured'
                          : '⭐ Set as Featured Article',
                    () => e(p) || !e(D).trim() || !e(F).trim(),
                  ],
                ),
                Ue('submit', L, (n) => {
                  (n.preventDefault(), Ge());
                }),
                Z(
                  ie,
                  () => e(D),
                  (n) => r(D, n),
                ),
                Z(
                  le,
                  () => e(H),
                  (n) => r(H, n),
                ),
                Z(
                  ce,
                  () => e(F),
                  (n) => r(F, n),
                ),
                Z(
                  fe,
                  () => e(I),
                  (n) => r(I, n),
                ),
                He(
                  Y,
                  () => e(R),
                  (n) => r(R, n),
                ),
                He(
                  q,
                  () => e(M),
                  (n) => r(M, n),
                ),
                g(k, $));
            },
            _ = (k) => {
              var $ = Ne(),
                L = Oe($);
              {
                var J = (N) => {
                  var K = Wt();
                  g(N, K);
                };
                A(
                  L,
                  (N) => {
                    e(U) || N(J);
                  },
                  !0,
                );
              }
              g(k, $);
            };
          A(
            c,
            (k) => {
              e(l) ? k(v) : k(_, !1);
            },
            !0,
          );
        }
        g(t, a);
      };
    A(it, (t) => {
      e(U) ? t(ot) : t(lt, !1);
    });
  }
  (o(ae), g(Me, ae), It(), Je());
}
_t(['click', 'change', 'input']);
export { tr as component };
