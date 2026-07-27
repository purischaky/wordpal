'use client';

import { use, useState, useCallback } from 'react';
import { DashboardCard, DashboardCardEmpty } from '@/components/admin/design-system/DashboardCard';
import { GrammarRadar } from '@/components/admin/design-system/GrammarRadar';
import { Timeline, TimelineEvent } from '@/components/admin/design-system/Timeline';
import { getStudentProfile } from '@/data/admin';
import type { BlockCategory, CEFRLevel } from '@/types/admin';

// ─── Types ───────────────────────────────────────────────────────────────────

interface StudentProfileData {
  id: string;
  name: string;
  email: string;
  role: string;
  joinDate: string;
  avatarUrl: string | null;
  status: 'active' | 'inactive' | 'suspended';
  currentLearningPath: string | null;
  currentLesson: string | null;
  grammarScores: { category: BlockCategory; score: number }[];
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

interface AICoachSummary {
  weakAreas: string[];
  recommendedLessons: string[];
  assessment: string;
}

interface Certificate {
  id: string;
  title: string;
  type: string;
  issueDate: string;
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

  // Load student profile from centralized data
  const studentData = getStudentProfile(id);

  // Derive profile data (fallback for unknown IDs)
  const profile: StudentProfileData = studentData
    ? {
        id: studentData.id,
        name: studentData.name,
        email: studentData.email,
        role: studentData.role,
        joinDate: studentData.joinDate,
        avatarUrl: studentData.avatarUrl,
        status: studentData.status,
        currentLearningPath: studentData.currentLearningPath,
        currentLesson: studentData.currentLesson,
        grammarScores: studentData.grammarScores as { category: BlockCategory; score: number }[],
      }
    : {
        id,
        name: 'Unknown Student',
        email: 'unknown@example.com',
        role: 'student',
        joinDate: '2024-01-01T00:00:00Z',
        avatarUrl: null,
        status: 'active',
        currentLearningPath: null,
        currentLesson: null,
        grammarScores: [],
      };

  const achievements: StudentAchievement[] = studentData?.achievements ?? [];
  const placementResults: PlacementResult[] = (studentData?.placementResults ?? []) as PlacementResult[];
  const timelineEvents: TimelineEvent[] = (studentData?.timelineEvents ?? []) as TimelineEvent[];
  const certificates: Certificate[] = studentData?.certificates ?? [];
  const initialAiCoach: AICoachSummary | null = studentData?.aiCoach ?? null;

  // AI Coach state with retry
  const [aiCoachData, setAiCoachData] = useState<AICoachSummary | null>(initialAiCoach);
  const [aiCoachError, setAiCoachError] = useState(false);
  const [aiCoachLoading, setAiCoachLoading] = useState(false);

  // Placement results pagination
  const [placementPage, setPlacementPage] = useState(1);
  const placementPageSize = 20;
  const placementTotalPages = Math.max(1, Math.ceil(placementResults.length / placementPageSize));
  const paginatedPlacements = [...placementResults]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice((placementPage - 1) * placementPageSize, placementPage * placementPageSize);

  // AI Coach retry handler
  const handleAiCoachRetry = useCallback(() => {
    setAiCoachLoading(true);
    setAiCoachError(false);
    // Simulate retry - in real app, call API
    setTimeout(() => {
      setAiCoachData(initialAiCoach);
      setAiCoachLoading(false);
    }, 1000);
  }, [initialAiCoach]);

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
                alt={`${profile.name} avatar`}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              profile.name.charAt(0).toUpperCase()
            )}
          </div>

          {/* Info Grid */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-card-foreground">
                {profile.name}
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
                <span className="text-xs font-medium text-muted-foreground">Status</span>
                <p className="text-sm capitalize text-card-foreground">{profile.status}</p>
              </div>
            </div>
          </div>
        </div>
      </DashboardCard>

      {/* Current Learning Path / Lesson */}
      <DashboardCard title="Current Learning Path & Lesson">
        {profile.currentLearningPath ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <span className="text-xs font-medium text-muted-foreground">Learning Path</span>
              <p className="mt-1 text-sm font-medium text-card-foreground">
                {profile.currentLearningPath}
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
          <DashboardCardEmpty message="No learning path assigned yet" />
        )}
      </DashboardCard>

      {/* Grammar Mastery & Achievements Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Grammar Mastery Radar Chart */}
        <DashboardCard title="Grammar Mastery">
          {profile.grammarScores.length > 0 ? (
            <GrammarRadar data={profile.grammarScores} size={280} />
          ) : (
            <DashboardCardEmpty message="No grammar mastery data available yet" />
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
      </div>

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

      {/* AI Coach Summary */}
      <DashboardCard title="AI Coach Summary">
        {aiCoachLoading ? (
          <div className="space-y-3">
            <div className="h-4 w-full animate-[skeleton-pulse_1500ms_ease-in-out_infinite] rounded bg-muted" />
            <div className="h-4 w-2/3 animate-[skeleton-pulse_1500ms_ease-in-out_infinite] rounded bg-muted" />
            <div className="h-4 w-1/2 animate-[skeleton-pulse_1500ms_ease-in-out_infinite] rounded bg-muted" />
          </div>
        ) : aiCoachError ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <svg
              className="mb-3 h-8 w-8 text-destructive/60"
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
            <p className="text-sm text-muted-foreground">
              AI Coach Summary is temporarily unavailable
            </p>
            <button
              type="button"
              onClick={handleAiCoachRetry}
              className="mt-3 rounded-[12px] border border-primary bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-colors duration-200 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring"
            >
              Retry
            </button>
          </div>
        ) : aiCoachData ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Weak Areas */}
            <div>
              <h4 className="mb-2 text-xs font-medium text-muted-foreground">
                Weak Areas ({aiCoachData.weakAreas.length})
              </h4>
              <ul className="space-y-1.5">
                {aiCoachData.weakAreas.map((area, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-card-foreground">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive/60" aria-hidden="true" />
                    {area}
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Lessons */}
            <div>
              <h4 className="mb-2 text-xs font-medium text-muted-foreground">
                Recommended Lessons ({aiCoachData.recommendedLessons.length})
              </h4>
              <ul className="space-y-1.5">
                {aiCoachData.recommendedLessons.map((lesson, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-card-foreground">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" aria-hidden="true" />
                    {lesson}
                  </li>
                ))}
              </ul>
            </div>

            {/* Assessment */}
            <div>
              <h4 className="mb-2 text-xs font-medium text-muted-foreground">
                Assessment
              </h4>
              <p className="text-sm leading-relaxed text-card-foreground">
                {aiCoachData.assessment.slice(0, 300)}
              </p>
            </div>
          </div>
        ) : (
          <DashboardCardEmpty message="No AI Coach data available yet" />
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

      {/* Certificates */}
      <DashboardCard title="Certificates">
        {certificates.length > 0 ? (
          <ul className="space-y-3" role="list" aria-label="Earned certificates">
            {certificates.map((cert) => (
              <li key={cert.id} className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10" aria-hidden="true">
                  <svg
                    className="h-5 w-5 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342"
                    />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-card-foreground">
                    {cert.title}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{cert.type}</span>
                    <span aria-hidden="true">·</span>
                    <time dateTime={cert.issueDate}>{formatDate(cert.issueDate)}</time>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <DashboardCardEmpty message="No certificates earned yet" />
        )}
      </DashboardCard>
    </div>
  );
}
