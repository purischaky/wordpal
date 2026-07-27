/**
 * Generates a unique ID with the given prefix.
 * Format: {prefix}-{timestamp_base36}-{random_base36}
 */
export function generateId(prefix: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${random}`;
}
