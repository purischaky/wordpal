import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { validateSettingsUpdate } from '@/lib/api/validators/settings';

/**
 * Feature: admin-api-routes, Property 10: Settings Scoring Validation
 *
 * For any settings object, the scoring validator should reject configurations where:
 * xpPerExercise is outside 1-1000, xpPerLesson is outside 1-10000, exercise type weights
 * do not sum to 100, or passingThreshold is outside 50-100. It should accept all
 * configurations that satisfy all four constraints simultaneously.
 *
 * Validates: Requirements 11.3
 */
describe('Feature: admin-api-routes, Property 10: Settings Scoring Validation', () => {
  // --- Generators ---

  /** Generate 6 weights that sum to exactly 100 */
  const validWeightsThatSumTo100 = fc
    .tuple(
      fc.integer({ min: 1, max: 90 }),
      fc.integer({ min: 1, max: 90 }),
      fc.integer({ min: 1, max: 90 }),
      fc.integer({ min: 1, max: 90 }),
      fc.integer({ min: 1, max: 90 }),
    )
    .map(([a, b, c, d, e]) => {
      // Force the 6th weight to make sum = 100
      const sixth = 100 - (a + b + c + d + e);
      return { a, b, c, d, e, sixth };
    })
    .filter(({ a, b, c, d, e, sixth }) => sixth >= 0 && sixth <= 100)
    .map(({ a, b, c, d, e, sixth }) => ({
      'drag-and-drop': a,
      'multiple-choice': b,
      'sentence-ordering': c,
      'fill-in-blank': d,
      'rewrite-sentence': e,
      'free-writing': sixth,
    }));

  /** Generate valid xpPerExercise: 1-1000 */
  const validXpPerExercise = fc.integer({ min: 1, max: 1000 });

  /** Generate valid xpPerLesson: 1-10000 */
  const validXpPerLesson = fc.integer({ min: 1, max: 10000 });

  /** Generate valid passingThreshold: 50-100 */
  const validPassingThreshold = fc.integer({ min: 50, max: 100 });

  /** Generate invalid xpPerExercise: outside 1-1000 */
  const invalidXpPerExercise = fc.oneof(
    fc.integer({ min: -10000, max: 0 }),
    fc.integer({ min: 1001, max: 99999 }),
  );

  /** Generate invalid xpPerLesson: outside 1-10000 */
  const invalidXpPerLesson = fc.oneof(
    fc.integer({ min: -10000, max: 0 }),
    fc.integer({ min: 10001, max: 99999 }),
  );

  /** Generate invalid passingThreshold: outside 50-100 */
  const invalidPassingThreshold = fc.oneof(
    fc.integer({ min: -100, max: 49 }),
    fc.integer({ min: 101, max: 999 }),
  );

  /** Generate weights that do NOT sum to 100 */
  const invalidWeights = fc
    .tuple(
      fc.integer({ min: 1, max: 50 }),
      fc.integer({ min: 1, max: 50 }),
      fc.integer({ min: 1, max: 50 }),
      fc.integer({ min: 1, max: 50 }),
      fc.integer({ min: 1, max: 50 }),
      fc.integer({ min: 1, max: 50 }),
    )
    .filter(([a, b, c, d, e, f]) => Math.round(a + b + c + d + e + f) !== 100)
    .map(([a, b, c, d, e, f]) => ({
      'drag-and-drop': a,
      'multiple-choice': b,
      'sentence-ordering': c,
      'fill-in-blank': d,
      'rewrite-sentence': e,
      'free-writing': f,
    }));

  // --- Acceptance: valid configs pass all constraints ---

  it('accepts scoring configs where all constraints are satisfied simultaneously', () => {
    fc.assert(
      fc.property(
        validXpPerExercise,
        validXpPerLesson,
        validPassingThreshold,
        validWeightsThatSumTo100,
        (xpPerExercise, xpPerLesson, passingThreshold, weightByExerciseType) => {
          const body = {
            scoring: {
              xpPerExercise,
              xpPerLesson,
              passingThreshold,
              weightByExerciseType,
            },
          };
          const result = validateSettingsUpdate(body);
          expect(result.valid).toBe(true);
          expect(result.errors).toHaveLength(0);
        },
      ),
      { numRuns: 100 },
    );
  });

  // --- Rejection: individual constraint violations ---

  it('rejects when xpPerExercise is outside 1-1000', () => {
    fc.assert(
      fc.property(
        invalidXpPerExercise,
        validXpPerLesson,
        validPassingThreshold,
        validWeightsThatSumTo100,
        (xpPerExercise, xpPerLesson, passingThreshold, weightByExerciseType) => {
          const body = {
            scoring: {
              xpPerExercise,
              xpPerLesson,
              passingThreshold,
              weightByExerciseType,
            },
          };
          const result = validateSettingsUpdate(body);
          expect(result.valid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('rejects when xpPerLesson is outside 1-10000', () => {
    fc.assert(
      fc.property(
        validXpPerExercise,
        invalidXpPerLesson,
        validPassingThreshold,
        validWeightsThatSumTo100,
        (xpPerExercise, xpPerLesson, passingThreshold, weightByExerciseType) => {
          const body = {
            scoring: {
              xpPerExercise,
              xpPerLesson,
              passingThreshold,
              weightByExerciseType,
            },
          };
          const result = validateSettingsUpdate(body);
          expect(result.valid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('rejects when passingThreshold is outside 50-100', () => {
    fc.assert(
      fc.property(
        validXpPerExercise,
        validXpPerLesson,
        invalidPassingThreshold,
        validWeightsThatSumTo100,
        (xpPerExercise, xpPerLesson, passingThreshold, weightByExerciseType) => {
          const body = {
            scoring: {
              xpPerExercise,
              xpPerLesson,
              passingThreshold,
              weightByExerciseType,
            },
          };
          const result = validateSettingsUpdate(body);
          expect(result.valid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('rejects when weightByExerciseType values do not sum to 100', () => {
    fc.assert(
      fc.property(
        validXpPerExercise,
        validXpPerLesson,
        validPassingThreshold,
        invalidWeights,
        (xpPerExercise, xpPerLesson, passingThreshold, weightByExerciseType) => {
          const body = {
            scoring: {
              xpPerExercise,
              xpPerLesson,
              passingThreshold,
              weightByExerciseType,
            },
          };
          const result = validateSettingsUpdate(body);
          expect(result.valid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
        },
      ),
      { numRuns: 100 },
    );
  });

  // --- Rejection: multiple simultaneous violations ---

  it('rejects when multiple constraints are violated simultaneously', () => {
    fc.assert(
      fc.property(
        invalidXpPerExercise,
        invalidXpPerLesson,
        invalidPassingThreshold,
        invalidWeights,
        (xpPerExercise, xpPerLesson, passingThreshold, weightByExerciseType) => {
          const body = {
            scoring: {
              xpPerExercise,
              xpPerLesson,
              passingThreshold,
              weightByExerciseType,
            },
          };
          const result = validateSettingsUpdate(body);
          expect(result.valid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
        },
      ),
      { numRuns: 100 },
    );
  });
});
