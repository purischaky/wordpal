import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { generateId } from '@/lib/api/id-generator';

/**
 * Feature: admin-api-routes, Property 2: ID Generation Uniqueness and Format
 * Validates: Requirements 15.5
 */
describe('Feature: admin-api-routes, Property 2: ID Generation Uniqueness and Format', () => {
  // Arbitrary for non-empty alphanumeric prefix strings
  const alphanumericPrefix = fc
    .string({ minLength: 1, maxLength: 20 })
    .filter((s) => /^[a-z0-9]+$/i.test(s));

  it('generated IDs are all unique for a given prefix', () => {
    fc.assert(
      fc.property(alphanumericPrefix, (prefix) => {
        const ids = Array.from({ length: 10 }, () => generateId(prefix));
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
      }),
      { numRuns: 100 }
    );
  });

  it('generated IDs start with prefix followed by a hyphen', () => {
    fc.assert(
      fc.property(alphanumericPrefix, (prefix) => {
        const ids = Array.from({ length: 10 }, () => generateId(prefix));
        for (const id of ids) {
          expect(id.startsWith(`${prefix}-`)).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('generated IDs contain only alphanumeric characters and hyphens', () => {
    fc.assert(
      fc.property(alphanumericPrefix, (prefix) => {
        const ids = Array.from({ length: 10 }, () => generateId(prefix));
        for (const id of ids) {
          expect(id).toMatch(/^[a-z0-9-]+$/i);
        }
      }),
      { numRuns: 100 }
    );
  });
});
