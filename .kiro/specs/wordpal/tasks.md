# Implementation Plan: WordPal

## Overview

WordPal is a gamified English sentence-building web app using drag-and-drop grammar blocks with AI-powered feedback. This plan implements the feature incrementally starting with project scaffolding, core types, and infrastructure, building up through the drag-and-drop engine, AI integration, lesson structure, and finally polish and optional stretch features.

**Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, @dnd-kit/core, Supabase (Auth + Postgres), Amazon Bedrock (Claude Haiku)

## Tasks

- [x] 1. Project initialization and configuration
  - [x] 1.1 Initialize Next.js 15 project with TypeScript, Tailwind CSS, and App Router
    - Run `create-next-app` with TypeScript and Tailwind enabled
    - Install core dependencies: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `@supabase/supabase-js`, `@supabase/auth-helpers-nextjs`, `@aws-sdk/client-bedrock-runtime`, `fast-check` (dev)
    - Install shadcn/ui and initialize with default config
    - Configure `tsconfig.json` path aliases (`@/` → `src/`)
    - Create `.env.example` with placeholders for `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
    - _Requirements: 6.1_

  - [x] 1.2 Set up project folder structure and TypeScript types
    - Create directory structure matching the design: `src/app`, `src/components/{ui,exercise,dashboard,auth,layout,leaderboard}`, `src/lib/{services,utils,hooks}`, `src/contexts`, `src/types`, `src/data`, `tests/{properties,unit,integration}`
    - Create type files: `src/types/index.ts`, `src/types/exercise.ts`, `src/types/feedback.ts`, `src/types/progress.ts`
    - Define all interfaces from the design: `GrammarBlock`, `Exercise`, `FeedbackResponse`, `CanvasState`, `FeedbackRequest`, `ProgressUpdateRequest`, `ProgressResponse`, `HintRequest`, `HintResponse`, `ExerciseState`, `ExerciseAction`
    - _Requirements: 1.1, 1.2, 2.1, 3.1, 5.1_

  - [x] 1.3 Configure Tailwind theme with design system tokens
    - Extend `tailwind.config.ts` with block colors (subject blue, verb red, object green, modifier yellow), surface colors, accent colors per the design color palette
    - Add font family configuration (Inter, Cal Sans)
    - Add custom animations: block-pickup, block-drop, feedback-fade-in, success-celebration, progress-fill, shake-error, skeleton-pulse
    - Configure border radius tokens and shadow presets
    - Set up `src/app/globals.css` with Tailwind directives and CSS custom properties
    - _Requirements: 6.1, 6.3, 6.5, 6.6_


- [x] 2. Supabase setup and database schema
  - [x] 2.1 Configure Supabase client libraries
    - Create `src/lib/services/supabase-server.ts` with server-side Supabase client using `createServerClient` from `@supabase/ssr`
    - Create `src/lib/services/supabase-browser.ts` with browser-side Supabase client using `createBrowserClient`
    - Set up proper cookie handling for Next.js 15 App Router
    - _Requirements: 4.5, 5.1_

  - [x] 2.2 Create database schema SQL and seed data
    - Create `supabase/schema.sql` with full DDL from the design (users, lessons, exercises, exercise_blocks, user_progress tables)
    - Include indexes, RLS policies, and triggers (update_updated_at, handle_new_user)
    - Create `src/data/lessons.json` with seed data for 3 lessons (Simple Present, Simple Past, Questions) each containing 5 exercises with grammar blocks and distractor blocks
    - Create `supabase/seed.sql` to insert lesson and exercise data from the JSON into Supabase tables
    - _Requirements: 3.1, 3.2, 3.5_

- [x] 3. Authentication
  - [x] 3.1 Implement AuthContext and auth hooks
    - Create `src/contexts/AuthContext.tsx` with `AuthProvider` wrapping Supabase auth state
    - Implement `signIn`, `signUp`, `signOut` methods in the context
    - Create `src/lib/hooks/useAuth.ts` that exposes context value
    - Handle `onAuthStateChange` subscription for session updates
    - Provide `loading` state for skeleton UIs during session restoration
    - _Requirements: 4.1, 4.2, 4.5, 4.6_

  - [x] 3.2 Create auth middleware for protected routes
    - Create `middleware.ts` at project root
    - Redirect unauthenticated users to `/auth/signin` for protected routes (`/dashboard`, `/lessons`, `/progress`, `/leaderboard`)
    - Allow public access to `/`, `/auth/signin`, `/auth/register`
    - Preserve intended route for post-login redirect
    - _Requirements: 4.3_

  - [x] 3.3 Build Sign In and Register pages
    - Create `src/components/auth/SignInForm.tsx` with email/password fields, validation (8+ char password), error display
    - Create `src/components/auth/RegisterForm.tsx` with email, display name, password fields, validation
    - Create `src/app/auth/signin/page.tsx` and `src/app/auth/register/page.tsx`
    - Display generic error "Email or password is incorrect" for failed auth (never reveal which field is wrong)
    - Display "This email is already in use" for duplicate registration
    - Redirect to `/dashboard` on successful auth
    - _Requirements: 4.1, 4.2, 4.4, 4.6, 4.7_

  - [ ]* 3.4 Write unit tests for auth error handling
    - Test generic error message for invalid credentials
    - Test duplicate email error message
    - Test password length validation (minimum 8 characters)
    - _Requirements: 4.4, 4.7_

- [x] 4. Layout components and navigation
  - [x] 4.1 Build NavBar and PageContainer layout components
    - Create `src/components/layout/NavBar.tsx` with logo, navigation links (Home, Progress, Leaderboard), Sign Out button
    - Implement responsive behavior: full nav on desktop (≥1024px), hamburger menu on tablet (768px–1023px)
    - Create `src/components/layout/PageContainer.tsx` with max-width container (1200px) and consistent padding
    - Create `src/app/layout.tsx` root layout wrapping with `AuthProvider`, `ProgressProvider`, NavBar, and main content area
    - _Requirements: 6.2, 6.6_


- [x] 5. Landing page
  - [x] 5.1 Build the branded landing page
    - Create `src/app/page.tsx` with hero section: WordPal logo, tagline "Build English, Block by Block", primary CTA button "Start Learning"
    - Add animated demo blocks showing color-coded grammar blocks (subject blue, verb red, object green, modifier yellow)
    - Add feature highlights section (AI Feedback, Progress Tracking, Gamification)
    - CTA button navigates to `/dashboard` (or `/auth/signin` if unauthenticated)
    - Apply design typography (Cal Sans display font for heading, Inter for body)
    - _Requirements: 6.4, 6.6_

- [x] 6. Checkpoint - Foundation verification
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Core drag-and-drop engine
  - [x] 7.1 Implement DraggableBlock component
    - Create `src/components/exercise/DraggableBlock.tsx` using `@dnd-kit/core` useDraggable hook
    - Apply color-coding based on block category: subject (#3B82F6), verb (#EF4444), object (#22C55E), modifier (#F59E0B)
    - Add drag animation: `scale(1.05)`, `shadow-xl`, `opacity(0.9)` on pickup (150ms ease-out)
    - Add drop animation: `scale(1.0)`, position snap (200ms ease-in-out)
    - Support tap-to-place on touch devices (click handler appends block to canvas end)
    - Show shake animation for blocks flagged as incorrect
    - Ensure minimum touch target of 44×44px
    - _Requirements: 1.1, 1.2, 1.3, 1.6, 6.3_

  - [x] 7.2 Implement SentenceCanvas drop zone
    - Create `src/components/exercise/SentenceCanvas.tsx` using `@dnd-kit/core` useDroppable hook
    - Accept dropped blocks and insert at the horizontal drop position relative to existing blocks
    - Support reordering blocks within the canvas via drag
    - Handle block removal: double-click or drag back to available area returns block to pool
    - Enforce 15-block maximum limit with error message when exceeded
    - Cancel drag operation if block dropped outside canvas boundaries (return to original position)
    - Minimum canvas height 120px, flexbox with wrap for placed blocks
    - _Requirements: 1.1, 1.3, 1.7, 1.8_

  - [x] 7.3 Implement AvailableBlocks component
    - Create `src/components/exercise/AvailableBlocks.tsx` displaying pool of unplaced grammar blocks
    - Blocks returned from canvas appear in their original source_order position
    - Apply same color-coding and styling as canvas blocks
    - _Requirements: 1.4_

  - [x] 7.4 Implement SentencePreview component
    - Create `src/components/exercise/SentencePreview.tsx` displaying constructed sentence text
    - Concatenate block labels in left-to-right canvas order separated by spaces
    - Update within 100ms of any block drop/reorder completing
    - Show above the Sentence Canvas
    - _Requirements: 1.3, 1.5_

  - [ ]* 7.5 Write property tests for canvas logic (Properties 1-4)
    - **Property 1: Block insertion preserves relative order** — For any ordered list of blocks and valid insertion index, inserting a new block results in correct placement with original blocks maintaining relative order
    - **Validates: Requirements 1.1**
    - **Property 2: Tap-to-place appends block at end** — For any canvas with N < 15 blocks, tapping an available block results in N+1 blocks with tapped block at index N
    - **Validates: Requirements 1.6**
    - **Property 3: Block removal round-trip** — Removing a block from canvas decreases canvas length by 1 and block appears in available pool
    - **Validates: Requirements 1.4**
    - **Property 4: Sentence preview is ordered label concatenation** — For any non-empty canvas, preview equals labels joined by single spaces in left-to-right order
    - **Validates: Requirements 1.3, 1.5**


- [x] 8. Exercise state management
  - [x] 8.1 Implement ExerciseContext and reducer
    - Create `src/contexts/ExerciseContext.tsx` with `ExerciseProvider` component
    - Implement `exerciseReducer` handling actions: `PLACE_BLOCK`, `REMOVE_BLOCK`, `REORDER_BLOCKS`, `SUBMIT_START`, `SUBMIT_SUCCESS`, `SUBMIT_ERROR`, `USE_HINT`, `RESET`
    - `PLACE_BLOCK` moves block from available to canvas at specified index
    - `REMOVE_BLOCK` moves block from canvas back to available (respecting source_order)
    - `REORDER_BLOCKS` splices block from one canvas index to another
    - Create `src/lib/hooks/useExercise.ts` exposing context value
    - Create `src/lib/utils/sentence.ts` with sentence construction helpers (concatenation, validation)
    - Create `src/lib/utils/exercise.ts` with exercise state helpers (block positioning, incorrect block detection)
    - _Requirements: 1.1, 1.3, 1.4, 1.7, 3.7_

  - [ ]* 8.2 Write property test for input validation (Property 5)
    - **Property 5: Input length validation** — Empty strings and strings >200 chars are rejected; strings 1–200 chars are accepted
    - **Validates: Requirements 2.7**

  - [ ]* 8.3 Write property tests for exercise logic (Properties 6-9)
    - **Property 6: Exercise ordering invariant** — Each successive exercise requires equal or greater block count than the previous
    - **Validates: Requirements 3.2**
    - **Property 7: Exercise state machine transitions** — Completed exercises are contiguous from start, first incomplete is "available", rest are "locked"
    - **Validates: Requirements 3.3, 3.4, 3.8**
    - **Property 8: Block count invariant per exercise** — Total blocks = target sentence word count + distractor count (0–3)
    - **Validates: Requirements 3.5**
    - **Property 9: Incorrect block identification accuracy** — Blocks flagged as incorrect are exactly those whose position differs from target ordering
    - **Validates: Requirements 3.7**

- [ ] 9. Amazon Bedrock integration
  - [~] 9.1 Implement Bedrock service client and prompt templates
    - Create `src/lib/services/bedrock.ts` with `BedrockRuntimeClient` configuration
    - Implement `invokeBedrock` function with AbortController timeout (3000ms for feedback, 5000ms for hints)
    - Create feedback prompt template (system prompt + user prompt) as defined in design
    - Create hint prompt template (system prompt + user prompt) as defined in design
    - Implement `parseFeedbackResponse` with code fence stripping and field validation
    - Implement `parseHintResponse` with validation
    - Define `BedrockTimeoutError` and `BedrockServiceError` custom error classes
    - _Requirements: 2.1, 2.4, 2.6_

  - [~] 9.2 Create POST /api/feedback route handler
    - Create `src/app/api/feedback/route.ts`
    - Validate auth session (return 401 if missing)
    - Validate input: sentence must be 1–200 characters (return 400 if invalid)
    - Call Bedrock with feedback prompt template including user sentence and target sentence
    - Parse response and return `FeedbackResponse` JSON
    - On Bedrock timeout or error, return 503 with "AI feedback temporarily unavailable"
    - Keep CEFR B1 level feedback via prompt engineering
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [~] 9.3 Create POST /api/hints route handler
    - Create `src/app/api/hints/route.ts`
    - Validate auth session (return 401 if missing)
    - Validate request body: exerciseId, placedBlocks array, hintNumber (1 or 2)
    - Reject if hintNumber > 2 (return 429 "No hints remaining")
    - Look up exercise target sentence from database
    - Call Bedrock with hint prompt template
    - On Bedrock failure, return 503 and do NOT count as used hint
    - Return hint text and hintsRemaining count
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ]* 9.4 Write integration tests for feedback API
    - Mock Bedrock client to test success response parsing
    - Test 400 response for empty and oversized input
    - Test 503 response for Bedrock timeout
    - Test 401 response for unauthenticated requests
    - _Requirements: 2.1, 2.5, 2.7_

- [~] 10. Checkpoint - Core engine verification
  - Ensure all tests pass, ask the user if questions arise.


- [ ] 11. Exercise page (full exercise screen)
  - [~] 11.1 Build ExerciseHeader component
    - Create `src/components/exercise/ExerciseHeader.tsx` with back button, lesson title, exercise progress indicator (e.g., "3/5 ●●●○○")
    - _Requirements: 3.4_

  - [~] 11.2 Build FeedbackPanel component
    - Create `src/components/exercise/FeedbackPanel.tsx` handling states: idle, loading, success, error, service-unavailable
    - Show loading spinner/skeleton while AI processes request
    - Animate feedback appearance with fade-in transition (200–500ms)
    - Display success message (green, positive) or error with error type and suggested correction
    - Show retry button when service unavailable
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 6.5, 6.7_

  - [~] 11.3 Build SubmitButton and HintButton components
    - Create `src/components/exercise/SubmitButton.tsx` — triggers sentence submission via ExerciseContext
    - Create `src/components/exercise/HintButton.tsx` — requests hint, shows hint count remaining, disables when exhausted
    - Display message when hints exhausted: "No hints remain"
    - _Requirements: 7.1, 7.2, 7.3_

  - [~] 11.4 Assemble the full Exercise page
    - Create `src/app/lessons/[lessonId]/exercises/[exerciseId]/page.tsx`
    - Fetch exercise data (blocks, target sentence) from Supabase
    - Wrap in `ExerciseProvider` with fetched exercise data
    - Compose: ExerciseHeader, SentencePreview, SentenceCanvas, AvailableBlocks, ActionBar (Hint + Submit), FeedbackPanel
    - On correct answer: mark exercise complete, unlock next exercise, show celebration animation
    - On incorrect answer: flag incorrect blocks with shake animation, allow rearranging and resubmitting without limit
    - _Requirements: 1.1, 1.2, 1.3, 1.5, 2.1, 3.3, 3.4, 3.7, 6.3, 6.5_

- [ ] 12. Lesson structure and navigation
  - [~] 12.1 Build lesson pages and exercise list
    - Create `src/app/lessons/[lessonId]/page.tsx` showing exercise list with status indicators (locked 🔒, available, completed ✓)
    - First exercise set to "available" on first visit, rest "locked"
    - Completed exercises show checkmark, next incomplete shows as available
    - Fetch user progress to determine exercise statuses
    - _Requirements: 3.3, 3.4, 3.8_

  - [~] 12.2 Build lesson completion page
    - Create `src/app/lessons/[lessonId]/complete/page.tsx`
    - Display lesson completion summary: exercises completed on first attempt out of total exercises
    - Add celebration animation (confetti/success visual)
    - Provide navigation to next lesson or back to dashboard
    - _Requirements: 3.6_

  - [ ]* 12.3 Write property test for exercise state machine (Property 7)
    - **Property 7: Exercise state machine transitions** — Verify completed exercises contiguous from start, first incomplete is "available", rest "locked"; completing available transitions next from locked to available
    - **Validates: Requirements 3.3, 3.4, 3.8**

- [ ] 13. Progress tracking
  - [~] 13.1 Implement ProgressContext and progress utilities
    - Create `src/contexts/ProgressContext.tsx` with `ProgressProvider`
    - Implement `fetchProgress` (GET /api/progress), `recordCompletion` (POST /api/progress), `invalidate` methods
    - Create `src/lib/utils/progress.ts` with progress computation helpers (percentage calculation, next exercise derivation)
    - Implement optimistic update: update local state immediately on completion, then POST to API
    - On save failure: display error message "Your progress couldn't be saved. Please try again.", retain learner input for retry
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [~] 13.2 Create progress API routes
    - Create `src/app/api/progress/route.ts` with GET and POST handlers
    - GET: Join user_progress with exercises and lessons, compute percentages server-side, determine lastExerciseId (first incomplete exercise)
    - POST: Validate request body (exerciseId, lessonId, score 0–100), upsert on (user_id, exercise_id), increment attempts
    - Auth required on both endpoints
    - _Requirements: 5.1, 5.2, 5.3_

  - [~] 13.3 Build progress dashboard page
    - Create `src/app/progress/page.tsx` displaying all lessons with progress bars
    - Show lesson title, completed/total exercises count, percentage bar for each lesson
    - Show overall stats: total exercises completed, overall percentage
    - Use `ProgressBar` component with appropriate color scheme
    - _Requirements: 5.2, 5.4_

  - [~] 13.4 Build home dashboard page
    - Create `src/app/dashboard/page.tsx` with welcome message, "Continue Learning" card pointing to last incomplete exercise, and lesson grid showing all lessons with progress
    - Fetch progress data from ProgressContext
    - Show locked/unlocked status per lesson
    - _Requirements: 5.2, 5.3, 5.4_

  - [ ]* 13.5 Write property tests for progress computation (Properties 10-11)
    - **Property 10: Progress computation consistency** — Completed count equals records with completed=true, percentage equals round((completed/total)*100), bounded [0,100]
    - **Validates: Requirements 5.1, 5.2, 5.4**
    - **Property 11: Next exercise derivation** — Resume position points to first incomplete exercise by lesson order then exercise order; if all complete, points to last exercise
    - **Validates: Requirements 5.3**

- [~] 14. Checkpoint - Full feature verification
  - Ensure all tests pass, ask the user if questions arise.


- [ ] 15. Polish and animations
  - [~] 15.1 Add micro-animations and transitions
    - Implement page transitions (200ms ease-out fade + translateY)
    - Add button hover effects (scale 1.02, color shift, 150ms)
    - Add progress bar fill animation (500ms ease-in-out)
    - Add block insert animation (300ms spring, width expansion + fade-in)
    - Add success celebration animation (600ms confetti particles + scale bounce)
    - Add skeleton pulse loading states (1500ms ease-in-out opacity loop)
    - Ensure drag animations maintain 30fps minimum
    - _Requirements: 6.3, 6.5, 6.6_

  - [~] 15.2 Implement responsive layout polish
    - Verify and fix layout at 768px, 1024px, and 1920px breakpoints
    - Ensure no horizontal scrollbar, no overlapping elements, no meaning-hiding truncation
    - Enlarge touch targets to 44×44px minimum on tablet
    - Test canvas and block pool layout adaptations per breakpoint
    - _Requirements: 6.2_

- [ ] 16. Optional: Hint system refinement
  - [~] 16.1 Implement hint UI and state tracking
    - Wire HintButton to ExerciseContext `requestHint` method
    - Track hints used per exercise attempt in ExerciseState (max 2)
    - Display hint message in a callout below the canvas
    - Disable hint button and show "No hints remain" when 2 hints used
    - On hint generation failure, show "Hint unavailable right now" without decrementing count
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ]* 16.2 Write property test for hint count limit (Property 12)
    - **Property 12: Hint count limit invariant** — Number of successfully delivered hints never exceeds 2; after 2 delivered, all subsequent requests rejected
    - **Validates: Requirements 7.2**

- [ ] 17. Optional: Leaderboard
  - [~] 17.1 Create leaderboard API route and page
    - Create `src/app/api/leaderboard/route.ts` — aggregate user_progress where completed=true, group by user_id, count exercises, join with users for display_name
    - Order by count DESC, then earliest completed_at ASC for tie-breaking
    - Return top 10 entries plus current user's rank
    - Create `src/app/leaderboard/page.tsx` with `LeaderboardTable` component
    - Display rank, display name, exercises completed for each entry
    - Show current user's rank even if not in top 10
    - Cache-Control: `public, max-age=60`
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [ ]* 17.2 Write property tests for leaderboard (Properties 13-14)
    - **Property 13: Leaderboard sort order** — Entries sorted by exercises completed DESC, ties broken by earliest completion ASC
    - **Validates: Requirements 8.1**
    - **Property 14: Leaderboard score increment** — Exercise completion increases user's score by exactly 1
    - **Validates: Requirements 8.2**

- [ ] 18. Optional: Audio pronunciation
  - [~] 18.1 Add text-to-speech audio playback for correct sentences
    - Add play-audio button displayed after a correct sentence submission
    - Integrate with a TTS service (Web Speech API as MVP fallback, or AWS Polly via API route)
    - Play pronunciation within 5 seconds of activation
    - On TTS failure, show "Audio unavailable at the moment" and hide play button gracefully without blocking other functionality
    - _Requirements: 9.1, 9.2, 9.3_

- [~] 19. Final checkpoint - Complete integration verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- MVP-critical features (Requirements 1–6) are covered in tasks 1–15
- Optional/stretch features (Requirements 7–9) are in tasks 16–18
- The seed data in task 2.2 must satisfy Property 6 (exercises ordered by increasing block count) and Property 8 (block count = target words + 0–3 distractors)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["2.1", "2.2"] },
    { "id": 3, "tasks": ["3.1", "4.1", "5.1"] },
    { "id": 4, "tasks": ["3.2", "3.3", "3.4"] },
    { "id": 5, "tasks": ["7.1", "7.2", "7.3", "7.4", "8.1"] },
    { "id": 6, "tasks": ["7.5", "8.2", "8.3", "9.1"] },
    { "id": 7, "tasks": ["9.2", "9.3", "9.4"] },
    { "id": 8, "tasks": ["11.1", "11.2", "11.3"] },
    { "id": 9, "tasks": ["11.4", "12.1", "13.1", "13.2"] },
    { "id": 10, "tasks": ["12.2", "12.3", "13.3", "13.4", "13.5"] },
    { "id": 11, "tasks": ["15.1", "15.2"] },
    { "id": 12, "tasks": ["16.1", "16.2"] },
    { "id": 13, "tasks": ["17.1", "17.2"] },
    { "id": 14, "tasks": ["18.1"] }
  ]
}
```
