'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { TopNav } from '@/components/admin/TopNav';
import { Sidebar } from '@/components/admin/Sidebar';
import { ErrorBoundary } from '@/components/admin/ErrorBoundary';
import type { AdminUser } from '@/types/admin';

/** localStorage key for dark mode preference */
const DARK_MODE_KEY = 'wordpal-admin-dark-mode';

/**
 * Reads the dark mode preference from localStorage.
 * Falls back to system preference if not set.
 */
function getInitialDarkMode(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const stored = localStorage.getItem(DARK_MODE_KEY);
    if (stored !== null) {
      return JSON.parse(stored) === true;
    }
  } catch {
    // Ignore parse errors
  }
  // Fall back to system preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * AdminLayoutShell - Client component wrapping TopNav + Sidebar with state.
 *
 * Manages dark mode state (persisted to localStorage) and provides
 * placeholder user/notification data until real auth context is connected.
 */
export function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate dark mode from localStorage on mount
  useEffect(() => {
    const initial = getInitialDarkMode();
    setIsDarkMode(initial);
    setIsHydrated(true);
  }, []);

  // Apply dark class to document element
  useEffect(() => {
    if (!isHydrated) return;
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode, isHydrated]);

  const handleThemeToggle = useCallback(() => {
    setIsDarkMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(DARK_MODE_KEY, JSON.stringify(next));
      } catch {
        // localStorage may be unavailable
      }
      return next;
    });
  }, []);

  const handleSearch = useCallback((query: string) => {
    // Global search handler - will trigger search modal/results
    console.log('Global search:', query);
  }, []);

  // Placeholder user until real auth context is integrated
  const placeholderUser: AdminUser = {
    id: 'current-user',
    email: 'admin@wordpal.com',
    displayName: 'Admin User',
    role: 'admin',
    avatarUrl: null,
    cefrLevel: 'C2',
    status: 'active',
    currentLessonId: null,
    currentLearningPathId: null,
    grammarScore: 100,
    progressPercentage: 100,
    joinedAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <TopNav
        user={placeholderUser}
        notificationCount={0}
        onSearch={handleSearch}
        onThemeToggle={handleThemeToggle}
        isDarkMode={isDarkMode}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6 dark:bg-background">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
