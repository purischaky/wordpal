/**
 * Pure notification operation logic extracted from the notifications route handlers.
 * Allows property-based testing without requiring HTTP request/response infrastructure.
 */

export interface Notification {
  id: string;
  isRead: boolean;
  createdAt: string;
  [key: string]: unknown;
}

/**
 * Filters out notifications with a createdAt date strictly before the cutoff.
 * Returns only those notifications whose createdAt is >= cutoff.
 */
export function filterOldNotifications(
  notifications: Notification[],
  cutoff: Date
): Notification[] {
  return notifications.filter((n) => new Date(n.createdAt) >= cutoff);
}

/**
 * Marks all notifications as read by setting isRead to true.
 */
export function markAllRead(notifications: Notification[]): Notification[] {
  return notifications.map((n) => ({ ...n, isRead: true }));
}
