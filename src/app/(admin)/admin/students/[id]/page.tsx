'use client';

import { use, useEffect, useState } from 'react';
import { DashboardCard, DashboardCardEmpty } from '@/components/admin/design-system/DashboardCard';
import { Timeline, TimelineEvent } from '@/components/admin/design-system/Timeline';
import type { CEFRLevel } from '@/types/admin';

// ─── Types (mirrors the JSON shape of the get_student_profile RPC) ───────────

interface StudentProfileData {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  status: 'active' | 'inactive' | 'suspended';
  cefrLevel: CEFRLevel;
  role: string;
  joinDate: string;
  currentLearningPath: string | null;
  currentLesson: string | null;
  totalXp: number;
  streakCurrent: number;
  streakLongest: number;
  lastActivityDate: string | null;
  placementResults: PlacementResult[];
  achievements: StudentAchievement[];
  timelineEvents: TimelineEvent[];
}

interface StudentAchievement {
  id: string;
  badgeIcon: string;
  title: string;
  date: string;
}

interface PlacementResult {
  id: string;
  date: string;
  score: number;
  result: 'pass' | 'fail';
  targetLevel: CEFRLevel;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function StatusBadge({ status }: { status: 'active' | 'inactive' | 'suspended' }) {
  const styles = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
    suspended: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ─── Page Component ──────────────────────────────────────────────────────────

export default function StudentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [placementPage, setPlacementPage] = useState(1);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setNotFound(false);
      try {
        const res = await fetch(`/api/admin/students/${id}`);
        const json = await res.json();
        if (cancelled) return;
        if (res.status === 404) {
          setNotFound(true);
        } else if (json.data) {
          setProfile(json.data);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const placementResults = profile?.placementResults ?? [];
  const achievements = profile?.achievements ?? [];
  const timelineEvents = profile?.timelineEvents ?? [];

  const placementPageSize = 20;
  const placementTotalPages = Math.max(1, Math.ceil(placementResults.length / placementPageSize));
  const paginatedPlacements = [...placementResults]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice((placementPage - 1) * placementPageSize, placementPage * placementPageSize);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-skeleton-pulse rounded bg-muted" />
        <div className="h-40 animate-skeleton-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Student Profile</h1>
        <DashboardCard title="Not Found">
          <DashboardCardEmpty message="This student could not be found" />
        </DashboardCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Student Profile
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Detailed view of student learning progress and performance.
        </p>
      </div>

      {/* Personal Info Section */}
      <DashboardCard title="Personal Information">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={`${profile.displayName} avatar`}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              profile.displayName.charAt(0).toUpperCase()
            )}
          </div>

          {/* Info Grid */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-card-foreground">
                {profile.displayName}
              </h2>
              <StatusBadge status={profile.status} />
            </div>
            <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <span className="text-xs font-medium text-muted-foreground">Email</span>
                <p className="text-sm text-card-foreground">{profile.email}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-muted-foreground">Role</span>
                <p className="text-sm capitalize text-card-foreground">{profile.role}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-muted-foreground">Join Date</span>
                <p className="text-sm text-card-foreground">{formatDate(profile.joinDate)}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-muted-foreground">CEFR Level</span>
                <p className="text-sm text-card-foreground">{profile.cefrLevel}</p>
              </div>
            </div>
          </div>
        </div>
      </DashboardCard>

      {/* Activity Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard>
          <span className="text-xs font-medium text-muted-foreground">Total XP</span>
          <p className="mt-1 text-2xl font-bold text-primary">{profile.totalXp}</p>
        </DashboardCard>
        <DashboardCard>
          <span className="text-xs font-medium text-muted-foreground">Current Streak</span>
          <p className="mt-1 text-2xl font-bold text-card-foreground">
            🔥 {profile.streakCurrent} {profile.streakCurrent === 1 ? 'day' : 'days'}
          </p>
        </DashboardCard>
        <DashboardCard>
          <span className="text-xs font-medium text-muted-foreground">Longest Streak</span>
          <p className="mt-1 text-2xl font-bold text-card-foreground">
            {profile.streakLongest} {profile.streakLongest === 1 ? 'day' : 'days'}
          </p>
        </DashboardCard>
        <DashboardCard>
          <span className="text-xs font-medium text-muted-foreground">Last Active</span>
          <p className="mt-1 text-2xl font-bold text-card-foreground">
            {profile.lastActivityDate ? formatDate(profile.lastActivityDate) : 'Never'}
          </p>
        </DashboardCard>
      </div>

      {/* Current Learning Path / Lesson */}
      <DashboardCard title="Current Learning Path & Lesson">
        {profile.currentLearningPath || profile.currentLesson ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <span className="text-xs font-medium text-muted-foreground">Learning Path</span>
              <p className="mt-1 text-sm font-medium text-card-foreground">
                {profile.currentLearningPath ?? 'Not started'}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <span className="text-xs font-medium text-muted-foreground">Current Lesson</span>
              <p className="mt-1 text-sm font-medium text-card-foreground">
                {profile.currentLesson ?? 'No active lesson'}
              </p>
            </div>
          </div>
        ) : (
          <DashboardCardEmpty message="No learning activity yet — the student hasn't started an exercise." />
        )}
      </DashboardCard>

      {/* Achievements */}
      <DashboardCard title="Achievements">
        {achievements.length > 0 ? (
          <ul className="space-y-3" role="list" aria-label="Recent achievements">
            {achievements.map((achievement) => (
              <li key={achievement.id} className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-base" aria-hidden="true">
                  {achievement.badgeIcon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-card-foreground">
                    {achievement.title}
                  </p>
                  <time className="text-xs text-muted-foreground" dateTime={achievement.date}>
                    {formatDate(achievement.date)}
                  </time>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <DashboardCardEmpty message="No achievements earned yet" />
        )}
      </DashboardCard>

      {/* Placement Challenge Results */}
      <DashboardCard title="Placement Challenge Results">
        {paginatedPlacements.length > 0 ? (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 pr-4 text-xs font-medium text-muted-foreground">Date</th>
                    <th className="pb-2 pr-4 text-xs font-medium text-muted-foreground">Score</th>
                    <th className="pb-2 pr-4 text-xs font-medium text-muted-foreground">Result</th>
                    <th className="pb-2 text-xs font-medium text-muted-foreground">Target CEFR</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPlacements.map((result) => (
                    <tr key={result.id} className="border-b border-border/50 last:border-0">
                      <td className="py-2.5 pr-4 text-sm text-card-foreground">
                        {formatDate(result.date)}
                      </td>
                      <td className="py-2.5 pr-4 text-sm font-medium text-card-foreground">
                        {result.score}/100
                      </td>
                      <td className="py-2.5 pr-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            result.result === 'pass'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}
                        >
                          {result.result === 'pass' ? 'Pass' : 'Fail'}
                        </span>
                      </td>
                      <td className="py-2.5 text-sm text-card-foreground">
                        {result.targetLevel}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {placementTotalPages > 1 && (
              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setPlacementPage((p) => Math.max(1, p - 1))}
                  disabled={placementPage <= 1}
                  className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-card-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  aria-label="Previous page"
                >
                  Previous
                </button>
                <span className="text-xs text-muted-foreground">
                  Page {placementPage} of {placementTotalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPlacementPage((p) => Math.min(placementTotalPages, p + 1))}
                  disabled={placementPage >= placementTotalPages}
                  className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-card-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  aria-label="Next page"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        ) : (
          <DashboardCardEmpty message="No placement challenge attempts yet" />
        )}
      </DashboardCard>

      {/* Learning Progress Timeline */}
      <DashboardCard title="Learning Progress">
        {timelineEvents.length > 0 ? (
          <Timeline
            events={timelineEvents}
            maxItems={50}
          />
        ) : (
          <DashboardCardEmpty message="No learning progress events yet" />
        )}
      </DashboardCard>
    </div>
  );
}
