# Implementation Plan: Admin Interface

## Overview

Implement a role-gated admin content management system within the existing Next.js + Supabase application. The admin interface lives at `/admin` and provides CRUD operations for lessons, exercises, grammar blocks, and placement challenges. Implementation proceeds from database schema and types, through the service layer and API routes, to UI components with validation and drag-and-drop reordering.

## Tasks

- [ ] 1. Set up database schema and TypeScript types
  - [ ] 1.1 Create database migration for admin content tables
    - Add `role` column to users table with check constraint (`learner`, `admin`)
    - Extend `lessons` table with `level`, `icon`, `updated_at` columns
    - Extend `exercises` table with `hint`, `tutor_explanation`, `updated_at` columns
    - Create `placement_challenges` table with level constraints
    - Create `challenge_exercises` junction table with unique constraint
    - Create RLS policies for admin-only writes and public reads
    - _Requirements: 1.1, 1.4, 2.3, 3.3, 4.3, 5.3_

  - [ ] 1.2 Define TypeScript types and interfaces for admin entities
    - Create `src/types/admin.ts` with `Level`, `BlockCategory`, input types, and view types
    - Define `CreateLessonInput`, `UpdateLessonInput`, `CreateExerciseInput`, `UpdateExerciseInput`, `CreateBlockInput`, `UpdateBlockInput`, `UpdateChallengeInput`
    - Define view types: `LessonWithCount`, `ExerciseWithBlockCount`, `ChallengeWithCount`
    - _Requirements: 2.2, 3.2, 4.2, 5.2_

- [ ] 2. Implement content validation utilities
  - [ ] 2.1 Implement field validation functions
    - Create `src/lib/validation/field-validators.ts`
    - Implement validators for title (non-empty, max 100), description (max 300), target sentence (non-empty, max 200), block label (non-empty/non-whitespace, max 50), hint (max 300), tutor explanation (max 500)
    - Return structured validation results with error messages
    - _Requirements: 2.9, 3.8, 3.9, 4.6, 5.7_

  - [ ]* 2.2 Write property test for field validation (Property 4)
    - **Property 4: Text field validation rejects invalid input**
    - **Validates: Requirements 2.9, 3.8, 3.9, 4.6**

  - [ ] 2.3 Implement content validator for exercise blocks
    - Create `src/lib/validation/content-validator.ts`
    - Implement `validateExerciseBlocks` function checking block-to-sentence consistency, block count range [2, 15], and non-distractor minimum
    - Return `ValidationResult` with `valid`, `errors`, and `warnings` arrays
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 4.7_

  - [ ]* 2.4 Write property test for block-to-sentence consistency (Property 5)
    - **Property 5: Block-to-sentence consistency detection**
    - **Validates: Requirements 6.1, 6.2**

  - [ ]* 2.5 Write property test for block count range (Property 6)
    - **Property 6: Block count range validation**
    - **Validates: Requirements 6.3, 6.4**

  - [ ]* 2.6 Write property test for non-distractor minimum (Property 7)
    - **Property 7: Non-distractor minimum enforcement**
    - **Validates: Requirements 4.7**

  - [ ] 2.7 Implement level ordering and required correct count validators
    - Add `validateLevelOrdering` function (from-level must be strictly lower than to-level)
    - Add `validateRequiredCorrect` function (requiredCorrect must be between 1 and total exercises)
    - _Requirements: 5.4, 5.6_

  - [ ]* 2.8 Write property test for level ordering constraint (Property 8)
    - **Property 8: Level ordering constraint**
    - **Validates: Requirements 5.6**

  - [ ]* 2.9 Write property test for required correct count bound (Property 9)
    - **Property 9: Required correct count bound**
    - **Validates: Requirements 5.4**

- [ ] 3. Checkpoint - Ensure all validation tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Implement reorder and deletion utilities
  - [ ] 4.1 Implement reorder logic utility
    - Create `src/lib/utils/reorder.ts`
    - Implement `reorderItems` function that takes a list and a move operation (from index, to index) and returns items with contiguous order values starting from 1
    - Implement `resequenceAfterDeletion` function that reassigns contiguous order values after an item is removed
    - _Requirements: 2.6, 3.5, 4.4, 5.5_

  - [ ]* 4.2 Write property test for reorder contiguous sequence (Property 1)
    - **Property 1: Reorder produces contiguous sequence**
    - **Validates: Requirements 2.6, 3.5, 4.4, 5.5**

  - [ ]* 4.3 Write property test for deletion re-sequencing (Property 10)
    - **Property 10: Deletion re-sequencing**
    - **Validates: Requirements 4.5**

- [ ] 5. Implement content manager service layer
  - [ ] 5.1 Implement lesson CRUD operations in content manager
    - Create `src/lib/services/content-manager.ts`
    - Implement `getLessons`, `getLessonById`, `createLesson`, `updateLesson`, `deleteLesson`, `reorderLessons`
    - Use `createSupabaseServerClient` for database access
    - Cascade deletion for lessons removes associated exercises and blocks
    - _Requirements: 2.1, 2.3, 2.4, 2.5, 2.6, 2.8_

  - [ ] 5.2 Implement exercise CRUD operations in content manager
    - Implement `getExercisesByLesson`, `getExerciseById`, `createExercise`, `updateExercise`, `deleteExercise`, `reorderExercises`
    - Cascade deletion for exercises removes associated grammar blocks
    - Run content validation on save and include warnings in response
    - _Requirements: 3.1, 3.3, 3.4, 3.5, 3.7, 6.1, 6.3_

  - [ ] 5.3 Implement grammar block CRUD operations in content manager
    - Implement `getBlocksByExercise`, `createBlock`, `updateBlock`, `deleteBlock`, `reorderBlocks`
    - Re-sequence source_order values after deletion
    - Prevent deletion of last non-distractor block
    - _Requirements: 4.1, 4.3, 4.4, 4.5, 4.8_

  - [ ] 5.4 Implement placement challenge operations in content manager
    - Implement `getChallenges`, `getChallengeById`, `updateChallenge`, `addExerciseToChallenge`, `removeExerciseFromChallenge`, `reorderChallengeExercises`
    - Validate level ordering and required correct count before persisting
    - _Requirements: 5.1, 5.2, 5.3, 5.5_

  - [ ]* 5.5 Write property test for content creation round-trip (Property 2)
    - **Property 2: Content creation round-trip**
    - **Validates: Requirements 2.3, 2.5, 3.3, 4.3, 5.3**

  - [ ]* 5.6 Write property test for cascade deletion completeness (Property 3)
    - **Property 3: Cascade deletion completeness**
    - **Validates: Requirements 2.8, 3.7**

- [ ] 6. Checkpoint - Ensure all service layer and property tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement admin role verification and layout
  - [ ] 7.1 Implement admin role verification utility
    - Create `src/lib/utils/verify-admin.ts`
    - Implement `verifyAdminRole` function that checks user role via Supabase
    - Return boolean indicating admin status; fail closed on service errors
    - _Requirements: 1.1, 1.2, 1.4, 1.5, 1.6_

  - [ ] 7.2 Create admin layout with role gate
    - Create `src/app/(admin)/admin/layout.tsx` as server component
    - Verify admin role on render; redirect unauthenticated users to `/auth/signin?redirect=/admin/...`
    - Render Access Denied page for non-admin authenticated users with link to `/dashboard`
    - Return 503 and service unavailable message if role verification service is down
    - _Requirements: 1.1, 1.2, 1.3, 1.5_

  - [ ] 7.3 Create admin sidebar navigation component
    - Create `src/components/admin/AdminSidebar.tsx` as client component
    - Include links to Lessons, Placement Challenges, and learner dashboard
    - Visually highlight the currently active section
    - _Requirements: 7.1_

  - [ ] 7.4 Implement breadcrumb component
    - Create `src/components/admin/Breadcrumb.tsx` as server component
    - Generate breadcrumb segments from the current route path
    - Each segment is a clickable link navigating to that level
    - _Requirements: 7.2_

  - [ ]* 7.5 Write property test for breadcrumb generation (Property 11)
    - **Property 11: Breadcrumb generation from path**
    - **Validates: Requirements 7.2**

  - [ ] 7.6 Create notification system component
    - Create `src/components/admin/NotificationStack.tsx` as client component
    - Success notifications auto-dismiss after 3 seconds
    - Error notifications persist until manually dismissed
    - Stack vertically with maximum 5 simultaneous notifications
    - _Requirements: 7.3, 7.4, 7.5_

  - [ ] 7.7 Create Access Denied page
    - Create `src/app/(admin)/admin/denied/page.tsx`
    - Display clear "Access Denied" message with link to `/dashboard`
    - _Requirements: 1.2_

- [ ] 8. Implement admin API route handlers
  - [ ] 8.1 Create lesson API route handlers
    - Create `src/app/api/admin/lessons/route.ts` (GET list, POST create)
    - Create `src/app/api/admin/lessons/[lessonId]/route.ts` (GET detail, PUT update, DELETE)
    - Create `src/app/api/admin/lessons/[lessonId]/reorder/route.ts` (PUT reorder)
    - Verify admin role on every request; return 401/403 as appropriate
    - _Requirements: 1.4, 2.1, 2.3, 2.5, 2.6, 2.8, 2.10, 2.11_

  - [ ] 8.2 Create exercise API route handlers
    - Create `src/app/api/admin/lessons/[lessonId]/exercises/route.ts` (GET list, POST create)
    - Create `src/app/api/admin/exercises/[exerciseId]/route.ts` (GET detail, PUT update, DELETE)
    - Create `src/app/api/admin/exercises/[exerciseId]/reorder/route.ts` (PUT reorder)
    - Include validation warnings in success responses
    - _Requirements: 1.4, 3.1, 3.3, 3.5, 3.7, 6.1, 6.2, 6.3, 6.4_

  - [ ] 8.3 Create grammar block API route handlers
    - Create `src/app/api/admin/exercises/[exerciseId]/blocks/route.ts` (GET list, POST create)
    - Create `src/app/api/admin/blocks/[blockId]/route.ts` (PUT update, DELETE)
    - Create `src/app/api/admin/exercises/[exerciseId]/blocks/reorder/route.ts` (PUT reorder)
    - Prevent deletion of last non-distractor block (return 422)
    - _Requirements: 1.4, 4.1, 4.3, 4.4, 4.5, 4.8_

  - [ ] 8.4 Create placement challenge API route handlers
    - Create `src/app/api/admin/challenges/route.ts` (GET list)
    - Create `src/app/api/admin/challenges/[challengeId]/route.ts` (GET detail, PUT update)
    - Create `src/app/api/admin/challenges/[challengeId]/exercises/route.ts` (POST add, DELETE remove, PUT reorder)
    - Validate level ordering and required correct count; return 422 on violation
    - _Requirements: 1.4, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

- [ ] 9. Checkpoint - Ensure all API routes and role verification work
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Implement lesson management UI
  - [ ] 10.1 Create lesson list page
    - Create `src/app/(admin)/admin/lessons/page.tsx` as server component
    - Fetch and display lessons grouped by level with title, description, icon, and exercise count
    - Include "Create Lesson" button
    - _Requirements: 2.1_

  - [ ] 10.2 Create lesson form component (create/edit)
    - Create `src/components/admin/LessonForm.tsx` as client component
    - Fields: title (max 100), description (max 300), level (select), icon (max 10)
    - Client-side validation with inline error messages
    - Pre-populate fields for edit mode
    - _Requirements: 2.2, 2.4, 2.9_

  - [ ] 10.3 Create lesson create and edit pages
    - Create `src/app/(admin)/admin/lessons/new/page.tsx` using LessonForm
    - Create `src/app/(admin)/admin/lessons/[lessonId]/edit/page.tsx` using LessonForm with pre-populated data
    - Wire form submission to API routes with success/error notifications
    - _Requirements: 2.3, 2.5, 2.10, 2.11_

  - [ ] 10.4 Create lesson detail page with exercise list
    - Create `src/app/(admin)/admin/lessons/[lessonId]/page.tsx`
    - Display lesson info and ordered exercise list with target sentence (truncated), block count, distractor count
    - Include "Add Exercise" button and links to exercise detail/edit
    - _Requirements: 3.1_

  - [ ] 10.5 Implement drag-and-drop reorder for lessons
    - Create `src/components/admin/ReorderList.tsx` using `@dnd-kit`
    - Wire reorder actions to the lesson reorder API endpoint
    - _Requirements: 2.6_

  - [ ] 10.6 Implement lesson delete with confirmation dialog
    - Create `src/components/admin/DeleteConfirmDialog.tsx` as client component
    - Show number of exercises that will be deleted
    - Wire deletion to API and show success/error notifications
    - _Requirements: 2.7, 2.8, 2.10, 2.11_

- [ ] 11. Implement exercise management UI
  - [ ] 11.1 Create exercise form component (create/edit)
    - Create `src/components/admin/ExerciseForm.tsx` as client component
    - Fields: target sentence (max 200), hint (max 300), tutor explanation (max 500)
    - Client-side validation with inline error messages
    - Pre-populate fields for edit mode
    - _Requirements: 3.2, 3.4, 3.8, 3.9_

  - [ ] 11.2 Create exercise create and edit pages
    - Create `src/app/(admin)/admin/lessons/[lessonId]/exercises/new/page.tsx`
    - Create `src/app/(admin)/admin/lessons/[lessonId]/exercises/[exerciseId]/edit/page.tsx`
    - Wire form submission to API routes; display validation warnings from content validator
    - _Requirements: 3.3, 3.4, 6.1, 6.2_

  - [ ] 11.3 Create exercise detail page with block list
    - Create `src/app/(admin)/admin/lessons/[lessonId]/exercises/[exerciseId]/page.tsx`
    - Display grammar blocks in source order with label, category (color-coded), and distractor status
    - Include "Add Block" button and validation warning banner if blocks don't match sentence
    - _Requirements: 4.1, 6.2_

  - [ ] 11.4 Implement exercise reorder and delete
    - Wire exercise reorder to API using ReorderList component
    - Add delete with confirmation dialog showing grammar block count
    - _Requirements: 3.5, 3.6, 3.7_

- [ ] 12. Implement grammar block management UI
  - [ ] 12.1 Create block form component (create/edit)
    - Create `src/components/admin/BlockForm.tsx` as client component
    - Fields: label (max 50), category (select with 7 options), distractor checkbox
    - Client-side validation with inline error messages
    - _Requirements: 4.2, 4.6_

  - [ ] 12.2 Wire block CRUD operations in exercise detail page
    - Add inline block creation form or modal
    - Add block edit functionality (inline or modal)
    - Wire to block API routes with success/error notifications
    - Display warning when last non-distractor block deletion is attempted
    - _Requirements: 4.3, 4.8_

  - [ ] 12.3 Implement block reorder and delete
    - Wire block reorder to API using ReorderList component
    - Implement block deletion with re-sequencing
    - _Requirements: 4.4, 4.5_

- [ ] 13. Implement placement challenge management UI
  - [ ] 13.1 Create placement challenge list page
    - Create `src/app/(admin)/admin/challenges/page.tsx` as server component
    - Display challenges with title, from-level, to-level, required correct, and exercise count
    - _Requirements: 5.1_

  - [ ] 13.2 Create challenge edit page and form
    - Create `src/app/(admin)/admin/challenges/[challengeId]/edit/page.tsx`
    - Create `src/components/admin/ChallengeForm.tsx` with title, description, required correct, from-level, to-level fields
    - Validate level ordering and required correct count on client side
    - _Requirements: 5.2, 5.4, 5.6, 5.7_

  - [ ] 13.3 Implement challenge exercise management
    - Create `src/app/(admin)/admin/challenges/[challengeId]/exercises/page.tsx`
    - Allow adding/removing exercises from the challenge
    - Implement drag-and-drop reorder for challenge exercises
    - _Requirements: 5.5_

- [ ] 14. Checkpoint - Ensure all UI components render correctly and forms validate
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 15. Integration wiring and admin dashboard
  - [ ] 15.1 Create admin dashboard page
    - Create `src/app/(admin)/admin/page.tsx` that redirects to `/admin/lessons`
    - _Requirements: 7.1_

  - [ ] 15.2 Wire notification system throughout admin pages
    - Integrate NotificationStack into admin layout
    - Ensure all CRUD operations trigger appropriate success/error notifications
    - Success notifications auto-dismiss after 3 seconds; error notifications persist
    - _Requirements: 7.3, 7.4, 7.5_

  - [ ]* 15.3 Write integration tests for admin CRUD flows
    - Test full lesson CRUD cycle via API routes
    - Test role verification on all admin API endpoints
    - Test cascade deletion removes all descendants
    - _Requirements: 1.4, 2.3, 2.8, 3.7_

- [ ] 16. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document using `fast-check`
- Unit tests validate specific examples and edge cases
- The project uses Next.js App Router, Supabase for auth/database, and `@dnd-kit` for drag-and-drop (already installed)
- All code examples use TypeScript as the implementation language
- Database migrations should be created as SQL files for Supabase

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1", "2.3", "2.7"] },
    { "id": 2, "tasks": ["2.2", "2.4", "2.5", "2.6", "2.8", "2.9", "4.1"] },
    { "id": 3, "tasks": ["4.2", "4.3"] },
    { "id": 4, "tasks": ["5.1", "5.2", "5.3", "5.4", "7.1"] },
    { "id": 5, "tasks": ["5.5", "5.6", "7.2", "7.3", "7.4", "7.6", "7.7"] },
    { "id": 6, "tasks": ["7.5", "8.1", "8.2", "8.3", "8.4"] },
    { "id": 7, "tasks": ["10.1", "10.2", "10.5", "10.6", "11.1", "12.1", "13.1"] },
    { "id": 8, "tasks": ["10.3", "10.4", "11.2", "11.3", "11.4", "12.2", "12.3", "13.2", "13.3"] },
    { "id": 9, "tasks": ["15.1", "15.2"] },
    { "id": 10, "tasks": ["15.3"] }
  ]
}
```
