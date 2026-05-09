var Ut = Array.isArray,
  Bt = Array.prototype.indexOf,
  Ln = Array.from,
  qn = Object.defineProperty,
  oe = Object.getOwnPropertyDescriptor,
  Vt = Object.getOwnPropertyDescriptors,
  Gt = Object.prototype,
  zt = Array.prototype,
  lt = Object.getPrototypeOf,
  tt = Object.isExtensible;
const ye = () => {};
function Yn(e) {
  return e();
}
function Kt(e) {
  for (var t = 0; t < e.length; t++) e[t]();
}
function ut() {
  var e,
    t,
    n = new Promise((r, s) => {
      ((e = r), (t = s));
    });
  return { promise: n, resolve: e, reject: t };
}
const y = 2,
  Ue = 4,
  Oe = 8,
  $t = 1 << 24,
  F = 16,
  j = 32,
  ne = 64,
  Be = 128,
  D = 512,
  g = 1024,
  A = 2048,
  L = 4096,
  P = 8192,
  Y = 16384,
  Ve = 32768,
  Ee = 65536,
  Me = 1 << 17,
  ot = 1 << 18,
  de = 1 << 19,
  ct = 1 << 20,
  Q = 32768,
  Fe = 1 << 21,
  Ge = 1 << 22,
  H = 1 << 23,
  W = Symbol('$state'),
  Hn = Symbol('legacy props'),
  Un = Symbol(''),
  se = new (class extends Error {
    name = 'StaleReactionError';
    message = 'The reaction that called `getAbortSignal()` was re-run or destroyed';
  })(),
  ze = 3,
  _t = 8;
function Xt(e) {
  throw new Error('https://svelte.dev/e/experimental_async_required');
}
function Zt(e) {
  throw new Error('https://svelte.dev/e/lifecycle_outside_component');
}
function Wt() {
  throw new Error('https://svelte.dev/e/async_derived_orphan');
}
function Jt(e) {
  throw new Error('https://svelte.dev/e/effect_in_teardown');
}
function Qt() {
  throw new Error('https://svelte.dev/e/effect_in_unowned_derived');
}
function en(e) {
  throw new Error('https://svelte.dev/e/effect_orphan');
}
function tn() {
  throw new Error('https://svelte.dev/e/effect_update_depth_exceeded');
}
function nn() {
  throw new Error('https://svelte.dev/e/fork_discarded');
}
function rn() {
  throw new Error('https://svelte.dev/e/fork_timing');
}
function Vn() {
  throw new Error('https://svelte.dev/e/hydration_failed');
}
function Gn(e) {
  throw new Error('https://svelte.dev/e/props_invalid_value');
}
function sn() {
  throw new Error('https://svelte.dev/e/state_descriptors_fixed');
}
function fn() {
  throw new Error('https://svelte.dev/e/state_prototype_fixed');
}
function an() {
  throw new Error('https://svelte.dev/e/state_unsafe_mutation');
}
function zn() {
  throw new Error('https://svelte.dev/e/svelte_boundary_reset_onerror');
}
const Kn = 1,
  $n = 2,
  Xn = 4,
  Zn = 8,
  Wn = 16,
  Jn = 1,
  Qn = 2,
  er = 4,
  tr = 8,
  nr = 16,
  rr = 1,
  sr = 2,
  ln = '[',
  un = '[!',
  on = ']',
  Ke = {},
  b = Symbol(),
  fr = 'http://www.w3.org/1999/xhtml';
function $e(e) {
  console.warn('https://svelte.dev/e/hydration_mismatch');
}
function ir() {
  console.warn('https://svelte.dev/e/select_multiple_invalid_value');
}
function ar() {
  console.warn('https://svelte.dev/e/svelte_boundary_reset_noop');
}
let V = !1;
function lr(e) {
  V = e;
}
let x;
function fe(e) {
  if (e === null) throw ($e(), Ke);
  return (x = e);
}
function ur() {
  return fe(K(x));
}
function or(e) {
  if (V) {
    if (K(x) !== null) throw ($e(), Ke);
    x = e;
  }
}
function cr(e = 1) {
  if (V) {
    for (var t = e, n = x; t--; ) n = K(n);
    x = n;
  }
}
function _r(e = !0) {
  for (var t = 0, n = x; ; ) {
    if (n.nodeType === _t) {
      var r = n.data;
      if (r === on) {
        if (t === 0) return n;
        t -= 1;
      } else (r === ln || r === un) && (t += 1);
    }
    var s = K(n);
    (e && n.remove(), (n = s));
  }
}
function vr(e) {
  if (!e || e.nodeType !== _t) throw ($e(), Ke);
  return e.data;
}
function vt(e) {
  return e === this.v;
}
function dt(e, t) {
  return e != e
    ? t == t
    : e !== t || (e !== null && typeof e == 'object') || typeof e == 'function';
}
function ht(e) {
  return !dt(e, this.v);
}
let he = !1;
function dr() {
  he = !0;
}
let w = null;
function be(e) {
  w = e;
}
function hr(e, t = !1, n) {
  w = {
    p: w,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    l: he && !t ? { s: null, u: null, $: [] } : null,
  };
}
function pr(e) {
  var t = w,
    n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n) St(r);
  }
  return (e !== void 0 && (t.x = e), (t.i = !0), (w = t.p), e ?? {});
}
function pe() {
  return !he || (w !== null && w.l === null);
}
let X = [];
function pt() {
  var e = X;
  ((X = []), Kt(e));
}
function cn(e) {
  if (X.length === 0 && !ce) {
    var t = X;
    queueMicrotask(() => {
      t === X && pt();
    });
  }
  X.push(e);
}
function _n() {
  for (; X.length > 0; ) pt();
}
function vn(e) {
  var t = h;
  if (t === null) return ((_.f |= H), e);
  if ((t.f & Ve) === 0) {
    if ((t.f & Be) === 0) throw e;
    t.b.error(e);
  } else ge(e, t);
}
function ge(e, t) {
  for (; t !== null; ) {
    if ((t.f & Be) !== 0)
      try {
        t.b.error(e);
        return;
      } catch (n) {
        e = n;
      }
    t = t.parent;
  }
  throw e;
}
const Z = new Set();
let p = null,
  Ie = null,
  T = null,
  S = [],
  De = null,
  je = !1,
  ce = !1;
class G {
  committed = !1;
  current = new Map();
  previous = new Map();
  #r = new Set();
  #s = new Set();
  #t = 0;
  #n = 0;
  #a = null;
  #f = [];
  #i = [];
  skipped_effects = new Set();
  is_fork = !1;
  is_deferred() {
    return this.is_fork || this.#n > 0;
  }
  process(t) {
    ((S = []), (Ie = null), this.apply());
    var n = { parent: null, effect: null, effects: [], render_effects: [], block_effects: [] };
    for (const r of t) this.#l(r, n);
    (this.is_fork || this.#o(),
      this.is_deferred()
        ? (this.#e(n.effects), this.#e(n.render_effects), this.#e(n.block_effects))
        : ((Ie = this),
          (p = null),
          nt(n.render_effects),
          nt(n.effects),
          (Ie = null),
          this.#a?.resolve()),
      (T = null));
  }
  #l(t, n) {
    t.f ^= g;
    for (var r = t.first; r !== null; ) {
      var s = r.f,
        f = (s & (j | ne)) !== 0,
        u = f && (s & g) !== 0,
        l = u || (s & P) !== 0 || this.skipped_effects.has(r);
      if (
        ((r.f & Be) !== 0 &&
          r.b?.is_pending() &&
          (n = { parent: n, effect: r, effects: [], render_effects: [], block_effects: [] }),
        !l && r.fn !== null)
      ) {
        f
          ? (r.f ^= g)
          : (s & Ue) !== 0
            ? n.effects.push(r)
            : we(r) && ((r.f & F) !== 0 && n.block_effects.push(r), ve(r));
        var a = r.first;
        if (a !== null) {
          r = a;
          continue;
        }
      }
      var i = r.parent;
      for (r = r.next; r === null && i !== null; )
        (i === n.effect &&
          (this.#e(n.effects), this.#e(n.render_effects), this.#e(n.block_effects), (n = n.parent)),
          (r = i.next),
          (i = i.parent));
    }
  }
  #e(t) {
    for (const n of t) (((n.f & A) !== 0 ? this.#f : this.#i).push(n), this.#u(n.deps), E(n, g));
  }
  #u(t) {
    if (t !== null)
      for (const n of t) (n.f & y) === 0 || (n.f & Q) === 0 || ((n.f ^= Q), this.#u(n.deps));
  }
  capture(t, n) {
    (this.previous.has(t) || this.previous.set(t, n),
      (t.f & H) === 0 && (this.current.set(t, t.v), T?.set(t, t.v)));
  }
  activate() {
    ((p = this), this.apply());
  }
  deactivate() {
    p === this && ((p = null), (T = null));
  }
  flush() {
    if ((this.activate(), S.length > 0)) {
      if ((qe(), p !== null && p !== this)) return;
    } else this.#t === 0 && this.process([]);
    this.deactivate();
  }
  discard() {
    for (const t of this.#s) t(this);
    this.#s.clear();
  }
  #o() {
    if (this.#n === 0) {
      for (const t of this.#r) t();
      this.#r.clear();
    }
    this.#t === 0 && this.#c();
  }
  #c() {
    if (Z.size > 1) {
      this.previous.clear();
      var t = T,
        n = !0,
        r = { parent: null, effect: null, effects: [], render_effects: [], block_effects: [] };
      for (const f of Z) {
        if (f === this) {
          n = !1;
          continue;
        }
        const u = [];
        for (const [a, i] of this.current) {
          if (f.current.has(a))
            if (n && i !== f.current.get(a)) f.current.set(a, i);
            else continue;
          u.push(a);
        }
        if (u.length === 0) continue;
        const l = [...f.current.keys()].filter((a) => !this.current.has(a));
        if (l.length > 0) {
          var s = S;
          S = [];
          const a = new Set(),
            i = new Map();
          for (const o of u) wt(o, l, a, i);
          if (S.length > 0) {
            ((p = f), f.apply());
            for (const o of S) f.#l(o, r);
            f.deactivate();
          }
          S = s;
        }
      }
      ((p = null), (T = t));
    }
    ((this.committed = !0), Z.delete(this));
  }
  increment(t) {
    ((this.#t += 1), t && (this.#n += 1));
  }
  decrement(t) {
    ((this.#t -= 1), t && (this.#n -= 1), this.revive());
  }
  revive() {
    for (const t of this.#f) (E(t, A), ee(t));
    for (const t of this.#i) (E(t, L), ee(t));
    ((this.#f = []), (this.#i = []), this.flush());
  }
  oncommit(t) {
    this.#r.add(t);
  }
  ondiscard(t) {
    this.#s.add(t);
  }
  settled() {
    return (this.#a ??= ut()).promise;
  }
  static ensure() {
    if (p === null) {
      const t = (p = new G());
      (Z.add(p),
        ce ||
          G.enqueue(() => {
            p === t && t.flush();
          }));
    }
    return p;
  }
  static enqueue(t) {
    cn(t);
  }
  apply() {}
}
function Le(e) {
  var t = ce;
  ce = !0;
  try {
    var n;
    for (e && (p !== null && qe(), (n = e())); ; ) {
      if ((_n(), S.length === 0 && (p?.flush(), S.length === 0))) return ((De = null), n);
      qe();
    }
  } finally {
    ce = t;
  }
}
function qe() {
  var e = B;
  je = !0;
  var t = null;
  try {
    var n = 0;
    for (Re(!0); S.length > 0; ) {
      var r = G.ensure();
      if (n++ > 1e3) {
        var s, f;
        dn();
      }
      (r.process(S), U.clear());
    }
  } finally {
    ((je = !1), Re(e), (De = null));
  }
}
function dn() {
  try {
    tn();
  } catch (e) {
    ge(e, De);
  }
}
let C = null;
function nt(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if (
        (r.f & (Y | P)) === 0 &&
        we(r) &&
        ((C = new Set()),
        ve(r),
        r.deps === null &&
          r.first === null &&
          r.nodes_start === null &&
          (r.teardown === null && r.ac === null ? Nt(r) : (r.fn = null)),
        C?.size > 0)
      ) {
        U.clear();
        for (const s of C) {
          if ((s.f & (Y | P)) !== 0) continue;
          const f = [s];
          let u = s.parent;
          for (; u !== null; ) (C.has(u) && (C.delete(u), f.push(u)), (u = u.parent));
          for (let l = f.length - 1; l >= 0; l--) {
            const a = f[l];
            (a.f & (Y | P)) === 0 && ve(a);
          }
        }
        C.clear();
      }
    }
    C = null;
  }
}
function wt(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const s of e.reactions) {
      const f = s.f;
      (f & y) !== 0
        ? wt(s, t, n, r)
        : (f & (Ge | F)) !== 0 && (f & A) === 0 && Et(s, t, r) && (E(s, A), ee(s));
    }
}
function yt(e, t) {
  if (e.reactions !== null)
    for (const n of e.reactions) {
      const r = n.f;
      (r & y) !== 0 ? yt(n, t) : (r & Me) !== 0 && (E(n, A), t.add(n));
    }
}
function Et(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const s of e.deps) {
      if (t.includes(s)) return !0;
      if ((s.f & y) !== 0 && Et(s, t, n)) return (n.set(s, !0), !0);
    }
  return (n.set(e, !1), !1);
}
function ee(e) {
  for (var t = (De = e); t.parent !== null; ) {
    t = t.parent;
    var n = t.f;
    if (je && t === h && (n & F) !== 0 && (n & ot) === 0) return;
    if ((n & (ne | j)) !== 0) {
      if ((n & g) === 0) return;
      t.f ^= g;
    }
  }
  S.push(t);
}
function wr(e) {
  (Xt(), p !== null && rn());
  var t = G.ensure();
  ((t.is_fork = !0), (T = new Map()));
  var n = !1,
    r = t.settled();
  (Le(e), (T = null));
  for (var [s, f] of t.previous) s.v = f;
  return {
    commit: async () => {
      if (n) {
        await r;
        return;
      }
      (Z.has(t) || nn(), (n = !0), (t.is_fork = !1));
      for (var [u, l] of t.current) u.v = l;
      (Le(() => {
        var a = new Set();
        for (var i of t.current.keys()) yt(i, a);
        (bn(a), Tt());
      }),
        t.revive(),
        await r);
    },
    discard: () => {
      !n && Z.has(t) && (Z.delete(t), t.discard());
    },
  };
}
function hn(e, t, n, r) {
  const s = pe() ? Xe : yn;
  if (n.length === 0 && e.length === 0) {
    r(t.map(s));
    return;
  }
  var f = p,
    u = h,
    l = pn();
  function a() {
    Promise.all(n.map((i) => wn(i)))
      .then((i) => {
        l();
        try {
          r([...t.map(s), ...i]);
        } catch (o) {
          (u.f & Y) === 0 && ge(o, u);
        }
        (f?.deactivate(), me());
      })
      .catch((i) => {
        ge(i, u);
      });
  }
  e.length > 0
    ? Promise.all(e).then(() => {
        l();
        try {
          return a();
        } finally {
          (f?.deactivate(), me());
        }
      })
    : a();
}
function pn() {
  var e = h,
    t = _,
    n = w,
    r = p;
  return function (f = !0) {
    (ie(e), z(t), be(n), f && r?.activate());
  };
}
function me() {
  (ie(null), z(null), be(null));
}
function Xe(e) {
  var t = y | A,
    n = _ !== null && (_.f & y) !== 0 ? _ : null;
  return (
    h !== null && (h.f |= de),
    {
      ctx: w,
      deps: null,
      effects: null,
      equals: vt,
      f: t,
      fn: e,
      reactions: null,
      rv: 0,
      v: b,
      wv: 0,
      parent: n ?? h,
      ac: null,
    }
  );
}
function wn(e, t) {
  let n = h;
  n === null && Wt();
  var r = n.b,
    s = void 0,
    f = We(b),
    u = !_,
    l = new Map();
  return (
    Sn(() => {
      var a = ut();
      s = a.promise;
      try {
        Promise.resolve(e())
          .then(a.resolve, a.reject)
          .then(() => {
            (i === p && i.committed && i.deactivate(), me());
          });
      } catch (c) {
        (a.reject(c), me());
      }
      var i = p;
      if (u) {
        var o = !r.is_pending();
        (r.update_pending_count(1), i.increment(o), l.get(i)?.reject(se), l.delete(i), l.set(i, a));
      }
      const v = (c, d = void 0) => {
        if ((i.activate(), d)) d !== se && ((f.f |= H), Ye(f, d));
        else {
          ((f.f & H) !== 0 && (f.f ^= H), Ye(f, c));
          for (const [O, Ne] of l) {
            if ((l.delete(O), O === i)) break;
            Ne.reject(se);
          }
        }
        u && (r.update_pending_count(-1), i.decrement(o));
      };
      a.promise.then(v, (c) => v(null, c || 'unknown'));
    }),
    xn(() => {
      for (const a of l.values()) a.reject(se);
    }),
    new Promise((a) => {
      function i(o) {
        function v() {
          o === s ? a(f) : i(s);
        }
        o.then(v, v);
      }
      i(s);
    })
  );
}
function yr(e) {
  const t = Xe(e);
  return (Ct(t), t);
}
function yn(e) {
  const t = Xe(e);
  return ((t.equals = ht), t);
}
function bt(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1) te(t[n]);
  }
}
function En(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & y) === 0) return (t.f & Y) === 0 ? t : null;
    t = t.parent;
  }
  return null;
}
function Ze(e) {
  var t,
    n = h;
  ie(En(e));
  try {
    ((e.f &= ~Q), bt(e), (t = Lt(e)));
  } finally {
    ie(n);
  }
  return t;
}
function gt(e) {
  var t = Ze(e);
  if ((e.equals(t) || (p?.is_fork || (e.v = t), (e.wv = Ft())), !ae))
    if (T !== null) (xe() || p?.is_fork) && T.set(e, t);
    else {
      var n = (e.f & D) === 0 ? L : g;
      E(e, n);
    }
}
let Te = new Set();
const U = new Map();
function bn(e) {
  Te = e;
}
let mt = !1;
function We(e, t) {
  var n = { f: 0, v: e, reactions: null, equals: vt, rv: 0, wv: 0 };
  return n;
}
function q(e, t) {
  const n = We(e);
  return (Ct(n), n);
}
function Er(e, t = !1, n = !0) {
  const r = We(e);
  return (t || (r.equals = ht), he && n && w !== null && w.l !== null && (w.l.s ??= []).push(r), r);
}
function $(e, t, n = !1) {
  _ !== null &&
    (!N || (_.f & Me) !== 0) &&
    pe() &&
    (_.f & (y | F | Ge | Me)) !== 0 &&
    !M?.includes(e) &&
    an();
  let r = n ? le(t) : t;
  return Ye(e, r);
}
function Ye(e, t) {
  if (!e.equals(t)) {
    var n = e.v;
    (ae ? U.set(e, t) : U.set(e, n), (e.v = t));
    var r = G.ensure();
    (r.capture(e, n),
      (e.f & y) !== 0 && ((e.f & A) !== 0 && Ze(e), E(e, (e.f & D) !== 0 ? g : L)),
      (e.wv = Ft()),
      At(e, A),
      pe() &&
        h !== null &&
        (h.f & g) !== 0 &&
        (h.f & (j | ne)) === 0 &&
        (R === null ? In([e]) : R.push(e)),
      !r.is_fork && Te.size > 0 && !mt && Tt());
  }
  return t;
}
function Tt() {
  mt = !1;
  var e = B;
  Re(!0);
  const t = Array.from(Te);
  try {
    for (const n of t) ((n.f & g) !== 0 && E(n, L), we(n) && ve(n));
  } finally {
    Re(e);
  }
  Te.clear();
}
function Ce(e) {
  $(e, e.v + 1);
}
function At(e, t) {
  var n = e.reactions;
  if (n !== null)
    for (var r = pe(), s = n.length, f = 0; f < s; f++) {
      var u = n[f],
        l = u.f;
      if (!(!r && u === h)) {
        var a = (l & A) === 0;
        if ((a && E(u, t), (l & y) !== 0)) {
          var i = u;
          (T?.delete(i), (l & Q) === 0 && (l & D && (u.f |= Q), At(i, L)));
        } else a && ((l & F) !== 0 && C !== null && C.add(u), ee(u));
      }
    }
}
function le(e) {
  if (typeof e != 'object' || e === null || W in e) return e;
  const t = lt(e);
  if (t !== Gt && t !== zt) return e;
  var n = new Map(),
    r = Ut(e),
    s = q(0),
    f = J,
    u = (l) => {
      if (J === f) return l();
      var a = _,
        i = J;
      (z(null), at(f));
      var o = l();
      return (z(a), at(i), o);
    };
  return (
    r && n.set('length', q(e.length)),
    new Proxy(e, {
      defineProperty(l, a, i) {
        (!('value' in i) || i.configurable === !1 || i.enumerable === !1 || i.writable === !1) &&
          sn();
        var o = n.get(a);
        return (
          o === void 0
            ? (o = u(() => {
                var v = q(i.value);
                return (n.set(a, v), v);
              }))
            : $(o, i.value, !0),
          !0
        );
      },
      deleteProperty(l, a) {
        var i = n.get(a);
        if (i === void 0) {
          if (a in l) {
            const o = u(() => q(b));
            (n.set(a, o), Ce(s));
          }
        } else ($(i, b), Ce(s));
        return !0;
      },
      get(l, a, i) {
        if (a === W) return e;
        var o = n.get(a),
          v = a in l;
        if (
          (o === void 0 &&
            (!v || oe(l, a)?.writable) &&
            ((o = u(() => {
              var d = le(v ? l[a] : b),
                O = q(d);
              return O;
            })),
            n.set(a, o)),
          o !== void 0)
        ) {
          var c = ue(o);
          return c === b ? void 0 : c;
        }
        return Reflect.get(l, a, i);
      },
      getOwnPropertyDescriptor(l, a) {
        var i = Reflect.getOwnPropertyDescriptor(l, a);
        if (i && 'value' in i) {
          var o = n.get(a);
          o && (i.value = ue(o));
        } else if (i === void 0) {
          var v = n.get(a),
            c = v?.v;
          if (v !== void 0 && c !== b)
            return { enumerable: !0, configurable: !0, value: c, writable: !0 };
        }
        return i;
      },
      has(l, a) {
        if (a === W) return !0;
        var i = n.get(a),
          o = (i !== void 0 && i.v !== b) || Reflect.has(l, a);
        if (i !== void 0 || (h !== null && (!o || oe(l, a)?.writable))) {
          i === void 0 &&
            ((i = u(() => {
              var c = o ? le(l[a]) : b,
                d = q(c);
              return d;
            })),
            n.set(a, i));
          var v = ue(i);
          if (v === b) return !1;
        }
        return o;
      },
      set(l, a, i, o) {
        var v = n.get(a),
          c = a in l;
        if (r && a === 'length')
          for (var d = i; d < v.v; d += 1) {
            var O = n.get(d + '');
            O !== void 0 ? $(O, b) : d in l && ((O = u(() => q(b))), n.set(d + '', O));
          }
        if (v === void 0)
          (!c || oe(l, a)?.writable) && ((v = u(() => q(void 0))), $(v, le(i)), n.set(a, v));
        else {
          c = v.v !== b;
          var Ne = u(() => le(i));
          $(v, Ne);
        }
        var Qe = Reflect.getOwnPropertyDescriptor(l, a);
        if ((Qe?.set && Qe.set.call(o, i), !c)) {
          if (r && typeof a == 'string') {
            var et = n.get('length'),
              Pe = Number(a);
            Number.isInteger(Pe) && Pe >= et.v && $(et, Pe + 1);
          }
          Ce(s);
        }
        return !0;
      },
      ownKeys(l) {
        ue(s);
        var a = Reflect.ownKeys(l).filter((v) => {
          var c = n.get(v);
          return c === void 0 || c.v !== b;
        });
        for (var [i, o] of n) o.v !== b && !(i in l) && a.push(i);
        return a;
      },
      setPrototypeOf() {
        fn();
      },
    })
  );
}
function rt(e) {
  try {
    if (e !== null && typeof e == 'object' && W in e) return e[W];
  } catch {}
  return e;
}
function br(e, t) {
  return Object.is(rt(e), rt(t));
}
var st, gn, mn, kt, xt;
function gr() {
  if (st === void 0) {
    ((st = window), (gn = document), (mn = /Firefox/.test(navigator.userAgent)));
    var e = Element.prototype,
      t = Node.prototype,
      n = Text.prototype;
    ((kt = oe(t, 'firstChild').get),
      (xt = oe(t, 'nextSibling').get),
      tt(e) &&
        ((e.__click = void 0),
        (e.__className = void 0),
        (e.__attributes = null),
        (e.__style = void 0),
        (e.__e = void 0)),
      tt(n) && (n.__t = void 0));
  }
}
function Ae(e = '') {
  return document.createTextNode(e);
}
function ke(e) {
  return kt.call(e);
}
function K(e) {
  return xt.call(e);
}
function mr(e, t) {
  if (!V) return ke(e);
  var n = ke(x);
  if (n === null) n = x.appendChild(Ae());
  else if (t && n.nodeType !== ze) {
    var r = Ae();
    return (n?.before(r), fe(r), r);
  }
  return (fe(n), n);
}
function Tr(e, t = !1) {
  if (!V) {
    var n = ke(e);
    return n instanceof Comment && n.data === '' ? K(n) : n;
  }
  if (t && x?.nodeType !== ze) {
    var r = Ae();
    return (x?.before(r), fe(r), r);
  }
  return x;
}
function Ar(e, t = 1, n = !1) {
  let r = V ? x : e;
  for (var s; t--; ) ((s = r), (r = K(r)));
  if (!V) return r;
  if (n && r?.nodeType !== ze) {
    var f = Ae();
    return (r === null ? s?.after(f) : r.before(f), fe(f), f);
  }
  return (fe(r), r);
}
function Tn(e) {
  e.textContent = '';
}
function kr() {
  return !1;
}
function xr(e) {
  V && ke(e) !== null && Tn(e);
}
let ft = !1;
function An() {
  ft ||
    ((ft = !0),
    document.addEventListener(
      'reset',
      (e) => {
        Promise.resolve().then(() => {
          if (!e.defaultPrevented) for (const t of e.target.elements) t.__on_r?.();
        });
      },
      { capture: !0 },
    ));
}
function Je(e) {
  var t = _,
    n = h;
  (z(null), ie(null));
  try {
    return e();
  } finally {
    (z(t), ie(n));
  }
}
function Rr(e, t, n, r = n) {
  e.addEventListener(t, () => Je(n));
  const s = e.__on_r;
  (s
    ? (e.__on_r = () => {
        (s(), r(!0));
      })
    : (e.__on_r = () => r(!0)),
    An());
}
function Rt(e) {
  (h === null && (_ === null && en(), Qt()), ae && Jt());
}
function kn(e, t) {
  var n = t.last;
  n === null ? (t.last = t.first = e) : ((n.next = e), (e.prev = n), (t.last = e));
}
function I(e, t, n) {
  var r = h;
  r !== null && (r.f & P) !== 0 && (e |= P);
  var s = {
    ctx: w,
    deps: null,
    nodes_start: null,
    nodes_end: null,
    f: e | A | D,
    first: null,
    fn: t,
    last: null,
    next: null,
    parent: r,
    b: r && r.b,
    prev: null,
    teardown: null,
    transitions: null,
    wv: 0,
    ac: null,
  };
  if (n)
    try {
      (ve(s), (s.f |= Ve));
    } catch (l) {
      throw (te(s), l);
    }
  else t !== null && ee(s);
  var f = s;
  if (
    (n &&
      f.deps === null &&
      f.teardown === null &&
      f.nodes_start === null &&
      f.first === f.last &&
      (f.f & de) === 0 &&
      ((f = f.first), (e & F) !== 0 && (e & Ee) !== 0 && f !== null && (f.f |= Ee)),
    f !== null &&
      ((f.parent = r), r !== null && kn(f, r), _ !== null && (_.f & y) !== 0 && (e & ne) === 0))
  ) {
    var u = _;
    (u.effects ??= []).push(f);
  }
  return s;
}
function xe() {
  return _ !== null && !N;
}
function xn(e) {
  const t = I(Oe, null, !1);
  return (E(t, g), (t.teardown = e), t);
}
function Rn(e) {
  Rt();
  var t = h.f,
    n = !_ && (t & j) !== 0 && (t & Ve) === 0;
  if (n) {
    var r = w;
    (r.e ??= []).push(e);
  } else return St(e);
}
function St(e) {
  return I(Ue | ct, e, !1);
}
function Sr(e) {
  return (Rt(), I(Oe | ct, e, !0));
}
function Or(e) {
  G.ensure();
  const t = I(ne | de, e, !0);
  return (n = {}) =>
    new Promise((r) => {
      n.outro
        ? Nn(t, () => {
            (te(t), r(void 0));
          })
        : (te(t), r(void 0));
    });
}
function Dr(e) {
  return I(Ue, e, !1);
}
function Sn(e) {
  return I(Ge | de, e, !0);
}
function Nr(e, t = 0) {
  return I(Oe | t, e, !0);
}
function Pr(e, t = [], n = [], r = []) {
  hn(r, t, n, (s) => {
    I(Oe, () => e(...s.map(ue)), !0);
  });
}
function Ir(e, t = 0) {
  var n = I(F | t, e, !0);
  return n;
}
function Cr(e) {
  return I(j | de, e, !0);
}
function Ot(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = ae,
      r = _;
    (it(!0), z(null));
    try {
      t.call(null);
    } finally {
      (it(n), z(r));
    }
  }
}
function Dt(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const s = n.ac;
    s !== null &&
      Je(() => {
        s.abort(se);
      });
    var r = n.next;
    ((n.f & ne) !== 0 ? (n.parent = null) : te(n, t), (n = r));
  }
}
function On(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    ((t.f & j) === 0 && te(t), (t = n));
  }
}
function te(e, t = !0) {
  var n = !1;
  ((t || (e.f & ot) !== 0) &&
    e.nodes_start !== null &&
    e.nodes_end !== null &&
    (Dn(e.nodes_start, e.nodes_end), (n = !0)),
    Dt(e, t && !n),
    Se(e, 0),
    E(e, Y));
  var r = e.transitions;
  if (r !== null) for (const f of r) f.stop();
  Ot(e);
  var s = e.parent;
  (s !== null && s.first !== null && Nt(e),
    (e.next =
      e.prev =
      e.teardown =
      e.ctx =
      e.deps =
      e.fn =
      e.nodes_start =
      e.nodes_end =
      e.ac =
        null));
}
function Dn(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : K(e);
    (e.remove(), (e = n));
  }
}
function Nt(e) {
  var t = e.parent,
    n = e.prev,
    r = e.next;
  (n !== null && (n.next = r),
    r !== null && (r.prev = n),
    t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n)));
}
function Nn(e, t, n = !0) {
  var r = [];
  (Pt(e, r, !0),
    Pn(r, () => {
      (n && te(e), t && t());
    }));
}
function Pn(e, t) {
  var n = e.length;
  if (n > 0) {
    var r = () => --n || t();
    for (var s of e) s.out(r);
  } else t();
}
function Pt(e, t, n) {
  if ((e.f & P) === 0) {
    if (((e.f ^= P), e.transitions !== null))
      for (const u of e.transitions) (u.is_global || n) && t.push(u);
    for (var r = e.first; r !== null; ) {
      var s = r.next,
        f = (r.f & Ee) !== 0 || ((r.f & j) !== 0 && (e.f & F) !== 0);
      (Pt(r, t, f ? n : !1), (r = s));
    }
  }
}
function Mr(e) {
  It(e, !0);
}
function It(e, t) {
  if ((e.f & P) !== 0) {
    ((e.f ^= P), (e.f & g) === 0 && (E(e, A), ee(e)));
    for (var n = e.first; n !== null; ) {
      var r = n.next,
        s = (n.f & Ee) !== 0 || (n.f & j) !== 0;
      (It(n, s ? t : !1), (n = r));
    }
    if (e.transitions !== null) for (const f of e.transitions) (f.is_global || t) && f.in();
  }
}
function Fr(e, t) {
  for (var n = e.nodes_start, r = e.nodes_end; n !== null; ) {
    var s = n === r ? null : K(n);
    (t.append(n), (n = s));
  }
}
let B = !1;
function Re(e) {
  B = e;
}
let ae = !1;
function it(e) {
  ae = e;
}
let _ = null,
  N = !1;
function z(e) {
  _ = e;
}
let h = null;
function ie(e) {
  h = e;
}
let M = null;
function Ct(e) {
  _ !== null && (M === null ? (M = [e]) : M.push(e));
}
let m = null,
  k = 0,
  R = null;
function In(e) {
  R = e;
}
let Mt = 1,
  _e = 0,
  J = _e;
function at(e) {
  J = e;
}
function Ft() {
  return ++Mt;
}
function we(e) {
  var t = e.f;
  if ((t & A) !== 0) return !0;
  if ((t & y && (e.f &= ~Q), (t & L) !== 0)) {
    var n = e.deps;
    if (n !== null)
      for (var r = n.length, s = 0; s < r; s++) {
        var f = n[s];
        if ((we(f) && gt(f), f.wv > e.wv)) return !0;
      }
    (t & D) !== 0 && T === null && E(e, g);
  }
  return !1;
}
function jt(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !M?.includes(e))
    for (var s = 0; s < r.length; s++) {
      var f = r[s];
      (f.f & y) !== 0 ? jt(f, t, !1) : t === f && (n ? E(f, A) : (f.f & g) !== 0 && E(f, L), ee(f));
    }
}
function Lt(e) {
  var t = m,
    n = k,
    r = R,
    s = _,
    f = M,
    u = w,
    l = N,
    a = J,
    i = e.f;
  ((m = null),
    (k = 0),
    (R = null),
    (_ = (i & (j | ne)) === 0 ? e : null),
    (M = null),
    be(e.ctx),
    (N = !1),
    (J = ++_e),
    e.ac !== null &&
      (Je(() => {
        e.ac.abort(se);
      }),
      (e.ac = null)));
  try {
    e.f |= Fe;
    var o = e.fn,
      v = o(),
      c = e.deps;
    if (m !== null) {
      var d;
      if ((Se(e, k), c !== null && k > 0))
        for (c.length = k + m.length, d = 0; d < m.length; d++) c[k + d] = m[d];
      else e.deps = c = m;
      if (B && xe() && (e.f & D) !== 0)
        for (d = k; d < c.length; d++) (c[d].reactions ??= []).push(e);
    } else c !== null && k < c.length && (Se(e, k), (c.length = k));
    if (pe() && R !== null && !N && c !== null && (e.f & (y | L | A)) === 0)
      for (d = 0; d < R.length; d++) jt(R[d], e);
    return (
      s !== null && s !== e && (_e++, R !== null && (r === null ? (r = R) : r.push(...R))),
      (e.f & H) !== 0 && (e.f ^= H),
      v
    );
  } catch (O) {
    return vn(O);
  } finally {
    ((e.f ^= Fe), (m = t), (k = n), (R = r), (_ = s), (M = f), be(u), (N = l), (J = a));
  }
}
function Cn(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = Bt.call(n, e);
    if (r !== -1) {
      var s = n.length - 1;
      s === 0 ? (n = t.reactions = null) : ((n[r] = n[s]), n.pop());
    }
  }
  n === null &&
    (t.f & y) !== 0 &&
    (m === null || !m.includes(t)) &&
    (E(t, L), (t.f & D) !== 0 && ((t.f ^= D), (t.f &= ~Q)), bt(t), Se(t, 0));
}
function Se(e, t) {
  var n = e.deps;
  if (n !== null) for (var r = t; r < n.length; r++) Cn(e, n[r]);
}
function ve(e) {
  var t = e.f;
  if ((t & Y) === 0) {
    E(e, g);
    var n = h,
      r = B;
    ((h = e), (B = !0));
    try {
      ((t & (F | $t)) !== 0 ? On(e) : Dt(e), Ot(e));
      var s = Lt(e);
      ((e.teardown = typeof s == 'function' ? s : null), (e.wv = Mt));
      var f;
    } finally {
      ((B = r), (h = n));
    }
  }
}
async function jr() {
  (await Promise.resolve(), Le());
}
function Lr() {
  return G.ensure().settled();
}
function ue(e) {
  var t = e.f,
    n = (t & y) !== 0;
  if (_ !== null && !N) {
    var r = h !== null && (h.f & Y) !== 0;
    if (!r && !M?.includes(e)) {
      var s = _.deps;
      if ((_.f & Fe) !== 0)
        e.rv < _e &&
          ((e.rv = _e),
          m === null && s !== null && s[k] === e
            ? k++
            : m === null
              ? (m = [e])
              : m.includes(e) || m.push(e));
      else {
        (_.deps ??= []).push(e);
        var f = e.reactions;
        f === null ? (e.reactions = [_]) : f.includes(_) || f.push(_);
      }
    }
  }
  if (ae) {
    if (U.has(e)) return U.get(e);
    if (n) {
      var u = e,
        l = u.v;
      return ((((u.f & g) === 0 && u.reactions !== null) || Yt(u)) && (l = Ze(u)), U.set(u, l), l);
    }
  } else
    n &&
      (!T?.has(e) || (p?.is_fork && !xe())) &&
      ((u = e), we(u) && gt(u), B && xe() && (u.f & D) === 0 && qt(u));
  if (T?.has(e)) return T.get(e);
  if ((e.f & H) !== 0) throw e.v;
  return e.v;
}
function qt(e) {
  if (e.deps !== null) {
    e.f ^= D;
    for (const t of e.deps)
      ((t.reactions ??= []).push(e), (t.f & y) !== 0 && (t.f & D) === 0 && qt(t));
  }
}
function Yt(e) {
  if (e.v === b) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps) if (U.has(t) || ((t.f & y) !== 0 && Yt(t))) return !0;
  return !1;
}
function Ht(e) {
  var t = N;
  try {
    return ((N = !0), e());
  } finally {
    N = t;
  }
}
const Mn = -7169;
function E(e, t) {
  e.f = (e.f & Mn) | t;
}
function qr(e) {
  if (!(typeof e != 'object' || !e || e instanceof EventTarget)) {
    if (W in e) He(e);
    else if (!Array.isArray(e))
      for (let t in e) {
        const n = e[t];
        typeof n == 'object' && n && W in n && He(n);
      }
  }
}
function He(e, t = new Set()) {
  if (typeof e == 'object' && e !== null && !(e instanceof EventTarget) && !t.has(e)) {
    (t.add(e), e instanceof Date && e.getTime());
    for (let r in e)
      try {
        He(e[r], t);
      } catch {}
    const n = lt(e);
    if (
      n !== Object.prototype &&
      n !== Array.prototype &&
      n !== Map.prototype &&
      n !== Set.prototype &&
      n !== Date.prototype
    ) {
      const r = Vt(n);
      for (let s in r) {
        const f = r[s].get;
        if (f)
          try {
            f.call(e);
          } catch {}
      }
    }
  }
}
function Fn(e, t, n) {
  if (e == null) return (t(void 0), ye);
  const r = Ht(() => e.subscribe(t, n));
  return r.unsubscribe ? () => r.unsubscribe() : r;
}
const re = [];
function Yr(e, t = ye) {
  let n = null;
  const r = new Set();
  function s(l) {
    if (dt(e, l) && ((e = l), n)) {
      const a = !re.length;
      for (const i of r) (i[1](), re.push(i, e));
      if (a) {
        for (let i = 0; i < re.length; i += 2) re[i][0](re[i + 1]);
        re.length = 0;
      }
    }
  }
  function f(l) {
    s(l(e));
  }
  function u(l, a = ye) {
    const i = [l, a];
    return (
      r.add(i),
      r.size === 1 && (n = t(s, f) || ye),
      l(e),
      () => {
        (r.delete(i), r.size === 0 && n && (n(), (n = null)));
      }
    );
  }
  return { set: s, update: f, subscribe: u };
}
function Hr(e) {
  let t;
  return (Fn(e, (n) => (t = n))(), t);
}
function Ur(e) {
  (w === null && Zt(),
    he && w.l !== null
      ? jn(w).m.push(e)
      : Rn(() => {
          const t = Ht(e);
          if (typeof t == 'function') return t;
        }));
}
function jn(e) {
  var t = e.l;
  return (t.u ??= { a: [], b: [], m: [] });
}
export {
  gn as $,
  hr as A,
  q as B,
  Rn as C,
  Y as D,
  Ur as E,
  Tr as F,
  pr as G,
  yr as H,
  mr as I,
  Ar as J,
  or as K,
  Hn as L,
  cr as M,
  Pr as N,
  xr as O,
  er as P,
  Er as Q,
  w as R,
  W as S,
  Sr as T,
  Kt as U,
  Yn as V,
  qr as W,
  dr as X,
  Mr as Y,
  te as Z,
  Nn as _,
  ue as a,
  Vn as a$,
  Ae as a0,
  Cr as a1,
  x as a2,
  Fr as a3,
  kr as a4,
  Ir as a5,
  ur as a6,
  Ee as a7,
  vr as a8,
  un as a9,
  An as aA,
  Un as aB,
  lt as aC,
  Vt as aD,
  Le as aE,
  xe as aF,
  Ce as aG,
  G as aH,
  ie as aI,
  z as aJ,
  be as aK,
  vn as aL,
  _ as aM,
  ge as aN,
  zn as aO,
  de as aP,
  Be as aQ,
  ar as aR,
  Je as aS,
  mn as aT,
  rr as aU,
  sr as aV,
  Ve as aW,
  ze as aX,
  gr as aY,
  ln as aZ,
  Ke as a_,
  _r as aa,
  fe as ab,
  lr as ac,
  ye as ad,
  Fn as ae,
  Hr as af,
  qn as ag,
  ke as ah,
  _t as ai,
  on as aj,
  Ye as ak,
  Ln as al,
  We as am,
  $n as an,
  Kn as ao,
  Wn as ap,
  P as aq,
  K as ar,
  Pt as as,
  Pn as at,
  Tn as au,
  cn as av,
  Xn as aw,
  Zn as ax,
  ot as ay,
  fr as az,
  yn as b,
  Or as b0,
  $e as b1,
  Yr as b2,
  wr as b3,
  Lr as b4,
  le as c,
  Xe as d,
  h as e,
  tr as f,
  oe as g,
  Qn as h,
  ae as i,
  Jn as j,
  nr as k,
  he as l,
  Rr as m,
  p as n,
  Dr as o,
  Gn as p,
  Ie as q,
  Ut as r,
  $ as s,
  ir as t,
  Ht as u,
  br as v,
  xn as w,
  jr as x,
  Nr as y,
  V as z,
};
