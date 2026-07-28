import Link from "next/link";
import { redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { getSession } from "@/lib/dal/session";
import { getLearningPath, getUserProgress } from "@/lib/dal/learn";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/auth/signin?redirect=/dashboard");

  const [lessons, progress] = await Promise.all([
    getLearningPath(),
    getUserProgress(session.userId),
  ]);

  const nextLesson = lessons.find(
    (l) => (progress.lessons[l.id] || 0) < l.exercises.length
  );
  const completedLessons = lessons.filter(
    (l) => (progress.lessons[l.id] || 0) >= l.exercises.length
  ).length;

  return (
    <PageContainer>
      <h1 className="text-3xl font-bold text-foreground">Welcome back</h1>
      <p className="mt-2 text-muted-foreground">Here&apos;s where you left off.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface-card p-5 shadow-[var(--shadow-card)]">
          <p className="text-xs font-medium text-muted-foreground">Total XP</p>
          <p className="mt-1 text-2xl font-bold text-wp-primary">{progress.totalXp}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface-card p-5 shadow-[var(--shadow-card)]">
          <p className="text-xs font-medium text-muted-foreground">Current Streak</p>
          <p className="mt-1 text-2xl font-bold text-block-time">
            🔥 {progress.streakCurrent} {progress.streakCurrent === 1 ? "day" : "days"}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface-card p-5 shadow-[var(--shadow-card)]">
          <p className="text-xs font-medium text-muted-foreground">Lessons Completed</p>
          <p className="mt-1 text-2xl font-bold text-block-object">
            {completedLessons}/{lessons.length}
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-border bg-surface-card p-6 shadow-[var(--shadow-card)]">
        {nextLesson ? (
          <>
            <p className="text-sm font-medium text-muted-foreground">Continue learning</p>
            <h2 className="mt-1 text-xl font-bold text-foreground">
              {nextLesson.icon} {nextLesson.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{nextLesson.description}</p>
            <Link
              href="/learn"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-wp-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-wp-primary-hover"
            >
              Continue →
            </Link>
          </>
        ) : (
          <>
            <p className="text-lg font-semibold text-foreground">🎉 You&apos;ve completed every lesson!</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Check the leaderboard to see how you rank.
            </p>
            <Link
              href="/leaderboard"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-wp-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-wp-primary-hover"
            >
              View Leaderboard →
            </Link>
          </>
        )}
      </div>
    </PageContainer>
  );
}
