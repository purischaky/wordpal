'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import type { AdminUser, AdminNotification } from '@/types/admin';
import { useAuth } from '@/lib/hooks/useAuth';
import { SearchBar } from './design-system/SearchBar';
import { NotificationCenter } from './design-system/NotificationCenter';
import { GlobalSearchModal, useGlobalSearchShortcut } from './GlobalSearchModal';

export interface TopNavProps {
  /** Current authenticated admin user */
  user: AdminUser;
  /** Count of unread notifications */
  notificationCount: number;
  /** Callback invoked with the global search query */
  onSearch: (query: string) => void;
  /** Callback to toggle dark/light theme */
  onThemeToggle: () => void;
  /** Whether dark mode is currently active */
  isDarkMode: boolean;
}

/**
 * TopNav - Top navigation bar for the admin dashboard.
 *
 * Contains:
 * - Global search input (max 100 chars, debounced)
 * - NotificationCenter integration with bell icon and badge
 * - AI Assistant trigger button (sparkle icon)
 * - User avatar with dropdown menu (profile link, sign out)
 * - Dark mode toggle (sun/moon icon) persisting to localStorage
 *
 * Sticky at top, responsive at all viewport sizes, supports dark mode.
 *
 * @see Requirements 1.1, 1.5, 16.1
 */
export function TopNav({
  user,
  notificationCount,
  onSearch,
  onThemeToggle,
  isDarkMode,
}: TopNavProps) {
  const { signOut } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [isSearchOpen, setIsSearchOpen] = useGlobalSearchShortcut();

  // Placeholder notifications state - in a real app, this would come from a context/provider
  const [notifications] = useState<AdminNotification[]>([]);

  // Close user menu on outside click
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
      setIsUserMenuOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen, handleClickOutside]);

  // Close user menu on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isUserMenuOpen) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isUserMenuOpen]);

  const handleThemeToggle = () => {
    onThemeToggle();
    // Persist to localStorage
    const newMode = !isDarkMode;
    try {
      localStorage.setItem('wordpal-admin-dark-mode', JSON.stringify(newMode));
    } catch {
      // localStorage may be unavailable in some environments
    }
  };

  const handleMarkRead = (id: string) => {
    // Will be connected to real notification service
    console.log('Mark notification read:', id);
  };

  const handleMarkAllRead = () => {
    // Will be connected to real notification service
    console.log('Mark all notifications read');
  };

  const handleNotificationClick = (notification: AdminNotification) => {
    // Navigate to context URL
    if (notification.contextUrl) {
      window.location.href = notification.contextUrl;
    }
  };

  // Get user initials for avatar fallback
  const getUserInitials = (name: string): string => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header
      className="sticky top-0 z-50 flex h-14 items-center border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:border-border"
      role="banner"
    >
      {/* Left section: Logo + Search */}
      <div className="flex flex-1 items-center gap-4">
        <span className="shrink-0 text-lg font-semibold text-foreground">
          WordPal Admin
        </span>

        {/* Global search - visible on md+ screens */}
        <div className="ml-4 hidden max-w-sm flex-1 md:block">
          <div
            onClick={() => setIsSearchOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsSearchOpen(true);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Open global search (Ctrl+K)"
            className="cursor-pointer"
          >
            <SearchBar
              placeholder="Search... (Ctrl+K)"
              maxLength={100}
              onSearch={onSearch}
              debounceMs={300}
            />
          </div>
        </div>
      </div>

      {/* Right section: Actions */}
      <div className="flex items-center gap-1">
        {/* Mobile search trigger - visible on small screens */}
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-[8px] text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:hidden"
          aria-label="Open search"
          onClick={() => setIsSearchOpen(true)}
        >
          <svg
            className="h-5 w-5"
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
        </button>

        {/* Dark mode toggle */}
        <button
          type="button"
          onClick={handleThemeToggle}
          className="flex h-10 w-10 items-center justify-center rounded-[8px] text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? (
            /* Sun icon - shown in dark mode to switch to light */
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
              />
            </svg>
          ) : (
            /* Moon icon - shown in light mode to switch to dark */
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
              />
            </svg>
          )}
        </button>

        {/* Notification Center */}
        <NotificationCenter
          notifications={notifications}
          unreadCount={notificationCount}
          onMarkRead={handleMarkRead}
          onMarkAllRead={handleMarkAllRead}
          onClick={handleNotificationClick}
        />

        {/* User avatar with dropdown */}
        <div ref={userMenuRef} className="relative ml-1">
          <button
            type="button"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-full ring-2 ring-transparent transition-all duration-200 hover:ring-primary/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            aria-label="User menu"
            aria-expanded={isUserMenuOpen}
            aria-haspopup="true"
          >
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={`${user.displayName}'s avatar`}
                width={36}
                height={36}
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {getUserInitials(user.displayName)}
              </div>
            )}
          </button>

          {/* User dropdown menu */}
          {isUserMenuOpen && (
            <div
              className="absolute right-0 top-full z-50 mt-2 w-56 rounded-[12px] border border-border bg-card py-1 shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all duration-200 dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)]"
              role="menu"
              aria-label="User menu options"
            >
              {/* User info header */}
              <div className="border-b border-border px-4 py-3">
                <p className="truncate text-sm font-medium text-card-foreground">
                  {user.displayName}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>

              {/* Menu items */}
              <div className="py-1">
                <a
                  href="/admin/profile"
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-card-foreground transition-colors duration-200 hover:bg-accent"
                  role="menuitem"
                >
                  <svg
                    className="h-4 w-4 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                    />
                  </svg>
                  Profile
                </a>

                <button
                  type="button"
                  onClick={async () => {
                    setIsUserMenuOpen(false);
                    await signOut();
                    window.location.href = '/auth/signin';
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-destructive transition-colors duration-200 hover:bg-accent"
                  role="menuitem"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15"
                    />
                  </svg>
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </header>
  );
}
