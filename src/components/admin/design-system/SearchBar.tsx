'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

export interface SearchBarProps {
  /** Placeholder text for the search input */
  placeholder?: string;
  /** Maximum number of characters allowed (default: 100) */
  maxLength?: number;
  /** Callback invoked with the search query after debounce */
  onSearch: (query: string) => void;
  /** Debounce delay in milliseconds (default: 300) */
  debounceMs?: number;
}

/**
 * SearchBar - A debounced search input for the admin dashboard.
 * Supports 300ms debounce, 100 character max, case-insensitive substring matching.
 *
 * Design tokens: 12px border radius, soft shadows, 200ms transitions.
 * WCAG compliant: visible label via aria-label, keyboard accessible, focus indicator.
 *
 * Validates: Requirements 4.2, 4.3, 16.1
 */
export function SearchBar({
  placeholder = 'Search...',
  maxLength = 100,
  onSearch,
  debounceMs = 300,
}: SearchBarProps) {
  const [value, setValue] = useState('');
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSearchRef = useRef(onSearch);

  // Keep the callback ref up to date without triggering effects
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setValue(newValue);

      // Clear any pending debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set a new debounce timer
      debounceTimerRef.current = setTimeout(() => {
        onSearchRef.current(newValue);
      }, debounceMs);
    },
    [debounceMs]
  );

  const handleClear = useCallback(() => {
    setValue('');
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    onSearchRef.current('');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="relative w-full">
      {/* Search icon */}
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <svg
          className="h-4 w-4 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
      </div>

      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        maxLength={maxLength}
        aria-label={placeholder}
        className="h-10 w-full rounded-[12px] border border-input bg-background py-2 pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent dark:bg-card dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] dark:focus:ring-ring"
      />

      {/* Clear button */}
      {value.length > 0 && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors duration-200"
          aria-label="Clear search"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

/**
 * Utility function for case-insensitive substring matching.
 * Exported for use in filtering logic and property-based tests.
 *
 * @param items - Array of items to filter
 * @param query - Search query string
 * @param getSearchableFields - Function to extract searchable text fields from an item
 * @returns Filtered items where at least one field contains the query as a case-insensitive substring
 */
export function filterBySubstring<T>(
  items: T[],
  query: string,
  getSearchableFields: (item: T) => string[]
): T[] {
  if (!query.trim()) {
    return items;
  }

  const normalizedQuery = query.toLowerCase();

  return items.filter((item) => {
    const fields = getSearchableFields(item);
    return fields.some((field) =>
      field.toLowerCase().includes(normalizedQuery)
    );
  });
}
