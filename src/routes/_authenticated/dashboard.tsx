import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { focusStreak } from "@/lib/aptimi";
import { PageHeader } from "@/components/page-header";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · APTIMI" }] }),
  component: Dashboard,
});

function greet() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function Dashboard() {
  const { user } = Route.useRouteContext();

  const { data } = useQuery({
    queryKey: ["dashboard", user.id],
    queryFn: async () => {
      const [profile, score, tasks, focus, apps] = await Promise.all([
        supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
        supabase.from("career_scores").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("tasks").select("id, title, week_number, completed, position").eq("user_id", user.id).order("week_number").order("position"),
        supabase.from("focus_sessions").select("duration_minutes, started_at").eq("user_id", user.id),
        supabase.from("applications").select("id").eq("user_id", user.id),
      ]);
      return {
        name: profile.data?.full_name ?? "",
        score: score.data,
        tasks: tasks.data ?? [],
        focus: focus.data ?? [],
        apps: apps.data ?? [],
      };
    },
  });

  const tasksAll = data?.tasks ?? [];
  const tasksDone = tasksAll.filter((t) => t.completed).length;
  const upNext = tasksAll.filter((t) => !t.completed).slice(0, 5);
  const totalMin = (data?.focus ?? []).reduce((a, b) => a + (b.duration_minutes ?? 0), 0);
  const streak = focusStreak(data?.focus ?? []);
  const score = data?.score;

  const firstName = (data?.name ?? "").split(" ")[0] || "there";

  return (
    <div className="min-h-screen">
      <PageHeader eyebrow="Dashboard" title={`${greet()}, ${firstName}.`} subtitle="Here's where you stand on the path to your target role." />

      <div className="mx-auto max-w-6xl px-5 pb-12 md:px-8">
        <div className="grid gap-8 border-b border-border py-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          <ScoreCard parts={score} />
          <div className="grid grid-cols-2 gap-x-6 gap-y-6 content-center">
            <Stat label="Tasks completed" value={`${tasksDone}/${tasksAll.length}`} />
            <Stat label="Total focus" value={`${Math.floor(totalMin / 60)}h ${totalMin % 60}m`} />
            <Stat label="Applications" value={`${data?.apps.length ?? 0}`} />
            <Stat label="Focus streak" value={`${streak} day${streak === 1 ? "" : "s"}`} />
          </div>
        </div>

        <div className="grid gap-10 py-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="min-w-0">
          <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
            <div>
              <h2 className="text-base font-semibold">Up next</h2>
            </div>
            <Link to="/weekly" className="text-sm text-primary hover:underline inline-flex items-center gap-1">View all <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
          </div>
          <ul className="divide-y divide-border">
            {upNext.length === 0 && <li className="py-8 text-sm text-muted-foreground">All caught up — great work.</li>}
            {upNext.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-4 py-4">
                <span className="min-w-0 text-sm break-words">{t.title}</span>
                <span className="shrink-0 text-xs text-muted-foreground">Week {t.week_number}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="border-b border-border pb-3 text-base font-semibold">Quick start</h2>
          <div className="divide-y divide-border">
            <QuickLink to="/focus" label="Start a focus session" />
            <QuickLink to="/weekly" label="Open weekly planner" />
            <QuickLink to="/applications" label="Track an application" />
          </div>
        </section>
        </div>
      </div>
    </div>
  );
}

function ScoreCard({ parts }: { parts: any }) {
  const total = parts?.total_score ?? 0;
  const sub = [
    ["Skills", parts?.skills_score ?? 0],
    ["Roadmap", parts?.roadmap_score ?? 0],
    ["Focus", parts?.focus_score ?? 0],
    ["Applications", parts?.applications_score ?? 0],
    ["Consistency", parts?.consistency_score ?? 0],
  ] as const;
  return (
    <section className="min-w-0">
      <h2 className="text-sm font-medium text-muted-foreground">Career readiness</h2>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-6xl font-semibold tabular-nums">{total}</span>
        <span className="text-muted-foreground">/100</span>
      </div>
      <div className="mt-7 grid gap-x-5 gap-y-3 sm:grid-cols-2">
        {sub.map(([k, v]) => (
          <div key={k}>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{k}</span>
              <span className="font-medium tabular-nums">{v}</span>
            </div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-secondary">
              <div className="h-full rounded-full bg-primary" style={{ width: `${v}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 border-l border-border pl-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-2 text-xl font-semibold tabular-nums break-words">{value}</div>
    </div>
  );
}

function QuickLink({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to as any} className="flex items-center justify-between gap-3 py-4 text-sm hover:text-primary">
      {label}
      <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}
