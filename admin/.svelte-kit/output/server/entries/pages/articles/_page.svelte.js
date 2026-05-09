import { U as head, X as attr } from '../../../chunks/index2.js';
import '@sveltejs/kit/internal';
import '../../../chunks/exports.js';
import '../../../chunks/utils.js';
import '@sveltejs/kit/internal/server';
import '../../../chunks/state.svelte.js';
import '../../../chunks/ArticleTable.svelte_svelte_type_style_lang.js';
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let articlesByPage = /* @__PURE__ */ new Map();
    let loading = false;
    let currentPage = 1;
    articlesByPage.get(currentPage) || [];
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      head('a1a7z4', $$renderer3, ($$renderer4) => {
        $$renderer4.title(($$renderer5) => {
          $$renderer5.push(`<title>Articles - Admin Panel</title>`);
        });
      });
      $$renderer3.push(
        `<div class="articles-page svelte-a1a7z4"><header class="page-header svelte-a1a7z4"><h1 class="svelte-a1a7z4">Article Management</h1> <button class="refresh-btn svelte-a1a7z4"${attr('disabled', loading, true)}>🔄 Refresh</button></header> `,
      );
      {
        $$renderer3.push('<!--[!-->');
      }
      $$renderer3.push(`<!--]--> <div class="content-card svelte-a1a7z4">`);
      {
        $$renderer3.push('<!--[!-->');
        {
          $$renderer3.push('<!--[-->');
          $$renderer3.push(`<div class="empty-state svelte-a1a7z4"><p>No articles found</p></div>`);
        }
        $$renderer3.push(`<!--]-->`);
      }
      $$renderer3.push(`<!--]--></div></div>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
  });
}
export { _page as default };
