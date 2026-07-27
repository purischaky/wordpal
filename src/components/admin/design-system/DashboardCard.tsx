'use client';

import React from 'react';

export interface DashboardCardProps {
  /** Optional card title */
  title?: string;
  /** Card content */
  children: React.ReactNode;
  /** Show loading skeleton state */
  loading?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * DashboardCard - A reusable container card for the admin dashboard.
 * Supports loading skeleton, dark mode, and empty state handling.
 *
 * Design tokens: 12px border radius, soft shadows, 200ms transitions.
 */
export function DashboardCard({
  title,
  children,
  loading = false,
  className = '',
}: DashboardCardProps) {
  if (loading) {
    return (
      <div
        className={`rounded-[12px] border border-border bg-card p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-shadow duration-200 ease-in-out dark:bg-card dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] ${className}`}
        role="status"
        aria-label="Loading content"
      >
        {title && (
          <div className="mb-4 h-5 w-1/3 animate-[skeleton-pulse_1500ms_ease-in-out_infinite] rounded bg-muted" />
        )}
        <div className="space-y-3">
          <div className="h-4 w-full animate-[skeleton-pulse_1500ms_ease-in-out_infinite] rounded bg-muted" />
          <div className="h-4 w-2/3 animate-[skeleton-pulse_1500ms_ease-in-out_infinite] rounded bg-muted" />
          <div className="h-4 w-1/2 animate-[skeleton-pulse_1500ms_ease-in-out_infinite] rounded bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-[12px] border border-border bg-card p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-shadow duration-200 ease-in-out hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] dark:bg-card dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_4px_12px_rgba(0,0,0,0.25)] ${className}`}
    >
      {title && (
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

/**
 * DashboardCardEmpty - Renders an empty state placeholder inside DashboardCard.
 */
export function DashboardCardEmpty({
  message = 'No data available',
}: {
  message?: string;
}) {
  return (
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
          d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 11.625l2.25-2.25M12 11.625l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
        />
      </svg>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
