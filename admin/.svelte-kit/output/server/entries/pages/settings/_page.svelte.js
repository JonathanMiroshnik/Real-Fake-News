import { U as head, X as attr, V as ensure_array_like } from '../../../chunks/index2.js';
import '@sveltejs/kit/internal';
import '../../../chunks/exports.js';
import '../../../chunks/utils.js';
import '@sveltejs/kit/internal/server';
import '../../../chunks/state.svelte.js';
import { e as escape_html } from '../../../chunks/context.js';
function getApiBaseUrl() {
  {
    return 'https://real.sensorcensor.xyz';
  }
}
function getApiBaseUrlWithPrefix() {
  const baseUrl = getApiBaseUrl();
  return baseUrl ? `${baseUrl}/api` : '/api';
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let texts = [];
    let newText = '';
    let loading = false;
    const API_BASE = getApiBaseUrlWithPrefix();
    head('1i19ct2', $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Settings - Admin Panel</title>`);
      });
    });
    $$renderer2.push(
      `<div class="settings-page svelte-1i19ct2"><header class="page-header svelte-1i19ct2"><h1 class="svelte-1i19ct2">Settings</h1> <p class="subtitle svelte-1i19ct2">Manage text items and configuration</p></header> `,
    );
    {
      $$renderer2.push('<!--[!-->');
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push('<!--[!-->');
    }
    $$renderer2.push(
      `<!--]--> <div class="settings-grid svelte-1i19ct2"><div class="settings-card svelte-1i19ct2"><h2 class="svelte-1i19ct2">Text Management</h2> <div class="text-input-container svelte-1i19ct2"><input type="text"${attr('value', newText)} placeholder="Enter text to add..."${attr('disabled', loading, true)} class="svelte-1i19ct2"/> <button${attr('disabled', !newText.trim(), true)} class="svelte-1i19ct2">Add Text</button></div> <div class="texts-display svelte-1i19ct2">`,
    );
    {
      $$renderer2.push('<!--[!-->');
      if (texts.length === 0) {
        $$renderer2.push('<!--[-->');
        $$renderer2.push(`<p class="empty svelte-1i19ct2">No texts added yet</p>`);
      } else {
        $$renderer2.push('<!--[!-->');
        $$renderer2.push(`<ul class="svelte-1i19ct2"><!--[-->`);
        const each_array = ensure_array_like(texts);
        for (let index = 0, $$length = each_array.length; index < $$length; index++) {
          let text = each_array[index];
          $$renderer2.push(
            `<li class="svelte-1i19ct2"><span class="text-number svelte-1i19ct2">${escape_html(index + 1)}.</span> <span class="text-content svelte-1i19ct2">${escape_html(text)}</span></li>`,
          );
        }
        $$renderer2.push(`<!--]--></ul>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(
      `<!--]--></div></div> <div class="settings-card svelte-1i19ct2"><h2 class="svelte-1i19ct2">Configuration</h2> <div class="config-info svelte-1i19ct2"><div class="info-item svelte-1i19ct2"><label class="svelte-1i19ct2">API Base URL</label> <code class="svelte-1i19ct2">${escape_html(API_BASE)}</code></div> <div class="info-item svelte-1i19ct2"><label class="svelte-1i19ct2">Backend Mode</label> <code class="svelte-1i19ct2">${escape_html('Production')}</code></div> <div class="info-item svelte-1i19ct2"><label class="svelte-1i19ct2">Frontend Mode</label> <code class="svelte-1i19ct2">${escape_html('Production')}</code></div> <div class="info-item svelte-1i19ct2"><label class="svelte-1i19ct2">Text Items Count</label> <code class="svelte-1i19ct2">${escape_html(texts.length)}</code></div></div></div></div></div>`,
    );
  });
}
export { _page as default };
