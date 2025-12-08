# Environment Configuration

This document explains how to configure the client application's environment variables.

## Backend Development Mode

The client can connect to either a local development backend or the production backend, controlled independently from the frontend's development mode.

### Environment Variable: `VITE_BACKEND_DEV_MODE`

Create a `.env` file in the `client` folder:

```env
# Backend Development Mode
# Set to "true" to use local development backend (localhost:5001)
# Set to "false" or leave undefined to use production backend (https://real.sensorcensor.xyz)
VITE_BACKEND_DEV_MODE=true
```

**Behavior:**
- `VITE_BACKEND_DEV_MODE=true` → Connects to `http://localhost:5001`
- `VITE_BACKEND_DEV_MODE=false` or undefined → Connects to `https://real.sensorcensor.xyz`

## Use Cases

### Developing Frontend with Production Backend

To develop the frontend locally while using the production backend:

```env
VITE_BACKEND_DEV_MODE=false
```

This allows you to:
- Test frontend changes against real production data
- Develop frontend features without running a local backend
- Debug frontend issues with production API responses

### Developing Frontend with Local Backend

To develop both frontend and backend locally:

```env
VITE_BACKEND_DEV_MODE=true
```

Make sure your local backend server is running on port 5001.

## Debug Logging

The client application includes extensive debug logging that can be controlled independently from the backend connection mode.

### Environment Variable: `VITE_DEBUG_LOGS`

Add to your `.env` file in the `client` folder:

```env
# Debug Logging
# Set to "true" to enable debug console logs (development prints)
# Set to "false" or leave undefined to disable debug logging
VITE_DEBUG_LOGS=true
```

**Behavior:**
- `VITE_DEBUG_LOGS=true` → All debug logs (console.log, console.warn, debug console.error) will be printed
- `VITE_DEBUG_LOGS=false` or undefined → Debug logs are suppressed (no console output)

**Note:** This is separate from `VITE_BACKEND_DEV_MODE`. You can:
- Use production backend with debug logs enabled: `VITE_BACKEND_DEV_MODE=false` and `VITE_DEBUG_LOGS=true`
- Use local backend with debug logs disabled: `VITE_BACKEND_DEV_MODE=true` and `VITE_DEBUG_LOGS=false`
- Any combination of the two settings

## Implementation

The API base URL is determined by the `getApiBaseUrl()` function in `src/config/apiConfig.ts`. All API calls throughout the application use this centralized configuration.

Debug logging is handled by the `debugLogger` utility in `src/utils/debugLogger.ts`. All debug console statements throughout the application use `debugLog()`, `debugWarn()`, and `debugError()` functions which respect the `VITE_DEBUG_LOGS` environment variable.

## Files Using API Configuration

- `src/services/articleService.ts` - Article fetching
- `src/services/imageService.ts` - Image URLs
- `src/components/Games/TriviaComponents/TriviaGame/TriviaGame.tsx` - Trivia game API calls


