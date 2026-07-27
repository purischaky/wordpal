# Requirements Document

## Introduction

The WordPal Admin Dashboard is a comprehensive premium management interface for the WordPal AI-powered English learning platform. It provides administrators and instructors with a desktop-first responsive dashboard to manage students, learning paths, lessons, exercises, AI-generated content, placement challenges, analytics, and platform settings. The dashboard supersedes and extends the basic admin-interface by adding student management, AI content generation, analytics, achievements, role-based permissions, and a modern design system inspired by Linear, Notion, Vercel, Stripe Dashboard, and Duolingo for Schools.

## Glossary

- **Admin_Dashboard**: The premium web-based management interface at `/admin` for administering the WordPal platform
- **Administrator**: A user with full platform access including settings, roles, and AI configuration management
- **Instructor**: A user with access to student management, content creation, AI Content Studio, and analytics
- **Content_Creator**: A user with access to learning path, lesson, and exercise creation and editing
- **Student**: A learner user who interacts with learning content and has no access to the Admin_Dashboard
- **Dashboard_Layout**: The responsive shell consisting of a top navigation bar and a collapsible left sidebar
- **KPI_Card**: A visual metric display component showing a single key performance indicator with trend data
- **Learning_Path**: An ordered collection of Units that defines a structured curriculum for a target CEFR level
- **Unit**: A grouping of related Lessons within a Learning_Path representing a thematic module
- **Lesson**: A unit of learning content containing a title, description, grammar focus, CEFR level, difficulty, estimated duration, learning objectives, and exercises
- **Exercise**: An interactive activity within a Lesson supporting multiple types including drag-and-drop sentence building, multiple choice, sentence ordering, fill in the blank, rewrite sentence, and free writing
- **Grammar_Block**: A labeled drag-and-drop element with a category (Subject, Verb, Object, Time, Place, Connector, Modifier), distractor flag, and source order
- **AI_Content_Studio**: The feature that uses AI to generate lessons, exercises, explanations, and assessments based on instructor parameters
- **Placement_Challenge**: An adaptive assessment that evaluates a student's grammar proficiency to determine their CEFR level
- **CEFR_Level**: The Common European Framework of Reference level (A1, A2, B1, B2, C1, C2) indicating language proficiency
- **Analytics_Engine**: The system component that aggregates and visualizes student performance and platform usage data
- **Notification_Center**: The component in the top navigation that displays system alerts, student activity, and AI-generated insights
- **Role_Manager**: The service responsible for assigning and verifying user roles and permissions
- **Design_System**: The set of reusable UI components (DashboardCard, MetricCard, ChartCard, etc.) that ensure visual consistency

## Requirements

### Requirement 1: Dashboard Layout and Navigation

**User Story:** As an administrator, I want a consistent layout with top navigation and sidebar, so that I can efficiently access all management sections.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL render a top navigation bar containing a global search input (maximum 100 characters), a Notification_Center icon with an unread count badge displaying the exact count up to 99 and "99+" for counts exceeding 99, an AI Assistant trigger button, and the current user's avatar with a dropdown menu
2. THE Admin_Dashboard SHALL render a collapsible left sidebar with navigation links to: Dashboard, Students, Learning Paths, Units, Lessons, Exercises, AI Content Studio, Challenges, Analytics, Achievements, Settings, and Profile
3. WHEN the current user navigates to any section, THE Admin_Dashboard SHALL apply a visually distinct style (different background color or font weight) to the active navigation item in the sidebar and display a breadcrumb trail showing the current navigation path up to a maximum depth of 5 levels
4. WHEN the viewport width is below 1024 pixels, THE Dashboard_Layout SHALL collapse the sidebar into a hamburger menu overlay while keeping all sidebar navigation links accessible and all main content areas visible without horizontal scrolling
5. THE Admin_Dashboard SHALL support a dark mode toggle that persists the user's preference in local storage and applies the selected theme across all dashboard pages
6. WHEN the Admin_Dashboard loads, THE Dashboard_Layout SHALL display loading skeleton components for all content areas until data is fetched, completing the transition within 2 seconds on a network connection with latency of 100ms or less
7. WHEN the viewport width is 1024 pixels or above, THE Dashboard_Layout SHALL render the sidebar in its expanded state by default, showing both icons and text labels for each navigation link

### Requirement 2: Role-Based Access Control

**User Story:** As a platform owner, I want granular role-based permissions, so that each user type can only access features appropriate to their role.

#### Acceptance Criteria

1. THE Role_Manager SHALL support four distinct roles: Administrator, Instructor, Content_Creator, and Student, where each role maps to a fixed set of permitted Admin_Dashboard sections as defined in criteria 4, 5, and 6
2. WHEN an unauthenticated user navigates to any `/admin` route, THE Admin_Dashboard SHALL redirect the user to the sign-in page with the original path stored as a redirect query parameter
3. WHEN an authenticated user with the Student role navigates to any `/admin` route, THE Admin_Dashboard SHALL display an "Access Denied" page with a navigation link back to the learner dashboard
4. WHILE a user holds the Administrator role, THE Admin_Dashboard SHALL grant access to all sections including Settings, Roles management, AI configuration, and Analytics
5. WHILE a user holds the Instructor role, THE Admin_Dashboard SHALL grant access to Students, Learning Paths, Units, Lessons, Exercises, AI Content Studio, Challenges, Analytics, and Achievements sections, and SHALL deny access to Settings and Roles management by redirecting the user to the "Access Denied" page
6. WHILE a user holds the Content_Creator role, THE Admin_Dashboard SHALL grant access to Learning Paths, Units, Lessons, Exercises, and AI Content Studio sections, and SHALL deny access to Students, Analytics, Settings, and Roles management by redirecting the user to the "Access Denied" page
7. THE Admin_Dashboard SHALL verify the user role on each server-side request to admin API routes and return HTTP 403 with a JSON error message indicating insufficient permissions for users whose assigned role does not include the requested section in its permitted set
8. IF the role verification service is unavailable or does not respond within 5 seconds, THEN THE Admin_Dashboard SHALL deny access, return HTTP 503, and display a message indicating the service is temporarily unavailable
9. WHEN a new user registers an account, THE Role_Manager SHALL assign the Student role by default
10. IF an authenticated user has no role assigned or has an unrecognized role value, THEN THE Admin_Dashboard SHALL deny access to all `/admin` routes and redirect the user to the "Access Denied" page

### Requirement 3: Dashboard Overview with KPIs

**User Story:** As an administrator, I want to see key platform metrics at a glance, so that I can monitor platform health and student engagement.

#### Acceptance Criteria

1. WHEN an authorized user navigates to the Dashboard section, THE Admin_Dashboard SHALL display KPI_Cards for: Total Students, Active Students (last 7 days), Lessons Completed (last 30 days), Average Grammar Score, CEFR Distribution, Placement Challenge Success Rate, Average Session Time, Daily Active Users, Weekly Learning Progress, and Most Common Grammar Mistakes
2. THE Admin_Dashboard SHALL display each KPI_Card with the current metric value, a percentage change indicator (rounded to one decimal place) comparing to the immediately preceding period of equal duration to the metric's display window, and a trend direction arrow (up for positive change, down for negative change, hidden when change is zero)
3. WHEN an authorized user navigates to the Dashboard section, THE Admin_Dashboard SHALL display a Recent Activity Feed showing up to 20 of the most recent platform events (student registrations, lesson completions, challenge attempts, achievement unlocks) with timestamps in relative format (e.g., "5 minutes ago", "2 hours ago"), switching to absolute date format for events older than 7 days
4. THE Admin_Dashboard SHALL display Quick Action buttons for: Generate AI Lesson, Create Learning Path, Add Student, and Generate Placement Test, each navigating to the corresponding creation workflow
5. IF the Analytics_Engine fails to respond within 10 seconds when loading metric data for any KPI_Card, THEN THE Admin_Dashboard SHALL display that KPI_Card in an error state with a retry button and a message indicating data is temporarily unavailable
6. WHEN an authorized user clicks the retry button on a KPI_Card in error state, THE Admin_Dashboard SHALL re-request the metric data from the Analytics_Engine and replace the error state with either the loaded metric or a refreshed error state if the request fails again within 10 seconds
7. IF the Recent Activity Feed contains fewer than 20 events, THEN THE Admin_Dashboard SHALL display all available events without an empty-state indicator, and if no events exist, SHALL display a message indicating no recent activity is available

### Requirement 4: Student Management

**User Story:** As an instructor, I want to search, filter, and manage students, so that I can track individual progress and take administrative actions.

#### Acceptance Criteria

1. WHEN an authorized user with Administrator or Instructor role navigates to the Students section, THE Admin_Dashboard SHALL display a paginated table showing 20 rows per page with columns: Avatar, Name, Email, Role, Current CEFR Level, Current Lesson, Grammar Score (0–100), Progress percentage (0–100%), Status (active/inactive/suspended), and an Actions menu
2. THE Admin_Dashboard SHALL provide a search input that filters students by name or email, matching any substring case-insensitively, with results updating within 300 milliseconds of the last keystroke and accepting a maximum query length of 100 characters
3. THE Admin_Dashboard SHALL provide filter controls for: Role (Administrator, Instructor, Content_Creator, Student), CEFR Level (A1, A2, B1, B2, C1, C2), Learning Path, Status (active, inactive, suspended), and Date Joined range with selectable start and end dates
4. THE Admin_Dashboard SHALL provide sort controls allowing sorting by Progress percentage, Grammar Score, or Last Activity date in ascending or descending order, with one sort column active at a time
5. WHEN an authorized user applies multiple filters simultaneously, THE Admin_Dashboard SHALL combine all active filters using AND logic and display the total count of students matching the combined filters
6. WHEN an authorized user clicks a student row, THE Admin_Dashboard SHALL navigate to that student's detailed profile view
7. WHEN the student table contains no results matching the applied filters, THE Admin_Dashboard SHALL display an empty state with a message indicating no students match the criteria and a button to clear all filters
8. IF the search input is cleared or all filters are removed, THEN THE Admin_Dashboard SHALL reset the table to display the full unfiltered paginated student list
9. IF the data service is unavailable when loading the student list, THEN THE Admin_Dashboard SHALL display an error message indicating the student data could not be loaded and provide a retry button

### Requirement 5: Student Profile View

**User Story:** As an instructor, I want a comprehensive student profile, so that I can understand individual learning patterns and provide targeted support.

#### Acceptance Criteria

1. WHEN an authorized user navigates to a student profile, THE Admin_Dashboard SHALL display: Personal Information (name, email, role, join date), Current Learning Path and Lesson, a Grammar Mastery radar chart with one axis per Grammar_Block category (Subject, Verb, Object, Time, Place, Connector, Modifier) showing a mastery score from 0 to 100 for each, Achievements list showing a maximum of 10 most recent achievements, and a Learning Timeline
2. THE Admin_Dashboard SHALL display Placement Challenge Results showing each attempt with date, score (integer from 0 to 100), result (pass/fail), and target CEFR level, ordered by date descending with a maximum of 20 attempts displayed and pagination controls if more exist
3. THE Admin_Dashboard SHALL display an AI Coach Summary section containing: up to 5 identified weak grammar areas ranked by severity, up to 3 recommended next lessons, and an AI-generated learning assessment of no more than 300 characters summarizing the student's current proficiency and improvement trajectory
4. THE Admin_Dashboard SHALL display a Learning Progress section with a visual timeline showing lesson completions, challenge attempts, and achievement unlocks ordered chronologically with the 50 most recent events displayed and pagination controls if more exist
5. THE Admin_Dashboard SHALL display a Certificates section listing all certificates earned by the student with issue date and certificate type
6. IF the student has no activity data, THEN THE Admin_Dashboard SHALL display an empty state in each section with a message indicating no data is available yet
7. IF the AI Coach Summary data is unavailable or the generation service fails, THEN THE Admin_Dashboard SHALL display the AI Coach Summary section in an error state with a message indicating the AI summary is temporarily unavailable and a retry button

### Requirement 6: Learning Path Management

**User Story:** As a content creator, I want to create and organize learning paths with units and lessons, so that I can design structured curricula for different proficiency levels.

#### Acceptance Criteria

1. WHEN an authorized user navigates to the Learning Paths section, THE Admin_Dashboard SHALL display all learning paths with their title, target CEFR level, unit count, lesson count, estimated total duration in minutes, status (Published/Draft), and creation date
2. WHEN an authorized user creates a new Learning Path, THE Admin_Dashboard SHALL present a form with fields for: Title (maximum 150 characters), Description (maximum 500 characters), Target CEFR Level (select A1-C2), Estimated Duration (positive integer in minutes, range 1–9999), Difficulty (Beginner/Intermediate/Advanced), and XP Reward (positive integer, range 1–10000)
3. THE Admin_Dashboard SHALL support drag-and-drop reordering of Units within a Learning Path and Lessons within a Unit, persisting the new order within 2 seconds of the drop action
4. WHEN an authorized user changes a Learning Path status from Draft to Published, THE Admin_Dashboard SHALL validate that the path contains at least one Unit with at least one Lesson and display a confirmation dialog before publishing
5. IF the publish validation fails because the Learning Path contains no Units or a Unit contains no Lessons, THEN THE Admin_Dashboard SHALL display a validation error indicating the specific missing content and keep the Learning Path in Draft status
6. WHEN an authorized user deletes a Learning Path, THE Admin_Dashboard SHALL display a confirmation dialog stating the number of Units and Lessons that will be affected and require explicit confirmation before deletion
7. IF a Learning Path creation or update submission contains a title that is empty or exceeds 150 characters, THEN THE Admin_Dashboard SHALL display a validation error indicating the title constraint and prevent submission
8. IF a Learning Path creation or update submission contains a Description exceeding 500 characters, an Estimated Duration outside the range 1–9999, or an XP Reward outside the range 1–10000, THEN THE Admin_Dashboard SHALL display a validation error for each invalid field and prevent submission

### Requirement 7: Lesson Builder

**User Story:** As a content creator, I want a rich lesson editor, so that I can create comprehensive grammar lessons with learning objectives and exercises.

#### Acceptance Criteria

1. WHEN an authorized user creates or edits a Lesson, THE Admin_Dashboard SHALL present a form with fields for: Title (non-empty, maximum 150 characters), Description (maximum 500 characters), Grammar Focus (text, maximum 100 characters), CEFR Level (select A1-C2), Difficulty (integer, 1-5 scale), Estimated Duration in minutes (positive integer, maximum 180), and Learning Objectives (list of text items, maximum 10 items, each item maximum 200 characters)
2. THE Admin_Dashboard SHALL display the list of Exercises assigned to the Lesson in their current order, with each exercise showing its type, a content preview truncated to 60 characters, and a status indicator displaying one of: Draft, Published, or Incomplete
3. THE Admin_Dashboard SHALL provide a Preview button that renders the lesson as a student would see it in a modal overlay
4. WHEN an authorized user activates the Duplicate action on a Lesson, THE Admin_Dashboard SHALL create a copy of the lesson with all exercises and blocks, prepend "Copy of " to the title (truncating the original title if the result would exceed 150 characters), and set the duplicated lesson status to Draft
5. WHEN an authorized user publishes a Lesson, THE Admin_Dashboard SHALL validate that the lesson has at least one Exercise and that the Title, CEFR Level, Difficulty, and Estimated Duration fields are filled, and display validation errors identifying each missing or invalid field
6. IF a Lesson update fails to persist, THEN THE Admin_Dashboard SHALL display an error notification preserving the user's input and providing a retry action

### Requirement 8: Exercise Builder

**User Story:** As a content creator, I want to build multiple exercise types with a grammar block editor, so that I can create diverse and engaging practice activities.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL support creation of six exercise types: Drag-and-Drop Sentence, Multiple Choice, Sentence Ordering, Fill in the Blank, Rewrite Sentence, and Free Writing
2. WHEN an authorized user creates a Drag-and-Drop Sentence exercise, THE Admin_Dashboard SHALL present a Grammar Block Editor with a block palette supporting categories: Subject, Verb, Object, Time, Place, Connector, and Modifier, each visually distinguished by a unique color per category, and allowing between 2 and 15 blocks per exercise
3. WHEN an authorized user creates a Multiple Choice exercise, THE Admin_Dashboard SHALL present fields for: Question text (1 to 300 characters), four answer options (1 to 200 characters each), correct answer selection (exactly one), and an optional explanation (maximum 500 characters)
4. WHEN an authorized user creates a Fill in the Blank exercise, THE Admin_Dashboard SHALL present a sentence input (maximum 500 characters) where blanks are indicated by the marker `___` (three consecutive underscores), supporting between 1 and 10 blanks per sentence, with a corresponding correct answer field (1 to 200 characters) for each blank
5. WHEN an authorized user creates a Sentence Ordering exercise, THE Admin_Dashboard SHALL present fields for: between 2 and 12 sentence fragments (1 to 200 characters each) in the intended correct order, with the system shuffling them for the student at exercise time
6. WHEN an authorized user creates a Rewrite Sentence exercise, THE Admin_Dashboard SHALL present fields for: an original sentence prompt (1 to 300 characters), a rewrite instruction (1 to 300 characters), and at least one acceptable answer (1 to 300 characters each, maximum 5 acceptable answers)
7. WHEN an authorized user creates a Free Writing exercise, THE Admin_Dashboard SHALL present fields for: a writing prompt (1 to 500 characters), an optional word count range with minimum (at least 1) and maximum (up to 1000) values, and optional evaluation guidelines (maximum 500 characters)
8. WHEN an authorized user activates the Preview function for any exercise, THE Admin_Dashboard SHALL render the exercise in its interactive form as a student would experience it
9. IF an exercise submission fails validation — including no correct answer designated for Multiple Choice, no non-distractor blocks for Drag-and-Drop Sentence, no blanks defined for Fill in the Blank, fewer than 2 fragments for Sentence Ordering, or no acceptable answer for Rewrite Sentence — THEN THE Admin_Dashboard SHALL display a validation error indicating the specific issue and prevent saving

### Requirement 9: AI Content Studio

**User Story:** As an instructor, I want AI to generate lesson content based on my parameters, so that I can rapidly create high-quality learning materials.

#### Acceptance Criteria

1. WHEN an authorized user with Instructor or Administrator role navigates to the AI Content Studio, THE Admin_Dashboard SHALL present an input form with fields for: Grammar Topic (text, maximum 100 characters), Target CEFR Level (select A1-C2), Difficulty (1-5 scale), Learning Goal (text, maximum 300 characters), and Context (select: Business, Travel, Daily Life, Interview)
2. WHEN an authorized user submits the AI content generation form with all required fields filled, THE AI_Content_Studio SHALL send the parameters to the AI generation service and display a loading state with a visible progress indicator within 1 second of submission
3. WHEN the AI generation completes, THE AI_Content_Studio SHALL display the generated content organized into sections: Lesson Explanation (1 section), Examples (minimum 3, maximum 10), Exercises with grammar blocks (minimum 3, maximum 10), Grammar Tips (minimum 2, maximum 5), Common Mistakes (minimum 2, maximum 5), Assessment Questions (minimum 3, maximum 10), and a Placement Challenge section (1 section)
4. THE AI_Content_Studio SHALL provide inline editing capability for all generated content sections, allowing the instructor to modify text, add or remove exercises, reorder items within a section, and adjust grammar blocks before saving
5. WHEN an authorized user clicks "Save to Lesson", THE AI_Content_Studio SHALL persist the edited content as a new Lesson with associated Exercises and Grammar Blocks in the database and display a success confirmation message within 5 seconds of the click
6. IF the AI generation service fails or times out after 30 seconds, THEN THE AI_Content_Studio SHALL display an error message indicating the failure reason and provide a "Retry" button that resubmits the same parameters without requiring the user to re-enter form values
7. IF the AI content generation form is submitted with any required field empty, THEN THE AI_Content_Studio SHALL display field-level validation errors indicating which fields are required without clearing already-filled fields
8. IF the "Save to Lesson" operation fails, THEN THE AI_Content_Studio SHALL display an error message indicating the save failure reason and retain the edited content so the user can retry without data loss

### Requirement 10: Placement Challenge Management

**User Story:** As an instructor, I want to create and configure adaptive placement assessments, so that students are accurately placed at their correct CEFR level.

#### Acceptance Criteria

1. WHEN an authorized user navigates to the Challenges section, THE Admin_Dashboard SHALL display all placement challenges with their title, target CEFR level, grammar topics covered, number of questions, status (Published/Draft), and creation date
2. WHEN an authorized user creates a new Placement Challenge, THE Admin_Dashboard SHALL present a configuration form with fields for: Title (maximum 150 characters), Target Level (select A1-C2), Grammar Topics (multi-select from available topics), Difficulty (1-5 scale), Exercise Types to include (multi-select from available types), and Number of Questions (integer, minimum 5, maximum 50)
3. WHEN an authorized user clicks "Generate with AI", THE Admin_Dashboard SHALL send the configuration to the AI generation service, display a loading state with a progress indicator, and present the generated questions for review within 30 seconds or trigger the failure handling defined in criterion 8
4. WHEN the AI generation completes, THE Admin_Dashboard SHALL display the generated assessment questions in an editable list, allowing the instructor to modify question text, adjust grammar blocks, add or remove individual questions, and designate correct answers before publishing
5. THE Admin_Dashboard SHALL provide a Preview mode that renders the placement challenge as a student would experience it, presenting questions sequentially with Previous and Next navigation buttons and a question progress indicator showing the current question number out of total questions
6. WHEN an authorized user publishes a Placement Challenge, THE Admin_Dashboard SHALL validate that the challenge contains at least the configured number of questions and all questions have correct answers designated, and display the challenge list with the status updated to Published
7. IF a Placement Challenge fails publish validation, THEN THE Admin_Dashboard SHALL display field-level validation errors indicating which questions lack correct answers or that the question count is below the configured minimum, and prevent status change to Published
8. IF a Placement Challenge generation fails or times out after 30 seconds, THEN THE Admin_Dashboard SHALL display an error notification indicating the failure reason and preserve the configuration form state with all entered values for retry

### Requirement 11: Analytics Dashboard

**User Story:** As an administrator, I want comprehensive visual analytics, so that I can make data-driven decisions about content and student support.

#### Acceptance Criteria

1. WHEN an authorized user navigates to the Analytics section, THE Analytics_Engine SHALL display charts for: Student Growth (line chart, over time), Lesson Completion Rate (bar chart, by learning path), Grammar Error Distribution (pie chart, by error type), and Most Difficult Lessons (ranked bar chart, by failure rate), where each chart supports hover interaction to reveal data point details
2. WHEN an authorized user navigates to the Analytics section, THE Analytics_Engine SHALL display charts for: Average Grammar Score Trend (line chart, over time), Challenge Pass Rate (bar chart, by CEFR level), Student Retention (cohort chart, by week), and Daily Active Users (area chart, last 30 days)
3. WHEN an authorized user navigates to the Analytics section, THE Analytics_Engine SHALL display a Learning Activity Heatmap showing student activity intensity by day of week (7 columns) and hour of day (24 rows) for the currently selected date range filter
4. THE Admin_Dashboard SHALL provide date range filters (Last 7 days, Last 30 days, Last 90 days, Custom range with a maximum span of 365 days) that apply to all analytics charts simultaneously, with "Last 30 days" selected by default on initial page load
5. WHEN an authorized user hovers over a chart data point, THE Analytics_Engine SHALL display a tooltip showing the exact numeric value, the associated date or category label, and the percentage change from the previous data point where applicable
6. IF the Analytics_Engine has insufficient data to render a chart (fewer than 2 data points), THEN THE Admin_Dashboard SHALL display that chart area with an empty state message indicating more data is needed and the minimum data threshold required
7. WHEN a date range filter is applied, THE Analytics_Engine SHALL update all visible charts to reflect the selected range within 3 seconds

### Requirement 12: AI-Powered Insights

**User Story:** As an administrator, I want AI-generated learning insights, so that I can identify patterns and take proactive action to improve student outcomes.

#### Acceptance Criteria

1. THE Analytics_Engine SHALL generate AI-powered insight cards that identify patterns in student performance data, displaying each insight with a title (maximum 100 characters), description (maximum 300 characters), affected student count, and a single suggested action
2. WHEN the Analytics_Engine detects that more than 30 percent of students at a CEFR level score below 60 percent on a specific grammar topic over the most recent 7-day period, THE Analytics_Engine SHALL generate an insight recommending additional content or exercises for that topic
3. THE Admin_Dashboard SHALL display AI insight cards in a dedicated section within Analytics, sorted by priority: high (more than 50 affected students), medium (21 to 50 affected students), and low (1 to 20 affected students)
4. WHEN an authorized user clicks "Take Action" on a content-gap insight, THE Admin_Dashboard SHALL navigate to the AI Content Studio pre-filled with the identified topic
5. WHEN an authorized user clicks "Take Action" on a student-performance insight, THE Admin_Dashboard SHALL navigate to the Student list filtered by the affected student group
6. THE Analytics_Engine SHALL refresh AI insights once every 24 hours and display the last successful refresh timestamp in the insights section
7. IF the Analytics_Engine has fewer than 10 students with activity data at a given CEFR level, THEN THE Analytics_Engine SHALL not generate insights for that level and SHALL display a message indicating insufficient data
8. IF no AI insights are available after the most recent refresh, THEN THE Admin_Dashboard SHALL display an empty state indicating that no actionable patterns were detected

### Requirement 13: Achievements and Gamification Management

**User Story:** As an administrator, I want to manage achievements and badges, so that I can motivate students through gamification.

#### Acceptance Criteria

1. WHEN an authorized user navigates to the Achievements section, THE Admin_Dashboard SHALL display all configured achievements with their badge icon, title, description, trigger criteria with threshold value, XP reward, and unlock count (number of students who earned it)
2. WHEN an authorized user creates a new Achievement, THE Admin_Dashboard SHALL present a form with fields for: Title (maximum 100 characters), Description (maximum 300 characters), Badge Icon (image upload accepting PNG or SVG up to 512 KB, or emoji selector), XP Reward (positive integer, maximum 10,000), Trigger Criteria (select from predefined triggers: lessons completed count, streak days, grammar score threshold, challenge passed, exercises completed count), and a Threshold Value input (positive integer specifying the numeric target for the selected trigger)
3. WHEN an authorized user edits an existing Achievement, THE Admin_Dashboard SHALL pre-populate the form with current values and preserve the existing unlock count without modification
4. THE Admin_Dashboard SHALL display a preview of how the achievement badge appears to students in both unlocked and locked states within the achievement creation and edit form
5. IF an Achievement creation or edit form is submitted with an empty title, no trigger criteria selected, or no threshold value specified, THEN THE Admin_Dashboard SHALL display inline validation errors adjacent to the invalid fields and prevent submission
6. WHEN an authorized user deletes an Achievement, THE Admin_Dashboard SHALL display a confirmation dialog showing the number of students who have already unlocked it and require explicit confirmation before deletion
7. WHEN an authorized user confirms deletion of an Achievement, THE Admin_Dashboard SHALL remove the achievement from the system while preserving the XP already awarded to students who previously unlocked it

### Requirement 14: Platform Settings

**User Story:** As an administrator, I want to configure platform-wide settings, so that I can customize the platform's branding, AI behavior, and scoring rules.

#### Acceptance Criteria

1. WHEN an Administrator navigates to the Settings section, THE Admin_Dashboard SHALL display configuration panels for: Brand (Logo upload accepting PNG or SVG files up to 2 MB, Theme colors, Language), AI Model selection, CEFR Configuration, Scoring Rules, Role permissions, and Notification preferences
2. WHEN an Administrator updates brand settings, THE Admin_Dashboard SHALL provide a live preview showing the updated logo, theme colors, and language selection before saving, and apply saved changes platform-wide within 5 seconds
3. WHEN an Administrator modifies Scoring Rules, THE Admin_Dashboard SHALL present configurable fields for: XP per exercise completed (integer between 1 and 1000), XP per lesson completed (integer between 1 and 10000), score weighting by exercise type (percentage per type, where all weights must sum to 100), and passing threshold percentage (integer between 50 and 100)
4. WHEN an Administrator saves Settings changes, THE Admin_Dashboard SHALL persist the configuration to the database and display a success notification that auto-dismisses after 3 seconds
5. IF a Settings save operation fails, THEN THE Admin_Dashboard SHALL display an error notification with the failure reason and preserve the modified form state so the Administrator can retry without re-entering data
6. IF an Administrator submits a Settings form with any field value outside its permitted range or with a required field empty, THEN THE Admin_Dashboard SHALL display inline validation errors for each invalid field and prevent submission
7. WHEN an Administrator has unsaved changes in any Settings panel and attempts to navigate away, THE Admin_Dashboard SHALL display a confirmation dialog warning that unsaved changes will be lost and offering options to save, discard, or cancel navigation

### Requirement 15: Notification System

**User Story:** As an administrator, I want real-time notifications about platform events, so that I can stay informed and respond to important activities.

#### Acceptance Criteria

1. THE Notification_Center SHALL display a bell icon in the top navigation with a numeric badge indicating the count of unread notifications, capped at displaying "99+" for counts exceeding 99
2. WHEN an authorized user clicks the Notification_Center icon, THE Admin_Dashboard SHALL display a dropdown panel listing the 50 most recent notifications in reverse chronological order with: event type icon, title, description (maximum 120 characters), relative timestamp, and read/unread indicator
3. WHEN a platform event occurs (new student registration, placement challenge completion, AI content generation completion, system error, or AI-generated insight), THE Notification_Center SHALL deliver a notification to the administrator within 10 seconds of the event
4. WHEN an authorized user clicks a notification, THE Admin_Dashboard SHALL mark the notification as read and navigate to the relevant context (student profile for registrations, generated content for AI completions, analytics insight for AI-generated insights, or system status for errors)
5. WHEN an authorized user clicks the "Mark All as Read" action, THE Notification_Center SHALL set all current notifications to read status and update the badge count to zero
6. IF the notification service is unavailable, THEN THE Notification_Center SHALL display the bell icon without a badge and show a message indicating notifications are temporarily unavailable when clicked
7. THE Notification_Center SHALL retain notifications for a maximum of 90 days, after which they are automatically removed from the notification list

### Requirement 16: Search Functionality

**User Story:** As an administrator, I want a global search, so that I can quickly find students, lessons, exercises, or any content across the platform.

#### Acceptance Criteria

1. WHEN an authorized user activates the global search (via the search input in the top navigation or keyboard shortcut Ctrl+K / Cmd+K), THE Admin_Dashboard SHALL display a search modal with a text input and categorized results
2. WHEN an authorized user types at least 2 characters in the global search, THE Admin_Dashboard SHALL display results grouped by category (Students, Learning Paths, Lessons, Exercises, Challenges) within 500 milliseconds of the last keystroke
3. THE Admin_Dashboard SHALL display a maximum of 5 results per category in the search modal, with a "View All" link for categories with more results
4. WHEN an authorized user selects a search result, THE Admin_Dashboard SHALL navigate to the detail view of the selected item and close the search modal
5. IF the global search returns no results, THEN THE Admin_Dashboard SHALL display an empty state with the message "No results found" and suggest checking the spelling or trying different keywords

### Requirement 17: Responsive Design and Accessibility

**User Story:** As an administrator, I want the dashboard to be accessible and responsive, so that I can manage the platform from different devices and ensure all users can interact with it.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL maintain full functionality on viewport widths from 1024 pixels and above (desktop-first), with graceful degradation on tablet viewports (768-1023 pixels) that collapses the sidebar and adjusts grid layouts to a single-column layout
2. THE Admin_Dashboard SHALL meet WCAG 2.1 Level AA compliance including: sufficient color contrast ratios (minimum 4.5:1 for normal text, 3:1 for large text), keyboard navigation for all interactive elements, ARIA labels on all icon-only buttons, and visible focus indicators (minimum 2px outline) on all focusable elements
3. THE Admin_Dashboard SHALL apply the design system consistently: rounded cards with 12px border radius, soft box shadows (0 2px 8px rgba(0,0,0,0.08)), blue-to-purple gradient accents for primary actions, and smooth transitions (200ms ease-in-out) on interactive state changes
4. THE Admin_Dashboard SHALL render empty states with an illustration, a descriptive message, and a primary call-to-action button for all list views when no data exists
5. IF an error occurs during page rendering, THEN THE Admin_Dashboard SHALL display an error boundary component with a descriptive message and a "Reload" button rather than an unhandled crash
6. THE Admin_Dashboard SHALL ensure all form inputs have associated visible labels or placeholder text, and all error messages are programmatically associated with their respective fields via aria-describedby

### Requirement 18: Design System Components

**User Story:** As a developer, I want a consistent design system, so that the dashboard maintains visual coherence and components are reusable across all sections.

#### Acceptance Criteria

1. THE Design_System SHALL provide the following independently importable components: DashboardCard, MetricCard, ChartCard, StudentTable, ProgressBar, GrammarRadar, Timeline, LessonEditor, ExerciseBuilder, AIInsightCard, ChallengeBuilder, ProfileCard, AchievementBadge, SearchBar, FilterPanel, and NotificationCenter, where each component renders without requiring parent-specific context beyond its declared props
2. THE Design_System SHALL implement each component with: TypeScript interfaces for all props, visual states for default, hover, active, and focus-visible, a loading skeleton variant matching the component's content dimensions, a dark mode variant, and responsive layouts for mobile (viewport width ≤640px), tablet (viewport width ≤1024px), and desktop (viewport width >1024px) that render without horizontal overflow at each breakpoint
3. THE MetricCard component SHALL accept: title (string, maximum 50 characters), value (string or number), change percentage (number between -100 and 9999), trend direction (up or down), and icon (React node), and render them in a card with the trend color-coded using colors that meet WCAG 2.1 AA contrast ratio (4.5:1 minimum) in both light and dark mode, with green indicating positive and red indicating negative trends
4. THE ChartCard component SHALL accept: title (string, maximum 80 characters), chart type (line, bar, pie, area, or heatmap), data array (1 to 1000 data points), and optional date range filter, rendering the chart using Recharts with the design system's color palette and typography tokens applied to all chart labels, legends, and axes
5. THE StudentTable component SHALL accept: student data array, column configuration, sort state, filter state, and pagination state (page size configurable from 10 to 50 rows, default 10), and render a table with sticky headers, row hover highlighting, and horizontal scrolling with a sticky first column at viewports ≤640px
6. IF a component receives an empty data array or undefined optional props, THEN THE Design_System SHALL render the component in an empty state displaying a placeholder message indicating no data is available, without throwing runtime errors
7. THE Design_System SHALL ensure all interactive components include accessible labels via aria-label or aria-labelledby attributes, support keyboard navigation with visible focus indicators, and associate any status or trend information with aria-live regions or descriptive text for screen readers
