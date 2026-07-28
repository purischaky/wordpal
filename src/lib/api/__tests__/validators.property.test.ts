import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { validateLearningPathCreate } from '@/lib/api/validators/learning-paths';
import { validateLessonCreate } from '@/lib/api/validators/lessons';
import { validateExerciseCreate } from '@/lib/api/validators/exercises';
import { validateAchievementCreate } from '@/lib/api/validators/achievements';
import { validateChallengeCreate } from '@/lib/api/validators/challenges';
import { validateSettingsUpdate } from '@/lib/api/validators/settings';
import { validateStudentUpdate } from '@/lib/api/validators/students';

/**
 * Feature: admin-api-routes, Property 4: Validation Accepts Valid Input
 *
 * For each entity validator, generate fully valid payloads (all required fields present,
 * strings within length limits, numbers within valid ranges) and assert valid === true
 * and errors.length === 0.
 *
 * Validates: Requirements 1.4, 2.2, 2.3, 3.2, 3.3, 4.4, 4.5, 5.2, 5.3, 6.2, 6.3
 */
describe('Feature: admin-api-routes, Property 4: Validation Accepts Valid Input', () => {
  // --- Generators for valid payloads ---

  /** Non-empty string between minLen and maxLen characters */
  const validString = (minLen: number, maxLen: number) =>
    fc.string({ minLength: minLen, maxLength: maxLen }).filter((s) => s.length >= minLen);

  /** Valid title: non-empty string 1-150 chars */
  const validTitle150 = validString(1, 150);

  /** Valid title: non-empty string 1-100 chars (for achievements) */
  const validTitle100 = validString(1, 100);

  /** Valid description: string 0-500 chars */
  const validDescription500 = fc.string({ minLength: 0, maxLength: 500 });

  /** Valid description: string 0-300 chars (for achievements) */
  const validDescription300 = fc.string({ minLength: 0, maxLength: 300 });

  /** Valid estimatedDuration: integer 1-9999 */
  const validEstimatedDuration = fc.integer({ min: 1, max: 9999 });

  /** Valid exercise type */
  const validExerciseType = fc.constantFrom(
    'drag-and-drop',
    'multiple-choice',
    'sentence-ordering',
    'fill-in-blank',
    'rewrite-sentence',
    'free-writing',
  );

  /** Valid trigger criteria */
  const validTriggerCriteria = fc.constantFrom(
    'lessons_completed',
    'streak_days',
    'grammar_score',
    'challenge_passed',
    'exercises_completed',
  );

  /** Valid CEFR target level */
  const validTargetLevel = fc.constantFrom('A1', 'A2', 'B1', 'B2', 'C1', 'C2');

  // --- Learning Path Create ---

  it('validateLearningPathCreate accepts valid payloads with only required fields', () => {
    fc.assert(
      fc.property(validTitle150, validTargetLevel, (title, targetLevel) => {
        const result = validateLearningPathCreate({ title, targetLevel });
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      }),
      { numRuns: 100 },
    );
  });

  it('validateLearningPathCreate accepts valid payloads with all optional fields', () => {
    fc.assert(
      fc.property(
        validTitle150,
        validTargetLevel,
        validDescription500,
        validEstimatedDuration,
        (title, targetLevel, description, estimatedDuration) => {
          const result = validateLearningPathCreate({ title, targetLevel, description, estimatedDuration });
          expect(result.valid).toBe(true);
          expect(result.errors).toHaveLength(0);
        },
      ),
      { numRuns: 100 },
    );
  });

  // --- Lesson Create ---

  it('validateLessonCreate accepts valid payloads with only required fields', () => {
    fc.assert(
      fc.property(validTitle150, fc.integer({ min: 1, max: 999 }), (title, position) => {
        const result = validateLessonCreate({ title, unitId: 'unit-1', position });
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      }),
      { numRuns: 100 },
    );
  });

  it('validateLessonCreate accepts valid payloads with all optional fields', () => {
    const validGrammarFocus = fc.string({ minLength: 0, maxLength: 100 });

    fc.assert(
      fc.property(
        validTitle150,
        fc.integer({ min: 1, max: 999 }),
        validDescription500,
        validGrammarFocus,
        (title, position, description, grammarFocus) => {
          const result = validateLessonCreate({ title, unitId: 'unit-1', position, description, grammarFocus });
          expect(result.valid).toBe(true);
          expect(result.errors).toHaveLength(0);
        },
      ),
      { numRuns: 100 },
    );
  });

  // --- Exercise Create ---

  it('validateExerciseCreate accepts valid payloads with a valid exercise type', () => {
    fc.assert(
      fc.property(validExerciseType, fc.integer({ min: 1, max: 999 }), (type, position) => {
        const result = validateExerciseCreate({
          type,
          position,
          content: { targetSentence: 'x', blocks: [] },
          lessonId: 'lesson-1',
        });
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      }),
      { numRuns: 100 },
    );
  });

  // --- Achievement Create ---

  it('validateAchievementCreate accepts valid payloads with only required fields', () => {
    fc.assert(
      fc.property(
        validTitle100,
        validTriggerCriteria,
        fc.integer({ min: 1, max: 10000 }),
        (title, triggerCriteria, thresholdValue) => {
          const result = validateAchievementCreate({ title, triggerCriteria, thresholdValue });
          expect(result.valid).toBe(true);
          expect(result.errors).toHaveLength(0);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('validateAchievementCreate accepts valid payloads with all optional fields', () => {
    fc.assert(
      fc.property(
        validTitle100,
        validTriggerCriteria,
        fc.integer({ min: 1, max: 10000 }),
        validDescription300,
        (title, triggerCriteria, thresholdValue, description) => {
          const result = validateAchievementCreate({ title, triggerCriteria, thresholdValue, description });
          expect(result.valid).toBe(true);
          expect(result.errors).toHaveLength(0);
        },
      ),
      { numRuns: 100 },
    );
  });

  // --- Challenge Create ---

  it('validateChallengeCreate accepts valid payloads with a valid title', () => {
    fc.assert(
      fc.property(validTitle150, validTargetLevel, (title, targetLevel) => {
        const result = validateChallengeCreate({ title, targetLevel });
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      }),
      { numRuns: 100 },
    );
  });
});

/**
 * Feature: admin-api-routes, Property 3: Validation Rejects Invalid Input
 *
 * For each entity validator, generate payloads with deliberate violations
 * (missing required fields, strings exceeding max length, numbers outside range, wrong types)
 * and assert valid === false and errors.length > 0.
 *
 * Validates: Requirements 1.5, 2.7, 3.8, 4.7, 5.6, 12.2, 12.3, 12.4, 12.5
 */
describe('Feature: admin-api-routes, Property 3: Validation Rejects Invalid Input', () => {
  describe('Empty/non-object bodies reject all validators', () => {
    const nonObjectArb = fc.oneof(
      fc.constant(null),
      fc.constant(undefined),
      fc.integer(),
      fc.string(),
      fc.boolean(),
      fc.constant([1, 2, 3]),
    );

    it('validateLearningPathCreate rejects non-object bodies', () => {
      fc.assert(
        fc.property(nonObjectArb, (body) => {
          const result = validateLearningPathCreate(body);
          expect(result.valid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
        }),
        { numRuns: 100 },
      );
    });

    it('validateLessonCreate rejects non-object bodies', () => {
      fc.assert(
        fc.property(nonObjectArb, (body) => {
          const result = validateLessonCreate(body);
          expect(result.valid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
        }),
        { numRuns: 100 },
      );
    });

    it('validateExerciseCreate rejects non-object bodies', () => {
      fc.assert(
        fc.property(nonObjectArb, (body) => {
          const result = validateExerciseCreate(body);
          expect(result.valid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
        }),
        { numRuns: 100 },
      );
    });

    it('validateAchievementCreate rejects non-object bodies', () => {
      fc.assert(
        fc.property(nonObjectArb, (body) => {
          const result = validateAchievementCreate(body);
          expect(result.valid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
        }),
        { numRuns: 100 },
      );
    });

    it('validateChallengeCreate rejects non-object bodies', () => {
      fc.assert(
        fc.property(nonObjectArb, (body) => {
          const result = validateChallengeCreate(body);
          expect(result.valid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
        }),
        { numRuns: 100 },
      );
    });

    it('validateSettingsUpdate rejects non-object bodies', () => {
      fc.assert(
        fc.property(nonObjectArb, (body) => {
          const result = validateSettingsUpdate(body);
          expect(result.valid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
        }),
        { numRuns: 100 },
      );
    });

    it('validateStudentUpdate rejects non-object bodies', () => {
      fc.assert(
        fc.property(nonObjectArb, (body) => {
          const result = validateStudentUpdate(body);
          expect(result.valid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
        }),
        { numRuns: 100 },
      );
    });
  });

  describe('validateLearningPathCreate rejects invalid payloads', () => {
    it('rejects missing title (empty object)', () => {
      fc.assert(
        fc.property(fc.constant({}), (body) => {
          const result = validateLearningPathCreate(body);
          expect(result.valid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
        }),
        { numRuns: 100 },
      );
    });

    it('rejects wrong type for title (number instead of string)', () => {
      fc.assert(
        fc.property(
          fc.record({ title: fc.oneof(fc.integer(), fc.boolean(), fc.constant(null)) }),
          (body) => {
            const result = validateLearningPathCreate(body);
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('rejects title exceeding 150 characters', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 151, maxLength: 500 }).map((s) => ({ title: s })),
          (body) => {
            const result = validateLearningPathCreate(body);
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('rejects estimatedDuration outside valid range (> 9999 or < 1)', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.integer({ min: 10000, max: 999999 }),
            fc.integer({ min: -9999, max: 0 }),
          ).map((duration) => ({ title: 'Valid Title', targetLevel: 'A1', estimatedDuration: duration })),
          (body) => {
            const result = validateLearningPathCreate(body);
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('rejects description exceeding 500 characters', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 501, maxLength: 700 }).map((desc) => ({
            title: 'Valid Title',
            targetLevel: 'A1',
            description: desc,
          })),
          (body) => {
            const result = validateLearningPathCreate(body);
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('rejects missing targetLevel', () => {
      fc.assert(
        fc.property(fc.constant({ title: 'Valid Title' }), (body) => {
          const result = validateLearningPathCreate(body);
          expect(result.valid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
        }),
        { numRuns: 100 },
      );
    });
  });

  describe('validateLessonCreate rejects invalid payloads', () => {
    it('rejects missing title (empty object)', () => {
      fc.assert(
        fc.property(fc.constant({}), (body) => {
          const result = validateLessonCreate(body);
          expect(result.valid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
        }),
        { numRuns: 100 },
      );
    });

    it('rejects wrong type for title', () => {
      fc.assert(
        fc.property(
          fc.record({ title: fc.oneof(fc.integer(), fc.boolean(), fc.constant(null)) }),
          (body) => {
            const result = validateLessonCreate(body);
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('rejects title exceeding 150 characters', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 151, maxLength: 500 }).map((s) => ({ title: s })),
          (body) => {
            const result = validateLessonCreate(body);
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('rejects description exceeding 500 characters', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 501, maxLength: 700 }).map((desc) => ({
            title: 'Valid Title',
            description: desc,
          })),
          (body) => {
            const result = validateLessonCreate(body);
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('rejects grammarFocus exceeding 100 characters', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 101, maxLength: 300 }).map((gf) => ({
            title: 'Valid Title',
            grammarFocus: gf,
          })),
          (body) => {
            const result = validateLessonCreate(body);
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  describe('validateExerciseCreate rejects invalid payloads', () => {
    it('rejects missing type (empty object)', () => {
      fc.assert(
        fc.property(fc.constant({}), (body) => {
          const result = validateExerciseCreate(body);
          expect(result.valid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
        }),
        { numRuns: 100 },
      );
    });

    it('rejects wrong type for type field (number instead of string)', () => {
      fc.assert(
        fc.property(
          fc.record({ type: fc.oneof(fc.integer(), fc.boolean(), fc.constant(null)) }),
          (body) => {
            const result = validateExerciseCreate(body);
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('rejects invalid exercise type string', () => {
      const invalidTypes = fc
        .string({ minLength: 1, maxLength: 50 })
        .filter(
          (s) =>
            ![
              'drag-and-drop',
              'multiple-choice',
              'sentence-ordering',
              'fill-in-blank',
              'rewrite-sentence',
              'free-writing',
            ].includes(s),
        );

      fc.assert(
        fc.property(invalidTypes.map((t) => ({ type: t })), (body) => {
          const result = validateExerciseCreate(body);
          expect(result.valid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
        }),
        { numRuns: 100 },
      );
    });
  });

  describe('validateAchievementCreate rejects invalid payloads', () => {
    it('rejects missing title and triggerCriteria (empty object)', () => {
      fc.assert(
        fc.property(fc.constant({}), (body) => {
          const result = validateAchievementCreate(body);
          expect(result.valid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
        }),
        { numRuns: 100 },
      );
    });

    it('rejects wrong type for title', () => {
      fc.assert(
        fc.property(
          fc.record({
            title: fc.oneof(fc.integer(), fc.boolean(), fc.constant(null)),
            triggerCriteria: fc.constant('lessons_completed'),
          }),
          (body) => {
            const result = validateAchievementCreate(body);
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('rejects title exceeding 100 characters', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 101, maxLength: 300 }).map((s) => ({
            title: s,
            triggerCriteria: 'lessons_completed',
          })),
          (body) => {
            const result = validateAchievementCreate(body);
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('rejects missing triggerCriteria', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }).map((title) => ({ title })),
          (body) => {
            const result = validateAchievementCreate(body);
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('rejects invalid triggerCriteria value', () => {
      const invalidCriteria = fc
        .string({ minLength: 1, maxLength: 50 })
        .filter(
          (s) =>
            ![
              'lessons_completed',
              'streak_days',
              'grammar_score',
              'challenge_passed',
              'exercises_completed',
            ].includes(s),
        );

      fc.assert(
        fc.property(
          invalidCriteria.map((tc) => ({
            title: 'Valid Title',
            triggerCriteria: tc,
          })),
          (body) => {
            const result = validateAchievementCreate(body);
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('rejects description exceeding 300 characters', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 301, maxLength: 500 }).map((desc) => ({
            title: 'Valid Title',
            triggerCriteria: 'lessons_completed',
            description: desc,
          })),
          (body) => {
            const result = validateAchievementCreate(body);
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  describe('validateChallengeCreate rejects invalid payloads', () => {
    it('rejects missing title (empty object)', () => {
      fc.assert(
        fc.property(fc.constant({}), (body) => {
          const result = validateChallengeCreate(body);
          expect(result.valid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
        }),
        { numRuns: 100 },
      );
    });

    it('rejects wrong type for title', () => {
      fc.assert(
        fc.property(
          fc.record({ title: fc.oneof(fc.integer(), fc.boolean(), fc.constant(null)) }),
          (body) => {
            const result = validateChallengeCreate(body);
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('rejects title exceeding 150 characters', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 151, maxLength: 500 }).map((s) => ({ title: s })),
          (body) => {
            const result = validateChallengeCreate(body);
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  describe('validateSettingsUpdate rejects invalid payloads', () => {
    it('rejects xpPerExercise outside valid range (1-1000)', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.integer({ min: 1001, max: 99999 }),
            fc.integer({ min: -9999, max: 0 }),
          ).map((xp) => ({
            scoring: { xpPerExercise: xp },
          })),
          (body) => {
            const result = validateSettingsUpdate(body);
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('rejects xpPerLesson outside valid range (1-10000)', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.integer({ min: 10001, max: 99999 }),
            fc.integer({ min: -9999, max: 0 }),
          ).map((xp) => ({
            scoring: { xpPerLesson: xp },
          })),
          (body) => {
            const result = validateSettingsUpdate(body);
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('rejects passingThreshold outside valid range (50-100)', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.integer({ min: 101, max: 999 }),
            fc.integer({ min: -100, max: 49 }),
          ).map((threshold) => ({
            scoring: { passingThreshold: threshold },
          })),
          (body) => {
            const result = validateSettingsUpdate(body);
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('rejects weightByExerciseType values not summing to 100', () => {
      fc.assert(
        fc.property(
          fc
            .tuple(
              fc.integer({ min: 1, max: 40 }),
              fc.integer({ min: 1, max: 40 }),
              fc.integer({ min: 1, max: 40 }),
            )
            .filter(([a, b, c]) => Math.round(a + b + c) !== 100)
            .map(([a, b, c]) => ({
              scoring: {
                weightByExerciseType: {
                  'multiple-choice': a,
                  'fill-in-blank': b,
                  'free-writing': c,
                },
              },
            })),
          (body) => {
            const result = validateSettingsUpdate(body);
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('rejects non-number values in scoring fields', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.string().map((s) => ({ scoring: { xpPerExercise: s } })),
            fc.boolean().map((b) => ({ scoring: { xpPerLesson: b } })),
            fc.constant({ scoring: { passingThreshold: 'high' } }),
          ),
          (body) => {
            const result = validateSettingsUpdate(body);
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('rejects scoring as a non-object value', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant({ scoring: 'invalid' }),
            fc.constant({ scoring: 42 }),
            fc.constant({ scoring: null }),
            fc.constant({ scoring: true }),
          ),
          (body) => {
            const result = validateSettingsUpdate(body);
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  describe('validateStudentUpdate rejects invalid payloads', () => {
    it('rejects invalid status value', () => {
      const invalidStatus = fc
        .string({ minLength: 1, maxLength: 30 })
        .filter((s) => !['active', 'inactive', 'suspended'].includes(s));

      fc.assert(
        fc.property(invalidStatus.map((status) => ({ status })), (body) => {
          const result = validateStudentUpdate(body);
          expect(result.valid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
        }),
        { numRuns: 100 },
      );
    });

    it('rejects wrong type for status (number instead of string)', () => {
      fc.assert(
        fc.property(
          fc.oneof(fc.integer(), fc.boolean()).map((status) => ({ status })),
          (body) => {
            const result = validateStudentUpdate(body);
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('rejects displayName exceeding 100 characters', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 101, maxLength: 300 }).map((displayName) => ({ displayName })),
          (body) => {
            const result = validateStudentUpdate(body);
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('rejects empty displayName string', () => {
      fc.assert(
        fc.property(fc.constant({ displayName: '' }), (body) => {
          const result = validateStudentUpdate(body);
          expect(result.valid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
        }),
        { numRuns: 100 },
      );
    });

    it('rejects wrong type for displayName (number instead of string)', () => {
      fc.assert(
        fc.property(
          fc.oneof(fc.integer(), fc.boolean()).map((displayName) => ({ displayName })),
          (body) => {
            const result = validateStudentUpdate(body);
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('rejects invalid cefrLevel value', () => {
      const invalidCefr = fc
        .string({ minLength: 1, maxLength: 10 })
        .filter((s) => !['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(s));

      fc.assert(
        fc.property(invalidCefr.map((cefrLevel) => ({ cefrLevel })), (body) => {
          const result = validateStudentUpdate(body);
          expect(result.valid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
        }),
        { numRuns: 100 },
      );
    });

    it('rejects invalid role value', () => {
      const invalidRole = fc
        .string({ minLength: 1, maxLength: 30 })
        .filter((s) => !['admin', 'instructor', 'content_creator', 'student'].includes(s));

      fc.assert(
        fc.property(invalidRole.map((role) => ({ role })), (body) => {
          const result = validateStudentUpdate(body);
          expect(result.valid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
        }),
        { numRuns: 100 },
      );
    });
  });
});
