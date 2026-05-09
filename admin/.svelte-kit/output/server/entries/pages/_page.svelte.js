import { Y as bind_props, U as head } from '../../chunks/index2.js';
import '@sveltejs/kit/internal';
import '../../chunks/exports.js';
import '../../chunks/utils.js';
import 'clsx';
import '@sveltejs/kit/internal/server';
import '../../chunks/state.svelte.js';
import '../../chunks/ArticleTable.svelte_svelte_type_style_lang.js';
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const ssr = false;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      head('1uha8ag', $$renderer3, ($$renderer4) => {
        $$renderer4.title(($$renderer5) => {
          $$renderer5.push(`<title>Admin Panel</title>`);
        });
      });
      {
        $$renderer3.push('<!--[-->');
        $$renderer3.push(
          `<div class="unauthorized svelte-1uha8ag"><h1 class="svelte-1uha8ag">Access Denied</h1> <p class="svelte-1uha8ag">This page requires authorization.</p></div>`,
        );
      }
      $$renderer3.push(`<!--]-->`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    bind_props($$props, { ssr });
  });
}
export { _page as default };
