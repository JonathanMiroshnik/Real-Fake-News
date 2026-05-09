import {
  n as _,
  Y as g,
  Z as h,
  _ as y,
  a0 as b,
  a1 as p,
  z as d,
  a2 as k,
  a3 as w,
  a4 as T,
  a5 as A,
  a6 as E,
  a7 as S,
  a8 as M,
  a9 as N,
  aa as D,
  ab as F,
  ac as v,
  ad as m,
  Q as R,
  ae as x,
  af as B,
  a as C,
  w as I,
  s as O,
  ag as U,
} from './CzCAzTT7.js';
class Y {
  anchor;
  #s = new Map();
  #t = new Map();
  #e = new Map();
  #a = new Set();
  #r = !0;
  constructor(s, t = !0) {
    ((this.anchor = s), (this.#r = t));
  }
  #i = () => {
    var s = _;
    if (this.#s.has(s)) {
      var t = this.#s.get(s),
        e = this.#t.get(t);
      if (e) (g(e), this.#a.delete(t));
      else {
        var n = this.#e.get(t);
        n &&
          (this.#t.set(t, n.effect),
          this.#e.delete(t),
          n.fragment.lastChild.remove(),
          this.anchor.before(n.fragment),
          (e = n.effect));
      }
      for (const [a, i] of this.#s) {
        if ((this.#s.delete(a), a === s)) break;
        const f = this.#e.get(i);
        f && (h(f.effect), this.#e.delete(i));
      }
      for (const [a, i] of this.#t) {
        if (a === t || this.#a.has(a)) continue;
        const f = () => {
          if (Array.from(this.#s.values()).includes(a)) {
            var o = document.createDocumentFragment();
            (w(i, o), o.append(b()), this.#e.set(a, { effect: i, fragment: o }));
          } else h(i);
          (this.#a.delete(a), this.#t.delete(a));
        };
        this.#r || !e ? (this.#a.add(a), y(i, f, !1)) : f();
      }
    }
  };
  #n = (s) => {
    this.#s.delete(s);
    const t = Array.from(this.#s.values());
    for (const [e, n] of this.#e) t.includes(e) || (h(n.effect), this.#e.delete(e));
  };
  ensure(s, t) {
    var e = _,
      n = T();
    if (t && !this.#t.has(s) && !this.#e.has(s))
      if (n) {
        var a = document.createDocumentFragment(),
          i = b();
        (a.append(i), this.#e.set(s, { effect: p(() => t(i)), fragment: a }));
      } else
        this.#t.set(
          s,
          p(() => t(this.anchor)),
        );
    if ((this.#s.set(e, s), n)) {
      for (const [f, c] of this.#t)
        f === s ? e.skipped_effects.delete(c) : e.skipped_effects.add(c);
      for (const [f, c] of this.#e)
        f === s ? e.skipped_effects.delete(c.effect) : e.skipped_effects.add(c.effect);
      (e.oncommit(this.#i), e.ondiscard(this.#n));
    } else (d && (this.anchor = k), this.#i());
  }
}
function H(r, s, t = !1) {
  d && E();
  var e = new Y(r),
    n = t ? S : 0;
  function a(i, f) {
    if (d) {
      const o = M(r) === N;
      if (i === o) {
        var c = D();
        (F(c), (e.anchor = c), v(!1), e.ensure(i, f), v(!0));
        return;
      }
    }
    e.ensure(i, f);
  }
  A(() => {
    var i = !1;
    (s((f, c = !0) => {
      ((i = !0), a(c, f));
    }),
      i || a(!1, null));
  }, n);
}
let u = !1,
  l = Symbol();
function L(r, s, t) {
  const e = (t[s] ??= { store: null, source: R(void 0), unsubscribe: m });
  if (e.store !== r && !(l in t))
    if ((e.unsubscribe(), (e.store = r ?? null), r == null))
      ((e.source.v = void 0), (e.unsubscribe = m));
    else {
      var n = !0;
      ((e.unsubscribe = x(r, (a) => {
        n ? (e.source.v = a) : O(e.source, a);
      })),
        (n = !1));
    }
  return r && l in t ? B(r) : C(e.source);
}
function P() {
  const r = {};
  function s() {
    I(() => {
      for (var t in r) r[t].unsubscribe();
      U(r, l, { enumerable: !1, value: !0 });
    });
  }
  return [r, s];
}
function Q(r) {
  var s = u;
  try {
    return ((u = !1), [r(), u]);
  } finally {
    u = s;
  }
}
export { Y as B, L as a, Q as c, H as i, P as s };
