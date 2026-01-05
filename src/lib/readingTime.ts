/**
 * Calculate the estimated reading time for a given text.
 * @param content The text content to calculate reading time for.
 * @param wordsPerMinute The average reading speed (default 200).
 * @returns The estimated reading time in minutes.
 */
export function getReadingTime(content: string | undefined, wordsPerMinute: number = 200): number {
  if (!content) return 0;
  const wordCount = content.trim().split(/\s+/g).length;
  return Math.ceil(wordCount / wordsPerMinute);
}
