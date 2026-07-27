'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import type { UserRole, AdminSection } from '@/types/admin';
import { ROLE_PERMISSIONS } from '@/types/admin';

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface SidebarProps {
  currentPath?: string;
  userRole?: UserRole;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  section: AdminSection;
  requiredRoles: UserRole[];
}

export interface BreadcrumbItem {
  label: string;
  href: string;
}

// ─── Breadcrumb Utility ──────────────────────────────────────────────────────

const SEGMENT_LABELS: Record<string, string> = {
  admin: 'Dashboard',
  students: 'Students',
  'learning-paths': 'Learning Paths',
  lessons: 'Lessons',
  exercises: 'Exercises',
  'ai-studio': 'AI Content Studio',
  challenges: 'Challenges',
  analytics: 'Analytics',
  achievements: 'Achievements',
  settings: 'Settings',
  profile: 'Profile',
  notifications: 'Notifications',
  denied: 'Access Denied',
  new: 'New',
  edit: 'Edit',
};

/**
 * Generates breadcrumb items from a pathname.
 * Max depth of 5 levels. Maps path segments to readable labels.
 *
 * @param pathname - e.g. "/admin/learning-paths/123/edit"
 * @returns Array of breadcrumb items with label and href
 */
export function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  // Remove trailing slash and split
  const cleaned = pathname.replace(/\/$/, '') || '/admin';
  const segments = cleaned.split('/').filter(Boolean);

  // Build breadcrumbs from segments, max depth 5
  const breadcrumbs: BreadcrumbItem[] = [];
  let currentPath = '';

  for (let i = 0; i < segments.length && breadcrumbs.length < 5; i++) {
    const segment = segments[i];
    currentPath += `/${segment}`;

    // Get a readable label for this segment
    const label = SEGMENT_LABELS[segment] ?? formatSegmentLabel(segment);
    breadcrumbs.push({ label, href: currentPath });
  }

  return breadcrumbs;
}

/**
 * Formats a path segment into a readable label.
 * Handles UUIDs/IDs by showing them truncated, and kebab-case by converting to title case.
 */
function formatSegmentLabel(segment: string): string {
  // If it looks like a UUID or numeric ID, show as "Detail"
  if (/^[0-9a-f-]{8,}$/i.test(segment) || /^\d+$/.test(segment)) {
    return 'Detail';
  }
  // Convert kebab-case to Title Case
  return segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function DashboardIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
    </svg>
  );
}

function StudentsIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>
  );
}

function LearningPathsIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
    </svg>
  );
}

function LessonsIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    </svg>
  );
}

function ExercisesIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
    </svg>
  );
}

function AIStudioIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
    </svg>
  );
}

function ChallengesIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.996.178-1.768.95-1.99 1.93a11.956 11.956 0 0 0 3.322 11.103 8.974 8.974 0 0 0 3.168 2.108 8.964 8.964 0 0 0 3.168-2.108 11.955 11.955 0 0 0 3.323-11.103c-.222-.98-.994-1.752-1.99-1.93A37.87 37.87 0 0 0 12 4.002a37.87 37.87 0 0 0-6.75.234Z" />
    </svg>
  );
}

function AnalyticsIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  );
}

function AchievementsIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );
}

function HamburgerIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg className="h-3 w-3 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  );
}

// ─── Navigation Items ────────────────────────────────────────────────────────

/**
 * Determines which roles can see each nav item based on ROLE_PERMISSIONS.
 * A role can see a nav item if its corresponding AdminSection is in that role's permitted set.
 */
function getRolesForSection(section: AdminSection): UserRole[] {
  const roles: UserRole[] = ['admin', 'instructor', 'content_creator', 'student'];
  return roles.filter((role) => ROLE_PERMISSIONS[role].includes(section));
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: <DashboardIcon />, section: 'dashboard', requiredRoles: getRolesForSection('dashboard') },
  { label: 'Students', href: '/admin/students', icon: <StudentsIcon />, section: 'students', requiredRoles: getRolesForSection('students') },
  { label: 'Learning Paths', href: '/admin/learning-paths', icon: <LearningPathsIcon />, section: 'learning-paths', requiredRoles: getRolesForSection('learning-paths') },
  { label: 'Lessons', href: '/admin/lessons', icon: <LessonsIcon />, section: 'lessons', requiredRoles: getRolesForSection('lessons') },
  { label: 'Exercises', href: '/admin/exercises', icon: <ExercisesIcon />, section: 'exercises', requiredRoles: getRolesForSection('exercises') },
  { label: 'AI Content Studio', href: '/admin/ai-studio', icon: <AIStudioIcon />, section: 'ai-studio', requiredRoles: getRolesForSection('ai-studio') },
  { label: 'Challenges', href: '/admin/challenges', icon: <ChallengesIcon />, section: 'challenges', requiredRoles: getRolesForSection('challenges') },
  { label: 'Analytics', href: '/admin/analytics', icon: <AnalyticsIcon />, section: 'analytics', requiredRoles: getRolesForSection('analytics') },
  { label: 'Achievements', href: '/admin/achievements', icon: <AchievementsIcon />, section: 'achievements', requiredRoles: getRolesForSection('achievements') },
  { label: 'Settings', href: '/admin/settings', icon: <SettingsIcon />, section: 'settings', requiredRoles: getRolesForSection('settings') },
];

// ─── Breadcrumb Component ────────────────────────────────────────────────────

function Breadcrumbs({ pathname }: { pathname: string }) {
  const breadcrumbs = generateBreadcrumbs(pathname);

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="px-4 py-2 border-b border-gray-200 dark:border-gray-800">
      <ol className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 overflow-x-auto">
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.href} className="flex items-center gap-1 whitespace-nowrap">
            {index > 0 && <ChevronRightIcon />}
            {index === breadcrumbs.length - 1 ? (
              <span className="font-medium text-gray-900 dark:text-white" aria-current="page">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// ─── Sidebar Component ───────────────────────────────────────────────────────

export function Sidebar({
  currentPath,
  userRole = 'admin',
  isCollapsed: controlledCollapsed,
  onToggleCollapse,
}: SidebarProps = {}) {
  const pathname = usePathname();
  const activePath = currentPath ?? pathname;

  // Internal collapsed state (used when not controlled externally)
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const isCollapsed = controlledCollapsed ?? internalCollapsed;

  // Mobile overlay state
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleToggle = useCallback(() => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed((prev) => !prev);
    }
  }, [onToggleCollapse]);

  // Auto-collapse below 1024px viewport width
  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');

    function handleChange(e: MediaQueryListEvent | MediaQueryList) {
      if (!onToggleCollapse) {
        setInternalCollapsed(!e.matches);
      }
      // Close mobile overlay when expanding to desktop
      if (e.matches) {
        setMobileOpen(false);
      }
    }

    handleChange(mediaQuery);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [onToggleCollapse]);

  // Filter nav items by user role
  const visibleNavItems = NAV_ITEMS.filter((item) =>
    item.requiredRoles.includes(userRole)
  );

  // Check if a nav item is active
  function isActive(itemHref: string): boolean {
    if (itemHref === '/admin') {
      return activePath === '/admin';
    }
    return activePath.startsWith(itemHref);
  }

  // Render navigation links
  const navContent = (
    <nav className="flex flex-col gap-1 p-3" aria-label="Admin navigation">
      {visibleNavItems.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ${
              active
                ? 'bg-blue-50 text-blue-700 font-semibold dark:bg-blue-900/30 dark:text-blue-300'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
            } ${isCollapsed && !mobileOpen ? 'justify-center' : ''}`}
            aria-current={active ? 'page' : undefined}
            title={isCollapsed && !mobileOpen ? item.label : undefined}
            onClick={() => setMobileOpen(false)}
          >
            <span className="shrink-0">{item.icon}</span>
            {(!isCollapsed || mobileOpen) && (
              <span className="truncate">{item.label}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Hamburger button for collapsed/mobile state */}
      {isCollapsed && (
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="fixed bottom-4 left-4 z-50 rounded-full bg-blue-600 p-3 text-white shadow-lg hover:bg-blue-700 transition-colors lg:hidden"
          aria-label="Open navigation menu"
        >
          <HamburgerIcon />
        </button>
      )}

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          {/* Panel */}
          <aside
            className="absolute left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-900 shadow-xl flex flex-col overflow-y-auto"
            role="navigation"
            aria-label="Admin navigation"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                Navigation
              </span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-md p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Close navigation menu"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {navContent}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 transition-all duration-200 overflow-y-auto ${
          isCollapsed ? 'w-16' : 'w-60'
        }`}
        role="navigation"
        aria-label="Admin navigation"
      >
        {/* Toggle button */}
        <div className="flex items-center justify-end p-2 border-b border-gray-200 dark:border-gray-800">
          <button
            type="button"
            onClick={handleToggle}
            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <HamburgerIcon />
          </button>
        </div>

        {/* Breadcrumbs (only when expanded) */}
        {!isCollapsed && <Breadcrumbs pathname={activePath} />}

        {/* Nav links */}
        {navContent}
      </aside>
    </>
  );
}
