/**
 * Normalizes paragraph formatting in article content for proper markdown rendering.
 * Ensures paragraphs are separated by exactly two newlines (\n\n) as required by markdown.
 * 
 * @param content The article content to normalize
 * @returns Normalized content with proper paragraph formatting
 */
export function normalizeParagraphFormatting(content: string): string {
  if (!content || typeof content !== 'string') {
    return content || '';
  }
  
  let normalized = content;
  
  // Step 1: Convert patterns where sentences end with punctuation followed by newline and capital letter
  // This catches: "sentence.\nNext sentence" -> "sentence.\n\nNext sentence"
  normalized = normalized.replace(/([.!?])\s*\n\s*([A-Z])/g, '$1\n\n$2');
  
  // Step 2: Convert patterns where paragraphs end with no punctuation but have newline and capital letter
  // This catches: "paragraph end\nNext paragraph" -> "paragraph end\n\nNext paragraph"
  normalized = normalized.replace(/([a-z0-9])\s*\n\s*([A-Z])/gi, '$1\n\n$2');
  
  // Step 3: Ensure exactly two newlines between paragraphs (not more, not less)
  // Replace 3+ newlines with exactly two newlines
  normalized = normalized.replace(/\n{3,}/g, '\n\n');
  
  // Step 4: Remove any HTML line breaks if present and replace with paragraph breaks
  normalized = normalized.replace(/<br\s*\/?>\s*/gi, '\n\n');
  
  // Step 5: Handle Windows line endings (\r\n) by converting to \n first
  normalized = normalized.replace(/\r\n/g, '\n');
  
  // Step 6: Trim excess whitespace at beginning and end
  normalized = normalized.trim();
  
  // Step 7: Ensure the content ends with a newline if it has multiple paragraphs
  if (normalized.includes('\n\n') && !normalized.endsWith('\n')) {
    normalized += '\n';
  }
  
  return normalized;
}

/**
 * Tests if content has proper paragraph formatting (two newlines between paragraphs)
 * 
 * @param content The content to test
 * @returns True if content has proper paragraph formatting
 */
export function hasProperParagraphFormatting(content: string): boolean {
  if (!content || typeof content !== 'string') {
    return true; // Empty content is considered properly formatted
  }
  
  // Check for common improper patterns
  const improperPatterns = [
    /[.!?]\s*\n\s*[A-Z]/, // Sentence punctuation followed by single newline and capital
    /[a-z]\s*\n\s*[A-Z]/i, // Lowercase letter followed by single newline and capital
    /<br\s*\/?>/i, // HTML line breaks
    /\r\n/, // Windows line endings (should be normalized)
  ];
  
  return !improperPatterns.some(pattern => pattern.test(content));
}
