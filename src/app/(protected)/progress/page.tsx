import { redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { getSession } from "@/lib/dal/session";
import { getLearningPath, getUserProgress } from "@/lib/dal/learn";
import { createSupabaseServerClient } from "@/lib/services/supabase-server";
import { GRAMMAR_EXPLANATIONS } from "@/types/exercise";
import type { BlockCategory } from "@/types";

export default async function ProgressPage() {
  const session = await getSession();
  if (!session) redirect("/auth/signin?redirect=/progress");

  const [lessons, progress] = await Promise.all([
    getLearningPath(),
    getUserProgress(session.userId),
  ]);

  const supabase = await createSupabaseServerClient();
  const { data: attempts } = await supabase
    .from("exercise_attempts")
    .select("incorrect_categories")
    .eq("user_id", session.userId);

  const categoryMisses = new Map<string, number>();
  for (const attempt of attempts ?? []) {
    for (const category of attempt.incorrect_categories ?? []) {
      categoryMisses.set(category, (categoryMisses.get(category) ?? 0) + 1);
    }
  }
  const weakestCategories = [...categoryMisses.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <PageContainer>
      <h1 className="text-3xl font-bold text-foreground">Progress</h1>
      <p className="mt-2 text-muted-foreground">Track your learning journey</p>

      <div className="mt-8 space-y-3">
        {lessons.map((lesson) => {
          const done = progress.lessons[lesson.id] || 0;
          const total = lesson.exercises.length;
          const percent = total > 0 ? Math.round((done / total) * 100) : 0;
          return (
            <div
              key={lesson.id}
              className="rounded-xl border border-border bg-surface-card p-4 shadow-[var(--shadow-card)]"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">
                  {lesson.icon} {lesson.title}
                </span>
                <span className="text-sm text-muted-foreground">{done}/{total}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-border">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    percent >= 100 ? "bg-block-object" : "bg-wp-primary"
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {weakestCategories.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-foreground">Areas to practice</h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {weakestCategories.map(([category, misses]) => (
              <div
                key={category}
                className="rounded-xl border border-border bg-surface-card p-4 shadow-[var(--shadow-card)]"
              >
                <p className="text-sm font-bold capitalize text-foreground">{category}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {GRAMMAR_EXPLANATIONS[category as BlockCategory] ?? ""}
                </p>
                <p className="mt-2 text-xs font-medium text-block-verb">
                  Missed {misses} {misses === 1 ? "time" : "times"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
