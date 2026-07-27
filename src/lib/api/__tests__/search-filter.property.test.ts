import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { filterSearchResults, SearchResult } from '@/lib/api/search-filter';

/**
 * Arbitrary for generating SearchResult objects with random but valid fields.
 */
const searchResultArb: fc.Arbitrary<SearchResult> = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  title: fc.string({ minLength: 0, maxLength: 100 }),
  subtitle: fc.string({ minLength: 0, maxLength: 100 }),
  category: fc.constantFrom('students', 'lessons', 'exercises', 'paths', 'challenges'),
  href: fc.string({ minLength: 1, maxLength: 50 }),
});

/**
 * Use a category from a fixed set to get meaningful grouping in tests.
 */
const searchResultWithCategoryArb: fc.Arbitrary<SearchResult> = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  title: fc.string({ minLength: 0, maxLength: 100 }),
  subtitle: fc.string({ minLength: 0, maxLength: 100 }),
  category: fc.constantFrom('students', 'lessons', 'exercises', 'paths', 'challenges'),
  href: fc.string({ minLength: 1, maxLength: 50 }),
});

/**
 * Feature: admin-api-routes, Property 5: Search Filtering Correctness
 * Validates: Requirements 10.1, 10.2, 10.3
 */
describe('Feature: admin-api-routes, Property 5: Search Filtering Correctness', () => {
  // Generate queries of 2+ characters
  const queryArb = fc.string({ minLength: 2, maxLength: 30 });

  it('results contain only items with query substring in title or subtitle (case-insensitive)', () => {
    fc.assert(
      fc.property(
        queryArb,
        fc.array(searchResultWithCategoryArb, { minLength: 0, maxLength: 50 }),
        (query, data) => {
          const results = filterSearchResults(query, data);
          const lowerQ = query.toLowerCase();

          for (const item of results) {
            const titleMatch = item.title.toLowerCase().includes(lowerQ);
            const subtitleMatch = item.subtitle.toLowerCase().includes(lowerQ);
            expect(titleMatch || subtitleMatch).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('does not exclude items that match the query in title or subtitle (within per-category limit)', () => {
    fc.assert(
      fc.property(
        queryArb,
        fc.array(searchResultWithCategoryArb, { minLength: 0, maxLength: 50 }),
        (query, data) => {
          const results = filterSearchResults(query, data);
          const lowerQ = query.toLowerCase();

          // Count results per category
          const resultCountByCategory: Record<string, number> = {};
          for (const item of results) {
            resultCountByCategory[item.category] = (resultCountByCategory[item.category] || 0) + 1;
          }

          // For each item in data that matches, it should be in results
          // unless the per-category limit (5) has been reached
          const matchingByCategory: Record<string, SearchResult[]> = {};
          for (const item of data) {
            const titleMatch = item.title.toLowerCase().includes(lowerQ);
            const subtitleMatch = item.subtitle.toLowerCase().includes(lowerQ);
            if (titleMatch || subtitleMatch) {
              if (!matchingByCategory[item.category]) {
                matchingByCategory[item.category] = [];
              }
              matchingByCategory[item.category].push(item);
            }
          }

          // Each category in results should have min(matchCount, 5) items
          for (const [category, matchingItems] of Object.entries(matchingByCategory)) {
            const expectedCount = Math.min(matchingItems.length, 5);
            const actualCount = resultCountByCategory[category] || 0;
            expect(actualCount).toBe(expectedCount);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns max 5 results per category', () => {
    fc.assert(
      fc.property(
        queryArb,
        fc.array(searchResultWithCategoryArb, { minLength: 0, maxLength: 50 }),
        (query, data) => {
          const results = filterSearchResults(query, data);

          // Group results by category and verify max 5 per category
          const countByCategory: Record<string, number> = {};
          for (const item of results) {
            countByCategory[item.category] = (countByCategory[item.category] || 0) + 1;
          }

          for (const count of Object.values(countByCategory)) {
            expect(count).toBeLessThanOrEqual(5);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: admin-api-routes, Property 6: Short Search Query Returns Empty
 * Validates: Requirements 10.2
 */
describe('Feature: admin-api-routes, Property 6: Short Search Query Returns Empty', () => {
  // Generate strings of length 0 or 1
  const shortQueryArb = fc.string({ minLength: 0, maxLength: 1 });

  it('queries of length 0 or 1 always return an empty array', () => {
    fc.assert(
      fc.property(
        shortQueryArb,
        fc.array(searchResultWithCategoryArb, { minLength: 0, maxLength: 50 }),
        (query, data) => {
          const results = filterSearchResults(query, data);
          expect(results).toEqual([]);
        }
      ),
      { numRuns: 100 }
    );
  });
});
