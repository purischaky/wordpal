# Requirements Document

## Introduction

This feature replaces the current static JSON import pattern used by WordPal admin dashboard pages with proper Next.js API routes. Each admin entity (students, learning paths, lessons, exercises, achievements, placement challenges, KPI metrics, AI insights, notifications, search, and settings) will have corresponding API route handlers under `app/api/admin/`. The routes read from and write to JSON files in `src/data/admin/` using the Node.js `fs` module, simulating a real backend with CRUD operations. All admin pages will be updated to fetch data from these API routes instead of importing JSON directly.

## Glossary

- **Route_Handler**: A Next.js App Router API route file (`route.ts`) that exports HTTP method handlers (GET, POST, PUT, PATCH, DELETE)
- **Admin_API**: The collection of route handlers located under `app/api/admin/` that serve admin dashboard data
- **JSON_Store**: The set of JSON files in `src/data/admin/` that serve as the persistent data store for all admin entities
- **Admin_Page**: A client-side React page component in `src/app/(admin)/admin/` that displays and manages admin data
- **Request_Validator**: A function that checks incoming request body fields against type and constraint rules before writing to the JSON_Store
- **Entity**: A distinct data type managed by the admin dashboard (Student, LearningPath, Lesson, Exercise, Achievement, PlacementChallenge, KPIMetric, AIInsight, Notification, SearchResult, PlatformSettings)

## Requirements

### Requirement 1: Students API Routes

**User Story:** As an admin, I want API routes for student data, so that the students page fetches data dynamically instead of importing static JSON.

#### Acceptance Criteria

1. WHEN a GET request is sent to `/api/admin/students`, THE Admin_API SHALL return a JSON array of all student records from the JSON_Store with HTTP status 200
2. WHEN a GET request is sent to `/api/admin/students/[id]` with a valid student ID, THE Admin_API SHALL return the corresponding student profile object with HTTP status 200
3. WHEN a GET request is sent to `/api/admin/students/[id]` with a non-existent ID, THE Admin_API SHALL return an error response with HTTP status 404
4. WHEN a PUT request is sent to `/api/admin/students/[id]` with a valid body, THE Admin_API SHALL update the student record in the JSON_Store and return the updated record with HTTP status 200
5. WHEN a PUT request is sent to `/api/admin/students/[id]` with an invalid body, THE Admin_API SHALL return a validation error response with HTTP status 400
6. IF an unexpected error occurs while reading or writing the students JSON file, THEN THE Admin_API SHALL return an error response with HTTP status 500

### Requirement 2: Learning Paths API Routes

**User Story:** As a content creator, I want API routes for learning paths, so that I can create, update, delete, and reorder units through proper HTTP endpoints.

#### Acceptance Criteria

1. WHEN a GET request is sent to `/api/admin/learning-paths`, THE Admin_API SHALL return a JSON array of all learning path records from the JSON_Store with HTTP status 200
2. WHEN a POST request is sent to `/api/admin/learning-paths` with a valid body, THE Admin_API SHALL create a new learning path record in the JSON_Store and return the created record with HTTP status 201
3. WHEN a PUT request is sent to `/api/admin/learning-paths/[id]` with a valid body, THE Admin_API SHALL update the learning path record in the JSON_Store and return the updated record with HTTP status 200
4. WHEN a DELETE request is sent to `/api/admin/learning-paths/[id]` with an existing ID, THE Admin_API SHALL remove the learning path record from the JSON_Store and return HTTP status 200
5. WHEN a DELETE request is sent to `/api/admin/learning-paths/[id]` with a non-existent ID, THE Admin_API SHALL return an error response with HTTP status 404
6. WHEN a PATCH request is sent to `/api/admin/learning-paths/[id]/reorder` with a valid unit order array, THE Admin_API SHALL update the unit order within the specified learning path and return the updated record with HTTP status 200
7. WHEN a POST request is sent to `/api/admin/learning-paths` with an invalid body (missing title or title exceeding 150 characters), THE Admin_API SHALL return a validation error response with HTTP status 400
8. IF an unexpected error occurs while reading or writing the learning paths JSON file, THEN THE Admin_API SHALL return an error response with HTTP status 500

### Requirement 3: Lessons API Routes

**User Story:** As a content creator, I want API routes for lessons, so that I can create, update, delete, duplicate, and publish lessons through proper HTTP endpoints.

#### Acceptance Criteria

1. WHEN a GET request is sent to `/api/admin/lessons`, THE Admin_API SHALL return a JSON array of all lesson records from the JSON_Store with HTTP status 200
2. WHEN a POST request is sent to `/api/admin/lessons` with a valid body, THE Admin_API SHALL create a new lesson record in the JSON_Store and return the created record with HTTP status 201
3. WHEN a PUT request is sent to `/api/admin/lessons/[id]` with a valid body, THE Admin_API SHALL update the lesson record in the JSON_Store and return the updated record with HTTP status 200
4. WHEN a DELETE request is sent to `/api/admin/lessons/[id]` with an existing ID, THE Admin_API SHALL remove the lesson record from the JSON_Store and return HTTP status 200
5. WHEN a POST request is sent to `/api/admin/lessons/[id]/duplicate`, THE Admin_API SHALL create a copy of the lesson with a title prefixed by "Copy of ", status set to "draft", and a new unique ID, and return the duplicated record with HTTP status 201
6. WHEN a PATCH request is sent to `/api/admin/lessons/[id]/publish`, THE Admin_API SHALL validate that the lesson has at least one exercise and all required fields are populated, and if valid, update the status to "published" and return the updated record with HTTP status 200
7. WHEN a PATCH request is sent to `/api/admin/lessons/[id]/publish` for a lesson that fails validation, THE Admin_API SHALL return a validation error response listing the missing fields with HTTP status 400
8. WHEN a POST request is sent to `/api/admin/lessons` with an invalid body (missing title or title exceeding 150 characters), THE Admin_API SHALL return a validation error response with HTTP status 400
9. IF an unexpected error occurs while reading or writing the lessons JSON file, THEN THE Admin_API SHALL return an error response with HTTP status 500

### Requirement 4: Exercises API Routes

**User Story:** As a content creator, I want API routes for exercises, so that I can manage exercise content through proper HTTP endpoints.

#### Acceptance Criteria

1. WHEN a GET request is sent to `/api/admin/exercises`, THE Admin_API SHALL return a JSON object containing all exercise records from the JSON_Store with HTTP status 200
2. WHEN a GET request is sent to `/api/admin/exercises/[id]` with a valid exercise ID, THE Admin_API SHALL return the corresponding exercise object with HTTP status 200
3. WHEN a GET request is sent to `/api/admin/exercises/[id]` with a non-existent ID, THE Admin_API SHALL return an error response with HTTP status 404
4. WHEN a POST request is sent to `/api/admin/exercises` with a valid body containing a type and content, THE Admin_API SHALL create a new exercise record in the JSON_Store and return the created record with HTTP status 201
5. WHEN a PUT request is sent to `/api/admin/exercises/[id]` with a valid body, THE Admin_API SHALL update the exercise record in the JSON_Store and return the updated record with HTTP status 200
6. WHEN a DELETE request is sent to `/api/admin/exercises/[id]` with an existing ID, THE Admin_API SHALL remove the exercise record from the JSON_Store and return HTTP status 200
7. WHEN a POST or PUT request is sent to `/api/admin/exercises` with an invalid body (missing type field or invalid exercise type), THE Admin_API SHALL return a validation error response with HTTP status 400
8. IF an unexpected error occurs while reading or writing the exercises JSON file, THEN THE Admin_API SHALL return an error response with HTTP status 500

### Requirement 5: Achievements API Routes

**User Story:** As an admin, I want API routes for achievements, so that I can create, update, and delete achievement badges through proper HTTP endpoints.

#### Acceptance Criteria

1. WHEN a GET request is sent to `/api/admin/achievements`, THE Admin_API SHALL return a JSON array of all achievement records from the JSON_Store with HTTP status 200
2. WHEN a POST request is sent to `/api/admin/achievements` with a valid body, THE Admin_API SHALL create a new achievement record in the JSON_Store and return the created record with HTTP status 201
3. WHEN a PUT request is sent to `/api/admin/achievements/[id]` with a valid body, THE Admin_API SHALL update the achievement record in the JSON_Store and return the updated record with HTTP status 200
4. WHEN a DELETE request is sent to `/api/admin/achievements/[id]` with an existing ID, THE Admin_API SHALL remove the achievement record from the JSON_Store and return HTTP status 200
5. WHEN a DELETE request is sent to `/api/admin/achievements/[id]` with a non-existent ID, THE Admin_API SHALL return an error response with HTTP status 404
6. WHEN a POST request is sent to `/api/admin/achievements` with an invalid body (missing title or missing trigger criteria), THE Admin_API SHALL return a validation error response with HTTP status 400
7. IF an unexpected error occurs while reading or writing the achievements JSON file, THEN THE Admin_API SHALL return an error response with HTTP status 500

### Requirement 6: Placement Challenges API Routes

**User Story:** As an admin, I want API routes for placement challenges, so that I can create, update, delete, and publish challenges through proper HTTP endpoints.

#### Acceptance Criteria

1. WHEN a GET request is sent to `/api/admin/challenges`, THE Admin_API SHALL return a JSON array of all placement challenge records from the JSON_Store with HTTP status 200
2. WHEN a POST request is sent to `/api/admin/challenges` with a valid body, THE Admin_API SHALL create a new placement challenge record in the JSON_Store and return the created record with HTTP status 201
3. WHEN a PUT request is sent to `/api/admin/challenges/[id]` with a valid body, THE Admin_API SHALL update the placement challenge record in the JSON_Store and return the updated record with HTTP status 200
4. WHEN a DELETE request is sent to `/api/admin/challenges/[id]` with an existing ID, THE Admin_API SHALL remove the placement challenge record from the JSON_Store and return HTTP status 200
5. WHEN a DELETE request is sent to `/api/admin/challenges/[id]` with a non-existent ID, THE Admin_API SHALL return an error response with HTTP status 404
6. WHEN a PATCH request is sent to `/api/admin/challenges/[id]/publish`, THE Admin_API SHALL validate that the challenge has at least the configured number of questions and every question has a correct answer, and if valid, update the status to "published" and return the updated record with HTTP status 200
7. WHEN a PATCH request is sent to `/api/admin/challenges/[id]/publish` for a challenge that fails validation, THE Admin_API SHALL return a validation error response listing the specific failures with HTTP status 400
8. IF an unexpected error occurs while reading or writing the challenges JSON file, THEN THE Admin_API SHALL return an error response with HTTP status 500

### Requirement 7: KPI Metrics API Route

**User Story:** As an admin, I want an API route for KPI metrics, so that the dashboard overview page fetches metrics dynamically.

#### Acceptance Criteria

1. WHEN a GET request is sent to `/api/admin/kpi-metrics`, THE Admin_API SHALL return a JSON array of all KPI metric records from the JSON_Store with HTTP status 200
2. THE Admin_API SHALL expose only a GET handler for the KPI metrics endpoint (read-only)
3. IF an unexpected error occurs while reading the KPI metrics JSON file, THEN THE Admin_API SHALL return an error response with HTTP status 500

### Requirement 8: AI Insights API Route

**User Story:** As an admin, I want an API route for AI insights, so that the analytics page fetches insights dynamically.

#### Acceptance Criteria

1. WHEN a GET request is sent to `/api/admin/ai-insights`, THE Admin_API SHALL return a JSON array of all AI insight records from the JSON_Store with HTTP status 200
2. THE Admin_API SHALL expose only a GET handler for the AI insights endpoint (read-only)
3. IF an unexpected error occurs while reading the AI insights JSON file, THEN THE Admin_API SHALL return an error response with HTTP status 500

### Requirement 9: Notifications API Routes

**User Story:** As an admin, I want API routes for notifications, so that I can mark notifications as read, mark all as read, and delete old notifications through proper HTTP endpoints.

#### Acceptance Criteria

1. WHEN a GET request is sent to `/api/admin/notifications`, THE Admin_API SHALL return a JSON array of all notification records from the JSON_Store with HTTP status 200
2. WHEN a PATCH request is sent to `/api/admin/notifications/[id]/read`, THE Admin_API SHALL set the isRead field to true for the specified notification and return the updated record with HTTP status 200
3. WHEN a PATCH request is sent to `/api/admin/notifications/[id]/read` with a non-existent ID, THE Admin_API SHALL return an error response with HTTP status 404
4. WHEN a POST request is sent to `/api/admin/notifications/mark-all-read`, THE Admin_API SHALL set the isRead field to true for all notifications in the JSON_Store and return HTTP status 200
5. WHEN a DELETE request is sent to `/api/admin/notifications/old` with a cutoff date parameter, THE Admin_API SHALL remove all notifications with a createdAt date before the specified cutoff from the JSON_Store and return the count of deleted records with HTTP status 200
6. IF an unexpected error occurs while reading or writing the notifications JSON file, THEN THE Admin_API SHALL return an error response with HTTP status 500

### Requirement 10: Search API Route

**User Story:** As an admin, I want an API route for search, so that the global search modal fetches results from an endpoint instead of importing static data.

#### Acceptance Criteria

1. WHEN a GET request is sent to `/api/admin/search` with a query parameter `q` of at least 2 characters, THE Admin_API SHALL return a JSON array of matching search results from the JSON_Store filtered by case-insensitive substring match with HTTP status 200
2. WHEN a GET request is sent to `/api/admin/search` without a query parameter or with a query shorter than 2 characters, THE Admin_API SHALL return an empty array with HTTP status 200
3. THE Admin_API SHALL group search results by category and return a maximum of 5 results per category
4. IF an unexpected error occurs while reading the search data JSON file, THEN THE Admin_API SHALL return an error response with HTTP status 500

### Requirement 11: Settings API Routes

**User Story:** As an admin, I want API routes for platform settings, so that settings can be persisted and retrieved through proper HTTP endpoints.

#### Acceptance Criteria

1. WHEN a GET request is sent to `/api/admin/settings`, THE Admin_API SHALL return the platform settings object from the JSON_Store with HTTP status 200
2. WHEN a PUT request is sent to `/api/admin/settings` with a valid body, THE Admin_API SHALL update the platform settings in the JSON_Store and return the updated settings with HTTP status 200
3. WHEN a PUT request is sent to `/api/admin/settings` with invalid scoring values (XP per exercise outside 1-1000, XP per lesson outside 1-10000, exercise type weights not summing to 100, or passing threshold outside 50-100), THE Admin_API SHALL return a validation error response with HTTP status 400
4. IF an unexpected error occurs while reading or writing the settings JSON file, THEN THE Admin_API SHALL return an error response with HTTP status 500

### Requirement 12: Input Validation

**User Story:** As a developer, I want all write operations to validate input data, so that invalid data does not corrupt the JSON_Store.

#### Acceptance Criteria

1. WHEN a POST or PUT request body is not valid JSON, THE Admin_API SHALL return an error response with a descriptive message and HTTP status 400
2. THE Request_Validator SHALL check that all required fields are present before writing to the JSON_Store
3. THE Request_Validator SHALL check that string fields do not exceed their defined maximum character lengths
4. THE Request_Validator SHALL check that numeric fields are within their defined valid ranges
5. WHEN the Request_Validator identifies one or more invalid fields, THE Admin_API SHALL return a JSON response containing an array of field-level error messages with HTTP status 400

### Requirement 13: Consistent Response Format

**User Story:** As a frontend developer, I want all API routes to return responses in a consistent format, so that the admin pages can handle responses uniformly.

#### Acceptance Criteria

1. WHEN a route handler returns a successful response, THE Admin_API SHALL include a JSON body with a `data` field containing the result payload
2. WHEN a route handler returns an error response, THE Admin_API SHALL include a JSON body with an `error` field containing a human-readable message
3. WHEN a route handler returns a validation error response, THE Admin_API SHALL include a JSON body with an `error` field and a `details` array listing each field-level validation failure
4. THE Admin_API SHALL set the `Content-Type` header to `application/json` for all responses

### Requirement 14: Admin Page Migration

**User Story:** As an admin, I want the admin pages to fetch data from API routes, so that the pages reflect the current state of the JSON_Store after mutations.

#### Acceptance Criteria

1. THE Admin_Page for students SHALL fetch student data from `/api/admin/students` instead of importing from the data module
2. THE Admin_Page for learning paths SHALL fetch data from `/api/admin/learning-paths` instead of importing from the data module
3. THE Admin_Page for lessons SHALL fetch data from `/api/admin/lessons` instead of importing from the data module
4. THE Admin_Page for exercises SHALL fetch data from `/api/admin/exercises` instead of importing from the data module
5. THE Admin_Page for achievements SHALL fetch data from `/api/admin/achievements` instead of importing from the data module
6. THE Admin_Page for placement challenges SHALL fetch data from `/api/admin/challenges` instead of importing from the data module
7. THE Admin_Page for the dashboard overview SHALL fetch KPI metrics from `/api/admin/kpi-metrics` instead of importing from the data module
8. THE Admin_Page for analytics SHALL fetch AI insights from `/api/admin/ai-insights` instead of importing from the data module
9. THE Admin_Page for notifications SHALL fetch data from `/api/admin/notifications` instead of importing from the data module
10. THE Admin_Page for search SHALL fetch results from `/api/admin/search` instead of importing from the data module
11. THE Admin_Page for settings SHALL fetch and persist settings through `/api/admin/settings` instead of using local state only

### Requirement 15: File System Operations

**User Story:** As a developer, I want the API routes to safely read and write JSON files, so that concurrent requests do not corrupt data.

#### Acceptance Criteria

1. THE Admin_API SHALL use the Node.js `fs/promises` module to read and write JSON files in `src/data/admin/`
2. WHEN writing to a JSON file, THE Admin_API SHALL serialize the data with 2-space indentation for human readability
3. WHEN reading a JSON file, THE Admin_API SHALL parse the file content as JSON and return the parsed object
4. IF a JSON file cannot be found at the expected path, THEN THE Admin_API SHALL return an error response with HTTP status 500 and a descriptive message
5. WHEN creating a new entity, THE Admin_API SHALL generate a unique ID using a combination of a prefix and a timestamp or random string
