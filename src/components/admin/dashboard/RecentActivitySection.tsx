'use client';

import React from 'react';
import Link from 'next/link';
import { DashboardCard, DashboardCardEmpty } from '../design-system/DashboardCard';
import { Timeline } from '../design-system/Timeline';
import type { TimelineEvent } from '../design-system/Timeline';

// ─── Mock Activity Data ──────────────────────────────────────────────────────

/** Time offsets in ms for each mock event (relative to a fixed reference) */
const EVENT_OFFSETS: { id: string; offset: number; type: TimelineEvent['type']; title: string; description: string }[] = [
  { id: 'evt-1', offset: 5 * 60 * 1000, type: 'registration', title: 'New student registered', description: 'Maria García joined the platform' },
  { id: 'evt-2', offset: 22 * 60 * 1000, type: 'lesson_completed', title: 'Lesson completed', description: 'Carlos Méndez finished "Present Perfect Tense"' },
  { id: 'evt-3', offset: 1.5 * 60 * 60 * 1000, type: 'challenge_attempt', title: 'Placement challenge attempted', description: 'Ana Torres scored 85% on B1 challenge' },
  { id: 'evt-4', offset: 3 * 60 * 60 * 1000, type: 'achievement_unlock', title: 'Achievement unlocked', description: 'Pedro López earned "7-Day Streak" badge' },
  { id: 'evt-5', offset: 5 * 60 * 60 * 1000, type: 'lesson_completed', title: 'Lesson completed', description: 'Sofía Ruiz finished "Conditional Sentences"' },
  { id: 'evt-6', offset: 8 * 60 * 60 * 1000, type: 'registration', title: 'New student registered', description: 'Luis Fernández joined the platform' },
  { id: 'evt-7', offset: 12 * 60 * 60 * 1000, type: 'level_change', title: 'Level advancement', description: 'Elena Morales advanced from A2 to B1' },
  { id: 'evt-8', offset: 1 * 24 * 60 * 60 * 1000, type: 'challenge_attempt', title: 'Placement challenge attempted', description: 'Javier Díaz scored 72% on A2 challenge' },
  { id: 'evt-9', offset: 1.5 * 24 * 60 * 60 * 1000, type: 'lesson_completed', title: 'Lesson completed', description: 'Claudia Herrera finished "Relative Clauses"' },
  { id: 'evt-10', offset: 2 * 24 * 60 * 60 * 1000, type: 'achievement_unlock', title: 'Achievement unlocked', description: 'Martín Rivera earned "Grammar Master" badge' },
  { id: 'evt-11', offset: 2.5 * 24 * 60 * 60 * 1000, type: 'registration', title: 'New student registered', description: 'Isabella Navarro joined the platform' },
  { id: 'evt-12', offset: 3 * 24 * 60 * 60 * 1000, type: 'lesson_completed', title: 'Lesson completed', description: 'Andrés Vargas finished "Passive Voice"' },
  { id: 'evt-13', offset: 4 * 24 * 60 * 60 * 1000, type: 'level_change', title: 'Level advancement', description: 'Paula Ramos advanced from B1 to B2' },
  { id: 'evt-14', offset: 5 * 24 * 60 * 60 * 1000, type: 'challenge_attempt', title: 'Placement challenge attempted', description: 'Daniel Castro scored 91% on C1 challenge' },
  { id: 'evt-15', offset: 5.5 * 24 * 60 * 60 * 1000, type: 'lesson_completed', title: 'Lesson completed', description: 'Valentina Ortiz finished "Reported Speech"' },
  { id: 'evt-16', offset: 6 * 24 * 60 * 60 * 1000, type: 'registration', title: 'New student registered', description: 'Ricardo Peña joined the platform' },
  { id: 'evt-17', offset: 8 * 24 * 60 * 60 * 1000, type: 'achievement_unlock', title: 'Achievement unlocked', description: 'Carmen Jiménez earned "50 Exercises" badge' },
  { id: 'evt-18', offset: 10 * 24 * 60 * 60 * 1000, type: 'lesson_completed', title: 'Lesson completed', description: 'Miguel Sánchez finished "Modal Verbs"' },
  { id: 'evt-19', offset: 12 * 24 * 60 * 60 * 1000, type: 'challenge_attempt', title: 'Placement challenge attempted', description: 'Laura Gutiérrez scored 68% on B2 challenge' },
  { id: 'evt-20', offset: 14 * 24 * 60 * 60 * 1000, type: 'level_change', title: 'Level advancement', description: 'Fernando Reyes advanced from A1 to A2' },
];

/**
 * Generates mock events with a fixed reference time to avoid hydration mismatches.
 * The reference time is captured once and reused for both server and client renders.
 */
function generateMockEvents(referenceTime: number): TimelineEvent[] {
  return EVENT_OFFSETS.map((item) => ({
    id: item.id,
    date: new Date(referenceTime - item.offset).toISOString(),
    type: item.type,
    title: item.title,
    description: item.description,
  }));
}

// ─── Quick Actions ───────────────────────────────────────────────────────────

interface QuickAction {
  label: string;
  href: string;
  icon: React.ReactNode;
  description: string;
}

const quickActions: QuickAction[] = [
  {
    label: 'Generate AI Lesson',
    href: '/admin/ai-studio',
    description: 'Create lesson content with AI',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
      </svg>
    ),
  },
  {
    label: 'Create Learning Path',
    href: '/admin/learning-paths/new',
    description: 'Design a new curriculum',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  {
    label: 'Add Student',
    href: '/admin/students',
    description: 'Manage student enrollment',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
      </svg>
    ),
  },
  {
    label: 'Generate Placement Test',
    href: '/admin/challenges/new',
    description: 'Create adaptive assessment',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
      </svg>
    ),
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export interface RecentActivitySectionProps {
  /** Activity events to display. Defaults to mock data if not provided. */
  events?: TimelineEvent[];
}

/**
 * RecentActivitySection - Displays the recent activity feed and quick action buttons
 * on the admin dashboard overview page.
 *
 * Features:
 * - Recent Activity Feed showing up to 20 events with relative/absolute timestamps
 * - Quick Action buttons linking to key creation workflows
 * - Empty state when no events exist
 * - Responsive: side-by-side on desktop, stacked on mobile
 *
 * @validates Requirements 3.3, 3.4, 3.7
 */
export function RecentActivitySection({ events }: RecentActivitySectionProps) {
  // Use a fixed reference time (start of today UTC) to avoid hydration mismatches.
  // Since this is mock data, the exact time doesn't matter — what matters is
  // that server and client compute the same dates.
  const referenceTime = new Date().setUTCHours(12, 0, 0, 0);
  const activityEvents = events ?? generateMockEvents(referenceTime);
  // Limit to 20 events max
  const displayEvents = activityEvents.slice(0, 20);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Recent Activity Feed - takes 2/3 of the space on desktop */}
      <div className="lg:col-span-2">
        <DashboardCard title="Recent Activity">
          {displayEvents.length === 0 ? (
            <DashboardCardEmpty message="No recent activity available" />
          ) : (
            <Timeline events={displayEvents} maxItems={10} />
          )}
        </DashboardCard>
      </div>

      {/* Quick Actions - takes 1/3 of the space on desktop */}
      <div className="lg:col-span-1">
        <DashboardCard title="Quick Actions">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="group flex items-center gap-3 rounded-lg border border-border p-3 transition-all duration-200 hover:border-primary/30 hover:bg-muted/50 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary/20">
                  {action.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-card-foreground">
                    {action.label}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
