'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AIInsightCard } from '@/components/admin/design-system/AIInsightCard';
import type { AIInsight } from '@/types/admin';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AIInsightsSectionProps {
  /** Number of students at the relevant level; if <10, shows threshold guard */
  studentCount?: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Priority ordering: high first, then medium, then low */
const PRIORITY_ORDER: Record<'high' | 'medium' | 'low', number> = {
  high: 0,
  medium: 1,
  low: 2,
};

function sortByPriority(insights: AIInsight[]): AIInsight[] {
  return [...insights].sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
  );
}

function formatRefreshTimestamp(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * AIInsightsSection - Displays AI-powered learning insights within the Analytics page.
 *
 * Features:
 * - Renders insight cards sorted by priority (high → medium → low)
 * - "Take Action" on content-gap insights navigates to /admin/ai-studio
 * - "Take Action" on student-performance insights navigates to /admin/students
 * - Shows last refresh timestamp
 * - Empty state when no insights are available
 * - Minimum threshold guard: shows message if <10 students
 *
 * @validates Requirements 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8
 */
export function AIInsightsSection({ studentCount = 50 }: AIInsightsSectionProps) {
  const router = useRouter();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInsights() {
      try {
        const res = await fetch('/api/admin/ai-insights');
        const json = await res.json();
        if (json.data) {
          setInsights(json.data);
        }
      } catch (error) {
        console.error('Failed to fetch AI insights:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchInsights();
  }, []);

  // Minimum threshold guard (Req 12.7)
  if (studentCount < 10) {
    return (
      <section aria-labelledby="ai-insights-heading">
        <div className="mb-4 flex items-center justify-between">
          <h2
            id="ai-insights-heading"
            className="text-lg font-semibold text-foreground"
          >
            AI-Powered Insights
          </h2>
        </div>
        <div className="rounded-[12px] border border-border bg-card p-8 text-center shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <svg
              className="h-6 w-6 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-foreground">Insufficient Data</p>
          <p className="mt-1 text-xs text-muted-foreground">
            AI insights require at least 10 students with activity data at a given CEFR level.
            Currently tracking {studentCount} student{studentCount !== 1 ? 's' : ''}.
          </p>
        </div>
      </section>
    );
  }

  // Loading state
  if (loading) {
    return (
      <section aria-labelledby="ai-insights-heading">
        <div className="mb-4 flex items-center justify-between">
          <h2
            id="ai-insights-heading"
            className="text-lg font-semibold text-foreground"
          >
            AI-Powered Insights
          </h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
        </div>
      </section>
    );
  }

  const sortedInsights = sortByPriority(insights);

  // Compute last refresh from the most recent insight
  const lastRefresh =
    sortedInsights.length > 0
      ? sortedInsights.reduce((latest, insight) =>
          new Date(insight.generatedAt) > new Date(latest.generatedAt)
            ? insight
            : latest
        ).generatedAt
      : null;

  // Handle Take Action navigation (Req 12.4, 12.5)
  const handleTakeAction = (insight: AIInsight) => {
    if (insight.actionType === 'content_gap') {
      // Navigate to AI Studio pre-filled with topic
      const params = new URLSearchParams();
      if (insight.actionParams.grammarTopic) {
        params.set('topic', insight.actionParams.grammarTopic);
      }
      if (insight.actionParams.targetLevel) {
        params.set('level', insight.actionParams.targetLevel);
      }
      const query = params.toString();
      router.push(`/admin/ai-studio${query ? `?${query}` : ''}`);
    } else if (insight.actionType === 'student_performance') {
      // Navigate to Students list filtered
      const params = new URLSearchParams();
      if (insight.actionParams.cefrLevel) {
        params.set('cefr', insight.actionParams.cefrLevel);
      }
      if (insight.actionParams.status) {
        params.set('status', insight.actionParams.status);
      }
      const query = params.toString();
      router.push(`/admin/students${query ? `?${query}` : ''}`);
    }
  };

  // Empty state (Req 12.8)
  if (sortedInsights.length === 0) {
    return (
      <section aria-labelledby="ai-insights-heading">
        <div className="mb-4 flex items-center justify-between">
          <h2
            id="ai-insights-heading"
            className="text-lg font-semibold text-foreground"
          >
            AI-Powered Insights
          </h2>
          {lastRefresh && (
            <span className="text-xs text-muted-foreground">
              Last refreshed: {formatRefreshTimestamp(lastRefresh)}
            </span>
          )}
        </div>
        <div className="rounded-[12px] border border-border bg-card p-8 text-center shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <svg
              className="h-6 w-6 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-foreground">No Actionable Insights</p>
          <p className="mt-1 text-xs text-muted-foreground">
            No actionable patterns were detected in the most recent analysis.
            Insights are refreshed every 24 hours.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="ai-insights-heading">
      {/* Section Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2
          id="ai-insights-heading"
          className="text-lg font-semibold text-foreground"
        >
          AI-Powered Insights
        </h2>
        {lastRefresh && (
          <span className="text-xs text-muted-foreground">
            Last refreshed: {formatRefreshTimestamp(lastRefresh)}
          </span>
        )}
      </div>

      {/* Insight Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedInsights.map((insight) => (
          <AIInsightCard
            key={insight.id}
            title={insight.title}
            description={insight.description}
            affectedCount={insight.affectedStudentCount}
            priority={insight.priority}
            suggestedAction={insight.suggestedAction}
            onTakeAction={() => handleTakeAction(insight)}
          />
        ))}
      </div>
    </section>
  );
}
