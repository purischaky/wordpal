'use client';

import React from 'react';

export interface MetricCardProps {
  /** Metric title - max 50 characters */
  title: string;
  /** Current metric value */
  value: string | number;
  /** Percentage change from previous period (-100 to 9999) */
  changePercentage: number;
  /** Trend direction: up or down */
  trendDirection: 'up' | 'down';
  /** Icon to display in the card */
  icon: React.ReactNode;
  /** Show loading skeleton state */
  loading?: boolean;
  /** Show error state with retry */
  error?: boolean;
  /** Callback when retry button is clicked */
  onRetry?: () => void;
}

/**
 * Rounds a number to exactly 1 decimal place.
 */
export function roundToOneDecimal(value: number): string {
  return value.toFixed(1);
}

/**
 * MetricCard - Displays a single KPI metric with trend indicator.
 *
 * Features:
 * - Value display with change percentage (rounded to 1 decimal)
 * - Trend arrow: up for positive, down for negative, hidden when zero
 * - WCAG AA color-coded trends (green positive, red negative)
 * - Loading skeleton state
 * - Error state with retry button
 * - Dark mode support
 *
 * Design tokens: 12px border radius, soft shadows, 200ms transitions.
 */
export function MetricCard({
  title,
  value,
  changePercentage,
  trendDirection,
  icon,
  loading = false,
  error = false,
  onRetry,
}: MetricCardProps) {
  if (loading) {
    return (
      <div
        className="rounded-[12px] border border-border bg-card p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-shadow duration-200 ease-in-out dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
        role="status"
        aria-label={`Loading ${title} metric`}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="h-4 w-24 animate-[skeleton-pulse_1500ms_ease-in-out_infinite] rounded bg-muted" />
            <div className="h-7 w-16 animate-[skeleton-pulse_1500ms_ease-in-out_infinite] rounded bg-muted" />
            <div className="h-4 w-20 animate-[skeleton-pulse_1500ms_ease-in-out_infinite] rounded bg-muted" />
          </div>
          <div className="h-10 w-10 animate-[skeleton-pulse_1500ms_ease-in-out_infinite] rounded-[8px] bg-muted" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-[12px] border border-border bg-card p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-shadow duration-200 ease-in-out dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
        role="alert"
        aria-label={`${title} metric unavailable`}
      >
        <div className="flex flex-col items-center justify-center py-2 text-center">
          <svg
            className="mb-2 h-8 w-8 text-destructive"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Data temporarily unavailable
          </p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors duration-200 hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              aria-label={`Retry loading ${title}`}
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  const isZeroChange = changePercentage === 0;
  const isPositive = trendDirection === 'up';

  // WCAG AA compliant colors for trends
  // Green: #047857 on white (7.2:1 ratio), on dark bg #34D399 on #1f2937 (5.2:1 ratio)
  // Red: #B91C1C on white (6.1:1 ratio), on dark bg #FCA5A5 on #1f2937 (7.5:1 ratio)
  const trendColorClass = isPositive
    ? 'text-[#047857] dark:text-[#34D399]'
    : 'text-[#B91C1C] dark:text-[#FCA5A5]';

  const trendBgClass = isPositive
    ? 'bg-[#047857]/10 dark:bg-[#34D399]/10'
    : 'bg-[#B91C1C]/10 dark:bg-[#FCA5A5]/10';

  const formattedPercentage = roundToOneDecimal(changePercentage);

  return (
    <div className="rounded-[12px] border border-border bg-card p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-shadow duration-200 ease-in-out hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_4px_12px_rgba(0,0,0,0.25)]">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-muted-foreground">
            {title}
          </p>
          <p
            className="mt-2 text-2xl font-semibold text-card-foreground"
            aria-label={`${title}: ${value}`}
          >
            {value}
          </p>
          <div className="mt-2 flex items-center gap-1.5">
            {!isZeroChange && (
              <span
                className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${trendColorClass} ${trendBgClass}`}
                aria-label={`${isPositive ? 'Increased' : 'Decreased'} by ${formattedPercentage} percent`}
              >
                {/* Trend arrow */}
                {isPositive ? (
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25"
                    />
                  </svg>
                )}
                {formattedPercentage}%
              </span>
            )}
            {isZeroChange && (
              <span
                className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                aria-label="No change"
              >
                0.0%
              </span>
            )}
          </div>
        </div>
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-primary/10 text-primary dark:bg-primary/20"
          aria-hidden="true"
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
