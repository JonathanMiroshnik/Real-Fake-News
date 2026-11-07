/**
 * CORS allowlist resolution.
 *
 * The defaults cover the deployed site and the two local dev servers. CLIENT_URL
 * and ALLOWED_ORIGINS (comma-separated) are added on top, so pointing the API at
 * a new frontend origin never requires a code change.
 */

/** Origins that are always allowed: production site + local dev servers. */
const DEFAULT_ORIGINS = [
  'https://real.sensorcensor.xyz',
  'http://localhost:5173',
  'http://localhost:5174', // Admin panel (dev)
  'http://localhost:3000', // Legacy local dev server, kept for compatibility
];

/**
 * Parses a comma-separated origin list from an env var.
 * @param rawValue Raw env var value, possibly undefined
 * @returns Trimmed origins, empty entries removed
 */
export const parseOriginList = (rawValue: string | undefined): string[] => {
  if (!rawValue) return [];

  return rawValue
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
};

/**
 * Builds the CORS allowlist: defaults + CLIENT_URL + ALLOWED_ORIGINS, de-duplicated.
 * @returns Array of allowed origins
 */
export const getAllowedOrigins = (): string[] => {
  const configuredOrigins = [
    ...parseOriginList(process.env.CLIENT_URL),
    ...parseOriginList(process.env.ALLOWED_ORIGINS),
  ];

  return [...new Set([...DEFAULT_ORIGINS, ...configuredOrigins])];
};
