/**
 * Splits a comma-separated string of weapon keywords and trims whitespace
 * @param description - Comma-separated keyword string
 * @returns Array of trimmed keywords, or empty array if no description
 */
export function parseWargearKeywords(description?: string): string[] {
  if (!description) return [];

  return description
    .split(',')
    .map((keyword) => keyword.trim())
    .filter((keyword) => keyword.length > 0);
}
