import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { focusStreak } from "@/lib/aptimi";
import { PageHeader } from "@/components/page-header";
import { Timer, ListChecks, Briefcase, ArrowRight } from "lucide-react";

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

      <div className="px-8 pb-12 grid gap-6 lg:grid-cols-3">
        <ScoreCard parts={score} />

        <div className="grid grid-cols-2 gap-3 lg:col-span-2">
          <Stat label="Tasks completed" value={`${tasksDone}/${tasksAll.length || 0}`} icon={ListChecks} />
          <Stat label="Total focus" value={`${Math.floor(totalMin / 60)}h ${totalMin % 60}m`} icon={Timer} />
          <Stat label="Applications" value={`${data?.apps.length ?? 0} submitted`} icon={Briefcase} />
          <Stat label="Focus streak" value={`${streak} day${streak === 1 ? "" : "s"}`} icon={Timer} />
        </div>

        <div className="lg:col-span-2 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <div>
              <div className="text-sm font-semibold">Up next</div>
              <div className="text-xs text-muted-foreground">Your nearest open tasks.</div>
            </div>
            <Link to="/weekly" className="text-xs text-primary hover:underline inline-flex items-center gap-1">View all <ArrowRight className="h-3 w-3" /></Link>
          </div>
          <ul className="divide-y divide-border">
            {upNext.length === 0 && <li className="px-5 py-8 text-sm text-muted-foreground">All caught up — great work.</li>}
            {upNext.map((t) => (
              <li key={t.id} className="flex items-center justify-between px-5 py-3">
                <span className="text-sm">{t.title}</span>
                <span className="eyebrow">Week {t.week_number}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="text-sm font-semibold">Quick start</div>
          <div className="text-xs text-muted-foreground">Get into execution mode in one click.</div>
          <div className="mt-4 space-y-2">
            <QuickLink to="/focus" label="Start a focus session" />
            <QuickLink to="/weekly" label="Open weekly planner" />
            <QuickLink to="/applications" label="Track an application" />
          </div>
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
    <div className="rounded-xl border border-border bg-card p-5">
      <span className="eyebrow">Career readiness score</span>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-5xl font-bold tracking-tight">{total}</span>
        <span className="text-muted-foreground">/100</span>
      </div>
      <div className="mt-5 space-y-2">
        {sub.map(([k, v]) => (
          <div key={k}>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{k}</span>
              <span className="font-medium tabular-nums">{v}</span>
            </div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-secondary">
              <div className="h-full rounded-full bg-primary" style={{ width: `${v}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-md bg-accent/60 px-3 py-2 text-xs">
        <span className="font-medium">Next best action: </span>
        <span className="text-muted-foreground">Aim for at least 10 hours of focused work this week.</span>
      </div>
    </div>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="eyebrow">{label}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}

function QuickLink({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to as any} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm hover:bg-accent">
      {label}
      <ArrowRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}
