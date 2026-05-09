import {
  U as head,
  V as ensure_array_like,
  W as attr_class,
  X as attr,
} from '../../chunks/index2.js';
import '@sveltejs/kit/internal';
import '../../chunks/exports.js';
import '../../chunks/utils.js';
import '@sveltejs/kit/internal/server';
import '../../chunks/state.svelte.js';
import { e as escape_html } from '../../chunks/context.js';
const favicon =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj4KICA8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzY2N2VlYSIvPgogIDx0ZXh0IHg9IjUwIiB5PSI3MCIgZm9udC1zaXplPSI2MCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIj5BPC90ZXh0Pgo8L3N2Zz4KCgo=';
function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { children } = $$props;
    const navItems = [
      { path: '/', label: 'Dashboard', icon: '📊' },
      { path: '/articles', label: 'Articles', icon: '📰' },
      { path: '/settings', label: 'Settings', icon: '⚙️' },
    ];
    function isActive(path) {
      return false;
    }
    head('12qhfyh', $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Admin Panel</title>`);
      });
      $$renderer3.push(`<link rel="icon"${attr('href', favicon)}/>`);
    });
    {
      $$renderer2.push('<!--[!-->');
      $$renderer2.push(
        `<div class="admin-layout svelte-12qhfyh"><nav class="sidebar svelte-12qhfyh"><div class="sidebar-header svelte-12qhfyh"><h1 class="svelte-12qhfyh">Admin Panel</h1></div> <ul class="nav-list svelte-12qhfyh"><!--[-->`,
      );
      const each_array = ensure_array_like(navItems);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let item = each_array[$$index];
        $$renderer2.push(
          `<li class="svelte-12qhfyh"><button${attr_class('nav-item svelte-12qhfyh', void 0, { active: isActive(item.path) })}><span class="icon svelte-12qhfyh">${escape_html(item.icon)}</span> <span class="label svelte-12qhfyh">${escape_html(item.label)}</span></button></li>`,
        );
      }
      $$renderer2.push(`<!--]--></ul></nav> <main class="main-content svelte-12qhfyh">`);
      children($$renderer2);
      $$renderer2.push(`<!----></main></div>`);
    }
    $$renderer2.push(`<!--]-->`);
  });
}
export { _layout as default };
