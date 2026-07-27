'use client';

import React from 'react';

// ─── Filter Configuration Types ──────────────────────────────────────────────

/** A single selectable option within a filter */
export interface FilterOption {
  label: string;
  value: string;
}

/** Base configuration shared by all filter types */
interface FilterConfigBase {
  /** Unique key identifying this filter */
  key: string;
  /** Display label for the filter */
  label: string;
}

/** Select filter: single value selection from a list */
export interface SelectFilterConfig extends FilterConfigBase {
  type: 'select';
  options: FilterOption[];
}

/** Multi-select filter: multiple values selectable */
export interface MultiSelectFilterConfig extends FilterConfigBase {
  type: 'multi-select';
  options: FilterOption[];
}

/** Date range filter: start and end date selection */
export interface DateRangeFilterConfig extends FilterConfigBase {
  type: 'date-range';
}

/** Union type for all supported filter configurations */
export type FilterConfig =
  | SelectFilterConfig
  | MultiSelectFilterConfig
  | DateRangeFilterConfig;

/** Value type for date range filters */
export interface DateRangeValue {
  start: string | null;
  end: string | null;
}

// ─── FilterPanel Props ───────────────────────────────────────────────────────

export interface FilterPanelProps {
  /** Array of filter configurations to render */
  filters: FilterConfig[];
  /** Currently active filter values keyed by filter key */
  activeFilters: Record<string, unknown>;
  /** Callback when a single filter value changes */
  onFilterChange: (key: string, value: unknown) => void;
  /** Callback to clear all active filters */
  onClearAll: () => void;
}

/**
 * FilterPanel - A composable filter panel supporting select, multi-select,
 * and date-range filter types with AND logic composition.
 *
 * Design tokens: 12px border radius, soft shadows, 200ms transitions.
 * WCAG compliant: visible labels, keyboard accessible, focus indicators.
 *
 * Validates: Requirements 4.3, 4.5
 */
export function FilterPanel({
  filters,
  activeFilters,
  onFilterChange,
  onClearAll,
}: FilterPanelProps) {
  const hasActiveFilters = Object.values(activeFilters).some((value) => {
    if (value === null || value === undefined || value === '') return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object' && value !== null) {
      const dateRange = value as DateRangeValue;
      return dateRange.start !== null || dateRange.end !== null;
    }
    return true;
  });

  return (
    <div className="rounded-[12px] border border-border bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-shadow duration-200 ease-in-out dark:bg-card dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-foreground">Filters</h3>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearAll}
            className="rounded-md px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Clear all filters"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {filters.map((filter) => (
          <FilterControl
            key={filter.key}
            config={filter}
            value={activeFilters[filter.key]}
            onChange={(value) => onFilterChange(filter.key, value)}
          />
        ))}
      </div>

      {hasActiveFilters && (
        <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
          <svg
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"
            />
          </svg>
          <span>Filters combine with AND logic</span>
        </div>
      )}
    </div>
  );
}

// ─── Individual Filter Controls ──────────────────────────────────────────────

interface FilterControlProps {
  config: FilterConfig;
  value: unknown;
  onChange: (value: unknown) => void;
}

function FilterControl({ config, value, onChange }: FilterControlProps) {
  switch (config.type) {
    case 'select':
      return (
        <SelectFilter
          config={config}
          value={value as string | null | undefined}
          onChange={onChange}
        />
      );
    case 'multi-select':
      return (
        <MultiSelectFilter
          config={config}
          value={value as string[] | null | undefined}
          onChange={onChange}
        />
      );
    case 'date-range':
      return (
        <DateRangeFilter
          config={config}
          value={value as DateRangeValue | null | undefined}
          onChange={onChange}
        />
      );
    default:
      return null;
  }
}

// ─── Select Filter ───────────────────────────────────────────────────────────

interface SelectFilterProps {
  config: SelectFilterConfig;
  value: string | null | undefined;
  onChange: (value: unknown) => void;
}

function SelectFilter({ config, value, onChange }: SelectFilterProps) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={`filter-${config.key}`}
        className="text-xs font-medium text-muted-foreground"
      >
        {config.label}
      </label>
      <select
        id={`filter-${config.key}`}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="h-8 rounded-[12px] border border-input bg-background px-2 text-xs text-foreground transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring dark:bg-card"
        aria-label={`Filter by ${config.label}`}
      >
        <option value="">All {config.label}</option>
        {config.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ─── Multi-Select Filter ─────────────────────────────────────────────────────

interface MultiSelectFilterProps {
  config: MultiSelectFilterConfig;
  value: string[] | null | undefined;
  onChange: (value: unknown) => void;
}

function MultiSelectFilter({ config, value, onChange }: MultiSelectFilterProps) {
  const selectedValues = value ?? [];

  const toggleOption = (optionValue: string) => {
    if (selectedValues.includes(optionValue)) {
      const updated = selectedValues.filter((v) => v !== optionValue);
      onChange(updated.length > 0 ? updated : null);
    } else {
      onChange([...selectedValues, optionValue]);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">
        {config.label}
      </span>
      <div
        className="flex flex-wrap gap-1"
        role="group"
        aria-label={`Filter by ${config.label}`}
      >
        {config.options.map((option) => {
          const isSelected = selectedValues.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => toggleOption(option.value)}
              className={`rounded-[12px] border px-2 py-1 text-xs font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring ${
                isSelected
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-input bg-background text-foreground hover:bg-accent dark:bg-card'
              }`}
              aria-pressed={isSelected}
              aria-label={`${option.label}${isSelected ? ' (selected)' : ''}`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Date Range Filter ───────────────────────────────────────────────────────

interface DateRangeFilterProps {
  config: DateRangeFilterConfig;
  value: DateRangeValue | null | undefined;
  onChange: (value: unknown) => void;
}

function DateRangeFilter({ config, value, onChange }: DateRangeFilterProps) {
  const dateRange = value ?? { start: null, end: null };

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = e.target.value || null;
    const newValue: DateRangeValue = { ...dateRange, start: newStart };
    // If both are null, clear the filter
    if (!newValue.start && !newValue.end) {
      onChange(null);
    } else {
      onChange(newValue);
    }
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEnd = e.target.value || null;
    const newValue: DateRangeValue = { ...dateRange, end: newEnd };
    if (!newValue.start && !newValue.end) {
      onChange(null);
    } else {
      onChange(newValue);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">
        {config.label}
      </span>
      <div className="flex items-center gap-2">
        <label htmlFor={`filter-${config.key}-start`} className="sr-only">
          {config.label} start date
        </label>
        <input
          id={`filter-${config.key}-start`}
          type="date"
          value={dateRange.start ?? ''}
          onChange={handleStartChange}
          className="h-8 rounded-[12px] border border-input bg-background px-2 text-xs text-foreground transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring dark:bg-card"
          aria-label={`${config.label} start date`}
        />
        <span className="text-xs text-muted-foreground" aria-hidden="true">
          to
        </span>
        <label htmlFor={`filter-${config.key}-end`} className="sr-only">
          {config.label} end date
        </label>
        <input
          id={`filter-${config.key}-end`}
          type="date"
          value={dateRange.end ?? ''}
          onChange={handleEndChange}
          className="h-8 rounded-[12px] border border-input bg-background px-2 text-xs text-foreground transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring dark:bg-card"
          aria-label={`${config.label} end date`}
        />
      </div>
    </div>
  );
}

// ─── Utility: AND Logic Filter Composition ───────────────────────────────────

/**
 * Applies multiple filters with AND logic composition.
 * Returns only items that satisfy ALL active filter predicates simultaneously.
 *
 * Exported for use in filtering logic and property-based tests.
 *
 * @param items - Array of items to filter
 * @param activeFilters - Currently active filter values
 * @param filterPredicates - Map of filter key to predicate function
 * @returns Items matching all active filters (AND composition)
 */
export function applyFiltersWithAndLogic<T>(
  items: T[],
  activeFilters: Record<string, unknown>,
  filterPredicates: Record<string, (item: T, value: unknown) => boolean>
): T[] {
  const activeEntries = Object.entries(activeFilters).filter(
    ([, value]) => {
      if (value === null || value === undefined || value === '') return false;
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'object' && value !== null) {
        const dateRange = value as DateRangeValue;
        return dateRange.start !== null || dateRange.end !== null;
      }
      return true;
    }
  );

  if (activeEntries.length === 0) {
    return items;
  }

  return items.filter((item) =>
    activeEntries.every(([key, value]) => {
      const predicate = filterPredicates[key];
      if (!predicate) return true;
      return predicate(item, value);
    })
  );
}
