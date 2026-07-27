# Implementation Plan: Admin API Routes

## Overview

This plan implements a RESTful API layer for the WordPal admin dashboard using Next.js 16 App Router route handlers. The implementation progresses from shared utilities (file service, response helpers, ID generator, validators) through route handlers for all 11 entities, followed by admin page migration to fetch calls, and concludes with property-based and unit tests using fast-check and vitest.

## Tasks

- [x] 1. Set up testing infrastructure and shared utility layer
  - [x] 1.1 Configure Vitest for the project
    - Install `vitest` and `@vitejs/plugin-react` as dev dependencies
    - Create `vitest.config.ts` at the project root with path aliases matching `tsconfig.json` (e.g., `@/` → `src/`)
    - Add `"test": "vitest --run"` script to `package.json`
    - _Requirements: Testing Strategy from design_

  - [x] 1.2 Implement the response helpers module
    - Create `src/lib/api/response.ts` with `successResponse<T>(data, status)`, `errorResponse(message, status)`, and `validationErrorResponse(message, details)` functions
    - All functions return `Response.json()` with the standard envelope format (`{ data }` or `{ error, details? }`)
    - _Requirements: 13.1, 13.2, 13.3, 13.4_

  - [x] 1.3 Implement the file service module
    - Create `src/lib/api/file-service.ts` with `readJsonFile<T>(filename)` and `writeJsonFile<T>(filename, data)` functions
    - Use `fs/promises` `readFile`/`writeFile` with `path.join(process.cwd(), 'src', 'data', 'admin')` as base directory
    - Write with 2-space indentation (`JSON.stringify(data, null, 2)`)
    - _Requirements: 15.1, 15.2, 15.3, 15.4_

  - [x] 1.4 Implement the ID generator module
    - Create `src/lib/api/id-generator.ts` with `generateId(prefix)` function
    - Format: `{prefix}-{timestamp_base36}-{random_base36}` ensuring uniqueness and prefix matching
    - _Requirements: 15.5_

  - [x] 1.5 Implement validators for all entities
    - Create `src/lib/api/validators/index.ts` exporting the `ValidationResult` interface (`{ valid: boolean; errors: string[] }`)
    - Create `src/lib/api/validators/students.ts` with `validateStudentUpdate(body)`
    - Create `src/lib/api/validators/learning-paths.ts` with `validateLearningPathCreate(body)` and `validateLearningPathUpdate(body)` — title required, max 150 chars; description max 500 chars; estimatedDuration 1–9999
    - Create `src/lib/api/validators/lessons.ts` with `validateLessonCreate(body)`, `validateLessonUpdate(body)`, and `validateLessonPublish(lesson)` — title required max 150, description max 500, grammarFocus max 100; publish requires at least one exercise and all required fields
    - Create `src/lib/api/validators/exercises.ts` with `validateExerciseCreate(body)` and `validateExerciseUpdate(body)` — type field required and must be a valid ExerciseType
    - Create `src/lib/api/validators/achievements.ts` with `validateAchievementCreate(body)` and `validateAchievementUpdate(body)` — title required max 100, description max 300, triggerCriteria required
    - Create `src/lib/api/validators/challenges.ts` with `validateChallengeCreate(body)`, `validateChallengeUpdate(body)`, and `validateChallengePublish(challenge)` — title required max 150; publish requires minimum questions and correct answers
    - Create `src/lib/api/validators/settings.ts` with `validateSettingsUpdate(body)` — xpPerExercise 1–1000, xpPerLesson 1–10000, weights sum to 100, passingThreshold 50–100
    - _Requirements: 1.5, 2.7, 3.8, 4.7, 5.6, 6.7, 11.3, 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 2. Implement core entity route handlers (Students, Learning Paths, Lessons)
  - [x] 2.1 Implement Students API routes
    - Create `src/app/api/admin/students/route.ts` with GET handler returning all students from `students.json`
    - Create `src/app/api/admin/students/[id]/route.ts` with GET (from `student-profiles.json`) and PUT handlers
    - Use `export const dynamic = 'force-dynamic'` on each file
    - Use `{ params }: { params: Promise<{ id: string }> }` for dynamic route segments (Next.js 16 async params)
    - Wrap all handlers in try/catch returning proper error responses
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [x] 2.2 Implement Learning Paths API routes
    - Create `src/app/api/admin/learning-paths/route.ts` with GET (list all) and POST (create with generated ID) handlers
    - Create `src/app/api/admin/learning-paths/[id]/route.ts` with PUT and DELETE handlers
    - Create `src/app/api/admin/learning-paths/[id]/reorder/route.ts` with PATCH handler that reorders units within a learning path based on provided unit ID array
    - Validate on POST/PUT, return 404 on missing ID for PUT/DELETE, use `generateId('lp')` for new records
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

  - [x] 2.3 Implement Lessons API routes
    - Create `src/app/api/admin/lessons/route.ts` with GET and POST handlers
    - Create `src/app/api/admin/lessons/[id]/route.ts` with PUT and DELETE handlers
    - Create `src/app/api/admin/lessons/[id]/duplicate/route.ts` with POST handler — duplicates lesson with "Copy of " title prefix, status "draft", new ID via `generateId('les')`
    - Create `src/app/api/admin/lessons/[id]/publish/route.ts` with PATCH handler — validates required fields and exercise count before setting status to "published"
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_

- [x] 3. Checkpoint - Verify core routes
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement remaining entity route handlers
  - [x] 4.1 Implement Exercises API routes
    - Create `src/app/api/admin/exercises/route.ts` with GET (returns full object) and POST handlers
    - Create `src/app/api/admin/exercises/[id]/route.ts` with GET, PUT, DELETE handlers
    - Exercises stored as `Record<string, ExerciseData>` — use `generateId('ex')` for keys
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

  - [x] 4.2 Implement Achievements API routes
    - Create `src/app/api/admin/achievements/route.ts` with GET and POST handlers
    - Create `src/app/api/admin/achievements/[id]/route.ts` with PUT and DELETE handlers
    - Use `generateId('ach')` for new records
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

  - [x] 4.3 Implement Challenges API routes
    - Create `src/app/api/admin/challenges/route.ts` with GET and POST handlers
    - Create `src/app/api/admin/challenges/[id]/route.ts` with PUT and DELETE handlers
    - Create `src/app/api/admin/challenges/[id]/publish/route.ts` with PATCH handler — validates minimum question count and correct answers before publishing
    - Use `generateId('ch')` for new records
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_

  - [x] 4.4 Implement KPI Metrics and AI Insights API routes
    - Create `src/app/api/admin/kpi-metrics/route.ts` with GET handler only (read-only)
    - Create `src/app/api/admin/ai-insights/route.ts` with GET handler only (read-only)
    - _Requirements: 7.1, 7.2, 7.3, 8.1, 8.2, 8.3_

  - [x] 4.5 Implement Notifications API routes
    - Create `src/app/api/admin/notifications/route.ts` with GET handler
    - Create `src/app/api/admin/notifications/[id]/read/route.ts` with PATCH handler (mark single notification as read)
    - Create `src/app/api/admin/notifications/mark-all-read/route.ts` with POST handler (set all isRead to true)
    - Create `src/app/api/admin/notifications/old/route.ts` with DELETE handler (accept cutoff date query param, remove notifications before that date, return count)
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [x] 4.6 Implement Search API route
    - Create `src/app/api/admin/search/route.ts` with GET handler
    - Accept `q` query parameter from `request.nextUrl.searchParams`
    - Return empty array if query is less than 2 characters
    - Filter by case-insensitive substring match on `title` and `subtitle` fields
    - Group by category, return max 5 results per category
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [x] 4.7 Implement Settings API route
    - Create `src/app/api/admin/settings/route.ts` with GET and PUT handlers
    - GET returns settings from `settings.json` (create with defaults if file doesn't exist)
    - PUT validates scoring fields before writing
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [x] 5. Checkpoint - Verify all route handlers
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Migrate admin pages to use fetch calls
  - [x] 6.1 Migrate Students and Dashboard pages
    - Update `src/app/(admin)/admin/page.tsx` to fetch KPI metrics from `/api/admin/kpi-metrics`
    - Update `src/app/(admin)/admin/students/page.tsx` to fetch from `/api/admin/students`
    - Replace static imports from `@/data/admin` with `fetch()` calls
    - Use `async` server component pattern or `useEffect`+`useState` for client components
    - _Requirements: 14.1, 14.7_

  - [x] 6.2 Migrate Learning Paths and Lessons pages
    - Update `src/app/(admin)/admin/learning-paths/page.tsx` to fetch from `/api/admin/learning-paths`
    - Update `src/app/(admin)/admin/lessons/page.tsx` to fetch from `/api/admin/lessons`
    - Update related new/edit pages to use POST/PUT fetch calls for mutations
    - _Requirements: 14.2, 14.3_

  - [x] 6.3 Migrate Exercises and Achievements pages
    - Update `src/app/(admin)/admin/exercises/page.tsx` to fetch from `/api/admin/exercises`
    - Update `src/app/(admin)/admin/achievements/page.tsx` to fetch from `/api/admin/achievements`
    - Update related new/edit pages to use POST/PUT/DELETE fetch calls
    - _Requirements: 14.4, 14.5_

  - [x] 6.4 Migrate Challenges and Analytics pages
    - Update `src/app/(admin)/admin/challenges/page.tsx` to fetch from `/api/admin/challenges`
    - Update `src/app/(admin)/admin/analytics/page.tsx` to fetch from `/api/admin/ai-insights`
    - _Requirements: 14.6, 14.8_

  - [x] 6.5 Migrate Notifications, Search, and Settings pages
    - Update `src/app/(admin)/admin/notifications/page.tsx` to fetch from `/api/admin/notifications`
    - Update the search modal component to fetch from `/api/admin/search?q=...`
    - Update `src/app/(admin)/admin/settings/page.tsx` to fetch and persist through `/api/admin/settings`
    - _Requirements: 14.9, 14.10, 14.11_

- [x] 7. Checkpoint - Verify page migrations build correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Property-based tests
  - [ ]* 8.1 Write property test for file service round-trip
    - **Property 1: File Service Round-Trip**
    - Test that writing arbitrary JSON objects via `writeJsonFile` and reading via `readJsonFile` produces deeply equal data
    - Verify raw file content uses 2-space indentation
    - Use `fc.anything()` or `fc.jsonValue()` to generate arbitrary JSON-compatible objects
    - **Validates: Requirements 15.2, 15.3**

  - [ ]* 8.2 Write property test for ID generation
    - **Property 2: ID Generation Uniqueness and Format**
    - Generate multiple IDs with arbitrary prefixes, assert all unique, start with prefix + hyphen, contain only alphanumeric chars and hyphens
    - Use `fc.string()` filtered to non-empty alphanumeric strings for prefix
    - **Validates: Requirements 15.5**

  - [ ]* 8.3 Write property tests for validator rejection of invalid input
    - **Property 3: Validation Rejects Invalid Input**
    - For each entity validator, generate payloads with deliberate violations (missing required fields, strings exceeding max length, numbers outside range, wrong types)
    - Assert `valid === false` and `errors.length > 0`
    - **Validates: Requirements 1.5, 2.7, 3.8, 4.7, 5.6, 12.2, 12.3, 12.4, 12.5**

  - [ ]* 8.4 Write property tests for validator acceptance of valid input
    - **Property 4: Validation Accepts Valid Input**
    - For each entity validator, generate fully valid payloads (all required fields, strings within limits, numbers within ranges)
    - Assert `valid === true` and `errors.length === 0`
    - **Validates: Requirements 1.4, 2.2, 2.3, 3.2, 3.3, 4.4, 4.5, 5.2, 5.3, 6.2, 6.3**

  - [ ]* 8.5 Write property tests for search filtering
    - **Property 5: Search Filtering Correctness**
    - Generate random search queries (2+ chars) and random SearchResult arrays
    - Assert results contain only items with query substring in title/subtitle (case-insensitive)
    - Assert max 5 results per category
    - **Property 6: Short Search Query Returns Empty**
    - Generate strings of length 0 or 1, assert empty result array
    - **Validates: Requirements 10.1, 10.2, 10.3**

  - [ ]* 8.6 Write property test for lesson duplication
    - **Property 7: Lesson Duplication Preserves Content**
    - Generate random AdminLesson objects, duplicate them
    - Assert new title is "Copy of {original}", status is "draft", ID differs, content fields preserved
    - **Validates: Requirements 3.5**

  - [ ]* 8.7 Write property tests for publish validation
    - **Property 8: Lesson Publish Validation**
    - Generate lessons with varying completeness, assert publish succeeds iff exercises > 0 and all required fields populated
    - **Property 9: Challenge Publish Validation**
    - Generate challenges with varying question counts, assert publish succeeds iff minimum questions met and all have correct answers
    - **Validates: Requirements 3.6, 3.7, 6.6, 6.7**

  - [ ]* 8.8 Write property test for settings scoring validation
    - **Property 10: Settings Scoring Validation**
    - Generate random scoring configs, assert rejection when xpPerExercise outside 1–1000, xpPerLesson outside 1–10000, weights don't sum to 100, or passingThreshold outside 50–100
    - Assert acceptance when all constraints satisfied simultaneously
    - **Validates: Requirements 11.3**

  - [ ]* 8.9 Write property tests for notification operations
    - **Property 11: Notification Date Filtering**
    - Generate random notification arrays with various dates and a cutoff date
    - Assert filtering removes exactly those before cutoff, preserves rest
    - **Property 12: Mark All Read Idempotence**
    - Generate random notification arrays with mixed isRead states
    - Assert marking all read results in all isRead: true; applying twice produces same result
    - **Validates: Requirements 9.4, 9.5**

  - [ ]* 8.10 Write property test for reorder operation
    - **Property 13: Reorder Preserves Units**
    - Generate random learning paths with units and valid permutations of unit IDs
    - Assert reordering produces same set of units with order matching permutation
    - **Validates: Requirements 2.6**

  - [ ]* 8.11 Write property tests for response helpers and body parsing
    - **Property 14: Response Envelope Consistency**
    - Generate random data payloads, assert successResponse includes `data` field; generate random error messages, assert errorResponse includes `error` field as non-empty string; validation errors include `details` array
    - **Property 15: Non-JSON Body Rejection**
    - Generate random non-JSON strings, assert they produce 400 with appropriate error message
    - **Validates: Requirements 12.1, 13.1, 13.2, 13.3**

- [ ] 9. Unit tests for route handlers
  - [ ]* 9.1 Write unit tests for Students and Learning Paths routes
    - Test GET returns correct data structure
    - Test 404 for non-existent student ID
    - Test PUT with valid/invalid body
    - Test POST creates new learning path with generated ID
    - Test DELETE removes record, 404 for missing ID
    - Mock `file-service` module for isolation
    - _Requirements: 1.1–1.6, 2.1–2.8_

  - [ ]* 9.2 Write unit tests for Lessons routes
    - Test GET, POST, PUT, DELETE handlers
    - Test duplicate endpoint creates copy with correct title and status
    - Test publish validates before changing status
    - _Requirements: 3.1–3.9_

  - [ ]* 9.3 Write unit tests for Exercises and Achievements routes
    - Test CRUD operations for both entities
    - Test 404 responses for non-existent IDs
    - Test validation rejection for invalid payloads
    - _Requirements: 4.1–4.8, 5.1–5.7_

  - [ ]* 9.4 Write unit tests for Challenges, Notifications, Search, and Settings routes
    - Test challenge publish validation logic
    - Test mark-all-read and delete-old notifications
    - Test search filtering with various query lengths
    - Test settings validation for scoring fields
    - _Requirements: 6.1–6.8, 9.1–9.6, 10.1–10.4, 11.1–11.4_

- [x] 10. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- Next.js 16 uses `params: Promise<{ id: string }>` (async params) in route handlers — always `await params` before accessing values
- The `RouteContext` helper type can be used for typed route params: `ctx: RouteContext<'/api/admin/students/[id]'>`
- All route handlers must use `export const dynamic = 'force-dynamic'` to prevent caching
- The `settings.json` file does not exist yet — the GET handler should create it with defaults if missing
- fast-check is already installed; vitest needs to be added in task 1.1

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3", "1.4"] },
    { "id": 1, "tasks": ["1.5"] },
    { "id": 2, "tasks": ["2.1", "2.2", "2.3", "4.4"] },
    { "id": 3, "tasks": ["4.1", "4.2", "4.3", "4.5", "4.6", "4.7"] },
    { "id": 4, "tasks": ["6.1", "6.2", "6.3", "6.4", "6.5"] },
    { "id": 5, "tasks": ["8.1", "8.2", "8.11"] },
    { "id": 6, "tasks": ["8.3", "8.4", "8.5", "8.6", "8.7", "8.8", "8.9", "8.10"] },
    { "id": 7, "tasks": ["9.1", "9.2", "9.3", "9.4"] }
  ]
}
```
