import { f as u, a as h, s as a } from '../chunks/4UhCeU0a.js';
import { i as g } from '../chunks/9GrOo0P6.js';
import { A as l, F as v, N as d, G as _, I as e, K as o, J as x } from '../chunks/CzCAzTT7.js';
import { s as $, p } from '../chunks/CL4eq0AM.js';
const k = {
  get error() {
    return p.error;
  },
  get status() {
    return p.status;
  },
};
$.updated.check;
const m = k;
var b = u('<h1> </h1> <p> </p>', 1);
function I(i, f) {
  (l(f, !1), g());
  var t = b(),
    r = v(t),
    n = e(r, !0);
  o(r);
  var s = x(r, 2),
    c = e(s, !0);
  (o(s),
    d(() => {
      (a(n, m.status), a(c, m.error?.message));
    }),
    h(i, t),
    _());
}
export { I as component };
