import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Pure function that mimics the route handler's lesson duplication logic.
 * Takes an original lesson object and a new ID, returns the duplicated lesson.
 */
function duplicateLesson(original: Record<string, unknown>, newId: string) {
  return {
    ...original,
    id: newId,
    title: `Copy of ${original.title}`,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Arbitrary for generating AdminLesson-like objects with realistic fields.
 */
const adminLessonArb: fc.Arbitrary<Record<string, unknown>> = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  description: fc.string({ minLength: 0, maxLength: 200 }),
  grammarFocus: fc.string({ minLength: 0, maxLength: 50 }),
  cefrLevel: fc.constantFrom('A1', 'A2', 'B1', 'B2', 'C1', 'C2'),
  exerciseCount: fc.integer({ min: 0, max: 20 }),
  status: fc.constantFrom('draft', 'published', 'archived'),
});

/**
 * Feature: admin-api-routes, Property 7: Lesson Duplication Preserves Content
 * Validates: Requirements 3.5
 */
describe('Feature: admin-api-routes, Property 7: Lesson Duplication Preserves Content', () => {
  it('duplicated lesson title is "Copy of {original title}"', () => {
    fc.assert(
      fc.property(
        adminLessonArb,
        fc.string({ minLength: 1, maxLength: 20 }),
        (original, newId) => {
          const duplicated = duplicateLesson(original, newId);
          expect(duplicated.title).toBe(`Copy of ${original.title}`);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('duplicated lesson status is always "draft"', () => {
    fc.assert(
      fc.property(
        adminLessonArb,
        fc.string({ minLength: 1, maxLength: 20 }),
        (original, newId) => {
          const duplicated = duplicateLesson(original, newId);
          expect(duplicated.status).toBe('draft');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('duplicated lesson ID differs from original', () => {
    fc.assert(
      fc.property(
        adminLessonArb,
        fc.string({ minLength: 1, maxLength: 20 }),
        (original, newId) => {
          // Ensure newId is different from original.id for a valid test
          fc.pre(newId !== original.id);
          const duplicated = duplicateLesson(original, newId);
          expect(duplicated.id).not.toBe(original.id);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('content fields are preserved unchanged after duplication', () => {
    fc.assert(
      fc.property(
        adminLessonArb,
        fc.string({ minLength: 1, maxLength: 20 }),
        (original, newId) => {
          const duplicated = duplicateLesson(original, newId);
          // Content fields should be preserved exactly
          expect(duplicated.description).toBe(original.description);
          expect(duplicated.grammarFocus).toBe(original.grammarFocus);
          expect(duplicated.cefrLevel).toBe(original.cefrLevel);
          expect(duplicated.exerciseCount).toBe(original.exerciseCount);
        }
      ),
      { numRuns: 100 }
    );
  });
});
