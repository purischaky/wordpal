'use client';

import React, { useState, useMemo } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

/** Event types that can appear in the timeline */
export type TimelineEventType =
  | 'lesson_completed'
  | 'challenge_attempt'
  | 'achievement_unlock'
  | 'registration'
  | 'level_change';

/** A single event in the learning timeline */
export interface TimelineEvent {
  id: string;
  date: string;
  type: TimelineEventType;
  title: string;
  description?: string;
}

/** Pagination state for the timeline */
export interface PaginationState {
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

export interface TimelineProps {
  /** Chronological events to display */
  events: TimelineEvent[];
  /** Maximum items to display per page (default: 10) */
  maxItems?: number;
  /** External pagination state (overrides internal pagination) */
  pagination?: PaginationState;
  /** Callback when page changes */
  onPageChange?: (page: number) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns an icon for the event type */
function EventIcon({ type }: { type: TimelineEventType }) {
  const iconClass = 'h-4 w-4';

  switch (type) {
    case 'lesson_completed':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
        </svg>
      );
    case 'challenge_attempt':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      );
    case 'achievement_unlock':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0 1 16.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 0 1-3.77 1.522m3.77-1.522a48.454 48.454 0 0 1-7.54 0" />
        </svg>
      );
    case 'registration':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
        </svg>
      );
    case 'level_change':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
        </svg>
      );
  }
}

/** Returns a color class for the event type dot */
function getEventDotColor(type: TimelineEventType): string {
  switch (type) {
    case 'lesson_completed':
      return 'bg-[#047857] dark:bg-[#34D399]';
    case 'challenge_attempt':
      return 'bg-[#6366f1] dark:bg-[#818cf8]';
    case 'achievement_unlock':
      return 'bg-[#eab308] dark:bg-[#fbbf24]';
    case 'registration':
      return 'bg-[#06b6d4] dark:bg-[#22d3ee]';
    case 'level_change':
      return 'bg-[#8b5cf6] dark:bg-[#a78bfa]';
  }
}

/**
 * Formats a date string for timeline display.
 * Shows relative time for events within 7 days, absolute date otherwise.
 */
function formatTimelineDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Timeline - Displays chronological events with date, type icon, title, and description.
 *
 * Features:
 * - Chronological event display with type-specific icons and color coding
 * - Pagination when events exceed maxItems
 * - Empty state when no events
 * - Dark mode support
 * - Relative/absolute date formatting
 *
 * Design tokens: 12px border radius, soft shadows, 200ms transitions.
 *
 * @validates Requirements 5.1, 5.4
 */
export function Timeline({
  events,
  maxItems = 10,
  pagination: externalPagination,
  onPageChange,
}: TimelineProps) {
  const [internalPage, setInternalPage] = useState(1);

  const totalPages = externalPagination
    ? externalPagination.totalPages
    : Math.max(1, Math.ceil(events.length / maxItems));

  const currentPage = externalPagination
    ? externalPagination.currentPage
    : internalPage;

  const paginatedEvents = useMemo(() => {
    if (externalPagination) return events;
    const start = (currentPage - 1) * maxItems;
    return events.slice(start, start + maxItems);
  }, [events, currentPage, maxItems, externalPagination]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    if (onPageChange) {
      onPageChange(page);
    } else {
      setInternalPage(page);
    }
  };

  // Empty state
  if (events.length === 0) {
    return (
      <div className="rounded-[12px] border border-border bg-card p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-shadow duration-200 ease-in-out dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <svg
            className="mb-3 h-10 w-10 text-muted-foreground/50"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
          <p className="text-sm text-muted-foreground">No timeline events available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[12px] border border-border bg-card p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-shadow duration-200 ease-in-out dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute left-[15px] top-0 bottom-0 w-px bg-border" aria-hidden="true" />

        <ul className="space-y-4" role="list" aria-label="Timeline events">
          {paginatedEvents.map((event, index) => (
            <li key={event.id} className="relative flex gap-4 pl-9">
              {/* Timeline dot */}
              <div
                className={`absolute left-[11px] top-1.5 h-[9px] w-[9px] rounded-full ring-2 ring-card ${getEventDotColor(event.type)}`}
                aria-hidden="true"
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground" aria-hidden="true">
                    <EventIcon type={event.type} />
                  </span>
                  <span className="truncate text-sm font-medium text-card-foreground">
                    {event.title}
                  </span>
                </div>
                {event.description && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {event.description}
                  </p>
                )}
                <time
                  className="mt-1 block text-xs text-muted-foreground/70"
                  dateTime={event.date}
                  suppressHydrationWarning
                >
                  {formatTimelineDate(event.date)}
                </time>
              </div>

              {/* Connector to next item */}
              {index === paginatedEvents.length - 1 && (
                <div className="absolute left-[15px] top-[10px] bottom-0 w-px bg-transparent" aria-hidden="true" />
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <button
            type="button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-card-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            aria-label="Previous page"
          >
            Previous
          </button>
          <span className="text-xs text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-card-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
