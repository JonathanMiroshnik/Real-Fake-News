import {
  Z as store_get,
  U as head,
  _ as unsubscribe_stores,
} from '../../../../../chunks/index2.js';
import { g as getContext } from '../../../../../chunks/context.js';
import 'clsx';
import '@sveltejs/kit/internal';
import '../../../../../chunks/exports.js';
import '../../../../../chunks/utils.js';
import '@sveltejs/kit/internal/server';
import '../../../../../chunks/state.svelte.js';
const getStores = () => {
  const stores$1 = getContext('__svelte__');
  return {
    /** @type {typeof page} */
    page: {
      subscribe: stores$1.page.subscribe,
    },
    /** @type {typeof navigating} */
    navigating: {
      subscribe: stores$1.navigating.subscribe,
    },
    /** @type {typeof updated} */
    updated: stores$1.updated,
  };
};
const page = {
  subscribe(fn) {
    const store = getStores().page;
    return store.subscribe(fn);
  },
};
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    store_get(($$store_subs ??= {}), '$page', page).params.key;
    head('iw8rjb', $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Edit Article - Admin Panel</title>`);
      });
    });
    $$renderer2.push(
      `<div class="edit-page svelte-iw8rjb"><header class="page-header svelte-iw8rjb"><h1 class="svelte-iw8rjb">Edit Article</h1> <button class="back-btn svelte-iw8rjb">← Back to Articles</button></header> `,
    );
    {
      $$renderer2.push('<!--[!-->');
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push('<!--[!-->');
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push('<!--[!-->');
      {
        $$renderer2.push('<!--[!-->');
        {
          $$renderer2.push('<!--[-->');
          $$renderer2.push(`<div class="empty-state svelte-iw8rjb"><p>Article not found</p></div>`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export { _page as default };
