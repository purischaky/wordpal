# Requirements Document

## Introduction

The Admin Interface provides authorized administrators with a web-based content management system for WordPal. It enables creating, editing, reordering, and deleting lessons, exercises, grammar blocks, and placement challenges without modifying source code. The interface is role-gated so only users with the `admin` role can access it, while regular learners are blocked from administrative functions.

## Glossary

- **Admin_Interface**: The protected web interface at `/admin` for managing WordPal content
- **Admin_User**: A user with the `admin` role assigned in the database
- **Lesson**: A unit of learning content containing a title, description, level, icon, and ordered exercises
- **Exercise**: A sentence-building activity within a lesson containing a target sentence, hint, tutor explanation, and grammar blocks
- **Grammar_Block**: A labeled drag-and-drop element with a category (subject, verb, object, modifier, time, place, contrast), distractor flag, and source order
- **Placement_Challenge**: A level-gate assessment containing exercises that learners must pass to advance to the next level
- **Learning_Path**: The ordered collection of all lessons organized by level (beginner, intermediate, advanced)
- **Content_Manager**: The CRUD service layer responsible for persisting content changes to the Supabase database

## Requirements

### Requirement 1: Admin Role Authorization

**User Story:** As a system owner, I want only designated administrators to access the admin interface, so that content integrity is protected from unauthorized changes.

#### Acceptance Criteria

1. WHEN an unauthenticated user navigates to any `/admin` route, THE Admin_Interface SHALL redirect the user to the sign-in page with the original `/admin` path stored as a query parameter so that the user is redirected back to that path after successful authentication
2. WHEN an authenticated user without the `admin` role navigates to any `/admin` route, THE Admin_Interface SHALL display an "Access Denied" message and provide a navigation link to `/dashboard`
3. WHILE a user has the `admin` role and holds a valid session, THE Admin_Interface SHALL render the admin navigation and content management pages
4. THE Admin_Interface SHALL verify the user role on each server-side request to admin API routes and return HTTP 403 with a JSON response body containing an error message indicating insufficient permissions for non-admin users
5. IF the role verification service is unavailable when a user attempts to access an `/admin` route, THEN THE Admin_Interface SHALL deny access, return HTTP 503, and display a message indicating the service is temporarily unavailable
6. IF an admin user's session expires or their `admin` role is revoked while they are using the admin interface, THEN THE Admin_Interface SHALL deny access on the next server-side request and redirect the user to the sign-in page

### Requirement 2: Lesson Management

**User Story:** As an admin, I want to create, edit, reorder, and delete lessons, so that I can manage the learning path without editing source code.

#### Acceptance Criteria

1. WHEN an Admin_User navigates to the lesson management view, THE Admin_Interface SHALL display a list of all lessons grouped by level (beginner, intermediate, advanced) with their title, description, level, icon, and exercise count
2. WHEN an Admin_User clicks "Create Lesson", THE Admin_Interface SHALL present a form with fields for title (text input, maximum 100 characters), description (text input, maximum 300 characters), level (select: beginner/intermediate/advanced), and icon (emoji picker or text input, maximum 10 characters)
3. WHEN an Admin_User submits a lesson creation form where title is non-empty and within character limits, THE Content_Manager SHALL persist the new lesson to the database and assign it the next sequential order within its level
4. WHEN an Admin_User edits a lesson, THE Admin_Interface SHALL pre-populate the form with the existing lesson data
5. WHEN an Admin_User submits a valid lesson edit form, THE Content_Manager SHALL persist the updated lesson data to the database
6. WHEN an Admin_User reorders a lesson within its level via drag-and-drop, THE Content_Manager SHALL update the order values of all affected lessons to reflect the new position
7. WHEN an Admin_User deletes a lesson that contains exercises, THE Admin_Interface SHALL display a confirmation dialog stating the number of exercises that will be deleted
8. WHEN an Admin_User confirms lesson deletion, THE Content_Manager SHALL delete the lesson and all associated exercises and grammar blocks from the database
9. IF a lesson creation or update submission contains an empty title or a title exceeding 100 characters, THEN THE Admin_Interface SHALL display a validation error indicating the title constraint and prevent submission
10. IF the Content_Manager fails to persist a lesson creation, update, or deletion, THEN THE Admin_Interface SHALL display an error message indicating the operation failed and preserve the Admin_User's input
11. WHEN the Content_Manager successfully persists a lesson creation, update, or deletion, THE Admin_Interface SHALL display a confirmation message indicating the operation succeeded within 1 second of completion

### Requirement 3: Exercise Management

**User Story:** As an admin, I want to create, edit, reorder, and delete exercises within a lesson, so that I can refine the learning content.

#### Acceptance Criteria

1. WHEN an Admin_User navigates to a lesson detail view, THE Admin_Interface SHALL display all exercises for that lesson in order, showing target sentence (truncated to 50 characters with ellipsis if longer), block count, and distractor count
2. WHEN an Admin_User clicks "Add Exercise", THE Admin_Interface SHALL present a form with fields for target sentence, hint text (maximum 300 characters), and tutor explanation (maximum 500 characters)
3. WHEN an Admin_User submits a valid exercise creation form, THE Content_Manager SHALL persist the exercise and assign it the next sequential order within its lesson
4. WHEN an Admin_User selects an existing exercise to edit, THE Admin_Interface SHALL pre-populate the form with the exercise's current target sentence, hint text, and tutor explanation, and save changes on submission
5. WHEN an Admin_User reorders exercises within a lesson, THE Content_Manager SHALL update the order values of all affected exercises
6. WHEN an Admin_User deletes an exercise that has associated grammar blocks, THE Admin_Interface SHALL display a confirmation dialog stating the number of grammar blocks that will be deleted
7. WHEN an Admin_User confirms exercise deletion, THE Content_Manager SHALL delete the exercise and all associated grammar blocks from the database
8. IF an exercise creation or update submission contains an empty target sentence, THEN THE Admin_Interface SHALL display a validation error "Target sentence is required" and prevent submission
9. IF an exercise creation or update submission contains a target sentence exceeding 200 characters, THEN THE Admin_Interface SHALL display a validation error "Target sentence must be 200 characters or fewer"

### Requirement 4: Grammar Block Management

**User Story:** As an admin, I want to manage grammar blocks for each exercise, so that I can design drag-and-drop activities with the right blocks and distractors.

#### Acceptance Criteria

1. WHEN an Admin_User views an exercise detail, THE Admin_Interface SHALL display all grammar blocks in source order, showing label, category, and distractor status with color-coding matching the learner interface
2. WHEN an Admin_User clicks "Add Block", THE Admin_Interface SHALL present a form with fields for label (maximum 50 characters), category (select: subject/verb/object/modifier/time/place/contrast), and a distractor checkbox
3. WHEN an Admin_User submits a valid block creation form, THE Content_Manager SHALL persist the block and assign it the next sequential source order within the exercise
4. WHEN an Admin_User reorders blocks within an exercise, THE Content_Manager SHALL update the source_order values of all affected blocks
5. WHEN an Admin_User deletes a grammar block, THE Content_Manager SHALL remove the block from the database and re-assign sequential source_order values to remaining blocks
6. IF a block creation or update submission contains an empty or whitespace-only label, THEN THE Admin_Interface SHALL display a validation error "Block label is required" and prevent submission
7. IF an Admin_User attempts to save an exercise that contains zero non-distractor blocks, THEN THE Admin_Interface SHALL display a validation error indicating that at least one non-distractor block is required and prevent the save operation
8. IF an Admin_User attempts to delete a grammar block that is the only non-distractor block in the exercise, THEN THE Admin_Interface SHALL display a warning indicating that at least one non-distractor block must remain and prevent the deletion

### Requirement 5: Placement Challenge Management

**User Story:** As an admin, I want to manage placement challenges, so that I can configure level-gate assessments without editing code.

#### Acceptance Criteria

1. THE Admin_Interface SHALL display a list of placement challenges showing their title, from-level, to-level, required correct count, and exercise count (the number of exercises currently assigned to that challenge)
2. WHEN an Admin_User edits a placement challenge, THE Admin_Interface SHALL present a form with fields for title (maximum 100 characters), description (maximum 500 characters), required correct count (integer, minimum 1), from-level, and to-level
3. WHEN an Admin_User submits a placement challenge update where all required fields are non-empty, the required correct count is between 1 and the total number of exercises in that challenge (inclusive), and from-level is a lower tier than to-level, THE Content_Manager SHALL persist the changes to the database within 3 seconds and display a success confirmation
4. IF a placement challenge update sets required correct count greater than the total number of exercises in that challenge, THEN THE Admin_Interface SHALL display a validation error indicating that required correct count cannot exceed total exercises, and SHALL NOT persist the changes
5. WHEN an Admin_User adds or removes exercises from a placement challenge, THE Content_Manager SHALL update the challenge exercise list and reassign sequential integer order values starting from 1, based on the resulting list position
6. IF an Admin_User submits a placement challenge update with from-level equal to or higher than to-level, THEN THE Admin_Interface SHALL display a validation error indicating that from-level must be a lower tier than to-level, and SHALL NOT persist the changes
7. IF an Admin_User submits a placement challenge update with any required field (title, required correct count, from-level, or to-level) left empty, THEN THE Admin_Interface SHALL indicate which fields are missing and SHALL NOT persist the changes

### Requirement 6: Content Validation

**User Story:** As an admin, I want the system to validate content consistency, so that learners do not encounter broken or incomplete exercises.

#### Acceptance Criteria

1. WHEN an Admin_User saves an exercise, THE Content_Manager SHALL verify that the non-distractor blocks, when their labels are concatenated with a single space in source order, produce a case-sensitive exact match of the target sentence
2. IF the space-joined non-distractor block labels do not produce a case-sensitive exact match of the target sentence, THEN THE Admin_Interface SHALL display a warning "Block labels do not match the target sentence" and allow the admin to proceed or fix the issue
3. WHEN an Admin_User saves an exercise, THE Content_Manager SHALL verify that the exercise has between 2 and 15 total blocks (including distractors)
4. IF an exercise has fewer than 2 or more than 15 blocks at save time, THEN THE Admin_Interface SHALL display a validation error indicating the block count must be between 2 and 15 and SHALL prevent the save operation

### Requirement 7: Admin Navigation and Layout

**User Story:** As an admin, I want a clear and dedicated navigation within the admin interface, so that I can efficiently manage content.

#### Acceptance Criteria

1. THE Admin_Interface SHALL provide a sidebar navigation with links to: Lessons, Placement Challenges, and a link back to the learner dashboard, with the currently active section visually highlighted
2. THE Admin_Interface SHALL display a breadcrumb trail showing the current navigation path (e.g., Admin > Lessons > Lesson 1 > Exercise 3) where each segment is a clickable link that navigates to that level
3. WHEN content is successfully created, updated, or deleted, THE Admin_Interface SHALL display a success notification for 3 seconds and then automatically dismiss it
4. WHEN a content operation fails, THE Admin_Interface SHALL display an error notification with the failure reason that persists until the Admin_User manually dismisses it
5. IF multiple notifications are triggered before previous ones are dismissed, THEN THE Admin_Interface SHALL stack notifications vertically displaying a maximum of 5 simultaneous notifications
