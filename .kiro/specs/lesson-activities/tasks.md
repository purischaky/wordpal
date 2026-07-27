# Implementation Plan: Lesson Activities

## Overview

This plan implements inline exercise management within the lesson editor. The implementation progresses from API modifications (adding `lessonId` filtering and array-based storage), through reusable UI components (ConfirmDialog, ExerciseRow, ExercisePanel), to wiring the panel into the lesson edit page, implementing post-creation redirect, and concluding with property-based and unit tests.

## Tasks

- [ ] 1. Migrate exercises API to array format with lessonId filtering
  - [ ] 1.1 Migrate exercises.json data format and update GET route
    - Convert `src/data/admin/exercises.json` from `Record<string, unknown>` to an array format `AdminExercise[]` with `id`, `lessonId`, `type`, `order`, `status`, `content`, `createdAt`, `updatedAt` fields
    - Update `src/app/api/admin/exercises/route.ts` GET handler to read the array format
    - Add `lessonId` query parameter support: when present and non-empty, filter exercises by matching `lessonId`; when empty string, return 400; when absent, return all exercises wrapped in `{ data: [...] }`
    - Return filtered results sorted by `order` ascending
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [ ] 1.2 Update exercises POST route with order and lessonId assignment
    - Modify `src/app/api/admin/exercises/route.ts` POST handler to accept `lessonId` in request body
    - Auto-assign `order` as count of existing exercises with the same `lessonId` plus one
    - Set `status` to `"draft"`, generate `createdAt` and `updatedAt` timestamps
    - Return created exercise with 201 status
    - Validate that `lessonId` is a non-empty string in the request body
    - _Requirements: 2.2, 2.3_

  - [ ] 1.3 Update exercises/[id] PUT and DELETE routes for array format
    - Modify `src/app/api/admin/exercises/[id]/route.ts` to work with the array format (find by `id` field instead of object key)
    - PUT handler: allow updating `content`, `order`, and `status` fields; update `updatedAt` timestamp
    - DELETE handler: remove exercise from array, recalculate `order` values for remaining exercises with the same `lessonId` to form contiguous 1..N sequence
    - _Requirements: 3.3, 3.4, 4.2, 4.3, 5.3_

- [ ] 2. Checkpoint - Verify API routes work
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 3. Implement reusable UI components
  - [ ] 3.1 Create ConfirmDialog component
    - Create `src/components/admin/ConfirmDialog.tsx` implementing the `ConfirmDialogProps` interface from the design
    - Props: `open`, `title`, `message`, `confirmLabel`, `onConfirm`, `onCancel`, `isLoading`
    - Use a modal overlay with confirm/cancel buttons; disable confirm button while `isLoading` is true
    - Ensure accessible: focus trap, `aria-modal`, `role="alertdialog"`, ESC to close
    - _Requirements: 3.1, 3.2_

  - [ ] 3.2 Create ExerciseRow component
    - Create `src/components/admin/ExerciseRow.tsx` implementing the `ExerciseRowProps` interface from the design
    - Display exercise type (formatted, e.g., "drag-and-drop" → "Drag and Drop"), content preview (first 60 chars + ellipsis if truncated), status badge, and order number
    - Include edit and delete action buttons
    - Include a drag handle icon (grip dots) shown only when `showDragHandle` is true
    - Integrate with `@dnd-kit/sortable` using `useSortable` hook for drag-and-drop support
    - _Requirements: 1.2, 1.3, 4.1, 4.5_

  - [ ] 3.3 Create ExercisePanel component
    - Create `src/components/admin/ExercisePanel.tsx` implementing `ExercisePanelProps` with `lessonId` prop
    - Manage internal state: `exercises`, `isLoading`, `error`, `isCreating`, `editingId`, `deleteConfirmId`
    - On mount, fetch `GET /api/admin/exercises?lessonId={lessonId}` and render sorted exercise list
    - Display loading skeleton (3+ placeholder rows) while fetching
    - Display empty state message when no exercises exist
    - Display error state with retry button on fetch failure
    - Include "Add Exercise" button (disabled at 50 exercises with limit message)
    - Wire ConfirmDialog for delete confirmation (show exercise type and order number)
    - Wire ExerciseBuilder inline in expandable section for create and edit modes
    - Disable type selector in ExerciseBuilder during edit mode via CSS/attribute
    - Implement optimistic reorder with `@dnd-kit/sortable`; maintain snapshot for rollback on failure
    - After create/delete, send PUT to `/api/admin/lessons/{lessonId}` to sync `exerciseCount` (derived by counting, not increment/decrement)
    - Show dismissible error notifications for failed operations without blocking other interactions
    - _Requirements: 1.1, 1.4, 1.5, 1.6, 2.1, 2.4, 2.5, 2.6, 3.3, 3.4, 3.5, 4.2, 4.3, 4.4, 5.1, 5.2, 5.4, 5.5, 5.6, 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 4. Integrate ExercisePanel into lesson edit page
  - [ ] 4.1 Replace mock exercises section with ExercisePanel
    - Update `src/app/(admin)/admin/lessons/[id]/edit/page.tsx`
    - Remove the `MOCK_EXERCISES` constant and the `ExercisesSection` component
    - Import and render `ExercisePanel` component passing the `lessonId` from URL params
    - Place the ExercisePanel in the existing exercises card section of the page
    - _Requirements: 1.1, 1.2, 1.3_

- [ ] 5. Implement post-creation redirect to edit page
  - [ ] 5.1 Update new lesson page with redirect to edit
    - Modify `src/app/(admin)/admin/lessons/new/page.tsx` to read the created lesson's `id` from the POST response
    - After successful creation, display success message and redirect to `/admin/lessons/{newId}/edit` within 2 seconds (instead of redirecting to the lessons list)
    - On failure, remain on the new lesson page with error message
    - _Requirements: 7.1, 7.2, 7.3_

- [ ] 6. Checkpoint - Ensure all components render and API calls work
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Property-based tests for exercise logic
  - [ ]* 7.1 Write property test for lessonId filtering
    - **Property 1: Filtering by lessonId returns only matching exercises**
    - Generate arrays of exercises with random `lessonId` values; filter by a specific `lessonId`; assert result contains exactly and only exercises with matching `lessonId`
    - **Validates: Requirements 1.1, 8.1**

  - [ ]* 7.2 Write property test for content preview truncation
    - **Property 2: Content preview truncation**
    - Generate random strings; assert preview equals first 60 chars + ellipsis when length > 60, or full string when ≤ 60
    - **Validates: Requirements 1.2**

  - [ ]* 7.3 Write property test for exercise list sort order
    - **Property 3: Exercise list sort order**
    - Generate arrays of exercises with random `order` values; sort by `order` ascending; assert result is sorted
    - **Validates: Requirements 1.3**

  - [ ]* 7.4 Write property test for new exercise order assignment
    - **Property 4: New exercise order assignment**
    - Generate a list of 0–49 existing exercises for a lesson; create a new exercise; assert it receives `order = N + 1` and `status = "draft"`
    - **Validates: Requirements 2.3**

  - [ ]* 7.5 Write property test for order contiguity after mutation
    - **Property 5: Order contiguity after mutation**
    - Generate a list of exercises; delete one at a random position; assert remaining exercises have contiguous orders 1..N preserving relative order
    - Also test reorder: move exercise from position A to B; assert contiguous orders 1..N with moved item at correct position
    - **Validates: Requirements 3.4, 4.2**

  - [ ]* 7.6 Write property test for cancel preserves state
    - **Property 6: Cancel preserves state**
    - Generate an exercise list state; simulate open + cancel of delete/edit; assert state is identical to before
    - **Validates: Requirements 3.2, 5.5**

  - [ ]* 7.7 Write property test for reorder rollback on failure
    - **Property 7: Reorder rollback on failure**
    - Generate an exercise list and a valid reorder permutation; apply reorder then rollback; assert result equals original state
    - **Validates: Requirements 4.4**

  - [ ]* 7.8 Write property test for edit does not change order
    - **Property 8: Edit does not change order**
    - Generate an exercise with a given `order`; update its content; assert `order` value is unchanged
    - **Validates: Requirements 5.4**

  - [ ]* 7.9 Write property test for exerciseCount derivation
    - **Property 9: exerciseCount equals actual count**
    - Generate a list of exercises with various `lessonId` values; after create/delete for a specific lesson; assert `exerciseCount` equals actual count of exercises with matching `lessonId`
    - **Validates: Requirements 6.1, 6.2, 6.3**

  - [ ]* 7.10 Write property test for exerciseCount bounds
    - **Property 10: exerciseCount bounds**
    - Generate random exercise counts; assert `exerciseCount` is always a non-negative integer in [0, 999]
    - **Validates: Requirements 6.5**

- [ ] 8. Unit tests for components and API routes
  - [ ]* 8.1 Write unit tests for exercises API routes
    - Test GET with `lessonId` query param returns only matching exercises
    - Test GET without `lessonId` returns all exercises
    - Test GET with empty `lessonId` returns 400
    - Test GET with non-matching `lessonId` returns empty array with 200
    - Test POST creates exercise with correct `order`, `status`, and `lessonId`
    - Test PUT updates content without changing order
    - Test DELETE removes exercise and recalculates orders
    - Mock `file-service` module for isolation
    - _Requirements: 1.1, 2.2, 2.3, 3.3, 3.4, 5.3, 5.4, 8.1, 8.2, 8.3, 8.4_

  - [ ]* 8.2 Write unit tests for ExercisePanel component
    - Test loading skeleton renders at least 3 placeholder rows
    - Test empty state renders correct message
    - Test error state renders retry button that re-triggers fetch
    - Test "Add Exercise" button disabled at 50 exercises
    - Test ExerciseBuilder opens in create mode on button click
    - Test ExerciseBuilder opens in edit mode with type selector disabled
    - Test confirmation dialog shows exercise type and order number
    - Test drag handles hidden when fewer than 2 exercises
    - _Requirements: 1.4, 1.5, 1.6, 2.1, 2.6, 3.1, 4.5, 5.1, 5.2_

  - [ ]* 8.3 Write unit tests for post-creation redirect
    - Test that successful lesson creation redirects to `/admin/lessons/{id}/edit` within 2 seconds
    - Test that failed creation remains on new lesson page with error
    - Test that edit page shows empty exercise panel after redirect
    - _Requirements: 7.1, 7.2, 7.3_

- [ ] 9. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The existing `exercises.json` uses `Record<string, unknown>` format — task 1.1 migrates to array format
- `@dnd-kit/sortable` v10 is already installed — use its API for drag-and-drop reorder
- `fast-check` and `vitest` are already configured in the project
- The ExerciseBuilder component accepts `initialType`, `initialBlocks`, `onSave`, and `onPreview` props — disable type selector via CSS pointer-events or `disabled` attribute in edit mode
- Next.js 16 uses `params: Promise<{ id: string }>` (async params) — always `await params` before accessing values
- Exercise order values MUST be contiguous integers starting at 1 after any mutation

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["3.1", "3.2"] },
    { "id": 3, "tasks": ["3.3"] },
    { "id": 4, "tasks": ["4.1", "5.1"] },
    { "id": 5, "tasks": ["7.1", "7.2", "7.3", "7.4", "7.10"] },
    { "id": 6, "tasks": ["7.5", "7.6", "7.7", "7.8", "7.9"] },
    { "id": 7, "tasks": ["8.1", "8.2", "8.3"] }
  ]
}
```
