'use client';

import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

// ─── Local Types ─────────────────────────────────────────────────────────────

/** A row of student data for display in the table */
export interface StudentRow {
  id: string;
  avatarUrl: string | null;
  name: string;
  email: string;
  role: string;
  cefrLevel: string;
  currentLesson: string | null;
  grammarScore: number;
  progressPercentage: number;
  status: 'active' | 'inactive' | 'suspended';
  lastActiveAt: string;
}

/** Configuration for a table column */
export interface ColumnConfig {
  key: string;
  label: string;
  sortable?: boolean;
  /** Width class for the column (Tailwind) */
  width?: string;
  /** Whether this column should be sticky on mobile (first column) */
  sticky?: boolean;
}

/** Current sort state */
export interface SortState {
  column: string;
  direction: 'asc' | 'desc';
}

/** Active filter state - keys are filter names, values are active filter values */
export interface FilterState {
  [key: string]: unknown;
}

/** Pagination state */
export interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

/** Props for the StudentTable component */
export interface StudentTableProps {
  students: StudentRow[];
  columns: ColumnConfig[];
  sortState: SortState;
  filterState: FilterState;
  pagination: PaginationState;
  onSort: (column: string, direction: 'asc' | 'desc') => void;
  onFilter: (filters: FilterState) => void;
  onPageChange: (page: number) => void;
  onRowClick: (studentId: string) => void;
  loading?: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

// ─── Sub-components ──────────────────────────────────────────────────────────

function SkeletonRow({ columnCount }: { columnCount: number }) {
  return (
    <tr className="border-b border-gray-100 dark:border-gray-800">
      {Array.from({ length: columnCount }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 w-full max-w-[120px] animate-[skeleton-pulse_1500ms_ease-in-out_infinite] rounded bg-gray-200 dark:bg-gray-700" />
        </td>
      ))}
    </tr>
  );
}

function SortIndicator({ column, sortState }: { column: string; sortState: SortState }) {
  const isActive = sortState.column === column;

  return (
    <span className="ml-1 inline-flex flex-col items-center" aria-hidden="true">
      <ChevronUp
        className={`h-3 w-3 -mb-0.5 transition-colors duration-200 ${
          isActive && sortState.direction === 'asc'
            ? 'text-blue-600 dark:text-blue-400'
            : 'text-gray-300 dark:text-gray-600'
        }`}
      />
      <ChevronDown
        className={`h-3 w-3 -mt-0.5 transition-colors duration-200 ${
          isActive && sortState.direction === 'desc'
            ? 'text-blue-600 dark:text-blue-400'
            : 'text-gray-300 dark:text-gray-600'
        }`}
      />
    </span>
  );
}

function StatusBadge({ status }: { status: StudentRow['status'] }) {
  const styles: Record<StudentRow['status'], string> = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    inactive: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    suspended: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function PaginationControls({
  pagination,
  onPageChange,
}: {
  pagination: PaginationState;
  onPageChange: (page: number) => void;
}) {
  const { currentPage, totalPages, totalItems, pageSize } = pagination;
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers to display (max 5 visible)
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | 'ellipsis')[] = [1];

    if (currentPage > 3) {
      pages.push('ellipsis');
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push('ellipsis');
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-200 px-4 py-3 dark:border-gray-700 sm:flex-row">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Showing <span className="font-medium">{startItem}</span> to{' '}
        <span className="font-medium">{endItem}</span> of{' '}
        <span className="font-medium">{totalItems}</span> students
      </p>

      <nav className="flex items-center gap-1" aria-label="Pagination">
        {/* First page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="rounded-lg p-1.5 text-gray-500 transition-colors duration-200 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-800"
          aria-label="First page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>

        {/* Previous page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="rounded-lg p-1.5 text-gray-500 transition-colors duration-200 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-800"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Page numbers */}
        {getPageNumbers().map((page, index) =>
          page === 'ellipsis' ? (
            <span
              key={`ellipsis-${index}`}
              className="px-1 text-gray-400 dark:text-gray-500"
              aria-hidden="true"
            >
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`min-w-[32px] rounded-lg px-2 py-1 text-sm font-medium transition-colors duration-200 ${
                page === currentPage
                  ? 'bg-blue-600 text-white dark:bg-blue-500'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
              aria-label={`Page ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          )
        )}

        {/* Next page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="rounded-lg p-1.5 text-gray-500 transition-colors duration-200 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-800"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Last page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="rounded-lg p-1.5 text-gray-500 transition-colors duration-200 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-800"
          aria-label="Last page"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </nav>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

/**
 * StudentTable - A sortable, paginated table component for displaying student data.
 *
 * Features:
 * - Sortable columns with direction indicators
 * - Pagination (20 rows per page) with prev/next and page numbers
 * - Row hover effect
 * - Sticky table headers
 * - Horizontal scroll on mobile with sticky first column
 * - Loading skeleton state
 * - Empty state when no data
 * - Dark mode support
 * - Design tokens: 12px border radius, soft shadows, 200ms transitions
 *
 * @validates Requirements 4.1, 4.4, 18.5
 */
export function StudentTable({
  students,
  columns,
  sortState,
  pagination,
  onSort,
  onPageChange,
  onRowClick,
  loading = false,
}: StudentTableProps) {
  const handleSort = (column: string) => {
    const newDirection =
      sortState.column === column && sortState.direction === 'asc' ? 'desc' : 'asc';
    onSort(column, newDirection);
  };

  const renderCellContent = (student: StudentRow, columnKey: string) => {
    switch (columnKey) {
      case 'avatar':
        return (
          <div className="flex items-center justify-center">
            {student.avatarUrl ? (
              <img
                src={student.avatarUrl}
                alt={`${student.name} avatar`}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                {student.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        );
      case 'name':
        return (
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {student.name}
          </span>
        );
      case 'email':
        return (
          <span className="text-gray-600 dark:text-gray-400">{student.email}</span>
        );
      case 'role':
        return (
          <span className="text-sm capitalize text-gray-700 dark:text-gray-300">
            {student.role.replace('_', ' ')}
          </span>
        );
      case 'cefrLevel':
        return (
          <span className="inline-flex items-center rounded bg-purple-100 px-1.5 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
            {student.cefrLevel}
          </span>
        );
      case 'currentLesson':
        return (
          <span className="max-w-[120px] truncate text-sm text-gray-600 dark:text-gray-400">
            {student.currentLesson ?? '—'}
          </span>
        );
      case 'grammarScore':
        return (
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
            {student.grammarScore}
          </span>
        );
      case 'progressPercentage':
        return (
          <div className="flex items-center gap-2">
            <div className="h-2 w-16 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-200 dark:bg-blue-500"
                style={{ width: `${Math.min(100, Math.max(0, student.progressPercentage))}%` }}
              />
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {student.progressPercentage}%
            </span>
          </div>
        );
      case 'status':
        return <StatusBadge status={student.status} />;
      default:
        return (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {String((student as unknown as Record<string, unknown>)[columnKey] ?? '—')}
          </span>
        );
    }
  };

  // Empty state
  if (!loading && students.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white shadow-[var(--shadow-card)] dark:border-gray-700 dark:bg-gray-900">
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
            No students found
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            No students match the current filters. Try adjusting your search criteria.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[var(--shadow-card)] transition-shadow duration-200 hover:shadow-[var(--shadow-card-hover)] dark:border-gray-700 dark:bg-gray-900">
      {/* Scrollable table container */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] border-collapse text-sm">
          {/* Sticky header */}
          <thead className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/80">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 ${
                    col.sticky
                      ? 'sticky left-0 z-20 bg-gray-50 dark:bg-gray-800/80'
                      : ''
                  } ${col.width ?? ''} ${
                    col.sortable ? 'cursor-pointer select-none' : ''
                  }`}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  aria-sort={
                    sortState.column === col.key
                      ? sortState.direction === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                  scope="col"
                >
                  <div className="flex items-center">
                    <span>{col.label}</span>
                    {col.sortable && (
                      <SortIndicator column={col.key} sortState={sortState} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading
              ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <SkeletonRow key={`skeleton-${i}`} columnCount={columns.length} />
                ))
              : students.map((student) => (
                  <tr
                    key={student.id}
                    onClick={() => onRowClick(student.id)}
                    className="cursor-pointer transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    role="button"
                    tabIndex={0}
                    aria-label={`View profile for ${student.name}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onRowClick(student.id);
                      }
                    }}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-4 py-3 ${
                          col.sticky
                            ? 'sticky left-0 z-10 bg-white dark:bg-gray-900'
                            : ''
                        }`}
                      >
                        {renderCellContent(student, col.key)}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && pagination.totalPages > 0 && (
        <PaginationControls pagination={pagination} onPageChange={onPageChange} />
      )}
    </div>
  );
}

export default StudentTable;
