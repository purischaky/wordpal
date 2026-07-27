import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * A minimal Unit interface for the reorder operation.
 */
interface Unit {
  id: string;
  title: string;
  order: number;
}

/**
 * Pure reorder function that reorders units based on a given permutation of unit IDs.
 * This mirrors the logic in the reorder route handler.
 */
function reorderUnits(units: Unit[], unitIds: string[]): Unit[] {
  const reordered: Unit[] = [];
  for (let i = 0; i < unitIds.length; i++) {
    const unit = units.find((u) => u.id === unitIds[i]);
    if (unit) {
      reordered.push({ ...unit, order: i + 1 });
    }
  }
  return reordered;
}

/**
 * Arbitrary for generating a Unit with a unique ID, title, and order.
 */
const unitArb = (id: string, order: number): fc.Arbitrary<Unit> =>
  fc.record({
    id: fc.constant(id),
    title: fc.string({ minLength: 1, maxLength: 50 }),
    order: fc.constant(order),
  });

/**
 * Generates a list of units with unique IDs, and a valid permutation of those IDs.
 */
const unitsWithPermutationArb = fc
  .integer({ min: 1, max: 20 })
  .chain((count) => {
    // Generate unique IDs for the units
    const ids = Array.from({ length: count }, (_, i) => `unit-${i + 1}`);

    // Generate units with those IDs
    const unitsArb = fc.tuple(
      ...ids.map((id, i) => unitArb(id, i + 1))
    ) as fc.Arbitrary<Unit[]>;

    // Generate a shuffled permutation of the IDs
    const permutationArb = fc.shuffledSubarray(ids, {
      minLength: ids.length,
      maxLength: ids.length,
    });

    return fc.tuple(unitsArb, permutationArb);
  });

/**
 * Feature: admin-api-routes, Property 13: Reorder Preserves Units
 * Validates: Requirements 2.6
 */
describe('Feature: admin-api-routes, Property 13: Reorder Preserves Units', () => {
  it('reordering preserves the same set of units (no additions or removals)', () => {
    fc.assert(
      fc.property(unitsWithPermutationArb, ([units, permutedIds]) => {
        const reordered = reorderUnits(units, permutedIds);

        // Same number of units
        expect(reordered).toHaveLength(units.length);

        // Same set of IDs (no additions or removals)
        const originalIds = new Set(units.map((u) => u.id));
        const reorderedIds = new Set(reordered.map((u) => u.id));
        expect(reorderedIds).toEqual(originalIds);
      }),
      { numRuns: 100 }
    );
  });

  it('order field matches the position in the provided permutation', () => {
    fc.assert(
      fc.property(unitsWithPermutationArb, ([units, permutedIds]) => {
        const reordered = reorderUnits(units, permutedIds);

        // Each unit's order should match its position in the permutation (1-indexed)
        for (let i = 0; i < permutedIds.length; i++) {
          const unit = reordered.find((u) => u.id === permutedIds[i]);
          expect(unit).toBeDefined();
          expect(unit!.order).toBe(i + 1);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('unit content (title) is preserved after reordering', () => {
    fc.assert(
      fc.property(unitsWithPermutationArb, ([units, permutedIds]) => {
        const reordered = reorderUnits(units, permutedIds);

        // Each unit should have the same title as the original
        for (const original of units) {
          const reorderedUnit = reordered.find((u) => u.id === original.id);
          expect(reorderedUnit).toBeDefined();
          expect(reorderedUnit!.title).toBe(original.title);
        }
      }),
      { numRuns: 100 }
    );
  });
});
