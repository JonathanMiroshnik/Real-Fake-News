import {
  aF as z,
  a as U,
  am as G,
  y as J,
  u as K,
  aG as B,
  av as H,
  a2 as l,
  z as c,
  e as v,
  a5 as Q,
  a6 as $,
  ai as V,
  a9 as ee,
  a1 as p,
  aH as A,
  _ as L,
  a0 as w,
  aI as M,
  aJ as m,
  aK as W,
  aL as te,
  aM as F,
  R as j,
  a3 as re,
  ak as ne,
  Z as D,
  ab as N,
  M as se,
  aa as ie,
  aN as Y,
  aO as ae,
  a7 as oe,
  aP as ue,
  aQ as fe,
  aR as le,
  ag as he,
  w as ce,
  aS as de,
  ah as k,
  aT as _e,
  aU as pe,
  aV as ve,
  aW as ge,
  aX as ye,
  aY as C,
  aZ as Ee,
  ar as me,
  a_ as P,
  ac as S,
  a$ as be,
  au as Te,
  al as we,
  b0 as Ne,
  A as Re,
  aj as Ae,
  b1 as Se,
  G as Me,
} from './CzCAzTT7.js';
function Oe(t) {
  let e = 0,
    r = G(0),
    i;
  return () => {
    z() &&
      (U(r),
      J(
        () => (
          e === 0 && (i = K(() => t(() => B(r)))),
          (e += 1),
          () => {
            H(() => {
              ((e -= 1), e === 0 && (i?.(), (i = void 0), B(r)));
            });
          }
        ),
      ));
  };
}
var Le = oe | ue | fe;
function De(t, e, r) {
  new Fe(t, e, r);
}
class Fe {
  parent;
  #r = !1;
  #t;
  #v = c ? l : null;
  #s;
  #h;
  #i;
  #n = null;
  #e = null;
  #a = null;
  #o = null;
  #u = null;
  #c = 0;
  #f = 0;
  #d = !1;
  #l = null;
  #E = Oe(
    () => (
      (this.#l = G(this.#c)),
      () => {
        this.#l = null;
      }
    ),
  );
  constructor(e, r, i) {
    ((this.#t = e),
      (this.#s = r),
      (this.#h = i),
      (this.parent = v.b),
      (this.#r = !!this.#s.pending),
      (this.#i = Q(() => {
        if (((v.b = this), c)) {
          const n = this.#v;
          ($(), n.nodeType === V && n.data === ee ? this.#b() : this.#m());
        } else {
          var s = this.#g();
          try {
            this.#n = p(() => i(s));
          } catch (n) {
            this.error(n);
          }
          this.#f > 0 ? this.#p() : (this.#r = !1);
        }
        return () => {
          this.#u?.remove();
        };
      }, Le)),
      c && (this.#t = l));
  }
  #m() {
    try {
      this.#n = p(() => this.#h(this.#t));
    } catch (e) {
      this.error(e);
    }
    this.#r = !1;
  }
  #b() {
    const e = this.#s.pending;
    e &&
      ((this.#e = p(() => e(this.#t))),
      A.enqueue(() => {
        var r = this.#g();
        ((this.#n = this.#_(() => (A.ensure(), p(() => this.#h(r))))),
          this.#f > 0
            ? this.#p()
            : (L(this.#e, () => {
                this.#e = null;
              }),
              (this.#r = !1)));
      }));
  }
  #g() {
    var e = this.#t;
    return (this.#r && ((this.#u = w()), this.#t.before(this.#u), (e = this.#u)), e);
  }
  is_pending() {
    return this.#r || (!!this.parent && this.parent.is_pending());
  }
  has_pending_snippet() {
    return !!this.#s.pending;
  }
  #_(e) {
    var r = v,
      i = F,
      s = j;
    (M(this.#i), m(this.#i), W(this.#i.ctx));
    try {
      return e();
    } catch (n) {
      return (te(n), null);
    } finally {
      (M(r), m(i), W(s));
    }
  }
  #p() {
    const e = this.#s.pending;
    (this.#n !== null &&
      ((this.#o = document.createDocumentFragment()),
      this.#o.append(this.#u),
      re(this.#n, this.#o)),
      this.#e === null && (this.#e = p(() => e(this.#t))));
  }
  #y(e) {
    if (!this.has_pending_snippet()) {
      this.parent && this.parent.#y(e);
      return;
    }
    ((this.#f += e),
      this.#f === 0 &&
        ((this.#r = !1),
        this.#e &&
          L(this.#e, () => {
            this.#e = null;
          }),
        this.#o && (this.#t.before(this.#o), (this.#o = null))));
  }
  update_pending_count(e) {
    (this.#y(e), (this.#c += e), this.#l && ne(this.#l, this.#c));
  }
  get_effect_pending() {
    return (this.#E(), U(this.#l));
  }
  error(e) {
    var r = this.#s.onerror;
    let i = this.#s.failed;
    if (this.#d || (!r && !i)) throw e;
    (this.#n && (D(this.#n), (this.#n = null)),
      this.#e && (D(this.#e), (this.#e = null)),
      this.#a && (D(this.#a), (this.#a = null)),
      c && (N(this.#v), se(), N(ie())));
    var s = !1,
      n = !1;
    const a = () => {
      if (s) {
        le();
        return;
      }
      ((s = !0),
        n && ae(),
        A.ensure(),
        (this.#c = 0),
        this.#a !== null &&
          L(this.#a, () => {
            this.#a = null;
          }),
        (this.#r = this.has_pending_snippet()),
        (this.#n = this.#_(() => ((this.#d = !1), p(() => this.#h(this.#t))))),
        this.#f > 0 ? this.#p() : (this.#r = !1));
    };
    var h = F;
    try {
      (m(null), (n = !0), r?.(e, a), (n = !1));
    } catch (f) {
      Y(f, this.#i && this.#i.parent);
    } finally {
      m(h);
    }
    i &&
      H(() => {
        this.#a = this.#_(() => {
          (A.ensure(), (this.#d = !0));
          try {
            return p(() => {
              i(
                this.#t,
                () => e,
                () => a,
              );
            });
          } catch (f) {
            return (Y(f, this.#i.parent), null);
          } finally {
            this.#d = !1;
          }
        });
      });
  }
}
const ke = ['touchstart', 'touchmove'];
function Ce(t) {
  return ke.includes(t);
}
const X = new Set(),
  x = new Set();
function Be(t) {
  if (!c) return;
  (t.removeAttribute('onload'), t.removeAttribute('onerror'));
  const e = t.__e;
  e !== void 0 &&
    ((t.__e = void 0),
    queueMicrotask(() => {
      t.isConnected && t.dispatchEvent(e);
    }));
}
function Pe(t, e, r, i = {}) {
  function s(n) {
    if ((i.capture || T.call(e, n), !n.cancelBubble)) return de(() => r?.call(this, n));
  }
  return (
    t.startsWith('pointer') || t.startsWith('touch') || t === 'wheel'
      ? H(() => {
          e.addEventListener(t, s, i);
        })
      : e.addEventListener(t, s, i),
    s
  );
}
function We(t, e, r, i, s) {
  var n = { capture: i, passive: s },
    a = Pe(t, e, r, n);
  (e === document.body || e === window || e === document || e instanceof HTMLMediaElement) &&
    ce(() => {
      e.removeEventListener(t, a, n);
    });
}
function Ye(t) {
  for (var e = 0; e < t.length; e++) X.add(t[e]);
  for (var r of x) r(t);
}
let q = null;
function T(t) {
  var e = this,
    r = e.ownerDocument,
    i = t.type,
    s = t.composedPath?.() || [],
    n = s[0] || t.target;
  q = t;
  var a = 0,
    h = q === t && t.__root;
  if (h) {
    var f = s.indexOf(h);
    if (f !== -1 && (e === document || e === window)) {
      t.__root = e;
      return;
    }
    var g = s.indexOf(e);
    if (g === -1) return;
    f <= g && (a = f);
  }
  if (((n = s[a] || t.target), n !== e)) {
    he(t, 'currentTarget', {
      configurable: !0,
      get() {
        return n || r;
      },
    });
    var O = F,
      d = v;
    (m(null), M(null));
    try {
      for (var o, u = []; n !== null; ) {
        var y = n.assignedSlot || n.parentNode || n.host || null;
        try {
          var b = n['__' + i];
          b != null && (!n.disabled || t.target === n) && b.call(n, t);
        } catch (R) {
          o ? u.push(R) : (o = R);
        }
        if (t.cancelBubble || y === e || y === null) break;
        n = y;
      }
      if (o) {
        for (let R of u)
          queueMicrotask(() => {
            throw R;
          });
        throw o;
      }
    } finally {
      ((t.__root = e), delete t.currentTarget, m(O), M(d));
    }
  }
}
function xe(t) {
  var e = document.createElement('template');
  return ((e.innerHTML = t.replaceAll('<!>', '<!---->')), e.content);
}
function _(t, e) {
  var r = v;
  r.nodes_start === null && ((r.nodes_start = t), (r.nodes_end = e));
}
function qe(t, e) {
  var r = (e & pe) !== 0,
    i = (e & ve) !== 0,
    s,
    n = !t.startsWith('<!>');
  return () => {
    if (c) return (_(l, null), l);
    s === void 0 && ((s = xe(n ? t : '<!>' + t)), r || (s = k(s)));
    var a = i || _e ? document.importNode(s, !0) : s.cloneNode(!0);
    if (r) {
      var h = k(a),
        f = a.lastChild;
      _(h, f);
    } else _(a, a);
    return a;
  };
}
function Ue(t = '') {
  if (!c) {
    var e = w(t + '');
    return (_(e, e), e);
  }
  var r = l;
  return (r.nodeType !== ye && (r.before((r = w())), N(r)), _(r, r), r);
}
function Ge() {
  if (c) return (_(l, null), l);
  var t = document.createDocumentFragment(),
    e = document.createComment(''),
    r = w();
  return (t.append(e, r), _(e, r), t);
}
function $e(t, e) {
  if (c) {
    var r = v;
    (((r.f & ge) === 0 || r.nodes_end === null) && (r.nodes_end = l), $());
    return;
  }
  t !== null && t.before(e);
}
function je(t, e) {
  var r = e == null ? '' : typeof e == 'object' ? e + '' : e;
  r !== (t.__t ??= t.nodeValue) && ((t.__t = r), (t.nodeValue = r + ''));
}
function Ie(t, e) {
  return Z(t, e);
}
function Xe(t, e) {
  (C(), (e.intro = e.intro ?? !1));
  const r = e.target,
    i = c,
    s = l;
  try {
    for (var n = k(r); n && (n.nodeType !== V || n.data !== Ee); ) n = me(n);
    if (!n) throw P;
    (S(!0), N(n));
    const a = Z(t, { ...e, anchor: n });
    return (S(!1), a);
  } catch (a) {
    if (
      a instanceof Error &&
      a.message
        .split(
          `
`,
        )
        .some((h) => h.startsWith('https://svelte.dev/e/'))
    )
      throw a;
    return (
      a !== P && console.warn('Failed to hydrate: ', a),
      e.recover === !1 && be(),
      C(),
      Te(r),
      S(!1),
      Ie(t, e)
    );
  } finally {
    (S(i), N(s));
  }
}
const E = new Map();
function Z(t, { target: e, anchor: r, props: i = {}, events: s, context: n, intro: a = !0 }) {
  C();
  var h = new Set(),
    f = (d) => {
      for (var o = 0; o < d.length; o++) {
        var u = d[o];
        if (!h.has(u)) {
          h.add(u);
          var y = Ce(u);
          e.addEventListener(u, T, { passive: y });
          var b = E.get(u);
          b === void 0
            ? (document.addEventListener(u, T, { passive: y }), E.set(u, 1))
            : E.set(u, b + 1);
        }
      }
    };
  (f(we(X)), x.add(f));
  var g = void 0,
    O = Ne(() => {
      var d = r ?? e.appendChild(w());
      return (
        De(d, { pending: () => {} }, (o) => {
          if (n) {
            Re({});
            var u = j;
            u.c = n;
          }
          if (
            (s && (i.$$events = s),
            c && _(o, null),
            (g = t(o, i) || {}),
            c && ((v.nodes_end = l), l === null || l.nodeType !== V || l.data !== Ae))
          )
            throw (Se(), P);
          n && Me();
        }),
        () => {
          for (var o of h) {
            e.removeEventListener(o, T);
            var u = E.get(o);
            --u === 0 ? (document.removeEventListener(o, T), E.delete(o)) : E.set(o, u);
          }
          (x.delete(f), d !== r && d.parentNode?.removeChild(d));
        }
      );
    });
  return (I.set(g, O), g);
}
let I = new WeakMap();
function Ze(t, e) {
  const r = I.get(t);
  return r ? (I.delete(t), r(e)) : Promise.resolve();
}
const He = '5';
typeof window < 'u' && ((window.__svelte ??= {}).v ??= new Set()).add(He);
export {
  $e as a,
  Ge as c,
  Ye as d,
  We as e,
  qe as f,
  Xe as h,
  Ie as m,
  Be as r,
  je as s,
  Ue as t,
  Ze as u,
};
