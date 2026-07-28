'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { AdminNotification } from '@/types/admin';

export interface NotificationCenterProps {
  /** Array of notifications to display (up to 50 most recent) */
  notifications: AdminNotification[];
  /** Count of unread notifications */
  unreadCount: number;
  /** Callback when a notification is marked as read */
  onMarkRead: (id: string) => void;
  /** Callback to mark all notifications as read */
  onMarkAllRead: () => void;
  /** Callback when a notification is clicked */
  onClick: (notification: AdminNotification) => void;
  /** Show loading skeleton state */
  loading?: boolean;
  /** Show error/unavailable state - graceful degradation */
  error?: boolean;
}

/**
 * Formats a notification badge count.
 * - Returns empty string for count <= 0 (badge hidden)
 * - Returns exact count as string for 1–99
 * - Returns "99+" for counts > 99
 */
export function formatBadgeCount(count: number): string {
  if (count <= 0) return '';
  if (count > 99) return '99+';
  return String(count);
}

/**
 * Formats a timestamp into a relative time string.
 * Within 7 days: relative (e.g., "5m ago", "2h ago", "3d ago")
 * Beyond 7 days: absolute date string (e.g., "Jan 15, 2024")
 */
export function formatRelativeTimestamp(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  if (diffMs < 0 || diffMs >= sevenDaysMs) {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

/** Maps notification type to an icon */
function NotificationTypeIcon({ type }: { type: AdminNotification['type'] }) {
  const iconClass = 'h-5 w-5 shrink-0';

  switch (type) {
    case 'registration':
      return (
        <svg className={`${iconClass} text-blue-600 dark:text-blue-400`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
        </svg>
      );
    case 'challenge_completion':
      return (
        <svg className={`${iconClass} text-green-600 dark:text-green-400`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.745 3.745 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
        </svg>
      );
    case 'system_error':
      return (
        <svg className={`${iconClass} text-red-600 dark:text-red-400`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
      );
    default:
      return (
        <svg className={`${iconClass} text-muted-foreground`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
        </svg>
      );
  }
}


/** Skeleton item for loading state */
function NotificationSkeleton() {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <div className="h-5 w-5 shrink-0 animate-[skeleton-pulse_1500ms_ease-in-out_infinite] rounded-full bg-muted" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-4 w-3/4 animate-[skeleton-pulse_1500ms_ease-in-out_infinite] rounded bg-muted" />
        <div className="h-3 w-full animate-[skeleton-pulse_1500ms_ease-in-out_infinite] rounded bg-muted" />
        <div className="h-3 w-16 animate-[skeleton-pulse_1500ms_ease-in-out_infinite] rounded bg-muted" />
      </div>
    </div>
  );
}

/**
 * NotificationCenter - Displays a bell icon with badge and dropdown panel of notifications.
 *
 * Features:
 * - Bell icon button with unread count badge
 * - Badge: exact count for 1-99, "99+" for counts >99, hidden when 0
 * - Dropdown panel showing up to 50 recent notifications
 * - Each notification: type icon, title, description (max 120 chars), relative timestamp, read/unread indicator
 * - "Mark as read" on individual notification click
 * - "Mark all as read" button at top of dropdown
 * - Graceful degradation when unavailable (error prop)
 * - Loading state with skeleton items
 * - Dark mode support
 * - Closes dropdown when clicking outside
 *
 * Design tokens: 12px border radius, soft shadows, 200ms transitions.
 *
 * @see Requirements 1.1, 15.1, 15.2, 15.4, 15.5, 15.6
 */
export function NotificationCenter({
  notifications,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
  onClick,
  loading = false,
  error = false,
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, handleClickOutside]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const badgeText = formatBadgeCount(unreadCount);
  const showBadge = !error && unreadCount > 0;

  const handleNotificationClick = (notification: AdminNotification) => {
    if (!notification.isRead) {
      onMarkRead(notification.id);
    }
    onClick(notification);
  };

  const handleMarkAllRead = () => {
    onMarkAllRead();
  };

  // Limit to 50 most recent notifications
  const displayedNotifications = notifications.slice(0, 50);

  return (
    <div ref={containerRef} className="relative">
      {/* Bell icon button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-10 w-10 items-center justify-center rounded-[8px] text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        aria-label={
          error
            ? 'Notifications unavailable'
            : `Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`
        }
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Bell SVG icon */}
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
          />
        </svg>

        {/* Unread badge */}
        {showBadge && (
          <span
            className="absolute -right-0.5 -top-0.5 flex min-w-[18px] items-center justify-center rounded-full bg-destructive px-1 py-0.5 text-[10px] font-bold leading-none text-destructive-foreground"
            aria-hidden="true"
          >
            {badgeText}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-[380px] max-w-[calc(100vw-2rem)] rounded-[12px] border border-border bg-card shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all duration-200 ease-in-out dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)]"
          role="region"
          aria-label="Notifications panel"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold text-card-foreground">
              Notifications
            </h2>
            {!error && !loading && unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors duration-200 hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                aria-label="Mark all notifications as read"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Content area */}
          <div className="max-h-[400px] overflow-y-auto">
            {/* Error / Unavailable state */}
            {error && (
              <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
                <svg
                  className="mb-2 h-8 w-8 text-muted-foreground"
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
                <p className="text-sm text-muted-foreground" role="alert">
                  Notifications temporarily unavailable
                </p>
              </div>
            )}

            {/* Loading state */}
            {!error && loading && (
              <div role="status" aria-label="Loading notifications">
                {Array.from({ length: 5 }).map((_, i) => (
                  <NotificationSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!error && !loading && displayedNotifications.length === 0 && (
              <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
                <svg
                  className="mb-2 h-8 w-8 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                  />
                </svg>
                <p className="text-sm text-muted-foreground">
                  No notifications yet
                </p>
              </div>
            )}

            {/* Notification list */}
            {!error && !loading && displayedNotifications.length > 0 && (
              <ul className="divide-y divide-border" aria-label="Notification list">
                {displayedNotifications.map((notification) => (
                  <li key={notification.id}>
                    <button
                      type="button"
                      onClick={() => handleNotificationClick(notification)}
                      className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors duration-200 hover:bg-accent/50 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring ${
                        !notification.isRead
                          ? 'bg-primary/5 dark:bg-primary/10'
                          : ''
                      }`}
                      aria-label={`${notification.isRead ? '' : 'Unread: '}${notification.title}. ${notification.description}`}
                    >
                      {/* Type icon */}
                      <NotificationTypeIcon type={notification.type} />

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`truncate text-sm ${
                              !notification.isRead
                                ? 'font-semibold text-card-foreground'
                                : 'font-medium text-card-foreground'
                            }`}
                          >
                            {notification.title}
                          </p>
                          {/* Read/unread indicator dot */}
                          {!notification.isRead && (
                            <span
                              className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary"
                              aria-hidden="true"
                            />
                          )}
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                          {notification.description.length > 120
                            ? `${notification.description.slice(0, 120)}…`
                            : notification.description}
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground/70">
                          {formatRelativeTimestamp(notification.createdAt)}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
