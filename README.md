# WordPal — Build English, Block by Block

A gamified English sentence-building app where learners drag and drop color-coded grammar blocks to construct sentences. Features AI-powered feedback via Amazon Bedrock and progress tracking with Supabase.

Built for the **Hackathon Kiro**.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Data Architecture](#data-architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Routes](#routes)
- [How the App Works](#how-the-app-works)
- [Adding New Lessons](#adding-new-lessons)

---

## Overview

WordPal teaches English grammar through interactive sentence construction. Users arrange grammar blocks (subject, verb, object, modifier, time, place, contrast) in the correct order. Each block is color-coded by category, making sentence structure intuitive and visual.

The app progresses through three levels:
- **Beginner** — Basic syntax (Subject + Verb + Object + Time/Place)
- **Intermediate** — Tone and nuance (adverb placement, emotional coloring)
- **Advanced** — Rhetorical structure (contrast, concession, participial phrases, parallel construction)

---

## Features

- **Drag-and-drop sentence building** using @dnd-kit (touch and pointer support)
- **Color-coded grammar blocks** — each category has a distinct color
- **Distractor blocks** — incorrect options mixed in to test understanding
- **AI-powered feedback** — Amazon Bedrock provides intelligent explanations
- **Tutor explanations** — pre-written explanations in Spanish for beginner levels
- **Learning path** — sequential lesson progression with unlock gates
- **Placement challenges** — AI challenges to unlock the next level
- **Progress persistence** — localStorage (client-side) + Supabase (server-side)
- **Authentication** — Supabase Auth with email/password
- **Protected routes** — middleware guards dashboard, progress, and leaderboard pages
- **Responsive design** — works on desktop and mobile

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| UI | React 19, Tailwind CSS 4, Lucide icons |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| Auth & DB | Supabase (Auth + PostgreSQL) |
| AI | AWS Amazon Bedrock |
| Styling | Tailwind CSS + class-variance-authority + tailwind-merge |
| Testing | fast-check (property-based testing) |

---

## Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Landing page (marketing)
│   ├── layout.tsx                # Root layout (AuthProvider)
│   ├── demo/page.tsx             # Main interactive learning page
│   ├── auth/
│   │   ├── signin/page.tsx       # Sign-in form
│   │   └── register/page.tsx     # Registration form
│   └── (protected)/              # Auth-gated route group
│       ├── layout.tsx            # Protected layout wrapper
│       ├── dashboard/page.tsx    # User dashboard
│       ├── progress/page.tsx     # Progress tracking
│       └── leaderboard/page.tsx  # Leaderboard
│
├── components/
│   ├── exercise/                 # Core exercise UI
│   │   ├── DraggableBlock.tsx    # Individual grammar block (draggable)
│   │   ├── SentenceCanvas.tsx    # Drop zone for building sentences
│   │   ├── AvailableBlocks.tsx   # Pool of blocks to choose from
│   │   └── SentencePreview.tsx   # Live text preview of sentence
│   ├── auth/                     # Auth forms
│   ├── layout/                   # NavBar, PageContainer
│   └── ui/                       # Reusable UI primitives (shadcn)
│
├── contexts/
│   ├── AuthContext.tsx           # Supabase auth state management
│   └── ExerciseContext.tsx       # Exercise state reducer (place/remove/reorder/submit)
│
├── data/                         # Static lesson content (no DB required)
│   ├── learning-path.ts          # 7 lessons with exercises + tutor explanations
│   ├── demo-sentences.ts         # Demo page sentences by difficulty
│   ├── lessons.json              # Alternate lesson format (JSON)
│   └── placement-challenges.ts   # Level-gate challenge exercises
│
├── lib/
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAuth.ts            # Auth hook (wraps AuthContext)
│   │   └── useExercise.ts        # Exercise hook (wraps ExerciseContext)
│   └── services/
│       ├── supabase-browser.ts   # Browser-side Supabase client
│       └── supabase-server.ts    # Server-side Supabase client
│
└── types/
    └── database.ts               # Supabase database type definitions

middleware.ts                      # Auth middleware for protected routes
```

---

## Data Architecture

### Static Content (bundled with the app)

All lesson content is stored in TypeScript/JSON files under `src/data/`. No database is needed to serve exercises — they ship with the frontend bundle.

| File | Description |
|------|-------------|
| `learning-path.ts` | The primary learning path with 7 lessons across 3 levels. Each exercise includes target sentence, hint, tutor explanation (in Spanish for beginners), and grammar blocks |
| `demo-sentences.ts` | Sentences for the standalone demo page, organized by difficulty |
| `lessons.json` | Alternate JSON-based lesson format (Simple Present, Simple Past, Questions) |
| `placement-challenges.ts` | Challenge exercises that gate level transitions. Pass 3/4 to unlock the next level |

### Grammar Block Schema

Every exercise uses blocks with this structure:

```typescript
interface GrammarBlock {
  id: string           // Unique identifier (e.g., 'l1-e1-1')
  label: string        // Text displayed on the block (e.g., 'The cat')
  category: 'subject' | 'verb' | 'object' | 'modifier' | 'time' | 'place' | 'contrast'
  isDistractor: boolean // true = wrong answer, shouldn't be in the sentence
  sourceOrder: number   // Original position (for resetting)
}
```

### Dynamic Data (Supabase)

User-specific data is stored in Supabase PostgreSQL:

| Table | Purpose |
|-------|---------|
| `users` | User profiles (id, email, display_name) |
| `lessons` | Lesson metadata (mirrors static data for future DB-driven approach) |
| `exercises` | Exercise metadata linked to lessons |
| `exercise_blocks` | Individual grammar blocks per exercise |
| `user_progress` | **Lesson records** — score, completed, attempts, timestamps per user per exercise |

### Client-Side Persistence

For the demo (no auth), progress is saved to `localStorage` under the key `wordpal-progress`:

```json
{
  "lessons": { "lesson-1": 3, "lesson-2": 1 },
  "challengesPassed": ["challenge-beginner-passed"]
}
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

```bash
git clone <repository-url>
cd Kiro_projects
npm install
```

### Configuration

Copy the environment example file:

```bash
cp .env.example .env.local
```

Fill in your credentials (see [Environment Variables](#environment-variables)).

### Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Note:** The app works without Supabase or AWS credentials. The demo page (`/demo`) uses local data and localStorage. Auth and AI features require the environment variables to be configured.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | For auth/progress | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For auth/progress | Your Supabase anonymous key |
| `AWS_REGION` | For AI feedback | AWS region (default: `us-east-1`) |
| `AWS_ACCESS_KEY_ID` | For AI feedback | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | For AI feedback | AWS secret key |

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Serve production build |
| `npm run lint` | Run ESLint |

---

## Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Landing page with feature highlights |
| `/demo` | Public | Main interactive learning experience (learning path + exercises) |
| `/auth/signin` | Public | Sign-in form |
| `/auth/register` | Public | Registration form |
| `/dashboard` | Protected | User dashboard |
| `/progress` | Protected | Detailed progress tracking |
| `/leaderboard` | Protected | Competitive leaderboard |

Protected routes redirect to `/auth/signin` if the user is not authenticated.

---

## How the App Works

### Learning Flow

1. **User opens `/demo`** → sees the Learning Path (list of lessons as a vertical timeline)
2. **Lessons unlock sequentially** — must complete the previous lesson first
3. **Each lesson has 3 exercises** — drag blocks to form the target sentence
4. **On check:** app compares the assembled sentence to the target. Incorrect blocks are highlighted.
5. **Tutor explanation** appears on wrong answers (in Spanish for beginners)
6. **After completing all lessons in a level** → a Celebration screen appears
7. **Placement Challenge** — pass 3/4 questions to unlock the next level
8. **Progress persists** via localStorage

### Exercise Mechanics

- Blocks appear shuffled in the "Available Blocks" area
- Tap or drag a block to place it on the Sentence Canvas
- Tap a placed block to remove it back to available
- Reorder by dragging within the canvas
- Maximum 15 blocks on canvas at once
- Distractor blocks are included as wrong answers

### AI Integration

The app calls `/api/feedback` (POST) with the user's sentence for AI evaluation:
- Uses Amazon Bedrock for intelligent grammar feedback
- Hints available via `/api/hints` (max 2 per exercise)
- Falls back gracefully if AWS is not configured

---

## Adding New Lessons

To add a new lesson to the learning path, edit `src/data/learning-path.ts`:

```typescript
{
  id: 'lesson-8',
  title: 'Your Lesson Title',
  description: 'Short description',
  level: 'beginner', // or 'intermediate' or 'advanced'
  icon: '📚',
  exercises: [
    {
      id: 'l8-e1',
      targetSentence: 'The correct sentence here',
      hint: 'Pattern hint shown to user',
      tutorExplanation: 'Explanation shown on wrong answer',
      blocks: [
        { id: 'l8-e1-1', label: 'The correct', category: 'subject', isDistractor: false, sourceOrder: 1 },
        { id: 'l8-e1-2', label: 'sentence here', category: 'verb', isDistractor: false, sourceOrder: 2 },
        { id: 'l8-e1-3', label: 'wrong option', category: 'verb', isDistractor: true, sourceOrder: 3 },
      ],
    },
  ],
}
```

Key rules:
- Non-distractor blocks joined with spaces must equal `targetSentence` exactly
- Use `isDistractor: true` for wrong-answer blocks
- `sourceOrder` determines the reset/sort order (not display order — blocks are shuffled)
- Block `id` format: `{lesson}-{exercise}-{block number}`
