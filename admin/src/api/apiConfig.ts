/**
 * API Configuration
 *
 * Controls which backend API to connect to.
 *
 * Environment Variables:
 * - VITE_BACKEND_DEV_MODE: Set to "true" to use local development backend (localhost:5001)
 *                          Set to "false" or leave undefined to use production backend
 * - VITE_USE_RELATIVE_API: Set to "true" to use relative URLs (for nginx proxy setup)
 *                          When true, API calls will use relative paths like "/api" instead of full URLs
 *
 * Usage:
 *   import { getApiBaseUrlWithPrefix } from '../api/apiConfig';
 *   const API_BASE = getApiBaseUrlWithPrefix();
 *   fetch(`${API_BASE}/admin/articles?...`)
 */

/** Gets the base URL for the backend API (without /api prefix) */
export function getApiBaseUrl(): string {
  const useRelativeApi = import.meta.env.VITE_USE_RELATIVE_API === "true";

  if (useRelativeApi) {
    return "";
  }

  const backendDevMode = import.meta.env.VITE_BACKEND_DEV_MODE;

  if (backendDevMode === undefined) {
    return import.meta.env.VITE_API_BASE_PROD || "https://real.sensorcensor.xyz";
  }

  if (backendDevMode === "true") {
    return import.meta.env.VITE_API_BASE_DEV || "http://localhost:5001";
  }

  return import.meta.env.VITE_API_BASE_PROD || "https://real.sensorcensor.xyz";
}

/** Gets the full API base URL with /api prefix */
export function getApiBaseUrlWithPrefix(): string {
  const baseUrl = getApiBaseUrl();
  return baseUrl ? `${baseUrl}/api` : "/api";
}

/** Gets the client URL for article links */
export function getClientUrl(): string {
  const frontendDevMode = import.meta.env.VITE_FRONTEND_DEV_MODE === 'true' ||
                          import.meta.env.VITE_LOCAL_DEV_MODE === 'true';

  if (frontendDevMode) {
    return import.meta.env.VITE_CLIENT_URL_DEV || 'http://localhost:5173';
  }

  return import.meta.env.VITE_CLIENT_URL_PROD || 'https://real.sensorcensor.xyz';
}
