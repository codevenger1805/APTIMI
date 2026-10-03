import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { computeAndSaveScore } from "@/lib/aptimi";
import { toast } from "sonner";
import { Play, Square } from "lucide-react";

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
  const startedAt = useRef<number | null>(null);
  const endAt = useRef<number | null>(null);

  useEffect(() => { if (!running) setRemaining(duration * 60); }, [duration, running]);

  useEffect(() => {
    if (!running) return;
    const i = setInterval(() => {
      const next = Math.max(0, Math.ceil(((endAt.current ?? Date.now()) - Date.now()) / 1000));
      setRemaining(next);
      if (next === 0) {
        clearInterval(i);
        void finish(duration);
      }
    }, 250);
    return () => clearInterval(i);
  }, [running, duration]);

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

  function start() {
    startedAt.current = Date.now();
    endAt.current = startedAt.current + duration * 60_000;
    setRunning(true);
  }

  async function finish(minutes: number) {
    setRunning(false);
    startedAt.current = null;
    endAt.current = null;
    const { error } = await supabase.from("focus_sessions").insert({
      user_id: user.id,
      task_id: taskId || null,
      duration_minutes: minutes,
      started_at: new Date(Date.now() - minutes * 60000).toISOString(),
      ended_at: new Date().toISOString(),
    });
    if (error) { toast.error(error.message); return; }
    await computeAndSaveScore(user.id);
    qc.invalidateQueries();
    toast.success(`Logged ${minutes}m focus session.`);
    setRemaining(duration * 60);
  }

  async function stop() {
    if (!running) return;
    setRunning(false);
    const minutes = Math.max(1, Math.ceil((Date.now() - (startedAt.current ?? Date.now())) / 60000));
    const sessionStart = startedAt.current ?? Date.now();
    startedAt.current = null;
    endAt.current = null;
    const { error } = await supabase.from("focus_sessions").insert({
      user_id: user.id, task_id: taskId || null,
      duration_minutes: minutes,
      started_at: new Date(sessionStart).toISOString(),
      ended_at: new Date().toISOString(),
    });
    if (error) { toast.error(error.message); return; }
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
      <div className="mx-auto grid max-w-5xl gap-10 px-5 py-8 md:px-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="min-w-0 text-center">
          <div className="py-8 text-6xl font-semibold tabular-nums md:text-8xl" role="timer" aria-label={`${m} minutes ${s} seconds remaining`}>{m}:{s}</div>
          <div className="mt-2 text-sm text-muted-foreground">{duration} minute session</div>
          <div className="mt-6 flex justify-center gap-2">
            {!running
              ? <Button size="lg" onClick={start}><Play aria-hidden="true" className="mr-2 h-4 w-4" />Start focus</Button>
              : <Button size="lg" variant="outline" onClick={stop}><Square aria-hidden="true" className="mr-2 h-4 w-4" />End session</Button>}
          </div>
          <div className="mx-auto mt-12 max-w-md border-t border-border pt-6 text-left">
            <div className="text-sm font-medium">Duration</div>
            <div className="mt-3 flex gap-2 flex-wrap" role="group" aria-label="Session duration">
              {DURATIONS.map((d) => (
                <Button key={d} type="button" size="sm" variant={duration === d ? "default" : "outline"} aria-pressed={duration === d} disabled={running} onClick={() => setDuration(d)}>{d}m</Button>
              ))}
            </div>
          </div>
          <div className="mx-auto mt-6 max-w-md text-left">
            <label htmlFor="focus-task" className="text-sm font-medium">Attach task</label>
            <select id="focus-task" value={taskId} onChange={(e) => setTaskId(e.target.value)} disabled={running} className="mt-2 w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">No task</option>
              {data?.tasks.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </div>
        </section>

        <section className="border-t border-border lg:border-t-0 lg:border-l lg:pl-8">
          <h2 className="py-3 border-b border-border text-sm font-semibold">Recent sessions</h2>
          <ul className="divide-y divide-border">
            {(data?.sessions ?? []).length === 0 && <li className="py-6 text-sm text-muted-foreground">No sessions yet.</li>}
            {data?.sessions.map((s) => (
              <li key={s.id} className="flex items-center justify-between py-3 text-sm">
                <span className="font-medium tabular-nums">{s.duration_minutes}m</span>
                <span className="text-xs text-muted-foreground">{new Date(s.started_at).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
