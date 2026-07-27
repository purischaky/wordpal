# Implementation Plan: WordPal Admin Dashboard

## Overview

This plan implements the WordPal Admin Dashboard as a Next.js App Router application with role-based access control, a comprehensive design system, student management, content creation tools, AI integration via AWS Bedrock, analytics with Recharts, and a notification system. Implementation uses TypeScript throughout and builds on the existing Supabase authentication infrastructure.

## Tasks

- [x] 1. Set up admin route structure and core types
  - [x] 1.1 Create admin route group and layout shell
    - Create `src/app/(admin)/admin/layout.tsx` with the AdminLayout shell (TopNav + Sidebar wrapper)
    - Create placeholder `page.tsx` files for all admin routes: dashboard, students, students/[id], learning-paths, learning-paths/new, learning-paths/[id]/edit, lessons, lessons/new, lessons/[id]/edit, exercises, exercises/new, exercises/[id]/edit, ai-studio, challenges, challenges/new, challenges/[id]/edit, analytics, achievements, achievements/new, settings, denied, notifications
    - _Requirements: 1.1, 1.2, 1.7_

  - [x] 1.2 Define core TypeScript interfaces and types
    - Create `src/types/admin.ts` with all data model interfaces: AdminUser, UserRole, CEFRLevel, LearningPath, Unit, AdminLesson, AdminExercise, exercise content types, AdminPlacementChallenge, Achievement, KPIMetric, ChartDataPoint, AdminNotification, AIInsight, PlatformSettings
    - Define the role permission matrix as a typed constant
    - _Requirements: 2.1, 2.4, 2.5, 2.6_

  - [x] 1.3 Create role verification service and middleware integration
    - Create `src/lib/services/role-service.ts` implementing the Role_Manager: role checking, permission resolution per section, 5-second timeout handling
    - Update `middleware.ts` to gate `/admin` routes: redirect unauthenticated users to sign-in with redirect param, redirect Students to `/admin/denied`, verify role permissions per route
    - _Requirements: 2.1, 2.2, 2.3, 2.7, 2.8, 2.9, 2.10_

  - [x]* 1.4 Write property tests for role permission resolution
    - **Property 2: Role permission resolution returns correct section set**
    - **Validates: Requirements 2.1, 2.4, 2.5, 2.6**

  - [x]* 1.5 Write property tests for API route role enforcement
    - **Property 3: API route role enforcement returns 403 for unauthorized access**
    - **Validates: Requirements 2.7**

- [x] 2. Implement design system foundation components
  - [x] 2.1 Create DashboardCard and MetricCard components
    - Create `src/components/admin/design-system/DashboardCard.tsx` with loading skeleton, dark mode, and empty state
    - Create `src/components/admin/design-system/MetricCard.tsx` with title, value, change percentage (rounded to 1 decimal), trend arrow (up/down/hidden), retry button on error, WCAG AA color-coded trends
    - _Requirements: 3.1, 3.2, 3.5, 3.6, 18.1, 18.2, 18.3, 18.6_

  - [x]* 2.2 Write property tests for MetricCard rendering
    - **Property 4: MetricCard renders value with correctly rounded percentage and trend indicator**
    - **Validates: Requirements 3.2, 18.3**

  - [x] 2.3 Create ChartCard component
    - Create `src/components/admin/design-system/ChartCard.tsx` supporting line, bar, pie, area, and heatmap chart types via Recharts
    - Implement tooltip on hover showing exact value, label, and percentage change
    - Handle empty state when fewer than 2 data points
    - _Requirements: 11.1, 11.2, 11.5, 11.6, 18.4_

  - [x] 2.4 Create StudentTable component
    - Create `src/components/admin/design-system/StudentTable.tsx` with sortable columns, pagination (20 rows per page), row hover, sticky headers, horizontal scroll with sticky first column on mobile
    - _Requirements: 4.1, 4.4, 18.5_

  - [x] 2.5 Create SearchBar and FilterPanel components
    - Create `src/components/admin/design-system/SearchBar.tsx` with 300ms debounce, 100 character max, case-insensitive substring matching
    - Create `src/components/admin/design-system/FilterPanel.tsx` with AND logic filter composition and clear-all button
    - _Requirements: 4.2, 4.3, 4.5, 16.1_

  - [x]* 2.6 Write property tests for student search and filter logic
    - **Property 6: Student search filters by case-insensitive substring**
    - **Property 7: Student list sorting produces correctly ordered results**
    - **Property 8: Multiple filters combine with AND logic**
    - **Validates: Requirements 4.2, 4.4, 4.5**

  - [x] 2.7 Create Timeline, GrammarRadar, and AIInsightCard components
    - Create `src/components/admin/design-system/Timeline.tsx` with chronological events and pagination
    - Create `src/components/admin/design-system/GrammarRadar.tsx` as a radar chart with 7 grammar block categories
    - Create `src/components/admin/design-system/AIInsightCard.tsx` with priority coloring, affected count, and Take Action button
    - _Requirements: 5.1, 5.4, 12.1, 12.3, 18.1_

  - [x] 2.8 Create NotificationCenter component
    - Create `src/components/admin/design-system/NotificationCenter.tsx` with bell icon, badge count (99+ cap), dropdown panel with 50 recent notifications, mark as read, mark all read, graceful degradation when unavailable
    - _Requirements: 1.1, 15.1, 15.2, 15.4, 15.5, 15.6_

  - [x]* 2.9 Write property tests for notification badge and timestamp formatting
    - **Property 22: Notification badge displays count with 99+ cap**
    - **Property 5: Timestamp formatting switches between relative and absolute**
    - **Validates: Requirements 15.1, 1.1, 3.3**

  - [x]* 2.10 Write property test for design system empty data resilience
    - **Property 24: Design system components handle empty data without errors**
    - **Validates: Requirements 18.6**

- [x] 3. Implement admin layout and navigation
  - [x] 3.1 Build TopNav component
    - Create `src/components/admin/TopNav.tsx` with global search input (max 100 chars), NotificationCenter integration, AI Assistant trigger button, user avatar dropdown, dark mode toggle persisting to localStorage
    - _Requirements: 1.1, 1.5, 16.1_

  - [x] 3.2 Build Sidebar component
    - Create `src/components/admin/Sidebar.tsx` with all nav links filtered by user role, active item highlighting, collapsible behavior (collapsed below 1024px), breadcrumb trail (max depth 5)
    - _Requirements: 1.2, 1.3, 1.4, 1.7_

  - [x]* 3.3 Write property test for breadcrumb generation
    - **Property 1: Breadcrumb generation respects maximum depth**
    - **Validates: Requirements 1.3**

  - [x] 3.4 Implement loading skeletons and dark mode
    - Add loading skeleton components for all content areas in the admin layout
    - Implement dark mode toggle with localStorage persistence and platform-wide application
    - _Requirements: 1.5, 1.6_

  - [x] 3.5 Build Access Denied page
    - Implement `src/app/(admin)/admin/denied/page.tsx` with appropriate message and link back to learner dashboard
    - _Requirements: 2.3_

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement Dashboard Overview with KPIs
  - [x] 5.1 Build Dashboard Overview page
    - Implement `src/app/(admin)/admin/page.tsx` with 10 KPI MetricCards: Total Students, Active Students (7d), Lessons Completed (30d), Average Grammar Score, CEFR Distribution, Placement Challenge Success Rate, Average Session Time, Daily Active Users, Weekly Learning Progress, Most Common Grammar Mistakes
    - Add percentage change indicators with trend arrows, retry on error
    - _Requirements: 3.1, 3.2, 3.5, 3.6_

  - [x] 5.2 Build Recent Activity Feed and Quick Actions
    - Add Recent Activity Feed showing up to 20 events with relative/absolute timestamps (relative within 7 days, absolute beyond)
    - Add Quick Action buttons: Generate AI Lesson, Create Learning Path, Add Student, Generate Placement Test
    - Handle empty states appropriately
    - _Requirements: 3.3, 3.4, 3.7_

- [x] 6. Implement Student Management
  - [x] 6.1 Build Student list page
    - Implement `src/app/(admin)/admin/students/page.tsx` with StudentTable (20 rows/page), columns: Avatar, Name, Email, Role, CEFR Level, Current Lesson, Grammar Score, Progress %, Status, Actions
    - Integrate SearchBar (300ms debounce) and FilterPanel (Role, CEFR, Learning Path, Status, Date Joined)
    - Implement sort controls (Progress, Grammar Score, Last Activity) and empty state with clear filters button
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9_

  - [x] 6.2 Build Student Profile page
    - Implement `src/app/(admin)/admin/students/[id]/page.tsx` with: Personal Info, Current Learning Path/Lesson, Grammar Mastery radar chart, Achievements (max 10 recent), Learning Timeline
    - Add Placement Challenge Results (max 20 attempts, paginated, date descending)
    - Add AI Coach Summary (5 weak areas, 3 recommended lessons, 300-char assessment) with retry on failure
    - Add Learning Progress timeline (50 recent events, paginated)
    - Add Certificates section
    - Handle empty states for each section
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

- [x] 7. Implement Learning Path Management
  - [x] 7.1 Build Learning Path list and creation form
    - Implement `src/app/(admin)/admin/learning-paths/page.tsx` showing paths with title, CEFR level, unit/lesson counts, duration, status, creation date
    - Implement `src/app/(admin)/admin/learning-paths/new/page.tsx` with form: Title (max 150), Description (max 500), Target CEFR Level, Estimated Duration (1-9999 min), Difficulty, XP Reward (1-10000)
    - Add field-level validation for all constraints
    - _Requirements: 6.1, 6.2, 6.7, 6.8_

  - [x]* 7.2 Write property tests for Learning Path form validation
    - **Property 10: Learning Path form validation enforces field constraints**
    - **Validates: Requirements 6.7, 6.8**

  - [x] 7.3 Implement Learning Path editing with drag-and-drop
    - Implement `src/app/(admin)/admin/learning-paths/[id]/edit/page.tsx` with drag-and-drop reordering of Units and Lessons
    - Implement publish validation (at least 1 Unit with at least 1 Lesson) with confirmation dialog
    - Implement delete with confirmation showing affected Units/Lessons count
    - _Requirements: 6.3, 6.4, 6.5, 6.6_

  - [x]* 7.4 Write property test for Learning Path publish validation
    - **Property 9: Learning Path publish validation enforces content presence**
    - **Validates: Requirements 6.4, 6.5**

- [x] 8. Implement Lesson Builder
  - [x] 8.1 Build Lesson creation and editing form
    - Implement `src/app/(admin)/admin/lessons/new/page.tsx` and `[id]/edit/page.tsx` with fields: Title (max 150), Description (max 500), Grammar Focus (max 100), CEFR Level, Difficulty (1-5), Duration (max 180 min), Learning Objectives (max 10, each max 200)
    - Display exercises list with type, content preview (60 char truncation), status indicator
    - Add Preview button rendering lesson as student would see it in modal overlay
    - _Requirements: 7.1, 7.2, 7.3_

  - [x] 8.2 Implement Lesson duplicate and publish operations
    - Implement Duplicate action: prepend "Copy of " to title (truncate to 150 chars), copy exercises/blocks, set status to Draft
    - Implement Publish validation: at least 1 exercise, Title/CEFR/Difficulty/Duration filled
    - Handle save failure with error notification preserving input and retry action
    - _Requirements: 7.4, 7.5, 7.6_

  - [x]* 8.3 Write property tests for Lesson operations
    - **Property 11: Lesson duplication produces correctly transformed title**
    - **Property 12: Lesson publish validation enforces completeness**
    - **Validates: Requirements 7.4, 7.5**

- [x] 9. Implement Exercise Builder
  - [x] 9.1 Build Exercise Builder with Grammar Block Editor
    - Implement `src/app/(admin)/admin/exercises/new/page.tsx` and `[id]/edit/page.tsx`
    - Create `src/components/admin/exercise-builder/ExerciseBuilder.tsx` with type selector for 6 exercise types
    - Create `src/components/admin/exercise-builder/GrammarBlockEditor.tsx` with block palette (Subject, Verb, Object, Time, Place, Connector, Modifier), unique colors, 2-15 blocks constraint
    - _Requirements: 8.1, 8.2_

  - [x] 9.2 Implement all exercise type forms
    - Multiple Choice: Question (1-300), 4 options (1-200 each), correct answer selection, optional explanation (max 500)
    - Fill in the Blank: Sentence (max 500) with `___` markers (1-10 blanks), answer fields (1-200 each)
    - Sentence Ordering: 2-12 fragments (1-200 each) in correct order
    - Rewrite Sentence: Original (1-300), instruction (1-300), 1-5 acceptable answers (1-300 each)
    - Free Writing: Prompt (1-500), optional word count range (1-1000), optional guidelines (max 500)
    - _Requirements: 8.3, 8.4, 8.5, 8.6, 8.7_

  - [x] 9.3 Implement exercise preview and validation
    - Build Preview mode rendering each exercise type interactively as a student would see it
    - Implement type-specific validation: no correct answer (MC), no non-distractor blocks (DnD), no blanks (FiB), <2 fragments (SO), no acceptable answer (Rewrite)
    - _Requirements: 8.8, 8.9_

  - [x]* 9.4 Write property tests for exercise validation
    - **Property 13: Fill-in-blank marker parsing identifies correct blank count**
    - **Property 14: Exercise type-specific validation prevents invalid submissions**
    - **Validates: Requirements 8.4, 8.9**

- [x] 10. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Implement AI Content Studio
  - [x] 11.1 Build AI Content Studio page
    - Implement `src/app/(admin)/admin/ai-studio/page.tsx` with generation form: Grammar Topic (max 100), Target CEFR Level, Difficulty (1-5), Learning Goal (max 300), Context (Business/Travel/Daily Life/Interview)
    - Show loading state with progress indicator within 1 second of submission
    - Handle 30-second timeout and generation failures with retry preserving form values
    - Implement required field validation with field-level errors preserving filled fields
    - _Requirements: 9.1, 9.2, 9.6, 9.7_

  - [x] 11.2 Build generated content display and editing
    - Display generated content in sections: Lesson Explanation, Examples (3-10), Exercises with blocks (3-10), Grammar Tips (2-5), Common Mistakes (2-5), Assessment Questions (3-10), Placement Challenge
    - Implement inline editing for all sections: modify text, add/remove exercises, reorder items, adjust grammar blocks
    - Implement "Save to Lesson" persisting content as new Lesson with Exercises and Grammar Blocks, success confirmation within 5s, error handling with retry preserving edited content
    - _Requirements: 9.3, 9.4, 9.5, 9.8_

  - [x]* 11.3 Write property test for AI form validation
    - **Property 15: AI generation form required field validation preserves filled fields**
    - **Validates: Requirements 9.7**

- [x] 12. Implement Placement Challenge Management
  - [x] 12.1 Build Placement Challenge list and creation form
    - Implement `src/app/(admin)/admin/challenges/page.tsx` showing challenges with title, CEFR level, topics, question count, status, creation date
    - Implement `src/app/(admin)/admin/challenges/new/page.tsx` with form: Title (max 150), Target Level, Grammar Topics (multi-select), Difficulty (1-5), Exercise Types (multi-select), Number of Questions (5-50)
    - _Requirements: 10.1, 10.2_

  - [x] 12.2 Implement AI generation and editing for challenges
    - Implement "Generate with AI" button sending config to AI service with 30s timeout, progress indicator
    - Display generated questions in editable list: modify text, adjust grammar blocks, add/remove questions, designate correct answers
    - Implement Preview mode: sequential questions with Previous/Next navigation, progress indicator
    - _Requirements: 10.3, 10.4, 10.5, 10.8_

  - [x] 12.3 Implement challenge publish validation
    - Validate challenge has at least configured number of questions and all have correct answers
    - Display field-level errors for questions lacking correct answers or insufficient count
    - _Requirements: 10.6, 10.7_

  - [x]* 12.4 Write property test for challenge publish validation
    - **Property 16: Placement Challenge publish validation enforces question completeness**
    - **Validates: Requirements 10.6, 10.7**

- [x] 13. Implement Analytics Dashboard
  - [x] 13.1 Build Analytics page with charts
    - Implement `src/app/(admin)/admin/analytics/page.tsx` with charts: Student Growth (line), Lesson Completion Rate (bar), Grammar Error Distribution (pie), Most Difficult Lessons (bar), Average Grammar Score Trend (line), Challenge Pass Rate (bar), Student Retention (cohort), Daily Active Users (area)
    - Add Learning Activity Heatmap (7 columns × 24 rows)
    - Implement date range filters: Last 7/30/90 days, Custom (max 365 days), default Last 30 days
    - Update all charts within 3 seconds on filter change
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7_

  - [x] 13.2 Build AI-Powered Insights section
    - Implement AI insight cards within Analytics page: title, description, affected count, priority (high >50, medium 21-50, low 1-20), suggested action
    - Implement "Take Action" navigation: content-gap → AI Studio pre-filled, student-performance → Students filtered
    - Display last refresh timestamp, handle empty state and minimum threshold guard (no insights for <10 students at a level)
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8_

  - [x]* 13.3 Write property tests for AI insights logic
    - **Property 17: AI insight generation triggers when threshold exceeded**
    - **Property 18: AI insights sorted by priority based on affected count**
    - **Property 19: No insights generated below minimum student threshold**
    - **Validates: Requirements 12.2, 12.3, 12.7**

- [x] 14. Implement Achievements Management
  - [x] 14.1 Build Achievements list and creation form
    - Implement `src/app/(admin)/admin/achievements/page.tsx` showing achievements with badge icon, title, description, trigger criteria, threshold, XP reward, unlock count
    - Implement `src/app/(admin)/admin/achievements/new/page.tsx` with form: Title (max 100), Description (max 300), Badge Icon (PNG/SVG ≤512KB or emoji), XP Reward (max 10000), Trigger Criteria (select), Threshold Value (positive integer)
    - Add badge preview (locked/unlocked states), edit with pre-populated values preserving unlock count
    - Implement delete with confirmation showing affected students count, preserve awarded XP
    - Add form validation: empty title, no trigger, no threshold → inline errors
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7_

  - [x]* 14.2 Write property test for achievement form validation
    - **Property 20: Achievement form validation enforces required fields**
    - **Validates: Requirements 13.5**

- [x] 15. Implement Platform Settings
  - [x] 15.1 Build Settings page
    - Implement `src/app/(admin)/admin/settings/page.tsx` with panels: Brand (logo PNG/SVG ≤2MB, theme colors, language), AI Model, CEFR Config, Scoring Rules (XP per exercise 1-1000, XP per lesson 1-10000, weights sum to 100, passing threshold 50-100), Role permissions, Notification preferences
    - Add live preview for brand changes before saving
    - Implement save with success notification (auto-dismiss 3s), error handling preserving form state
    - Implement unsaved changes warning on navigation
    - Add range and field validation with inline errors
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7_

  - [x]* 15.2 Write property test for settings form validation
    - **Property 21: Settings form validation enforces range constraints**
    - **Validates: Requirements 14.6**

- [x] 16. Implement Global Search and Notifications Integration
  - [x] 16.1 Build Global Search modal
    - Implement search modal triggered by search input or Ctrl+K/Cmd+K keyboard shortcut
    - Display categorized results (Students, Learning Paths, Lessons, Exercises, Challenges) within 500ms, max 5 per category with "View All" links
    - Navigate to detail view on result selection, close modal
    - Handle no results with empty state message
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5_

  - [x]* 16.2 Write property test for global search
    - **Property 23: Global search returns categorized results limited to 5 per category**
    - **Validates: Requirements 16.2, 16.3**

  - [x] 16.3 Implement real-time notification delivery
    - Set up Supabase Realtime subscription for platform events (registrations, challenge completions, AI generation, system errors, AI insights)
    - Deliver notifications within 10 seconds of events
    - Implement notification click navigation to relevant context
    - Implement 90-day retention cleanup
    - _Requirements: 15.3, 15.4, 15.7_

- [x] 17. Implement responsive design and accessibility
  - [x] 17.1 Apply responsive design and WCAG compliance
    - Ensure desktop-first layout (≥1024px) with graceful tablet degradation (768-1023px: sidebar collapse, single-column grids)
    - Apply WCAG 2.1 AA: 4.5:1 contrast for text, 3:1 for large text, keyboard navigation, ARIA labels on icon buttons, 2px focus outlines
    - Apply design system tokens: 12px border radius, soft shadows, blue-to-purple gradient accents, 200ms transitions
    - Ensure all form inputs have visible labels, error messages associated via aria-describedby
    - Implement error boundary component with "Reload" button
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6_

- [x] 18. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties using fast-check
- Unit tests validate specific examples and edge cases
- The implementation builds on existing Supabase auth (AuthContext, middleware) and AWS Bedrock dependencies
- Recharts is used for all chart visualizations in the analytics dashboard
- All components follow the design system approach with TypeScript interfaces and dark mode support

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["1.3", "2.1", "2.3", "2.4", "2.5", "2.7", "2.8"] },
    { "id": 2, "tasks": ["1.4", "1.5", "2.2", "2.6", "2.9", "2.10", "3.1", "3.2", "3.5"] },
    { "id": 3, "tasks": ["3.3", "3.4"] },
    { "id": 4, "tasks": ["5.1", "5.2", "6.1"] },
    { "id": 5, "tasks": ["6.2", "7.1"] },
    { "id": 6, "tasks": ["7.2", "7.3"] },
    { "id": 7, "tasks": ["7.4", "8.1"] },
    { "id": 8, "tasks": ["8.2", "8.3", "9.1"] },
    { "id": 9, "tasks": ["9.2", "9.3"] },
    { "id": 10, "tasks": ["9.4", "11.1"] },
    { "id": 11, "tasks": ["11.2", "11.3", "12.1"] },
    { "id": 12, "tasks": ["12.2", "12.3"] },
    { "id": 13, "tasks": ["12.4", "13.1"] },
    { "id": 14, "tasks": ["13.2", "13.3", "14.1"] },
    { "id": 15, "tasks": ["14.2", "15.1"] },
    { "id": 16, "tasks": ["15.2", "16.1"] },
    { "id": 17, "tasks": ["16.2", "16.3"] },
    { "id": 18, "tasks": ["17.1"] }
  ]
}
```
