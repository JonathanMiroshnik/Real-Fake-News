import { getApiBaseUrlWithPrefix, getClientUrl } from './apiConfig';

const ADMIN_PASSWORD_PARAM = 'pwd';

export interface Article {
  key?: string;
  title?: string;
  category?: string;
  content?: string;
  shortDescription?: string;
  timestamp?: string;
  writerType?: "AI" | "Human" | "Synthesis";
  headImage?: string;
  isFeatured?: boolean;
  featuredDate?: string;
}

export interface FetchArticlesResult {
  articles: Article[];
  error?: string;
}

export interface ArticleResult {
  article?: Article;
  error?: string;
}

function getApiUrl(): string {
  return getApiBaseUrlWithPrefix();
}

function getPassword(): string {
  const params = new URLSearchParams(window.location.search);
  const urlPassword = params.get(ADMIN_PASSWORD_PARAM);
  if (urlPassword !== null) return urlPassword;
  const isDev = import.meta.env.VITE_FRONTEND_DEV_MODE === 'true' ||
                import.meta.env.VITE_LOCAL_DEV_MODE === 'true';
  return isDev ? 'changeme123' : '';
}

function authQuery(): string {
  return `password=${encodeURIComponent(getPassword())}`;
}

function handleError(err: unknown, context: string): string {
  console.error(`Error ${context}:`, err);
  if (err instanceof TypeError && err.message.includes('fetch')) {
    return `Network error: Is the backend server running on ${getApiUrl()}?`;
  }
  return err instanceof Error ? err.message : `Failed to ${context}`;
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${getApiUrl()}${path}?${authQuery()}&_t=${Date.now()}`;
  const response = await fetch(url, {
    cache: 'no-store',
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP ${response.status}: ${path}`);
  }

  if (response.status === 304) {
    return {} as T;
  }

  return response.json();
}

export async function fetchArticles(): Promise<FetchArticlesResult> {
  try {
    const data = await apiFetch<{ articles?: Article[] }>('/admin/articles');
    const fetchedArticles = (data.articles || []).sort((a, b) => {
      const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return dateB - dateA;
    });
    return { articles: fetchedArticles };
  } catch (err) {
    return { articles: [], error: handleError(err, 'fetching articles') };
  }
}

export async function deleteArticle(key: string): Promise<string | null> {
  try {
    await apiFetch(`/admin/articles/${key}`, { method: 'DELETE' });
    return null;
  } catch (err) {
    return handleError(err, 'deleting article');
  }
}

export async function fetchArticle(key: string): Promise<ArticleResult> {
  try {
    const data = await apiFetch<{ article?: Article }>(`/admin/articles/${key}`);
    return { article: data.article };
  } catch (err) {
    return { error: handleError(err, 'fetching article') };
  }
}

export async function updateArticle(key: string, article: Partial<Article>): Promise<string | null> {
  try {
    await apiFetch(`/admin/articles/${key}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(article),
    });
    return null;
  } catch (err) {
    return handleError(err, 'updating article');
  }
}

export async function setFeaturedArticle(key: string): Promise<string | null> {
  try {
    await apiFetch(`/admin/articles/${key}/featured`, { method: 'PUT' });
    return null;
  } catch (err) {
    return handleError(err, 'setting featured article');
  }
}

export async function fetchTexts(): Promise<string[]> {
  try {
    const data = await apiFetch<{ texts?: string[] }>('/admin/texts');
    return data.texts || [];
  } catch (err) {
    console.error('Error fetching texts:', err);
    return [];
  }
}

export async function addText(text: string): Promise<{ texts: string[]; error?: string }> {
  try {
    const data = await apiFetch<{ texts: string[] }>('/admin/texts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    return { texts: data.texts || [] };
  } catch (err) {
    return { texts: [], error: handleError(err, 'adding text') };
  }
}

export async function generateArticle(): Promise<string | null> {
  try {
    const data = await apiFetch<{ success: boolean; error?: string }>('/admin/generate/article', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!data.success) throw new Error(data.error || 'Failed to generate article');
    return null;
  } catch (err) {
    return handleError(err, 'generating article');
  }
}

export async function generateRecipe(): Promise<string | null> {
  try {
    const data = await apiFetch<{ success: boolean; error?: string }>('/admin/generate/recipe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!data.success) throw new Error(data.error || 'Failed to generate recipe');
    return null;
  } catch (err) {
    return handleError(err, 'generating recipe');
  }
}

export async function uploadImage(file: File): Promise<{ filename?: string; error?: string }> {
  try {
    const formData = new FormData();
    formData.append('image', file);
    const url = `${getApiUrl()}/admin/images/upload?${authQuery()}`;
    const response = await fetch(url, { method: 'POST', body: formData });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(errorData.error || 'Upload failed');
    }
    return response.json();
  } catch (err) {
    return { error: handleError(err, 'uploading image') };
  }
}

export function getArticleUrl(key?: string): string {
  if (!key) return '#';
  const clientUrl = getClientUrl();
  return `${clientUrl}/article/${key}`;
}

export function getImageUrl(filename: string): string {
  return `${getApiUrl()}/images/${filename}`;
}

export const VALID_CATEGORIES = [
  "Politics", "Sports", "Culture", "Economics", "Technology", "Food"
];
