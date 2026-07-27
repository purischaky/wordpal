'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { AdminNotification } from '@/types/admin';

// ─── Context URL Mapping ─────────────────────────────────────────────────────

/**
 * Maps notification types to context URL patterns for click navigation.
 * Used as a fallback when contextUrl is not provided on a notification.
 */
export function getDefaultContextUrl(type: AdminNotification['type']): string {
  switch (type) {
    case 'registration':
      return '/admin/students';
    case 'challenge_completion':
      return '/admin/challenges';
    case 'ai_generation':
      return '/admin/ai-studio';
    case 'system_error':
      return '/admin/settings';
    case 'ai_insight':
      return '/admin/analytics';
    default:
      return '/admin';
  }
}

// ─── 90-Day Retention ────────────────────────────────────────────────────────

const RETENTION_DAYS = 90;

/**
 * Filters out notifications older than 90 days.
 */
function applyRetentionPolicy(notifications: AdminNotification[]): AdminNotification[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);
  const cutoffTime = cutoff.getTime();

  return notifications.filter((n) => new Date(n.createdAt).getTime() >= cutoffTime);
}

// ─── Hook Return Type ────────────────────────────────────────────────────────

export interface UseNotificationsReturn {
  /** All notifications (after retention cleanup) */
  notifications: AdminNotification[];
  /** Count of unread notifications */
  unreadCount: number;
  /** Whether the hook is in loading state */
  loading: boolean;
  /** Whether there's an error (service unavailable) */
  error: boolean;
  /** Mark a single notification as read */
  markRead: (id: string) => void;
  /** Mark all notifications as read */
  markAllRead: () => void;
  /** Get the full notifications list (all, not just 50) */
  getNotifications: () => AdminNotification[];
  /** Get the context URL for a notification click */
  getContextUrl: (notification: AdminNotification) => string;
}

// ─── Hook Implementation ─────────────────────────────────────────────────────

/**
 * Custom hook for notification management.
 *
 * - Fetches notifications from `/api/admin/notifications`
 * - Provides functions: markRead(id), markAllRead, getNotifications
 * - Maps notification types to context URLs for click navigation
 * - Handles 90-day retention cleanup (on mount, removes notifications older than 90 days)
 * - Returns typed notification data using AdminNotification type
 *
 * @see Requirements 14.9, 15.3, 15.4, 15.7
 */
export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Initialize notifications on mount by fetching from API
  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      setLoading(true);
      setError(false);

      try {
        abortRef.current = new AbortController();
        const res = await fetch('/api/admin/notifications', {
          signal: abortRef.current.signal,
        });
        const json = await res.json();

        if (!cancelled) {
          if (json.error) {
            setError(true);
            setLoading(false);
            return;
          }

          const data: AdminNotification[] = json.data;
          setNotifications(applyRetentionPolicy(data));
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled && !(err instanceof DOMException && (err as DOMException).name === 'AbortError')) {
          setError(true);
          setLoading(false);
        }
      }
    }

    initialize();

    return () => {
      cancelled = true;
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
    };
  }, []);

  // Mark a single notification as read (optimistic + API call)
  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );

    // Persist via API
    fetch(`/api/admin/notifications/${id}/read`, {
      method: 'PATCH',
    }).catch(() => {
      // Silent - optimistic update already applied
    });
  }, []);

  // Mark all notifications as read (optimistic + API call)
  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

    // Persist via API
    fetch('/api/admin/notifications/mark-all-read', {
      method: 'POST',
    }).catch(() => {
      // Silent - optimistic update already applied
    });
  }, []);

  // Get all notifications (full list, not just 50)
  const getNotifications = useCallback(() => {
    return notifications;
  }, [notifications]);

  // Get context URL for a notification
  const getContextUrl = useCallback((notification: AdminNotification) => {
    return notification.contextUrl || getDefaultContextUrl(notification.type);
  }, []);

  // Compute unread count
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markRead,
    markAllRead,
    getNotifications,
    getContextUrl,
  };
}
