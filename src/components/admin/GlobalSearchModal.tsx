'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// ─── Search Result Types ─────────────────────────────────────────────────────

export type SearchCategory =
  | 'Students'
  | 'Learning Paths'
  | 'Lessons'
  | 'Exercises'
  | 'Challenges';

export interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  category: SearchCategory;
  href: string;
}

export interface CategoryResults {
  category: SearchCategory;
  results: SearchResult[];
  totalCount: number;
  viewAllHref: string;
}

export interface GlobalSearchModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Optional callback when navigating to a result */
  onNavigate?: (href: string) => void;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const CATEGORY_VIEW_ALL_HREFS: Record<SearchCategory, string> = {
  'Students': '/admin/students',
  'Learning Paths': '/admin/learning-paths',
  'Lessons': '/admin/lessons',
  'Exercises': '/admin/exercises',
  'Challenges': '/admin/challenges',
};

const CATEGORY_ORDER: SearchCategory[] = [
  'Students',
  'Learning Paths',
  'Lessons',
  'Exercises',
  'Challenges',
];

const MAX_RESULTS_PER_CATEGORY = 5;

// ─── Search Logic ────────────────────────────────────────────────────────────

/**
 * Fetches search results from the API and groups them by category.
 * Returns results grouped by category, limited to MAX_RESULTS_PER_CATEGORY per group.
 */
export async function performSearch(query: string): Promise<CategoryResults[]> {
  if (query.length < 2) return [];

  const res = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`);
  const json = await res.json();

  if (json.error) return [];

  const matchingResults: SearchResult[] = json.data;

  const grouped: CategoryResults[] = CATEGORY_ORDER
    .map((category) => {
      const categoryResults = matchingResults.filter((r) => r.category === category);
      return {
        category,
        results: categoryResults.slice(0, MAX_RESULTS_PER_CATEGORY),
        totalCount: categoryResults.length,
        viewAllHref: `${CATEGORY_VIEW_ALL_HREFS[category]}?search=${encodeURIComponent(query)}`,
      };
    })
    .filter((group) => group.results.length > 0);

  return grouped;
}

// ─── Category Icons ──────────────────────────────────────────────────────────

function CategoryIcon({ category }: { category: SearchCategory }) {
  const iconClass = 'h-4 w-4 shrink-0 text-muted-foreground';

  switch (category) {
    case 'Students':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
      );
    case 'Learning Paths':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
        </svg>
      );
    case 'Lessons':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
        </svg>
      );
    case 'Exercises':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 0 1-.657.643 48.39 48.39 0 0 1-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 0 1-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 0 0-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 0 1-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 0 0 .657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 0 1-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.401.604-.401.959v0c0 .333.277.599.61.58a48.1 48.1 0 0 0 5.427-.63 48.05 48.05 0 0 0 .582-4.717.532.532 0 0 0-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.959.401v0a.656.656 0 0 0 .658-.663 48.422 48.422 0 0 0-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 0 1-.61-.58v0Z" />
        </svg>
      );
    case 'Challenges':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.996.178-1.768.563-2.048 1.074a2.9 2.9 0 0 0-.234.57 3.04 3.04 0 0 0 .238 2.345c.345.592.956 1.05 1.797 1.345M5.25 4.236V3.375a.375.375 0 0 1 .375-.375h12.75a.375.375 0 0 1 .375.375v.861M5.25 4.236a52.003 52.003 0 0 1 13.5 0m0 0c.996.178 1.768.563 2.048 1.074.133.229.198.461.234.57a3.04 3.04 0 0 1-.238 2.345c-.345.592-.956 1.05-1.797 1.345" />
        </svg>
      );
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * GlobalSearchModal - A modal search dialog for finding content across all categories.
 *
 * Features:
 * - Opens via Ctrl+K (Windows) / Cmd+K (Mac) keyboard shortcut
 * - Search input with 300ms debounce
 * - Displays categorized results: Students, Learning Paths, Lessons, Exercises, Challenges
 * - Max 5 results per category with "View All" links
 * - Result selection navigates to detail page and closes modal
 * - Escape key or click-outside closes modal
 * - Loading state while searching
 * - Empty state when no results found
 * - Accessible with ARIA roles (dialog, listbox, option)
 *
 * @see Requirements 16.1, 16.2, 16.3, 16.4, 16.5
 */
export function GlobalSearchModal({ isOpen, onClose, onNavigate }: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CategoryResults[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Flatten results for keyboard navigation
  const flatResults = useMemo(() => {
    return results.flatMap((group) => group.results);
  }, [results]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      // Short delay to allow rendering
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      // Reset state when closing
      setQuery('');
      setResults([]);
      setActiveIndex(-1);
      setIsLoading(false);
    }
  }, [isOpen]);

  // Debounced search
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setActiveIndex(-1);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    debounceRef.current = setTimeout(async () => {
      const searchResults = await performSearch(value);
      setResults(searchResults);
      setIsLoading(false);
    }, 300);
  }, []);

  // Navigate to result
  const handleSelectResult = useCallback(
    (result: SearchResult) => {
      onClose();
      if (onNavigate) {
        onNavigate(result.href);
      } else {
        window.location.href = result.href;
      }
    },
    [onClose, onNavigate]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex((prev) =>
            prev < flatResults.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex((prev) =>
            prev > 0 ? prev - 1 : flatResults.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (activeIndex >= 0 && activeIndex < flatResults.length) {
            handleSelectResult(flatResults[activeIndex]);
          }
          break;
      }
    },
    [onClose, flatResults, activeIndex, handleSelectResult]
  );

  // Click outside to close
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) {
        onClose();
      }
    },
    [onClose]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  const hasResults = results.length > 0;
  const showEmptyState = query.length >= 2 && !isLoading && !hasResults;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/50 pt-[15vh] backdrop-blur-sm"
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-[12px] border border-border bg-card shadow-[0_16px_48px_rgba(0,0,0,0.2)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.5)]"
        role="dialog"
        aria-modal="true"
        aria-label="Global search"
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <svg
            className="h-5 w-5 shrink-0 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search students, lessons, paths, exercises..."
            className="flex-1 bg-transparent text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none"
            maxLength={100}
            aria-label="Search"
            aria-autocomplete="list"
            aria-controls="search-results-listbox"
            aria-activedescendant={
              activeIndex >= 0 ? `search-result-${flatResults[activeIndex]?.id}` : undefined
            }
          />
          <kbd className="hidden shrink-0 rounded-md border border-border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground sm:inline-block">
            Esc
          </kbd>
        </div>

        {/* Results area */}
        <div
          className="max-h-[400px] overflow-y-auto"
          id="search-results-listbox"
          role="listbox"
          aria-label="Search results"
        >
          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <svg
                  className="h-4 w-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Searching...
              </div>
            </div>
          )}

          {/* Empty state */}
          {showEmptyState && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
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
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
              <p className="text-sm font-medium text-card-foreground">
                No results found
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Try checking the spelling or using different keywords
              </p>
            </div>
          )}

          {/* Initial state hint */}
          {query.length < 2 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <p className="text-sm text-muted-foreground">
                Type at least 2 characters to search
              </p>
            </div>
          )}

          {/* Categorized results */}
          {hasResults &&
            !isLoading &&
            results.map((group) => {
              let runningIndex = 0;
              // Calculate the starting index for this group in the flat list
              for (const g of results) {
                if (g.category === group.category) break;
                runningIndex += g.results.length;
              }

              return (
                <div key={group.category} className="border-b border-border last:border-b-0">
                  {/* Category header */}
                  <div className="flex items-center justify-between px-4 py-2">
                    <div className="flex items-center gap-2">
                      <CategoryIcon category={group.category} />
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {group.category}
                      </span>
                    </div>
                    {group.totalCount > MAX_RESULTS_PER_CATEGORY && (
                      <a
                        href={group.viewAllHref}
                        className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
                        onClick={(e) => {
                          e.preventDefault();
                          onClose();
                          if (onNavigate) {
                            onNavigate(group.viewAllHref);
                          } else {
                            window.location.href = group.viewAllHref;
                          }
                        }}
                      >
                        View All ({group.totalCount})
                      </a>
                    )}
                  </div>

                  {/* Results list */}
                  <div>
                    {group.results.map((result, idx) => {
                      const globalIdx = runningIndex + idx;
                      const isActive = globalIdx === activeIndex;

                      return (
                        <button
                          key={result.id}
                          id={`search-result-${result.id}`}
                          type="button"
                          role="option"
                          aria-selected={isActive}
                          className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors duration-150 ${
                            isActive
                              ? 'bg-accent text-accent-foreground'
                              : 'text-card-foreground hover:bg-accent/50'
                          }`}
                          onClick={() => handleSelectResult(result)}
                          onMouseEnter={() => setActiveIndex(globalIdx)}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {result.title}
                            </p>
                            {result.subtitle && (
                              <p className="truncate text-xs text-muted-foreground">
                                {result.subtitle}
                              </p>
                            )}
                          </div>
                          {/* Arrow indicator for active item */}
                          {isActive && (
                            <svg
                              className="h-4 w-4 shrink-0 text-muted-foreground"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m8.25 4.5 7.5 7.5-7.5 7.5"
                              />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Footer hint */}
        <div className="flex items-center justify-between border-t border-border px-4 py-2">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">↑↓</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">↵</kbd>
              select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">esc</kbd>
              close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Keyboard Shortcut Hook ──────────────────────────────────────────────────

/**
 * Hook that listens for Ctrl+K (Windows/Linux) or Cmd+K (Mac) to open the search modal.
 * Returns [isOpen, setIsOpen] state tuple.
 */
export function useGlobalSearchShortcut(): [boolean, React.Dispatch<React.SetStateAction<boolean>>] {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K on Windows/Linux, Cmd+K on Mac
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return [isOpen, setIsOpen];
}
