'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { StudentTable, StudentRow, ColumnConfig, SortState, PaginationState } from '@/components/admin/design-system/StudentTable';
import { SearchBar, filterBySubstring } from '@/components/admin/design-system/SearchBar';
import { FilterPanel, FilterConfig, applyFiltersWithAndLogic } from '@/components/admin/design-system/FilterPanel';

// ─── Column Configuration ────────────────────────────────────────────────────

const COLUMNS: ColumnConfig[] = [
  { key: 'avatar', label: 'Avatar', width: 'w-12' },
  { key: 'name', label: 'Name', sticky: true },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'cefrLevel', label: 'CEFR Level' },
  { key: 'currentLesson', label: 'Current Lesson' },
  { key: 'grammarScore', label: 'Grammar Score', sortable: true },
  { key: 'progressPercentage', label: 'Progress %', sortable: true },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions' },
];

// ─── Filter Configuration ────────────────────────────────────────────────────

const FILTER_CONFIGS: FilterConfig[] = [
  {
    key: 'role',
    label: 'Role',
    type: 'select',
    options: [
      { label: 'Admin', value: 'admin' },
      { label: 'Instructor', value: 'instructor' },
      { label: 'Content Creator', value: 'content_creator' },
      { label: 'Student', value: 'student' },
    ],
  },
  {
    key: 'cefrLevel',
    label: 'CEFR Level',
    type: 'select',
    options: [
      { label: 'A1', value: 'A1' },
      { label: 'A2', value: 'A2' },
      { label: 'B1', value: 'B1' },
      { label: 'B2', value: 'B2' },
      { label: 'C1', value: 'C1' },
      { label: 'C2', value: 'C2' },
    ],
  },
  {
    key: 'learningPath',
    label: 'Learning Path',
    type: 'multi-select',
    options: [
      { label: 'Beginner Foundations', value: 'beginner-foundations' },
      { label: 'Intermediate Grammar', value: 'intermediate-grammar' },
      { label: 'Advanced Writing', value: 'advanced-writing' },
      { label: 'Business English', value: 'business-english' },
    ],
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
      { label: 'Suspended', value: 'suspended' },
    ],
  },
  {
    key: 'dateJoined',
    label: 'Date Joined',
    type: 'date-range',
  },
];

// ─── Filter Predicates ───────────────────────────────────────────────────────

const FILTER_PREDICATES: Record<string, (item: StudentRow, value: unknown) => boolean> = {
  role: (item, value) => item.role === (value as string),
  cefrLevel: (item, value) => item.cefrLevel === (value as string),
  learningPath: () => true, // Mock: no learning path data on StudentRow, passes all
  status: (item, value) => item.status === (value as string),
  dateJoined: () => true, // Mock: no joinedAt on StudentRow, passes all
};

// ─── Sort Comparator ─────────────────────────────────────────────────────────

function sortStudents(students: StudentRow[], sortState: SortState): StudentRow[] {
  const { column, direction } = sortState;

  return [...students].sort((a, b) => {
    let comparison = 0;

    switch (column) {
      case 'progressPercentage':
        comparison = a.progressPercentage - b.progressPercentage;
        break;
      case 'grammarScore':
        comparison = a.grammarScore - b.grammarScore;
        break;
      case 'lastActiveAt':
        comparison = new Date(a.lastActiveAt).getTime() - new Date(b.lastActiveAt).getTime();
        break;
      default:
        return 0;
    }

    return direction === 'asc' ? comparison : -comparison;
  });
}

// ─── Page Size ───────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

// ─── Student List Page ───────────────────────────────────────────────────────

export default function StudentsPage() {
  const router = useRouter();

  // Data state
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, unknown>>({});
  const [sortState, setSortState] = useState<SortState>({ column: 'progressPercentage', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch students from API on mount
  useEffect(() => {
    async function fetchStudents() {
      try {
        setIsLoading(true);
        setFetchError(null);
        const res = await fetch('/api/admin/students');
        const json = await res.json();
        if (json.error) {
          setFetchError(json.error);
          return;
        }
        setStudents(json.data as StudentRow[]);
      } catch {
        setFetchError('Failed to load students');
      } finally {
        setIsLoading(false);
      }
    }
    fetchStudents();
  }, []);

  // Search handler (called by SearchBar after 300ms debounce)
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  // Filter change handler
  const handleFilterChange = useCallback((key: string, value: unknown) => {
    setActiveFilters((prev) => {
      const next = { ...prev };
      if (value === null || value === undefined || value === '') {
        delete next[key];
      } else {
        next[key] = value;
      }
      return next;
    });
    setCurrentPage(1);
  }, []);

  // Clear all filters
  const handleClearAll = useCallback(() => {
    setActiveFilters({});
    setSearchQuery('');
    setCurrentPage(1);
  }, []);

  // Sort handler
  const handleSort = useCallback((column: string, direction: 'asc' | 'desc') => {
    setSortState({ column, direction });
    setCurrentPage(1);
  }, []);

  // Row click → navigate to student profile
  const handleRowClick = useCallback((studentId: string) => {
    router.push(`/admin/students/${studentId}`);
  }, [router]);

  // Compute filtered, sorted, paginated data
  const processedData = useMemo(() => {
    // 1. Apply search filter (case-insensitive substring on name/email)
    const searched = filterBySubstring(
      students,
      searchQuery,
      (student) => [student.name, student.email]
    );

    // 2. Apply filters with AND logic
    const filtered = applyFiltersWithAndLogic(searched, activeFilters, FILTER_PREDICATES);

    // 3. Sort
    const sorted = sortStudents(filtered, sortState);

    // 4. Paginate
    const totalItems = sorted.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * PAGE_SIZE;
    const paginatedStudents = sorted.slice(startIndex, startIndex + PAGE_SIZE);

    const pagination: PaginationState = {
      currentPage: safePage,
      totalPages,
      totalItems,
      pageSize: PAGE_SIZE,
    };

    return { students: paginatedStudents, pagination };
  }, [students, searchQuery, activeFilters, sortState, currentPage]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Students
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Manage and monitor student progress, performance, and engagement.
        </p>
      </div>

      {fetchError && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {fetchError}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-sm text-muted-foreground">Loading students...</div>
        </div>
      ) : (
        <>
          {/* Search Bar */}
          <SearchBar
            placeholder="Search students by name or email..."
            onSearch={handleSearch}
            debounceMs={300}
          />

          {/* Filter Panel */}
          <FilterPanel
            filters={FILTER_CONFIGS}
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
            onClearAll={handleClearAll}
          />

          {/* Sort Controls */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-muted-foreground">Sort by:</span>
            <div className="flex gap-2">
              {[
                { key: 'progressPercentage', label: 'Progress %' },
                { key: 'grammarScore', label: 'Grammar Score' },
                { key: 'lastActiveAt', label: 'Last Activity' },
              ].map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => {
                    const newDirection =
                      sortState.column === option.key && sortState.direction === 'asc'
                        ? 'desc'
                        : sortState.column === option.key
                        ? 'asc'
                        : 'desc';
                    handleSort(option.key, newDirection);
                  }}
                  className={`rounded-[12px] border px-3 py-1.5 text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring ${
                    sortState.column === option.key
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-input bg-background text-foreground hover:bg-accent dark:bg-card'
                  }`}
                  aria-label={`Sort by ${option.label} ${
                    sortState.column === option.key
                      ? sortState.direction === 'asc'
                        ? 'descending'
                        : 'ascending'
                      : 'descending'
                  }`}
                >
                  {option.label}
                  {sortState.column === option.key && (
                    <span className="ml-1" aria-hidden="true">
                      {sortState.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Student Table or Empty State */}
          {processedData.students.length === 0 && processedData.pagination.totalItems === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:border-gray-700 dark:bg-gray-900 dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
              <div className="flex flex-col items-center justify-center px-6 py-16">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                  <svg
                    className="h-6 w-6 text-gray-400 dark:text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  No students match the criteria
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Try adjusting your search or filters to find what you&apos;re looking for.
                </p>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="mt-4 rounded-[12px] border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors duration-200 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          ) : (
            <StudentTable
              students={processedData.students}
              columns={COLUMNS}
              sortState={sortState}
              filterState={activeFilters}
              pagination={processedData.pagination}
              onSort={handleSort}
              onFilter={() => {}}
              onPageChange={setCurrentPage}
              onRowClick={handleRowClick}
            />
          )}
        </>
      )}
    </div>
  );
}
