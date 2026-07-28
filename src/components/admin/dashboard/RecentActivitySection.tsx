'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardCard, DashboardCardEmpty } from '../design-system/DashboardCard';
import { Timeline } from '../design-system/Timeline';
import type { TimelineEvent, TimelineEventType } from '../design-system/Timeline';
import type { AdminNotification } from '@/types/admin';

// ─── Notification -> Timeline mapping ────────────────────────────────────────

/**
 * Notifications only carry 3 types (registration, challenge_completion,
 * system_error) while Timeline supports a broader activity vocabulary.
 * system_error isn't user activity, so it's dropped from this feed.
 */
function notificationTypeToTimelineType(type: AdminNotification['type']): TimelineEventType | null {
  switch (type) {
    case 'registration':
      return 'registration';
    case 'challenge_completion':
      return 'challenge_attempt';
    case 'system_error':
      return null;
  }
}

function toTimelineEvents(notifications: AdminNotification[]): TimelineEvent[] {
  return notifications.reduce<TimelineEvent[]>((events, n) => {
    const type = notificationTypeToTimelineType(n.type);
    if (type) {
      events.push({ id: n.id, date: n.createdAt, type, title: n.title, description: n.description });
    }
    return events;
  }, []);
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
  /** Activity events to display. Defaults to fetching from /api/admin/notifications. */
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
  const [fetchedEvents, setFetchedEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(events === undefined);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (events !== undefined) return;

    let cancelled = false;
    fetch('/api/admin/notifications')
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (json.error) {
          setError(true);
        } else {
          setFetchedEvents(toTimelineEvents(json.data as AdminNotification[]));
        }
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [events]);

  // Limit to 20 events max
  const displayEvents = (events ?? fetchedEvents).slice(0, 20);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Recent Activity Feed - takes 2/3 of the space on desktop */}
      <div className="lg:col-span-2">
        <DashboardCard title="Recent Activity" loading={loading}>
          {error ? (
            <DashboardCardEmpty message="Failed to load recent activity" />
          ) : displayEvents.length === 0 ? (
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
