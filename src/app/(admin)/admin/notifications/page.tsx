'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { formatRelativeTimestamp } from '@/components/admin/design-system/NotificationCenter';
import type { AdminNotification } from '@/types/admin';

type NotificationType = AdminNotification['type'] | 'all';

const TYPE_LABELS: Record<AdminNotification['type'], string> = {
  registration: 'Registrations',
  challenge_completion: 'Challenge Completions',
  system_error: 'System Errors',
};

const TYPE_COLORS: Record<AdminNotification['type'], string> = {
  registration: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  challenge_completion: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  system_error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

/**
 * Full notification history page.
 * Shows all notifications (not just 50 recent) with:
 * - Filter by type
 * - Mark as read functionality
 * - Notification click navigates to context
 *
 * @see Requirements 15.3, 15.4, 15.7
 */
export default function NotificationsPage() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markRead,
    markAllRead,
    getContextUrl,
  } = useNotifications();

  const [activeFilter, setActiveFilter] = useState<NotificationType>('all');

  // Filter notifications by type
  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'all') return notifications;
    return notifications.filter((n) => n.type === activeFilter);
  }, [notifications, activeFilter]);

  // Handle notification click - mark read and navigate
  const handleNotificationClick = (notification: AdminNotification) => {
    if (!notification.isRead) {
      markRead(notification.id);
    }
    const url = getContextUrl(notification);
    router.push(url);
  };

  // Filter options
  const filterOptions: { value: NotificationType; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'registration', label: 'Registrations' },
    { value: 'challenge_completion', label: 'Challenges' },
    { value: 'system_error', label: 'System Errors' },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
              : 'All caught up'}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors duration-200 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            aria-label="Mark all notifications as read"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter notifications by type">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={activeFilter === option.value}
            onClick={() => setActiveFilter(option.value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${
              activeFilter === option.value
                ? 'bg-blue-600 text-white shadow-sm dark:bg-blue-500'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        {/* Loading state */}
        {loading && (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4 px-6 py-4">
                <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-3 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-3 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <svg className="mb-4 h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300" role="alert">
              Notifications temporarily unavailable
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Please try again later.
            </p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredNotifications.length === 0 && (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <svg className="mb-4 h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
            </svg>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
              {activeFilter === 'all'
                ? 'No notifications yet'
                : `No ${TYPE_LABELS[activeFilter as AdminNotification['type']] || ''} notifications`}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {activeFilter === 'all'
                ? 'New notifications will appear here as platform events occur.'
                : 'Try selecting a different filter.'}
            </p>
            {activeFilter !== 'all' && (
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                View all notifications
              </button>
            )}
          </div>
        )}

        {/* Notification list */}
        {!loading && !error && filteredNotifications.length > 0 && (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800" aria-label="Notifications list">
            {filteredNotifications.map((notification) => (
              <li key={notification.id}>
                <button
                  type="button"
                  onClick={() => handleNotificationClick(notification)}
                  className={`flex w-full items-start gap-4 px-6 py-4 text-left transition-colors duration-200 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-500 dark:hover:bg-gray-800/50 ${
                    !notification.isRead
                      ? 'bg-blue-50/50 dark:bg-blue-950/20'
                      : ''
                  }`}
                  aria-label={`${notification.isRead ? '' : 'Unread: '}${notification.title}. ${notification.description}. Click to navigate to details.`}
                >
                  {/* Icon */}
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      TYPE_COLORS[notification.type]
                    }`}
                  >
                    <NotificationIcon type={notification.type} />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm ${
                            !notification.isRead
                              ? 'font-semibold text-gray-900 dark:text-white'
                              : 'font-medium text-gray-800 dark:text-gray-200'
                          }`}
                        >
                          {notification.title}
                        </p>
                        <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
                          {notification.description}
                        </p>
                      </div>

                      {/* Unread dot */}
                      {!notification.isRead && (
                        <span
                          className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600 dark:bg-blue-400"
                          aria-hidden="true"
                        />
                      )}
                    </div>

                    {/* Footer: timestamp + type badge */}
                    <div className="mt-2 flex items-center gap-3">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatRelativeTimestamp(notification.createdAt)}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          TYPE_COLORS[notification.type]
                        }`}
                      >
                        {TYPE_LABELS[notification.type]}
                      </span>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Retention info */}
      {!loading && !error && notifications.length > 0 && (
        <p className="text-center text-xs text-gray-500 dark:text-gray-400">
          Notifications are retained for 90 days.
        </p>
      )}
    </div>
  );
}

// ─── Notification Icon Component ─────────────────────────────────────────────

function NotificationIcon({ type }: { type: AdminNotification['type'] }) {
  const iconClass = 'h-5 w-5';

  switch (type) {
    case 'registration':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
        </svg>
      );
    case 'challenge_completion':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.745 3.745 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
        </svg>
      );
    case 'system_error':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
      );
    default:
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
        </svg>
      );
  }
}
