'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import type { AdminPlacementChallenge } from '@/types/admin';

// ─── Helper Functions ────────────────────────────────────────────────────────

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getCEFRColor(level: string): string {
  switch (level) {
    case 'A1': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
    case 'A2': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'B1': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    case 'B2': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
    case 'C1': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
    case 'C2': return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  }
}

function getTopicColor(index: number): string {
  const colors = [
    'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
    'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  ];
  return colors[index % colors.length];
}

// ─── Placement Challenges List Page ──────────────────────────────────────────

export default function ChallengesPage() {
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [challenges, setChallenges] = useState<AdminPlacementChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishErrors, setPublishErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    async function fetchChallenges() {
      try {
        const res = await fetch('/api/admin/challenges');
        const json = await res.json();
        if (json.data) {
          setChallenges(json.data);
        }
      } catch (error) {
        console.error('Failed to fetch challenges:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchChallenges();
  }, []);

  const filteredChallenges = useMemo(() => {
    if (statusFilter === 'all') return challenges;
    return challenges.filter((ch) => ch.status === statusFilter);
  }, [statusFilter, challenges]);

  async function handlePublish(challengeId: string) {
    setPublishErrors((prev) => {
      const next = { ...prev };
      delete next[challengeId];
      return next;
    });

    try {
      const res = await fetch(`/api/admin/challenges/${challengeId}/publish`, { method: 'PATCH' });
      const json = await res.json();

      if (!res.ok) {
        setPublishErrors((prev) => ({ ...prev, [challengeId]: json.details ?? [json.error ?? 'Failed to publish'] }));
        return;
      }

      setChallenges((prev) => prev.map((ch) => (ch.id === challengeId ? json.data : ch)));
    } catch {
      setPublishErrors((prev) => ({ ...prev, [challengeId]: ['Failed to publish challenge. Please try again.'] }));
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Placement Challenges
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and manage adaptive placement assessments for CEFR level determination.
          </p>
        </div>
        <Link
          href="/admin/challenges/new"
          className="inline-flex items-center gap-2 rounded-[12px] bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors duration-200 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create Challenge
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2">
        {(['all', 'published', 'draft'] as const).map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(status)}
            className={`rounded-[12px] border px-3 py-1.5 text-xs font-medium capitalize transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring ${
              statusFilter === status
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-input bg-background text-foreground hover:bg-accent dark:bg-card'
            }`}
            aria-label={`Filter by ${status} status`}
          >
            {status === 'all' ? 'All' : status}
            <span className="ml-1.5 text-xs opacity-70">
              ({status === 'all'
                ? challenges.length
                : challenges.filter((ch) => ch.status === status).length})
            </span>
          </button>
        ))}
      </div>

      {/* Challenges Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
        </div>
      ) : (
      <>
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">CEFR Level</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Grammar Topics</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Questions</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredChallenges.map((challenge) => (
                <tr
                  key={challenge.id}
                  className="transition-colors duration-150 hover:bg-muted/30"
                >
                  {/* Title */}
                  <td className="px-4 py-3.5">
                    <span className="font-medium text-foreground">
                      {challenge.title}
                    </span>
                  </td>

                  {/* CEFR Level */}
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${getCEFRColor(challenge.targetLevel)}`}>
                      {challenge.targetLevel}
                    </span>
                  </td>

                  {/* Grammar Topics as badges */}
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap gap-1 max-w-[280px]">
                      {challenge.grammarTopics.slice(0, 3).map((topic, idx) => (
                        <span
                          key={topic}
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getTopicColor(idx)}`}
                        >
                          {topic}
                        </span>
                      ))}
                      {challenge.grammarTopics.length > 3 && (
                        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          +{challenge.grammarTopics.length - 3}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Question Count */}
                  <td className="px-4 py-3.5 text-center">
                    <span className="text-foreground font-medium">
                      {challenge.questionCount}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5 text-center">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        challenge.status === 'published'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                      }`}
                    >
                      {challenge.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </td>

                  {/* Creation Date */}
                  <td className="px-4 py-3.5">
                    <span className="text-muted-foreground">
                      {formatDate(challenge.createdAt)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {challenge.status === 'draft' && (
                        <button
                          type="button"
                          onClick={() => handlePublish(challenge.id)}
                          className="inline-flex items-center gap-1 rounded-md bg-green-600 px-2.5 py-1 text-xs font-medium text-white transition-colors duration-200 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
                          aria-label={`Publish ${challenge.title}`}
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Publish
                        </button>
                      )}
                      <Link
                        href={`/admin/challenges/${challenge.id}/edit`}
                        className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-primary transition-colors duration-200 hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                        Edit
                      </Link>
                    </div>
                    {/* Publish Validation Errors */}
                    {publishErrors[challenge.id] && (
                      <div className="mt-2 text-left" role="alert" aria-live="polite">
                        {publishErrors[challenge.id].map((error, idx) => (
                          <p key={idx} className="text-xs text-red-600 dark:text-red-400">
                            {error}
                          </p>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredChallenges.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-foreground">No challenges found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            No placement challenges match the current filter.
          </p>
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className="mt-4 rounded-[12px] border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors duration-200 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            Show all challenges
          </button>
        </div>
      )}
      </>
      )}
    </div>
  );
}
