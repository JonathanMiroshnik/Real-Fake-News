/**
 * Debug Logger Utility
 * 
 * Provides conditional logging functions that only print when VITE_DEBUG_LOGS is enabled.
 * This is separate from VITE_BACKEND_DEV_MODE, allowing you to control debug output
 * independently from backend connection settings.
 * 
 * Environment Variable:
 * - VITE_DEBUG_LOGS: Set to "true" to enable debug logging, "false" or undefined to disable
 * 
 * Usage:
 *   import { debugLog, debugWarn, debugError } from './utils/debugLogger';
 *   debugLog('This will only print if VITE_DEBUG_LOGS=true');
 */

/**
 * Checks if debug logging is enabled via environment variable
 */
function isDebugEnabled(): boolean {
  return import.meta.env.VITE_DEBUG_LOGS === "true";
}

/**
 * Conditional console.log - only logs if VITE_DEBUG_LOGS is "true"
 * Works exactly like console.log but respects the debug flag
 */
export function debugLog(...args: unknown[]): void {
  if (isDebugEnabled()) {
    console.log(...args);
  }
}

/**
 * Conditional console.warn - only logs if VITE_DEBUG_LOGS is "true"
 * Works exactly like console.warn but respects the debug flag
 */
export function debugWarn(...args: unknown[]): void {
  if (isDebugEnabled()) {
    console.warn(...args);
  }
}

/**
 * Conditional console.error - only logs if VITE_DEBUG_LOGS is "true"
 * Use this for debug error messages. For actual errors that should always be logged,
 * use console.error directly.
 */
export function debugError(...args: unknown[]): void {
  if (isDebugEnabled()) {
    console.error(...args);
  }
}

