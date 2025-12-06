/**
 * API Configuration
 * 
 * Controls which backend API to connect to.
 * 
 * Environment Variables:
 * - VITE_BACKEND_DEV_MODE: Set to "true" to use local development backend (localhost:5001/api)
 *                          Set to "false" or leave undefined to use production backend
 * 
 * Usage:
 *   import { getApiBaseUrl } from '$lib/apiConfig';
 *   const apiBase = getApiBaseUrl();
 */

/**
 * Gets the base URL for the backend API (with /api prefix)
 * @returns The API base URL (e.g., "http://localhost:5001/api" or "https://real.sensorcensor.xyz/api")
 */
export function getApiBaseUrl(): string {
  // Check if VITE_BACKEND_DEV_MODE is explicitly set
  const backendDevMode = import.meta.env.VITE_BACKEND_DEV_MODE;
  
  if (backendDevMode === undefined) {
    // Default behavior: if not set, use production backend
    return import.meta.env.VITE_API_BASE_PROD || "https://real.sensorcensor.xyz/api";
  }
  
  // If explicitly set to "true", use local dev backend
  if (backendDevMode === "true") {
    return import.meta.env.VITE_API_BASE_DEV || "http://localhost:5001/api";
  }
  
  // Otherwise (including "false"), use production backend
  return import.meta.env.VITE_API_BASE_PROD || "https://real.sensorcensor.xyz/api";
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

