import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  filterOldNotifications,
  markAllRead,
  Notification,
} from '@/lib/api/notification-ops';

/**
 * Arbitrary for generating valid ISO date strings within a reasonable range.
 * Uses integer timestamps to avoid invalid date issues during shrinking.
 */
const isoDateArb: fc.Arbitrary<string> = fc
  .integer({
    min: new Date('2020-01-01T00:00:00.000Z').getTime(),
    max: new Date('2030-12-31T23:59:59.999Z').getTime(),
  })
  .map((ts) => new Date(ts).toISOString());

/**
 * Arbitrary for generating Notification objects with random but valid fields.
 */
const notificationArb: fc.Arbitrary<Notification> = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  isRead: fc.boolean(),
  createdAt: isoDateArb,
});

/**
 * Feature: admin-api-routes, Property 11: Notification Date Filtering
 * Validates: Requirements 9.5
 */
describe('Feature: admin-api-routes, Property 11: Notification Date Filtering', () => {
  const cutoffArb = fc
    .integer({
      min: new Date('2020-01-01T00:00:00.000Z').getTime(),
      max: new Date('2030-12-31T23:59:59.999Z').getTime(),
    })
    .map((ts) => new Date(ts));

  it('filtering removes exactly those notifications before the cutoff and preserves the rest', () => {
    fc.assert(
      fc.property(
        fc.array(notificationArb, { minLength: 0, maxLength: 50 }),
        cutoffArb,
        (notifications, cutoff) => {
          const result = filterOldNotifications(notifications, cutoff);

          // All results should have createdAt >= cutoff
          for (const n of result) {
            expect(new Date(n.createdAt).getTime()).toBeGreaterThanOrEqual(cutoff.getTime());
          }

          // Count how many in the original should survive
          const expectedCount = notifications.filter(
            (n) => new Date(n.createdAt) >= cutoff
          ).length;
          expect(result.length).toBe(expectedCount);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('preserved notifications are unchanged (same data)', () => {
    fc.assert(
      fc.property(
        fc.array(notificationArb, { minLength: 0, maxLength: 50 }),
        cutoffArb,
        (notifications, cutoff) => {
          const result = filterOldNotifications(notifications, cutoff);

          // Each result should be deeply equal to an item in the original
          for (const r of result) {
            const original = notifications.find(
              (n) => n.id === r.id && n.createdAt === r.createdAt
            );
            expect(original).toBeDefined();
            expect(r).toEqual(original);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('no notification before the cutoff survives the filter', () => {
    fc.assert(
      fc.property(
        fc.array(notificationArb, { minLength: 0, maxLength: 50 }),
        cutoffArb,
        (notifications, cutoff) => {
          const result = filterOldNotifications(notifications, cutoff);

          // None of the results should have a createdAt strictly before cutoff
          const hasBefore = result.some(
            (n) => new Date(n.createdAt) < cutoff
          );
          expect(hasBefore).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: admin-api-routes, Property 12: Mark All Read Idempotence
 * Validates: Requirements 9.4
 */
describe('Feature: admin-api-routes, Property 12: Mark All Read Idempotence', () => {
  it('marking all read results in every notification having isRead: true', () => {
    fc.assert(
      fc.property(
        fc.array(notificationArb, { minLength: 0, maxLength: 50 }),
        (notifications) => {
          const result = markAllRead(notifications);

          for (const n of result) {
            expect(n.isRead).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('applying markAllRead twice produces the same result (idempotence)', () => {
    fc.assert(
      fc.property(
        fc.array(notificationArb, { minLength: 0, maxLength: 50 }),
        (notifications) => {
          const once = markAllRead(notifications);
          const twice = markAllRead(once);

          expect(twice).toEqual(once);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('markAllRead preserves all fields except isRead', () => {
    fc.assert(
      fc.property(
        fc.array(notificationArb, { minLength: 0, maxLength: 50 }),
        (notifications) => {
          const result = markAllRead(notifications);

          expect(result.length).toBe(notifications.length);

          for (let i = 0; i < notifications.length; i++) {
            expect(result[i].id).toBe(notifications[i].id);
            expect(result[i].createdAt).toBe(notifications[i].createdAt);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
