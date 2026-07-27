# Design Document: Admin API Routes

## Overview

This design introduces a RESTful API layer for the WordPal admin dashboard, replacing direct static JSON imports with Next.js 16 App Router route handlers. Each admin entity gets dedicated API route files under `src/app/api/admin/` that read from and write to JSON files in `src/data/admin/` using Node.js `fs/promises`. The API follows a consistent response envelope (`{ data }` or `{ error, details? }`) and includes input validation for all write operations.

The migration preserves the existing data format and types while enabling dynamic CRUD operations that persist changes to disk. Admin pages transition from static imports to `fetch()` calls against these local API endpoints.

## Architecture

```mermaid
graph TD
    subgraph "Client Layer"
        AP[Admin Pages<br/>src/app/(admin)/admin/]
    end

    subgraph "API Layer"
        RH[Route Handlers<br/>src/app/api/admin/]
        VAL[Validators<br/>src/lib/api/validators/]
        RESP[Response Helpers<br/>src/lib/api/response.ts]
    end

    subgraph "Data Layer"
        FS[File Service<br/>src/lib/api/file-service.ts]
        JSON[JSON Store<br/>src/data/admin/*.json]
    end

    AP -->|fetch()| RH
    RH --> VAL
    RH --> RESP
    RH --> FS
    FS -->|fs/promises| JSON
```

**Key architectural decisions:**

1. **File-based persistence**: JSON files serve as the data store, read/written via `fs/promises`. This simulates a backend without requiring a database, keeping the project simple for development and demo purposes.

2. **Shared utilities**: A centralized file service handles all read/write operations with consistent error handling. Response helpers enforce the envelope format. Validators are per-entity modules.

3. **No ORM or abstraction layer**: Given the simplicity of flat JSON files, a thin file service is sufficient. No need for repositories or data access objects.

4. **Route handler per entity**: Each entity gets its own directory under `src/app/api/admin/` with `route.ts` files for collection endpoints and `[id]/route.ts` for individual resource endpoints.

## Components and Interfaces

### Route Handler Structure

```
src/app/api/admin/
├── students/
│   ├── route.ts              # GET (list all)
│   └── [id]/
│       └── route.ts          # GET, PUT (single student)
├── learning-paths/
│   ├── route.ts              # GET, POST
│   └── [id]/
│       ├── route.ts          # PUT, DELETE
│       └── reorder/
│           └── route.ts      # PATCH
├── lessons/
│   ├── route.ts              # GET, POST
│   └── [id]/
│       ├── route.ts          # PUT, DELETE
│       ├── duplicate/
│           └── route.ts      # POST
│       └── publish/
│           └── route.ts      # PATCH
├── exercises/
│   ├── route.ts              # GET (all), POST
│   └── [id]/
│       └── route.ts          # GET, PUT, DELETE
├── achievements/
│   ├── route.ts              # GET, POST
│   └── [id]/
│       └── route.ts          # PUT, DELETE
├── challenges/
│   ├── route.ts              # GET, POST
│   └── [id]/
│       ├── route.ts          # PUT, DELETE
│       └── publish/
│           └── route.ts      # PATCH
├── kpi-metrics/
│   └── route.ts              # GET only
├── ai-insights/
│   └── route.ts              # GET only
├── notifications/
│   ├── route.ts              # GET
│   ├── mark-all-read/
│   │   └── route.ts          # POST
│   ├── old/
│   │   └── route.ts          # DELETE
│   └── [id]/
│       └── read/
│           └── route.ts      # PATCH
├── search/
│   └── route.ts              # GET
└── settings/
    └── route.ts              # GET, PUT
```

### Shared Utilities

```
src/lib/api/
├── response.ts               # successResponse(), errorResponse(), validationErrorResponse()
├── file-service.ts           # readJsonFile(), writeJsonFile()
├── id-generator.ts           # generateId(prefix)
└── validators/
    ├── students.ts
    ├── learning-paths.ts
    ├── lessons.ts
    ├── exercises.ts
    ├── achievements.ts
    ├── challenges.ts
    ├── settings.ts
    └── index.ts
```

### Response Helper Interface

```typescript
// src/lib/api/response.ts

/**
 * Creates a successful JSON response with the standard envelope.
 */
export function successResponse<T>(data: T, status = 200): Response {
  return Response.json({ data }, { status });
}

/**
 * Creates an error JSON response with the standard envelope.
 */
export function errorResponse(message: string, status = 500): Response {
  return Response.json({ error: message }, { status });
}

/**
 * Creates a validation error response with field-level details.
 */
export function validationErrorResponse(
  message: string,
  details: string[]
): Response {
  return Response.json({ error: message, details }, { status: 400 });
}
```

### File Service Interface

```typescript
// src/lib/api/file-service.ts
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'src', 'data', 'admin');

/**
 * Reads and parses a JSON file from the admin data directory.
 * Throws if file not found or JSON is invalid.
 */
export async function readJsonFile<T>(filename: string): Promise<T> {
  const filePath = path.join(DATA_DIR, filename);
  const content = await readFile(filePath, 'utf-8');
  return JSON.parse(content) as T;
}

/**
 * Serializes data and writes it to a JSON file with 2-space indentation.
 */
export async function writeJsonFile<T>(filename: string, data: T): Promise<void> {
  const filePath = path.join(DATA_DIR, filename);
  const content = JSON.stringify(data, null, 2);
  await writeFile(filePath, content, 'utf-8');
}
```

### ID Generator Interface

```typescript
// src/lib/api/id-generator.ts

/**
 * Generates a unique ID with the given prefix.
 * Format: {prefix}-{timestamp}-{random}
 */
export function generateId(prefix: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${random}`;
}
```

### Route Handler Pattern (Example)

```typescript
// src/app/api/admin/students/route.ts
import type { NextRequest } from 'next/server';
import { readJsonFile } from '@/lib/api/file-service';
import { successResponse, errorResponse } from '@/lib/api/response';
import type { StudentRow } from '@/data/admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const students = await readJsonFile<StudentRow[]>('students.json');
    return successResponse(students);
  } catch (error) {
    return errorResponse('Failed to read students data');
  }
}
```

```typescript
// src/app/api/admin/students/[id]/route.ts
import type { NextRequest } from 'next/server';
import { readJsonFile, writeJsonFile } from '@/lib/api/file-service';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api/response';
import { validateStudentUpdate } from '@/lib/api/validators/students';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const profiles = await readJsonFile<Record<string, unknown>>('student-profiles.json');
    const profile = profiles[id];
    
    if (!profile) {
      return errorResponse('Student not found', 404);
    }
    
    return successResponse(profile);
  } catch (error) {
    return errorResponse('Failed to read student data');
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const validation = validateStudentUpdate(body);
    if (!validation.valid) {
      return validationErrorResponse('Validation failed', validation.errors);
    }
    
    // Read, update, write pattern
    const students = await readJsonFile<Array<Record<string, unknown>>>('students.json');
    const index = students.findIndex((s) => s.id === id);
    
    if (index === -1) {
      return errorResponse('Student not found', 404);
    }
    
    students[index] = { ...students[index], ...body };
    await writeJsonFile('students.json', students);
    
    return successResponse(students[index]);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON in request body', 400);
    }
    return errorResponse('Failed to update student data');
  }
}
```

### Validator Pattern

```typescript
// src/lib/api/validators/learning-paths.ts

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateLearningPathCreate(body: unknown): ValidationResult {
  const errors: string[] = [];
  
  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be a JSON object'] };
  }
  
  const data = body as Record<string, unknown>;
  
  if (!data.title || typeof data.title !== 'string') {
    errors.push('title is required and must be a string');
  } else if (data.title.length > 150) {
    errors.push('title must not exceed 150 characters');
  }
  
  // Additional field checks...
  
  return { valid: errors.length === 0, errors };
}
```

### Admin Page Migration Pattern

Pages will transition from static imports to fetch calls:

```typescript
// Before (static import)
import { getKPIMetrics } from '@/data/admin';
const metrics = getKPIMetrics();

// After (API fetch)
async function fetchMetrics(): Promise<KPIMetric[]> {
  const res = await fetch('/api/admin/kpi-metrics');
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return json.data;
}
```

Pages that are currently `'use client'` will use `useEffect` + `useState` for fetching, or transition to a custom hook pattern for consistency.

## Data Models

The existing type definitions in `@/types/admin` remain the source of truth. The API routes serialize and deserialize these types to/from JSON files. No schema changes are required.

**JSON file ↔ Type mapping:**

| JSON File | TypeScript Type | Access Pattern |
|-----------|----------------|----------------|
| `students.json` | `StudentRow[]` | Array of records |
| `student-profiles.json` | `Record<string, StudentProfile>` | Object keyed by ID |
| `learning-paths.json` | `LearningPath[]` | Array of records |
| `lessons.json` | `AdminLesson[]` | Array of records |
| `exercises.json` | `Record<string, ExerciseData>` | Object keyed by ID |
| `achievements.json` | `Achievement[]` | Array of records |
| `challenges.json` | `AdminPlacementChallenge[]` | Array of records |
| `kpi-metrics.json` | `KPIMetric[]` | Array (read-only) |
| `ai-insights.json` | `AIInsight[]` | Array (read-only) |
| `notifications.json` | `AdminNotification[]` | Array of records |
| `search-data.json` | `SearchResult[]` | Array (read-only, filtered) |
| `settings.json` | `PlatformSettings` | Single object |

**Note:** The `settings.json` file does not exist yet and will be created with default values on first write.

### Response Envelope

All responses conform to one of these shapes:

```typescript
// Success
interface SuccessResponse<T> {
  data: T;
}

// Error
interface ErrorResponse {
  error: string;
  details?: string[];  // present for validation errors
}
```



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: File Service Round-Trip

*For any* valid JavaScript object, writing it to a JSON file via `writeJsonFile` and then reading it back via `readJsonFile` should produce a deeply equal object. Additionally, the raw file content should be formatted with 2-space indentation.

**Validates: Requirements 15.2, 15.3**

### Property 2: ID Generation Uniqueness and Format

*For any* prefix string, generating multiple IDs via `generateId(prefix)` should produce values that are all unique, all start with the given prefix followed by a hyphen, and contain only alphanumeric characters and hyphens.

**Validates: Requirements 15.5**

### Property 3: Validation Rejects Invalid Input

*For any* entity type and any payload that violates the entity's validation rules (missing required fields, string fields exceeding maximum length, numeric fields outside valid ranges, or wrong field types), the corresponding validator should return `{ valid: false }` with a non-empty `errors` array listing each specific violation.

**Validates: Requirements 1.5, 2.7, 3.8, 4.7, 5.6, 12.2, 12.3, 12.4, 12.5**

### Property 4: Validation Accepts Valid Input

*For any* entity type and any payload that satisfies all validation rules (all required fields present, strings within length limits, numbers within valid ranges, correct types), the corresponding validator should return `{ valid: true }` with an empty `errors` array.

**Validates: Requirements 1.4, 2.2, 2.3, 3.2, 3.3, 4.4, 4.5, 5.2, 5.3, 6.2, 6.3**

### Property 5: Search Filtering Correctness

*For any* search query string of 2 or more characters and any array of search results, filtering by case-insensitive substring match should return only results whose `title` or `subtitle` contains the query string (case-insensitive), and should never return more than 5 results per category.

**Validates: Requirements 10.1, 10.3**

### Property 6: Short Search Query Returns Empty

*For any* string of length 0 or 1, the search endpoint should return an empty array regardless of the backing data.

**Validates: Requirements 10.2**

### Property 7: Lesson Duplication Preserves Content

*For any* lesson record, duplicating it should produce a new record where: the title is `"Copy of {original title}"`, the status is `"draft"`, the ID is different from the original, and all content-related fields (description, grammarFocus, cefrLevel, exercises, etc.) are preserved unchanged.

**Validates: Requirements 3.5**

### Property 8: Lesson Publish Validation

*For any* lesson, publishing should succeed (returning status "published") if and only if the lesson has at least one exercise and all required fields (title, description, grammarFocus, cefrLevel) are populated. If validation fails, the response should list all specific missing fields.

**Validates: Requirements 3.6, 3.7**

### Property 9: Challenge Publish Validation

*For any* placement challenge, publishing should succeed if and only if the challenge has at least the configured minimum number of questions and every question has a designated correct answer. If validation fails, the response should list the specific failures.

**Validates: Requirements 6.6, 6.7**

### Property 10: Settings Scoring Validation

*For any* settings object, the scoring validator should reject configurations where: xpPerExercise is outside 1-1000, xpPerLesson is outside 1-10000, exercise type weights do not sum to 100, or passingThreshold is outside 50-100. It should accept all configurations that satisfy all four constraints simultaneously.

**Validates: Requirements 11.3**

### Property 11: Notification Date Filtering

*For any* set of notifications with various `createdAt` dates and any cutoff date, deleting old notifications should remove exactly those notifications whose `createdAt` is strictly before the cutoff, and preserve all others unchanged.

**Validates: Requirements 9.5**

### Property 12: Mark All Read Idempotence

*For any* set of notifications with mixed `isRead` states, marking all as read should result in every notification having `isRead: true`. Applying the operation a second time should produce the same result (idempotent).

**Validates: Requirements 9.4**

### Property 13: Reorder Preserves Units

*For any* learning path with units and any valid permutation of those unit IDs, reordering should result in the same set of units (no additions or removals) with their order matching the provided permutation.

**Validates: Requirements 2.6**

### Property 14: Response Envelope Consistency

*For any* API response from the admin routes, a successful response (2xx) must contain a `data` field, and an error response (4xx/5xx) must contain an `error` field that is a non-empty string. Validation errors (400) must additionally contain a `details` array.

**Validates: Requirements 13.1, 13.2, 13.3**

### Property 15: Non-JSON Body Rejection

*For any* string that is not valid JSON, sending it as the body of a POST or PUT request to any write endpoint should return a 400 status with an error message indicating invalid JSON.

**Validates: Requirements 12.1**

## Error Handling

### Error Categories

| Category | HTTP Status | Response Shape | Trigger |
|----------|-------------|----------------|---------|
| Not Found | 404 | `{ error: "... not found" }` | ID lookup fails |
| Validation | 400 | `{ error: "Validation failed", details: [...] }` | Input fails validation |
| Bad JSON | 400 | `{ error: "Invalid JSON in request body" }` | Body is not parseable JSON |
| Server Error | 500 | `{ error: "Failed to ..." }` | File system error, unexpected exception |

### Error Handling Strategy

1. **JSON parse errors**: Caught via try/catch around `request.json()`. The `SyntaxError` is detected and returns 400.

2. **File system errors**: All `readJsonFile`/`writeJsonFile` calls are wrapped in try/catch. Any failure (ENOENT, EACCES, etc.) returns 500 with a descriptive message that does not leak file paths.

3. **Validation errors**: Validators return structured results. Route handlers check `validation.valid` before proceeding and return the `errors` array in the response.

4. **Not found errors**: After reading the data, if the target entity doesn't exist, return 404 before attempting any mutations.

5. **No uncaught exceptions**: Every route handler has a top-level try/catch that ensures a proper JSON response is always returned, never an unhandled Next.js error page.

### Error Response Examples

```json
// 404 - Not Found
{ "error": "Student not found" }

// 400 - Validation Error
{
  "error": "Validation failed",
  "details": [
    "title is required and must be a string",
    "estimatedDuration must be between 1 and 9999"
  ]
}

// 400 - Bad JSON
{ "error": "Invalid JSON in request body" }

// 500 - Server Error
{ "error": "Failed to read students data" }
```

## Testing Strategy

### Dual Testing Approach

This feature uses both example-based unit tests and property-based tests for comprehensive coverage.

**Property-Based Testing Library**: `fast-check` (already installed as a dev dependency)

**Test Configuration**:
- Minimum 100 iterations per property test
- Each property test tagged with: `Feature: admin-api-routes, Property {number}: {property_text}`

### Property-Based Tests

Test the pure logic layer (validators, file service, search filtering, ID generation) using `fast-check`:

| Property | Test Target | Key Generators |
|----------|-------------|----------------|
| 1 | `readJsonFile` / `writeJsonFile` | Arbitrary JSON objects |
| 2 | `generateId` | Arbitrary prefix strings |
| 3 | Per-entity validators (invalid) | Payloads with deliberate violations |
| 4 | Per-entity validators (valid) | Fully valid payloads |
| 5 | Search filter function | Random queries + random SearchResult arrays |
| 6 | Search filter function | Strings of length 0-1 |
| 7 | Lesson duplicate function | Random AdminLesson objects |
| 8 | Lesson publish validator | Lessons with varying completeness |
| 9 | Challenge publish validator | Challenges with varying question counts |
| 10 | Settings scoring validator | Random scoring configs |
| 11 | Notification date filter | Random notification arrays + cutoff dates |
| 12 | Mark-all-read function | Random notification arrays |
| 13 | Reorder function | Random learning paths + permutations |
| 14 | Response helper functions | Random data/error payloads |
| 15 | Request body parsing | Random non-JSON strings |

### Unit Tests (Example-Based)

Cover integration points and specific edge cases:

- Each GET endpoint returns correct data structure
- 404 responses for non-existent IDs
- 500 responses when file system is mocked to fail
- Content-Type header verification
- Read-only endpoints reject write methods
- Admin page migration: verify fetch calls replace imports

### Test File Structure

```
src/lib/api/__tests__/
├── file-service.property.test.ts    # Properties 1
├── id-generator.property.test.ts    # Property 2
├── validators.property.test.ts      # Properties 3, 4, 8, 9, 10
├── search-filter.property.test.ts   # Properties 5, 6
├── lesson-ops.property.test.ts      # Property 7
├── notification-ops.property.test.ts # Properties 11, 12
├── reorder.property.test.ts         # Property 13
├── response.property.test.ts        # Properties 14, 15
└── routes/
    ├── students.test.ts
    ├── learning-paths.test.ts
    ├── lessons.test.ts
    ├── exercises.test.ts
    ├── achievements.test.ts
    ├── challenges.test.ts
    ├── kpi-metrics.test.ts
    ├── ai-insights.test.ts
    ├── notifications.test.ts
    ├── search.test.ts
    └── settings.test.ts
```
