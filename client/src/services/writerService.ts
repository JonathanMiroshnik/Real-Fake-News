// TODO: get all writer articles from history + pagination? need fetch beyond daily
// TODO: Fetch historical articles for a writer with pagination

/**
 * Sanitizes writer names for URL-safe usage by replacing spaces with underscores
 * @param name - Original writer name (e.g., "John Doe")
 * @returns Sanitized name (e.g., "John_Doe")
 * @example
 * sanitizeWriterName("Neon Dusk") // Returns "Neon_Dusk"
 */
export const sanitizeWriterName = (name: string) => name.replace(/ /g, '_');

/**
 * Reverses name sanitization by converting underscores back to spaces
 * @param name - Sanitized writer name (e.g., "Jane_Smith")
 * @returns Original format name (e.g., "Jane Smith")
 * @example
 * desanitizeWriterName("Mothman_Mark") // Returns "Mothman Mark"
 */
export const desanitizeWriterName = (name: string) => name.replace(/_/g, ' ');