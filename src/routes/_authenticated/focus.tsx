import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { computeAndSaveScore } from "@/lib/aptimi";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/focus")({
  head: () => ({ meta: [{ title: "Focus · APTIMI" }] }),
  component: Focus,
});

const DURATIONS = [15, 25, 45, 60];

function Focus() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const [duration, setDuration] = useState(25);
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [taskId, setTaskId] = useState<string>("");

  useEffect(() => { if (!running) setRemaining(duration * 60); }, [duration, running]);

  useEffect(() => {
    if (!running) return;
    const i = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) { clearInterval(i); finish(); return 0; }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(i);
  }, [running]); // eslint-disable-line

  const { data } = useQuery({
    queryKey: ["focus", user.id],
    queryFn: async () => {
      const [sessions, tasks] = await Promise.all([
        supabase.from("focus_sessions").select("*").eq("user_id", user.id).order("started_at", { ascending: false }).limit(8),
        supabase.from("tasks").select("id, title").eq("user_id", user.id).eq("completed", false).order("week_number").limit(50),
      ]);
      return { sessions: sessions.data ?? [], tasks: tasks.data ?? [] };
    },
  });

  async function finish() {
    setRunning(false);
    const minutes = duration - Math.ceil(remaining / 60);
    await supabase.from("focus_sessions").insert({
      user_id: user.id,
      task_id: taskId || null,
      duration_minutes: Math.max(minutes, duration),
      started_at: new Date(Date.now() - duration * 60000).toISOString(),
      ended_at: new Date().toISOString(),
    });
    await computeAndSaveScore(user.id);
    qc.invalidateQueries();
    toast.success(`Logged ${duration}m focus session.`);
    setRemaining(duration * 60);
  }

  async function stop() {
    if (!running) return;
    setRunning(false);
    const minutes = Math.max(1, duration - Math.ceil(remaining / 60));
    await supabase.from("focus_sessions").insert({
      user_id: user.id, task_id: taskId || null,
      duration_minutes: minutes,
      started_at: new Date(Date.now() - minutes * 60000).toISOString(),
      ended_at: new Date().toISOString(),
    });
    await computeAndSaveScore(user.id);
    qc.invalidateQueries();
    setRemaining(duration * 60);
    toast.success(`Logged ${minutes}m focus session.`);
  }

  const m = Math.floor(remaining / 60).toString().padStart(2, "0");
  const s = (remaining % 60).toString().padStart(2, "0");

  return (
    <div>
      <PageHeader eyebrow="Focus mode" title="Get into deep work" subtitle="Pick a task, set a duration, and execute." />
      <div className="px-8 py-8 grid gap-8 lg:grid-cols-[1fr_320px] max-w-5xl">
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <div className="text-7xl font-bold tabular-nums tracking-tight md:text-8xl">{m}:{s}</div>
          <div className="mt-2 text-sm text-muted-foreground">{duration} minute session</div>
          <div className="mt-6 flex justify-center gap-2">
            {!running
              ? <Button size="lg" onClick={() => setRunning(true)}>Start</Button>
              : <Button size="lg" variant="outline" onClick={stop}>End session</Button>}
          </div>
          <div className="mt-8">
            <div className="eyebrow text-left">Duration</div>
            <div className="mt-2 flex gap-2 flex-wrap">
              {DURATIONS.map((d) => (
                <button key={d} disabled={running} onClick={() => setDuration(d)} className={`rounded-md border px-3 py-1.5 text-sm ${duration === d ? "border-primary bg-accent" : "border-border hover:bg-accent/60"} disabled:opacity-50`}>{d}m</button>
              ))}
            </div>
          </div>
          <div className="mt-6 text-left">
            <div className="eyebrow">Attach task</div>
            <select value={taskId} onChange={(e) => setTaskId(e.target.value)} disabled={running} className="mt-2 w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">No task</option>
              {data?.tasks.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card">
          <div className="px-5 py-3 border-b border-border text-sm font-semibold">Recent sessions</div>
          <ul className="divide-y divide-border">
            {(data?.sessions ?? []).length === 0 && <li className="px-5 py-6 text-sm text-muted-foreground">No sessions yet.</li>}
            {data?.sessions.map((s) => (
              <li key={s.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <span className="font-medium tabular-nums">{s.duration_minutes}m</span>
                <span className="text-xs text-muted-foreground">{new Date(s.started_at).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
