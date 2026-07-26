# Implementation Plan: Analytics Dashboard

## Overview

This plan implements an admin-only analytics dashboard for WordPal with two visualizations: a Daily Active Builders (DAB) line chart and a User Retention Cohort heatmap table. The implementation uses the existing Next.js App Router + Supabase stack, adds Recharts for charting, and builds server-side aggregation via Route Handlers. Tasks are ordered to establish infrastructure first, then core logic, then UI components, and finally wiring everything together.

## Tasks

- [ ] 1. Set up admin route group, roles table, and middleware
  - [ ] 1.1 Create the `user_roles` Supabase migration and RLS policy
    - Create a SQL migration file at `supabase/migrations/` that creates the `user_roles` table with columns: `id` (UUID PK), `user_id` (UUID FK to auth.users, UNIQUE), `role` (text with CHECK constraint), `created_at` (timestamptz)
    - Add index `idx_user_roles_user_id` on `user_id`
    - Add RLS policy: only service_role can read/write
    - _Requirements: 1.1, 1.2, 1.3_

  - [ ] 1.2 Create the admin layout and route group
    - Create `src/app/(admin)/layout.tsx` with admin-specific navigation shell
    - Create `src/app/(admin)/admin/analytics/page.tsx` as a Server Component placeholder
    - Ensure the layout wraps admin pages with appropriate structure
    - _Requirements: 1.3_

  - [ ] 1.3 Implement admin role check middleware
    - Update `middleware.ts` to intercept requests to `/admin/*` routes
    - Check for valid Supabase session; redirect to sign-in if unauthenticated (preserving return URL)
    - Query `user_roles` table for admin role; return 403 if not admin
    - Handle expired sessions by redirecting to sign-in
    - _Requirements: 1.1, 1.2, 1.4_

- [ ] 2. Implement analytics service layer and date utilities
  - [ ] 2.1 Create date validation and utility functions
    - Create `src/lib/services/analytics-utils.ts`
    - Implement `validateDateRange(start, end)` that rejects future dates, inverted ranges, and ranges exceeding 365 days
    - Implement `getDefaultDateRange()` returning the most recent 30 days
    - Implement `getWindowForDate(timestamp)` returning the Monday–Sunday window boundaries
    - Implement `filterCompleteWindows(startDate, endDate)` to exclude partial weeks
    - Implement `getIntensityLevel(rate)` returning 1–5 based on retention rate ranges
    - _Requirements: 3.3, 3.4, 3.5, 4.4, 4.5, 4.6, 5.4, 6.5_

  - [ ]* 2.2 Write property tests for date validation (Properties 3, 4)
    - **Property 3: Date validation rejects future dates** — Generate random dates from past year to +1 year, verify future dates rejected and past/present dates accepted
    - **Property 4: Date validation rejects inverted ranges** — Generate random date pairs, verify inverted ranges rejected and valid ranges accepted
    - **Validates: Requirements 3.3, 3.4, 6.5**

  - [ ]* 2.3 Write property tests for window boundaries (Properties 7, 8)
    - **Property 7: Rolling window boundaries** — Generate random UTC timestamps, verify each is assigned to a Monday–Sunday window containing it
    - **Property 8: Complete weeks only** — Generate random date ranges, verify only fully-contained weeks are included
    - **Validates: Requirements 4.4, 4.5, 4.6**

  - [ ]* 2.4 Write property test for color intensity mapping (Property 10)
    - **Property 10: Color intensity mapping** — Generate random numbers 0–100, verify exactly one of 5 levels returned with correct range boundaries
    - **Validates: Requirements 5.4**

  - [ ] 2.5 Implement DAB computation logic
    - Create `src/lib/services/analytics.ts`
    - Implement `computeDAB(records, dateRange)` that takes raw completion records and returns an array of `DABDataPoint` with one entry per calendar day, zero-filling days without activity
    - Clamp output to maximum 90 data points (most recent) if range exceeds 90 days
    - _Requirements: 2.1, 2.4, 2.6, 6.1_

  - [ ]* 2.6 Write property tests for DAB computation (Properties 1, 2)
    - **Property 1: DAB computation completeness** — Generate random arrays of `{userId, completedAt}` + random date ranges, verify output has exactly N points with correct distinct user counts
    - **Property 2: DAB range clamping** — Generate random date ranges spanning 1–365 days, verify output never exceeds 90 points
    - **Validates: Requirements 2.4, 2.6, 6.1**

  - [ ] 2.7 Implement retention cohort computation logic
    - Implement `assignCohorts(records)` that assigns each user to a cohort based on their first completion's Monday week start
    - Implement `computeRetention(records, dateRange)` that calculates retention rates per cohort per weekly window, rounded to 1 decimal
    - Implement `formatRetentionTable(cohorts)` that limits output to 12 cohorts and 10 windows, ordered most recent first
    - _Requirements: 4.1, 4.2, 4.3, 4.7, 5.1_

  - [ ]* 2.8 Write property tests for retention computation (Properties 5, 6, 9)
    - **Property 5: Cohort assignment correctness** — Generate random user completion records, verify each user assigned to exactly one cohort at their earliest week's Monday
    - **Property 6: Retention rate calculation** — Generate random cohorts with known activity, verify rate = round(R/S*100, 1) and Week 0 always = 100.0
    - **Property 9: Retention table bounds** — Generate random datasets with 1–50 cohorts, verify output has at most 12 rows and 10 columns
    - **Validates: Requirements 4.1, 4.2, 4.7, 5.1**

- [ ] 3. Checkpoint - Ensure service layer tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Implement API Route Handlers
  - [ ] 4.1 Create Supabase analytics query builders
    - Create `src/lib/services/analytics-queries.ts`
    - Implement `fetchDABData(supabase, startDate, endDate)` that queries `user_progress` for completed exercises within the date range
    - Implement `fetchRetentionData(supabase, startDate, endDate)` that queries `user_progress` for cohort and retention data
    - Use server-side Supabase client for queries
    - _Requirements: 6.1, 6.2, 6.3_

  - [ ] 4.2 Create the DAB API route handler
    - Create `src/app/api/analytics/dab/route.ts`
    - Handle GET requests with optional `startDate` and `endDate` query params
    - Validate admin session (return 401 if unauthenticated, 403 if not admin)
    - Validate date range (return 400 for invalid ranges)
    - Default to 30 days if no range provided
    - Call analytics service to compute DAB data and return `DABResponse` JSON
    - Return 500 with error message on database failures
    - _Requirements: 6.1, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [ ] 4.3 Create the Retention API route handler
    - Create `src/app/api/analytics/retention/route.ts`
    - Handle GET requests with optional `startDate` and `endDate` query params
    - Validate admin session and date range (same pattern as DAB route)
    - Default to 30 days if no range provided
    - Call analytics service to compute retention data and return `RetentionResponse` JSON
    - Return 500 with error message on database failures
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [ ]* 4.4 Write unit tests for API route handlers
    - Test 401 response for unauthenticated requests
    - Test 403 response for non-admin users
    - Test 400 response for invalid date ranges
    - Test default 30-day range when no params provided
    - Test successful response shape matches `DABResponse` and `RetentionResponse` interfaces
    - _Requirements: 6.4, 6.5, 6.6_

- [ ] 5. Implement dashboard UI components
  - [ ] 5.1 Install Recharts and create the DABChart component
    - Install `recharts` package
    - Create `src/components/analytics/DABChart.tsx` as a client component
    - Render a responsive `LineChart` with y-axis starting at 0 and x-axis labels in MMM DD format
    - Implement tooltip showing date (YYYY-MM-DD) and integer DAB count on hover
    - Handle empty data state gracefully
    - Add ARIA labels for accessibility
    - _Requirements: 2.1, 2.3, 2.4, 2.5_

  - [ ] 5.2 Create the RetentionTable component
    - Create `src/components/analytics/RetentionTable.tsx` as a client component
    - Render a table with cohort rows (up to 12) and window columns (up to 10)
    - Display cohort size in first column, retention rates as percentages (1 decimal)
    - Apply 5-level color intensity using Tailwind classes mapped to retention rate ranges
    - Implement tooltip on cell hover showing cohort start date, window period, retained users count, and retention rate
    - Ensure WCAG AA contrast compliance for all color levels
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ] 5.3 Create the DateRangeSelector component
    - Create `src/components/analytics/DateRangeSelector.tsx` as a client component
    - Provide preset buttons for 7d, 30d, 90d and a custom option
    - For custom: use shadcn/ui Popover + Calendar for start/end date selection
    - Prevent selection of future dates and inverted ranges
    - Default to 30d preset on initial load
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ] 5.4 Create loading, empty, and error state components
    - Create `src/components/analytics/AnalyticsErrorState.tsx` with error message display and retry button
    - Create `src/components/analytics/AnalyticsEmptyState.tsx` with empty state messaging
    - Create skeleton loading placeholders for DAB chart and retention table areas
    - Implement retry counter logic (max 3 attempts, disable after exhaustion)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [ ]* 5.5 Write unit tests for UI state components
    - Test skeleton placeholders render during loading
    - Test empty state message displays correctly
    - Test error state shows retry button
    - Test retry button disables after 3 attempts
    - Test tooltip content format for DAB and retention
    - _Requirements: 7.1, 7.3, 7.4, 7.5, 7.6_

- [ ] 6. Wire everything together in the dashboard orchestrator
  - [ ] 6.1 Create the AnalyticsDashboard client orchestrator
    - Create `src/components/analytics/AnalyticsDashboard.tsx`
    - Manage state for: selected date range, DAB data, retention data, loading states, error states
    - Fetch DAB and retention data in parallel on mount and date range changes
    - Implement 30-second client-side timeout for API calls
    - Pass data to DABChart and RetentionTable, manage independent error boundaries per visualization
    - Wire DateRangeSelector to trigger data refreshes
    - _Requirements: 3.2, 7.1, 7.2, 7.4, 7.5_

  - [ ] 6.2 Complete the admin analytics page Server Component
    - Update `src/app/(admin)/admin/analytics/page.tsx`
    - Verify admin role server-side before rendering
    - Render the AnalyticsDashboard client component
    - Handle 403 and redirect cases at page level
    - _Requirements: 1.2, 1.3_

  - [ ]* 6.3 Write integration tests for the full dashboard flow
    - Test date range selection updates both chart and table
    - Test independent error handling (one component fails, other still renders)
    - Test session expiry redirects to sign-in with return URL
    - Test full request cycle through middleware to API to UI
    - _Requirements: 1.1, 1.4, 3.2, 3.6_

- [ ] 7. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties using `fast-check` (already in devDependencies)
- Unit tests validate specific examples and edge cases
- Recharts needs to be installed as a new dependency (task 5.1)
- The `shadcn/ui` Calendar and Popover components may need to be added via the shadcn CLI if not already present
- All date operations use UTC to maintain consistency across timezones

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "2.1"] },
    { "id": 1, "tasks": ["1.3", "2.2", "2.3", "2.4", "2.5"] },
    { "id": 2, "tasks": ["2.6", "2.7"] },
    { "id": 3, "tasks": ["2.8", "4.1"] },
    { "id": 4, "tasks": ["4.2", "4.3", "5.1", "5.2", "5.3", "5.4"] },
    { "id": 5, "tasks": ["4.4", "5.5", "6.1"] },
    { "id": 6, "tasks": ["6.2"] },
    { "id": 7, "tasks": ["6.3"] }
  ]
}
```
