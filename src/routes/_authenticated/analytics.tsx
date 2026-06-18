import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, CartesianGrid, Tooltip } from "recharts";
import { STATUSES, STATUS_LABELS } from "@/lib/aptimi";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({ meta: [{ title: "Analytics · APTIMI" }] }),
  component: Analytics,
});

function Analytics() {
  const { user } = Route.useRouteContext();

  const { data } = useQuery({
    queryKey: ["analytics", user.id],
    queryFn: async () => {
      const [score, tasks, focus, apps, roadmap] = await Promise.all([
        supabase.from("career_scores").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("tasks").select("*").eq("user_id", user.id),
        supabase.from("focus_sessions").select("*").eq("user_id", user.id),
        supabase.from("applications").select("status").eq("user_id", user.id),
        supabase.from("roadmaps").select("total_weeks").eq("user_id", user.id).maybeSingle(),
      ]);
      return { score: score.data, tasks: tasks.data ?? [], focus: focus.data ?? [], apps: apps.data ?? [], total: roadmap.data?.total_weeks ?? 12 };
    },
  });

  const tasks = data?.tasks ?? [];
  const done = tasks.filter((t) => t.completed).length;
  const totalMin = (data?.focus ?? []).reduce((a, b) => a + (b.duration_minutes ?? 0), 0);
  const interviewRate = (() => {
    const applied = (data?.apps ?? []).filter((a) => ["applied", "assessment", "interview", "offer", "rejected"].includes(a.status)).length;
    const interviewed = (data?.apps ?? []).filter((a) => ["interview", "offer"].includes(a.status)).length;
    return applied ? Math.round((interviewed / applied) * 100) : 0;
  })();

  // last 7 days focus minutes
  const days7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const focusByDay = days7.map((d) => {
    const key = d.toDateString();
    const mins = (data?.focus ?? []).filter((s) => new Date(s.started_at).toDateString() === key).reduce((a, b) => a + (b.duration_minutes ?? 0), 0);
    return { day: d.toLocaleDateString(undefined, { weekday: "short" }), mins };
  });

  // tasks per week
  const totalWeeks = data?.total ?? 12;
  const tasksByWeek = Array.from({ length: totalWeeks }, (_, i) => {
    const wk = i + 1;
    const ws = tasks.filter((t) => t.week_number === wk);
    return { week: wk, completed: ws.filter((t) => t.completed).length, total: ws.length };
  });

  const funnel = STATUSES.map((s) => ({ stage: STATUS_LABELS[s], count: (data?.apps ?? []).filter((a) => a.status === s).length }));

  const score = data?.score;
  const breakdown = [
    ["Skills", score?.skills_score ?? 0, 30],
    ["Roadmap", score?.roadmap_score ?? 0, 30],
    ["Focus", score?.focus_score ?? 0, 15],
    ["Applications", score?.applications_score ?? 0, 15],
    ["Consistency", score?.consistency_score ?? 0, 10],
  ] as const;

  return (
    <div>
      <PageHeader eyebrow="Analytics" title="Your execution, in numbers." subtitle="Track the trends that drive your readiness score." />
      <div className="px-8 py-8 space-y-6 max-w-6xl">
        <div className="grid gap-3 md:grid-cols-4">
          <KPI label="Readiness" value={`${score?.total_score ?? 0}/100`} />
          <KPI label="Tasks completed" value={`${done}/${tasks.length}`} />
          <KPI label="Focus hours" value={`${Math.floor(totalMin / 60)}h`} />
          <KPI label="Interview rate" value={`${interviewRate}%`} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Focus minutes — last 7 days">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={focusByDay}>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--color-border)" }} />
                  <Bar dataKey="mins" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Weekly task completion">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={tasksByWeek}>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Line type="monotone" dataKey="completed" stroke="var(--color-primary)" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <Card title="Application funnel">
          <div className="grid grid-cols-6 gap-3">
            {funnel.map((f) => (
              <div key={f.stage} className="rounded-md border border-border bg-secondary/40 p-3 text-center">
                <div className="eyebrow">{f.stage}</div>
                <div className="mt-1 text-2xl font-semibold tabular-nums">{f.count}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Score breakdown">
          <div className="space-y-3">
            {breakdown.map(([k, v, w]) => (
              <div key={k}>
                <div className="flex items-center justify-between text-sm">
                  <span>{k}</span>
                  <span className="tabular-nums text-muted-foreground">{v} <span className="text-xs">/ weight {w}%</span></span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-secondary"><div className="h-full rounded-full bg-primary" style={{ width: `${v}%` }} /></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function KPI({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="eyebrow">{label}</div>
      <div className="mt-2 text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="text-sm font-semibold mb-4">{title}</div>
      {children}
    </div>
  );
}
