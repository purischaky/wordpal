# Requirements Document

## Introduction

This feature enables administrators to create, view, reorder, and remove exercises (activities) directly within the lesson editing interface. Currently, exercises exist as standalone entities disconnected from lessons. This feature integrates the existing ExerciseBuilder component into the lesson edit page, allowing inline exercise creation and management with proper lesson-exercise association through the `lessonId` field on exercises.

## Glossary

- **Lesson_Editor**: The admin page for editing an existing lesson, located at `/admin/lessons/[id]/edit`
- **Exercise_Panel**: The UI section within the Lesson_Editor that displays and manages exercises belonging to the lesson
- **ExerciseBuilder**: The existing reusable component that handles exercise type selection and content configuration
- **Exercise**: A learning activity (drag-and-drop, multiple-choice, sentence-ordering, fill-in-blank, rewrite-sentence, or free-writing) associated with a lesson
- **Exercises_API**: The REST API at `/api/admin/exercises` that handles exercise CRUD operations
- **Lesson_API**: The REST API at `/api/admin/lessons` that handles lesson CRUD operations
- **Exercise_Order**: A numeric value (starting at 1) that determines the sequence of exercises within a lesson

## Requirements

### Requirement 1: Display Lesson Exercises

**User Story:** As an admin, I want to see all exercises belonging to a lesson when editing it, so that I can understand the current lesson structure.

#### Acceptance Criteria

1. WHEN the Lesson_Editor loads, THE Exercise_Panel SHALL fetch and display all exercises from the Exercises_API using the `lessonId` query parameter matching the current lesson ID
2. THE Exercise_Panel SHALL display each exercise showing its type (one of: drag-and-drop, multiple-choice, sentence-ordering, fill-in-blank, rewrite-sentence, free-writing), a content preview consisting of the first 60 characters of the exercise content's primary text field followed by an ellipsis if truncated, its status, and its order number
3. THE Exercise_Panel SHALL display exercises sorted by their `order` field in ascending order
4. WHILE the exercises are loading, THE Exercise_Panel SHALL display a loading skeleton placeholder with at least 3 placeholder rows
5. IF the fetch request fails, THEN THE Exercise_Panel SHALL display an error message indicating the exercises could not be loaded, along with a retry button that re-triggers the fetch request
6. IF the fetch request returns zero exercises, THEN THE Exercise_Panel SHALL display an empty state message indicating that no exercises have been added to this lesson yet

### Requirement 2: Create Exercise Inline

**User Story:** As an admin, I want to create exercises directly within the lesson edit page, so that I can build lesson content without navigating away.

#### Acceptance Criteria

1. WHEN the admin clicks the "Add Exercise" button in the Exercise_Panel, THE Lesson_Editor SHALL display the ExerciseBuilder component inline within an expandable section below the exercise list
2. WHEN the admin saves a new exercise via the ExerciseBuilder, THE Exercise_Panel SHALL send a POST request to the Exercises_API with the `type`, `content`, and the current lesson's ID as `lessonId` in the request body
3. WHEN the Exercises_API returns a success response (HTTP 201), THE Exercise_Panel SHALL assign the new exercise an `order` value equal to the current exercise count in that lesson plus one and a `status` of "draft"
4. WHEN the exercise is created successfully, THE Exercise_Panel SHALL append the new exercise to the displayed list without requiring a full page reload and collapse the ExerciseBuilder section
5. IF the Exercises_API returns an error response (HTTP 4xx or 5xx), THEN THE Exercise_Panel SHALL display an error notification that remains visible until the admin dismisses it, and SHALL retain all ExerciseBuilder field values so the admin can correct and retry
6. IF the lesson already contains 50 exercises, THEN THE Exercise_Panel SHALL disable the "Add Exercise" button and display a message indicating the maximum exercise limit has been reached

### Requirement 3: Remove Exercise from Lesson

**User Story:** As an admin, I want to remove exercises from a lesson, so that I can adjust lesson content as needed.

#### Acceptance Criteria

1. WHEN the admin clicks the delete button on an exercise row, THE Exercise_Panel SHALL display a confirmation dialog that identifies the exercise by its type and order number and provides confirm and cancel options
2. WHEN the admin cancels the confirmation dialog, THE Exercise_Panel SHALL close the dialog and leave the exercise list unchanged
3. WHEN the admin confirms deletion, THE Exercise_Panel SHALL disable the delete button to prevent duplicate submissions and send a DELETE request to the Exercises_API for the specified exercise
4. WHEN the Exercises_API returns a successful response, THE Exercise_Panel SHALL remove the exercise from the displayed list and recalculate the `order` values of remaining exercises to form a contiguous sequence starting from 1, preserving the original relative order
5. IF the DELETE request fails due to a network error or non-success response, THEN THE Exercise_Panel SHALL display an error notification indicating the exercise could not be deleted, re-enable the delete button, and keep the exercise in the list unchanged

### Requirement 4: Reorder Exercises

**User Story:** As an admin, I want to reorder exercises within a lesson, so that I can control the sequence in which students encounter activities.

#### Acceptance Criteria

1. THE Exercise_Panel SHALL provide a drag handle icon on each exercise row to enable reordering via @dnd-kit/sortable
2. WHEN the admin completes a drag-and-drop reorder, THE Exercise_Panel SHALL update the visual order of exercises immediately (optimistic UI) and reassign contiguous `order` values starting from 1
3. WHEN the admin completes a drag-and-drop reorder, THE Exercise_Panel SHALL send PUT requests to the Exercises_API to persist the updated `order` values for all exercises whose order changed
4. IF any reorder persistence request fails, THEN THE Exercise_Panel SHALL revert the visual order to the previous state and display an error notification indicating the reorder could not be saved
5. WHEN the lesson contains fewer than 2 exercises, THE Exercise_Panel SHALL hide the drag handles since reordering is not applicable

### Requirement 5: Edit Existing Exercise

**User Story:** As an admin, I want to edit an existing exercise from within the lesson context, so that I can make corrections without losing context.

#### Acceptance Criteria

1. WHEN the admin clicks the edit button on an exercise row, THE Exercise_Panel SHALL display the ExerciseBuilder component in an expandable section, pre-populated with the exercise's current type and content
2. WHILE the ExerciseBuilder is displayed in edit mode, THE Exercise_Panel SHALL disable the exercise type selector so the admin cannot change the exercise type of an existing exercise
3. WHEN the admin saves an edited exercise, THE Exercise_Panel SHALL send a PUT request to the Exercises_API at `/api/admin/exercises/[id]` including the exercise ID and the updated content data
4. WHEN the exercise update is saved successfully, THE Exercise_Panel SHALL close the ExerciseBuilder, update the exercise row in the displayed list with the new content preview, and retain the exercise's existing order position
5. WHEN the admin clicks a cancel button in the ExerciseBuilder during editing, THE Exercise_Panel SHALL close the ExerciseBuilder without sending any request and without modifying the exercise in the displayed list
6. IF the exercise update fails, THEN THE Exercise_Panel SHALL display an error notification and retain the ExerciseBuilder state with the admin's unsaved changes so the admin can retry without re-entering data

### Requirement 6: Exercise Count Synchronization

**User Story:** As an admin, I want the lesson's exercise count to stay accurate, so that the lesson list page shows correct information.

#### Acceptance Criteria

1. WHEN an exercise is successfully created within a lesson, THE Exercise_Panel SHALL send a PUT request to the Lesson_API at `/api/admin/lessons/[id]` to update the lesson's `exerciseCount` field to the total number of exercises with the matching `lessonId`
2. WHEN an exercise is successfully deleted from a lesson, THE Exercise_Panel SHALL send a PUT request to the Lesson_API at `/api/admin/lessons/[id]` to update the lesson's `exerciseCount` field to the total number of exercises with the matching `lessonId`
3. THE Exercise_Panel SHALL derive the `exerciseCount` value by counting the actual exercises with matching `lessonId` after the create or delete operation completes, not from manual increment or decrement of the previous value
4. IF the PUT request to update `exerciseCount` fails, THEN THE Exercise_Panel SHALL display an error message indicating the lesson count could not be synchronized, and SHALL retain the locally computed count for retry on the next create or delete operation
5. THE Exercise_Panel SHALL set the `exerciseCount` to a non-negative integer ranging from 0 to 999

### Requirement 7: Post-Creation Redirect to Edit

**User Story:** As an admin, I want to be redirected to the edit page after creating a new lesson, so that I can immediately add exercises to the lesson.

#### Acceptance Criteria

1. WHEN the new lesson page receives a successful response (HTTP 2xx) from the lesson creation request containing the new lesson ID, THE Lesson_Editor SHALL display a success indication and then redirect the admin to the edit page (`/admin/lessons/[newId]/edit`) within 2 seconds, using the ID returned in the response
2. WHEN the admin arrives at the edit page after creation, THE Exercise_Panel SHALL display the empty exercises state with the "Add Exercise" button available
3. IF the lesson creation request fails (non-2xx response or network error), THEN THE Lesson_Editor SHALL remain on the new lesson page and display an error message indicating the failure reason

### Requirement 8: Exercises API Filtering by Lesson

**User Story:** As an admin, I want the exercises API to support filtering by lesson ID, so that the lesson editor can efficiently fetch only relevant exercises.

#### Acceptance Criteria

1. WHEN a GET request to the Exercises_API includes a `lessonId` query parameter with a non-empty string value, THE Exercises_API SHALL return only exercises whose `lessonId` field matches the provided value, wrapped in the standard envelope `{ data: [...] }` with a 200 status code
2. WHEN a GET request to the Exercises_API omits the `lessonId` query parameter, THE Exercises_API SHALL return all exercises in the standard envelope `{ data: {...} }` with a 200 status code, preserving existing behavior
3. WHEN a GET request includes a `lessonId` query parameter whose value does not match any exercise's `lessonId` field, THE Exercises_API SHALL return an empty array in the standard envelope `{ data: [] }` with a 200 status code
4. IF a GET request to the Exercises_API includes a `lessonId` query parameter with an empty string value, THEN THE Exercises_API SHALL return a 400 status code with an error message indicating that the lessonId parameter must not be empty
