import {
  ab as D,
  z as A,
  ah as Z,
  a0 as L,
  a6 as te,
  a5 as $,
  a as G,
  b as le,
  a8 as ue,
  a9 as ve,
  aa as P,
  ac as R,
  a2 as k,
  ai as J,
  aj as ce,
  ak as V,
  n as oe,
  a1 as Y,
  a4 as de,
  al as W,
  r as _e,
  Q as pe,
  am as K,
  an as j,
  ao as ee,
  ap as he,
  Y as ae,
  _ as ge,
  aq as z,
  ar as q,
  as as me,
  at as Ee,
  au as Ae,
  Z as be,
  av as re,
  aw as se,
  ax as Te,
  ay as Ne,
  az as Se,
  aA as xe,
  aB as Ie,
  aC as Ce,
  aD as Me,
} from './CzCAzTT7.js';
import { s as we } from './CL4eq0AM.js';
function Ye(e, a) {
  return a;
}
function ke(e, a, r) {
  for (var u = [], t = a.length, n = 0; n < t; n++) me(a[n].e, u, !0);
  Ee(u, () => {
    var f = u.length === 0 && r !== null;
    if (f) {
      var p = r,
        i = p.parentNode;
      (Ae(i), i.append(p), e.items.clear(), E(e, a[0].prev, a[t - 1].next));
    }
    for (var _ = 0; _ < t; _++) {
      var l = a[_];
      (f || (e.items.delete(l.k), E(e, l.prev, l.next)), be(l.e, !f));
    }
    e.first === a[0] && (e.first = a[0].prev);
  });
}
function qe(e, a, r, u, t, n = null) {
  var f = e,
    p = new Map(),
    i = null,
    _ = (a & se) !== 0,
    l = (a & ee) !== 0,
    T = (a & j) !== 0;
  if (_) {
    var d = e;
    f = A ? D(Z(d)) : d.appendChild(L());
  }
  A && te();
  var v = null,
    S = le(() => {
      var o = r();
      return _e(o) ? o : o == null ? [] : W(o);
    }),
    h,
    s = !0;
  function c() {
    (De(x, h, f, a, u),
      v !== null &&
        (h.length === 0
          ? (v.fragment ? (f.before(v.fragment), (v.fragment = null)) : ae(v.effect),
            (C.first = v.effect))
          : ge(v.effect, () => {
              v = null;
            })));
  }
  var C = $(() => {
      h = G(S);
      var o = h.length;
      let I = !1;
      if (A) {
        var M = ue(f) === ve;
        M !== (o === 0) && ((f = P()), D(f), R(!1), (I = !0));
      }
      for (var w = new Set(), b = oe, N = null, y = de(), g = 0; g < o; g += 1) {
        A && k.nodeType === J && k.data === ce && ((f = k), (I = !0), R(!1));
        var O = h[g],
          H = u(O, g),
          m = s ? null : p.get(H);
        (m
          ? (l && V(m.v, O), T ? V(m.i, g) : (m.i = g), y && b.skipped_effects.delete(m.e))
          : ((m = Re(s ? f : null, N, O, H, g, t, a, r)),
            s && ((m.o = !0), N === null ? (i = m) : (N.next = m), (N = m)),
            p.set(H, m)),
          w.add(H));
      }
      if (o === 0 && n && !v)
        if (s) v = { fragment: null, effect: Y(() => n(f)) };
        else {
          var B = document.createDocumentFragment(),
            U = L();
          (B.append(U), (v = { fragment: B, effect: Y(() => n(U)) }));
        }
      if ((A && o > 0 && D(P()), !s))
        if (y) {
          for (const [fe, ie] of p) w.has(fe) || b.skipped_effects.add(ie.e);
          (b.oncommit(c), b.ondiscard(() => {}));
        } else c();
      (I && R(!0), G(S));
    }),
    x = { effect: C, items: p, first: i };
  ((s = !1), A && (f = k));
}
function De(e, a, r, u, t) {
  var n = (u & Te) !== 0,
    f = a.length,
    p = e.items,
    i = e.first,
    _,
    l = null,
    T,
    d = [],
    v = [],
    S,
    h,
    s,
    c;
  if (n)
    for (c = 0; c < f; c += 1)
      ((S = a[c]),
        (h = t(S, c)),
        (s = p.get(h)),
        s.o && (s.a?.measure(), (T ??= new Set()).add(s)));
  for (c = 0; c < f; c += 1) {
    if (((S = a[c]), (h = t(S, c)), (s = p.get(h)), (e.first ??= s), !s.o)) {
      s.o = !0;
      var C = l ? l.next : i;
      (E(e, l, s), E(e, s, C), F(s, C, r), (l = s), (d = []), (v = []), (i = l.next));
      continue;
    }
    if (
      ((s.e.f & z) !== 0 && (ae(s.e), n && (s.a?.unfix(), (T ??= new Set()).delete(s))), s !== i)
    ) {
      if (_ !== void 0 && _.has(s)) {
        if (d.length < v.length) {
          var x = v[0],
            o;
          l = x.prev;
          var I = d[0],
            M = d[d.length - 1];
          for (o = 0; o < d.length; o += 1) F(d[o], x, r);
          for (o = 0; o < v.length; o += 1) _.delete(v[o]);
          (E(e, I.prev, M.next),
            E(e, l, I),
            E(e, M, x),
            (i = x),
            (l = M),
            (c -= 1),
            (d = []),
            (v = []));
        } else
          (_.delete(s),
            F(s, i, r),
            E(e, s.prev, s.next),
            E(e, s, l === null ? e.first : l.next),
            E(e, l, s),
            (l = s));
        continue;
      }
      for (d = [], v = []; i !== null && i.k !== h; )
        ((i.e.f & z) === 0 && (_ ??= new Set()).add(i), v.push(i), (i = i.next));
      if (i === null) continue;
      s = i;
    }
    (d.push(s), (l = s), (i = s.next));
  }
  let w = p.size > f;
  if (i !== null || _ !== void 0) {
    for (var b = _ === void 0 ? [] : W(_); i !== null; )
      ((i.e.f & z) === 0 && b.push(i), (i = i.next));
    var N = b.length;
    if (((w = p.size - N > f), N > 0)) {
      var y = (u & se) !== 0 && f === 0 ? r : null;
      if (n) {
        for (c = 0; c < N; c += 1) b[c].a?.measure();
        for (c = 0; c < N; c += 1) b[c].a?.fix();
      }
      ke(e, b, y);
    }
  }
  if (w) for (const g of p.values()) g.o || (E(e, l, g), (l = g));
  ((e.effect.last = l && l.e),
    n &&
      re(() => {
        if (T !== void 0) for (s of T) s.a?.apply();
      }));
}
function Re(e, a, r, u, t, n, f, p) {
  var i = (f & ee) !== 0,
    _ = (f & he) === 0,
    l = i ? (_ ? pe(r, !1, !1) : K(r)) : r,
    T = (f & j) === 0 ? t : K(t),
    d = { i: T, v: l, k: u, a: null, e: null, o: !1, prev: a, next: null };
  try {
    if (e === null) {
      var v = document.createDocumentFragment();
      v.append((e = L()));
    }
    return ((d.e = Y(() => n(e, l, T, p))), a !== null && (a.next = d), d);
  } finally {
  }
}
function F(e, a, r) {
  for (
    var u = e.next ? e.next.e.nodes_start : r, t = a ? a.e.nodes_start : r, n = e.e.nodes_start;
    n !== null && n !== u;
  ) {
    var f = q(n);
    (t.before(n), (n = f));
  }
}
function E(e, a, r) {
  (a === null
    ? ((e.first = r), (e.effect.first = r && r.e))
    : (a.e.next && (a.e.next.prev = null), (a.next = r), (a.e.next = r && r.e)),
    r !== null && (r.e.prev && (r.e.prev.next = null), (r.prev = a), (r.e.prev = a && a.e)));
}
function Be(e, a) {
  let r = null,
    u = A;
  var t;
  if (A) {
    r = k;
    for (var n = Z(document.head); n !== null && (n.nodeType !== J || n.data !== e); ) n = q(n);
    if (n === null) R(!1);
    else {
      var f = q(n);
      (n.remove(), D(f));
    }
  }
  A || (t = document.head.appendChild(L()));
  try {
    $(() => a(t), Ne);
  } finally {
    u && (R(!0), D(r));
  }
}
const ye = Symbol('is custom element'),
  He = Symbol('is html');
function Ue(e) {
  if (A) {
    var a = !1,
      r = () => {
        if (!a) {
          if (((a = !0), e.hasAttribute('value'))) {
            var u = e.value;
            (Q(e, 'value', null), (e.value = u));
          }
          if (e.hasAttribute('checked')) {
            var t = e.checked;
            (Q(e, 'checked', null), (e.checked = t));
          }
        }
      };
    ((e.__on_r = r), re(r), xe());
  }
}
function Ge(e, a) {
  var r = ne(e);
  r.value === (r.value = a ?? void 0) ||
    (e.value === a && (a !== 0 || e.nodeName !== 'PROGRESS')) ||
    (e.value = a ?? '');
}
function Q(e, a, r, u) {
  var t = ne(e);
  (A &&
    ((t[a] = e.getAttribute(a)),
    a === 'src' || a === 'srcset' || (a === 'href' && e.nodeName === 'LINK'))) ||
    (t[a] !== (t[a] = r) &&
      (a === 'loading' && (e[Ie] = r),
      r == null
        ? e.removeAttribute(a)
        : typeof r != 'string' && Le(e).includes(a)
          ? (e[a] = r)
          : e.setAttribute(a, r)));
}
function ne(e) {
  return (e.__attributes ??= { [ye]: e.nodeName.includes('-'), [He]: e.namespaceURI === Se });
}
var X = new Map();
function Le(e) {
  var a = e.getAttribute('is') || e.nodeName,
    r = X.get(a);
  if (r) return r;
  X.set(a, (r = []));
  for (var u, t = e, n = Element.prototype; n !== t; ) {
    u = Me(t);
    for (var f in u) u[f].set && r.push(f);
    t = Ce(t);
  }
  return r;
}
const Oe = () => {
    const e = we;
    return {
      page: { subscribe: e.page.subscribe },
      navigating: { subscribe: e.navigating.subscribe },
      updated: e.updated,
    };
  },
  Pe = {
    subscribe(e) {
      return Oe().page.subscribe(e);
    },
  };
export { Q as a, qe as e, Be as h, Ye as i, Pe as p, Ue as r, Ge as s };
