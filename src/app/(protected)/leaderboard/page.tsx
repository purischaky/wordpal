import { redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { getSession } from "@/lib/dal/session";
import { createSupabaseServerClient } from "@/lib/services/supabase-server";

export default async function LeaderboardPage() {
  const session = await getSession();
  if (!session) redirect("/auth/signin?redirect=/leaderboard");

  const supabase = await createSupabaseServerClient();
  const { data: rows } = await supabase.rpc("get_leaderboard", { p_limit: 50 });

  const entries = rows ?? [];

  return (
    <PageContainer>
      <h1 className="text-3xl font-bold text-foreground">Leaderboard</h1>
      <p className="mt-2 text-muted-foreground">See how you compare</p>

      <div className="mt-8 overflow-hidden rounded-xl border border-border bg-surface-card shadow-[var(--shadow-card)]">
        {entries.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">
            No ranked students yet — be the first to earn XP!
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {entries.map((entry) => {
              const isMe = entry.user_id === session.userId;
              return (
                <li
                  key={entry.user_id}
                  className={`flex items-center gap-4 px-4 py-3 ${isMe ? "bg-wp-primary/5" : ""}`}
                >
                  <span className="w-8 shrink-0 text-center text-sm font-bold text-muted-foreground">
                    {entry.rank <= 3 ? ["🥇", "🥈", "🥉"][entry.rank - 1] : `#${entry.rank}`}
                  </span>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-wp-primary/10 text-sm font-bold text-wp-primary">
                    {entry.display_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {entry.display_name}
                      {isMe && <span className="ml-2 text-xs text-muted-foreground">(you)</span>}
                    </p>
                    {entry.streak_current > 0 && (
                      <p className="text-xs text-muted-foreground">🔥 {entry.streak_current} day streak</p>
                    )}
                  </div>
                  <span className="shrink-0 text-sm font-bold text-wp-primary">{entry.total_xp} XP</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </PageContainer>
  );
}
