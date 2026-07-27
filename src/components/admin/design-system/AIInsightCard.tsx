'use client';

import React from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AIInsightCardProps {
  /** Insight title (max 100 characters) */
  title: string;
  /** Insight description (max 300 characters) */
  description: string;
  /** Number of affected students */
  affectedCount: number;
  /** Priority level based on affected count: high >50, medium 21-50, low 1-20 */
  priority: 'high' | 'medium' | 'low';
  /** Suggested action text */
  suggestedAction: string;
  /** Callback when "Take Action" button is clicked */
  onTakeAction: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Priority color configurations (WCAG AA compliant) */
const PRIORITY_CONFIG: Record<
  'high' | 'medium' | 'low',
  {
    label: string;
    dotClass: string;
    badgeClass: string;
    borderClass: string;
  }
> = {
  high: {
    label: 'High',
    dotClass: 'bg-[#B91C1C] dark:bg-[#FCA5A5]',
    badgeClass: 'bg-[#B91C1C]/10 text-[#B91C1C] dark:bg-[#FCA5A5]/10 dark:text-[#FCA5A5]',
    borderClass: 'border-l-[#B91C1C] dark:border-l-[#FCA5A5]',
  },
  medium: {
    label: 'Medium',
    dotClass: 'bg-[#D97706] dark:bg-[#FBBF24]',
    badgeClass: 'bg-[#D97706]/10 text-[#D97706] dark:bg-[#FBBF24]/10 dark:text-[#FBBF24]',
    borderClass: 'border-l-[#D97706] dark:border-l-[#FBBF24]',
  },
  low: {
    label: 'Low',
    dotClass: 'bg-[#2563EB] dark:bg-[#93C5FD]',
    badgeClass: 'bg-[#2563EB]/10 text-[#2563EB] dark:bg-[#93C5FD]/10 dark:text-[#93C5FD]',
    borderClass: 'border-l-[#2563EB] dark:border-l-[#93C5FD]',
  },
};

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * AIInsightCard - Displays an AI-generated insight with priority coloring,
 * affected student count, and a Take Action button.
 *
 * Features:
 * - Priority color coding: high (red), medium (yellow/amber), low (blue)
 * - Left border accent indicating priority
 * - Affected student count display
 * - Suggested action text
 * - "Take Action" button with callback
 * - Dark mode support
 * - WCAG AA compliant colors
 *
 * Design tokens: 12px border radius, soft shadows, 200ms transitions.
 *
 * @validates Requirements 12.1, 12.3, 18.1
 */
export function AIInsightCard({
  title,
  description,
  affectedCount,
  priority,
  suggestedAction,
  onTakeAction,
}: AIInsightCardProps) {
  const config = PRIORITY_CONFIG[priority];

  return (
    <div
      className={`rounded-[12px] border border-border border-l-4 ${config.borderClass} bg-card p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-shadow duration-200 ease-in-out hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] dark:bg-card dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_4px_12px_rgba(0,0,0,0.25)]`}
      role="article"
      aria-label={`AI insight: ${title}, ${config.label} priority`}
    >
      {/* Header: Priority badge + affected count */}
      <div className="mb-3 flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.badgeClass}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${config.dotClass}`} aria-hidden="true" />
          {config.label} Priority
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
            />
          </svg>
          <span aria-label={`${affectedCount} affected students`}>
            {affectedCount} student{affectedCount !== 1 ? 's' : ''} affected
          </span>
        </span>
      </div>

      {/* Title */}
      <h4 className="text-sm font-semibold text-card-foreground">
        {title}
      </h4>

      {/* Description */}
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
        {description}
      </p>

      {/* Suggested action */}
      <div className="mt-3 flex items-start gap-2 rounded-[8px] bg-muted/50 px-3 py-2 dark:bg-muted/30">
        <svg
          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
          />
        </svg>
        <p className="text-xs text-muted-foreground">
          <span className="font-medium">Suggested:</span> {suggestedAction}
        </p>
      </div>

      {/* Take Action button */}
      <div className="mt-4">
        <button
          type="button"
          onClick={onTakeAction}
          className="rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-colors duration-200 hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          aria-label={`Take action: ${suggestedAction}`}
        >
          Take Action
        </button>
      </div>
    </div>
  );
}
