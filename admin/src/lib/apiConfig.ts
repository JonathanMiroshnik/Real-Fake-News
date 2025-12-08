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
 *   import { getApiBaseUrl, getApiBaseUrlWithPrefix } from '$lib/apiConfig';
 *   const apiBase = getApiBaseUrl(); // Base URL without /api
 *   const apiBaseWithPrefix = getApiBaseUrlWithPrefix(); // Base URL with /api prefix
 */

/**
 * Gets the base URL for the backend API (without /api prefix)
 * @returns The base URL (e.g., "http://localhost:5001" or "https://real.sensorcensor.xyz"), or empty string for relative URLs
 */
export function getApiBaseUrl(): string {
  // Check if relative API mode is enabled (for nginx proxy)
  const useRelativeApi = import.meta.env.VITE_USE_RELATIVE_API === "true";
  
  if (useRelativeApi) {
    // Return empty string to use relative URLs (nginx will handle routing)
    return "";
  }
  
  // Check if VITE_BACKEND_DEV_MODE is explicitly set
  const backendDevMode = import.meta.env.VITE_BACKEND_DEV_MODE;
  
  if (backendDevMode === undefined) {
    // Default behavior: if not set, use production backend
    return import.meta.env.VITE_API_BASE_PROD || "https://real.sensorcensor.xyz";
  }
  
  // If explicitly set to "true", use local dev backend
  if (backendDevMode === "true") {
    return import.meta.env.VITE_API_BASE_DEV || "http://localhost:5001";
  }
  
  // Otherwise (including "false"), use production backend
  return import.meta.env.VITE_API_BASE_PROD || "https://real.sensorcensor.xyz";
}

/**
 * Gets the full API base URL with /api prefix
 * @returns The API base URL with /api prefix (e.g., "http://localhost:5001/api" or "https://real.sensorcensor.xyz/api", or just "/api" for relative mode)
 */
export function getApiBaseUrlWithPrefix(): string {
  const baseUrl = getApiBaseUrl();
  // If baseUrl is empty (relative mode), return just "/api"
  // Otherwise, return the full URL with "/api"
  return baseUrl ? `${baseUrl}/api` : "/api";
}

/**
 * Gets the client URL for article links
 * @returns The client URL based on frontend dev mode
 */
export function getClientUrl(): string {
  const frontendDevMode = import.meta.env.VITE_FRONTEND_DEV_MODE === 'true' || 
                          import.meta.env.VITE_LOCAL_DEV_MODE === 'true'; // Backward compatibility
  
  if (frontendDevMode) {
    return import.meta.env.VITE_CLIENT_URL_DEV || 'http://localhost:5173';
  }
  
  return import.meta.env.VITE_CLIENT_URL_PROD || 'https://real.sensorcensor.xyz';
}

