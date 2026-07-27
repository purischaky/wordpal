/**
 * Pure search filtering logic extracted from the search route handler.
 * Allows property-based testing without requiring HTTP request/response infrastructure.
 */

export interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  href: string;
}

/**
 * Filters search results by case-insensitive substring match on title/subtitle,
 * groups by category, and limits to max 5 results per category.
 *
 * Returns an empty array if the query is fewer than 2 characters.
 */
export function filterSearchResults(
  query: string,
  searchData: SearchResult[]
): SearchResult[] {
  if (query.length < 2) {
    return [];
  }

  const lowerQ = query.toLowerCase();
  const filtered = searchData.filter(
    (item) =>
      item.title.toLowerCase().includes(lowerQ) ||
      item.subtitle.toLowerCase().includes(lowerQ)
  );

  // Group by category and limit to 5 per category
  const grouped: Record<string, SearchResult[]> = {};
  for (const item of filtered) {
    if (!grouped[item.category]) {
      grouped[item.category] = [];
    }
    if (grouped[item.category].length < 5) {
      grouped[item.category].push(item);
    }
  }

  // Flatten grouped results
  return Object.values(grouped).flat();
}
