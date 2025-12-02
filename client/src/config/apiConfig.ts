/**
 * API Configuration
 * 
 * Controls which backend API to connect to.
 * 
 * Environment Variables:
 * - VITE_BACKEND_DEV_MODE: Set to "true" to use local development backend (localhost:5001)
 *                          Set to "false" or leave undefined to use production backend
 * 
 * Usage:
 *   import { getApiBaseUrl } from './config/apiConfig';
 *   const apiBase = getApiBaseUrl();
 */

/**
 * Gets the base URL for the backend API
 * @returns The base URL (without trailing slash)
 */
export function getApiBaseUrl(): string {
  // Check if VITE_BACKEND_DEV_MODE is explicitly set
  const backendDevMode = import.meta.env.VITE_BACKEND_DEV_MODE;
  
  if (backendDevMode === undefined) {
    // Default behavior: if not set, use production backend
    return "https://real.sensorcensor.xyz";
  }
  
  // If explicitly set to "true", use local dev backend
  if (backendDevMode === "true") {
    return "http://localhost:5001";
  }
  
  // Otherwise (including "false"), use production backend
  return "https://real.sensorcensor.xyz";
}

/**
 * Gets the full API base URL with /api prefix
 * @returns The API base URL with /api prefix
 */
export function getApiBaseUrlWithPrefix(): string {
  return `${getApiBaseUrl()}/api`;
}

