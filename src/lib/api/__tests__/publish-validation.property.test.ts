import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { validateLessonPublish } from '@/lib/api/validators/lessons';
import { validateChallengePublish } from '@/lib/api/validators/challenges';

/**
 * Feature: admin-api-routes, Property 8: Lesson Publish Validation
 * Validates: Requirements 3.6, 3.7
 */
describe('Feature: admin-api-routes, Property 8: Lesson Publish Validation', () => {
  // Generator for non-empty strings (required field values)
  const nonEmptyString = fc.string({ minLength: 1, maxLength: 100 });

  // Generator for a valid publishable lesson
  const validPublishableLesson = fc.record({
    title: nonEmptyString,
    description: nonEmptyString,
    grammarFocus: nonEmptyString,
    cefrLevel: nonEmptyString,
    exerciseCount: fc.integer({ min: 1, max: 100 }),
  });

  it('publish succeeds when all required fields are populated and exerciseCount >= 1', () => {
    fc.assert(
      fc.property(validPublishableLesson, (lesson) => {
        const result = validateLessonPublish(lesson);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      }),
      { numRuns: 100 }
    );
  });

  it('publish fails when title is missing or empty', () => {
    const lessonMissingTitle = fc.record({
      title: fc.constant(''),
      description: nonEmptyString,
      grammarFocus: nonEmptyString,
      cefrLevel: nonEmptyString,
      exerciseCount: fc.integer({ min: 1, max: 100 }),
    });

    fc.assert(
      fc.property(lessonMissingTitle, (lesson) => {
        const result = validateLessonPublish(lesson);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it('publish fails when description is missing or empty', () => {
    const lessonMissingDesc = fc.record({
      title: nonEmptyString,
      description: fc.constant(''),
      grammarFocus: nonEmptyString,
      cefrLevel: nonEmptyString,
      exerciseCount: fc.integer({ min: 1, max: 100 }),
    });

    fc.assert(
      fc.property(lessonMissingDesc, (lesson) => {
        const result = validateLessonPublish(lesson);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it('publish fails when grammarFocus is missing or empty', () => {
    const lessonMissingGrammar = fc.record({
      title: nonEmptyString,
      description: nonEmptyString,
      grammarFocus: fc.constant(''),
      cefrLevel: nonEmptyString,
      exerciseCount: fc.integer({ min: 1, max: 100 }),
    });

    fc.assert(
      fc.property(lessonMissingGrammar, (lesson) => {
        const result = validateLessonPublish(lesson);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it('publish fails when cefrLevel is missing or empty', () => {
    const lessonMissingCefr = fc.record({
      title: nonEmptyString,
      description: nonEmptyString,
      grammarFocus: nonEmptyString,
      cefrLevel: fc.constant(''),
      exerciseCount: fc.integer({ min: 1, max: 100 }),
    });

    fc.assert(
      fc.property(lessonMissingCefr, (lesson) => {
        const result = validateLessonPublish(lesson);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it('publish fails when exerciseCount is less than 1', () => {
    const lessonNoExercises = fc.record({
      title: nonEmptyString,
      description: nonEmptyString,
      grammarFocus: nonEmptyString,
      cefrLevel: nonEmptyString,
      exerciseCount: fc.integer({ min: -100, max: 0 }),
    });

    fc.assert(
      fc.property(lessonNoExercises, (lesson) => {
        const result = validateLessonPublish(lesson);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it('publish fails when any combination of required fields is missing', () => {
    // Generate lessons where at least one required field is empty/missing
    const emptyStr = fc.constant('') as fc.Arbitrary<string>;
    const fieldGenerators = [
      { title: emptyStr, description: nonEmptyString, grammarFocus: nonEmptyString, cefrLevel: nonEmptyString },
      { title: nonEmptyString, description: emptyStr, grammarFocus: nonEmptyString, cefrLevel: nonEmptyString },
      { title: nonEmptyString, description: nonEmptyString, grammarFocus: emptyStr, cefrLevel: nonEmptyString },
      { title: nonEmptyString, description: nonEmptyString, grammarFocus: nonEmptyString, cefrLevel: emptyStr },
    ];

    const invalidFieldsLesson = fc.oneof(
      ...fieldGenerators.map((fields) =>
        fc.record({
          ...fields,
          exerciseCount: fc.integer({ min: 1, max: 100 }),
        })
      )
    );

    fc.assert(
      fc.property(invalidFieldsLesson, (lesson) => {
        const result = validateLessonPublish(lesson);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: admin-api-routes, Property 9: Challenge Publish Validation
 * Validates: Requirements 6.6, 6.7
 */
describe('Feature: admin-api-routes, Property 9: Challenge Publish Validation', () => {
  // Generator for a question with a valid correct answer (one of several answer types)
  const validQuestionContent = fc.oneof(
    fc.record({ correctIndex: fc.integer({ min: 0, max: 10 }) }),
    fc.record({ acceptableAnswers: fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 5 }) }),
    fc.record({ answers: fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 5 }) }),
    fc.record({ targetSentence: fc.string({ minLength: 1, maxLength: 100 }) }),
    fc.record({ fragments: fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 5 }) })
  );

  const validQuestion = fc.record({
    content: validQuestionContent,
  });

  // Generator for a challenge with at least 5 valid questions
  const validPublishableChallenge = fc.record({
    questions: fc.array(validQuestion, { minLength: 5, maxLength: 20 }),
  });

  it('publish succeeds when challenge has >= 5 questions each with a correct answer', () => {
    fc.assert(
      fc.property(validPublishableChallenge, (challenge) => {
        const result = validateChallengePublish(challenge);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      }),
      { numRuns: 100 }
    );
  });

  it('publish fails when challenge has fewer than 5 questions', () => {
    const tooFewQuestions = fc.record({
      questions: fc.array(validQuestion, { minLength: 0, maxLength: 4 }),
    });

    fc.assert(
      fc.property(tooFewQuestions, (challenge) => {
        const result = validateChallengePublish(challenge);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it('publish fails when some questions are missing correct answers', () => {
    // A question with no valid answer markers in its content
    const invalidQuestion = fc.record({
      content: fc.record({
        prompt: fc.string({ minLength: 1 }),
      }),
    });

    // Generate at least 5 questions but include at least one invalid one
    const challengeWithInvalidQuestion = fc
      .tuple(
        fc.array(validQuestion, { minLength: 4, maxLength: 10 }),
        invalidQuestion,
        fc.array(validQuestion, { minLength: 0, maxLength: 5 })
      )
      .map(([before, invalid, after]) => ({
        questions: [...before, invalid, ...after],
      }));

    fc.assert(
      fc.property(challengeWithInvalidQuestion, (challenge) => {
        const result = validateChallengePublish(challenge);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it('publish fails when questions array is missing', () => {
    const noQuestionsChallenge = fc.record({
      title: fc.string({ minLength: 1 }),
    });

    fc.assert(
      fc.property(noQuestionsChallenge, (challenge) => {
        const result = validateChallengePublish(challenge);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it('publish fails when questions have missing content', () => {
    const questionWithNoContent = fc.constant({ noContent: true });

    const challengeWithMissingContent = fc.record({
      questions: fc.array(questionWithNoContent, { minLength: 5, maxLength: 10 }),
    });

    fc.assert(
      fc.property(challengeWithMissingContent, (challenge) => {
        const result = validateChallengePublish(challenge);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });
});
