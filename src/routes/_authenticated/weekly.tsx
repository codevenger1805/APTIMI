import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { computeAndSaveScore } from "@/lib/aptimi";

export const Route = createFileRoute("/_authenticated/weekly")({
  head: () => ({ meta: [{ title: "Weekly Plan · APTIMI" }] }),
  component: Weekly,
});

function Weekly() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const [week, setWeek] = useState(1);

  const { data } = useQuery({
    queryKey: ["weekly", user.id],
    queryFn: async () => {
      const [tasks, roadmap] = await Promise.all([
        supabase.from("tasks").select("*").eq("user_id", user.id).order("position"),
        supabase.from("roadmaps").select("total_weeks").eq("user_id", user.id).maybeSingle(),
      ]);
      return { tasks: tasks.data ?? [], total: roadmap.data?.total_weeks ?? 12 };
    },
  });

  const tasks = (data?.tasks ?? []).filter((t) => t.week_number === week);
  const done = tasks.filter((t) => t.completed).length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const total = data?.total ?? 12;

  const toggle = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      await supabase.from("tasks").update({ completed, completed_at: completed ? new Date().toISOString() : null }).eq("id", id);
      await computeAndSaveScore(user.id);
    },
    onSuccess: () => qc.invalidateQueries(),
  });

  return (
    <div>
      <PageHeader eyebrow="Weekly Planner" title={`Week ${week}`} subtitle={`${done} of ${tasks.length} tasks complete · ${pct}%`} actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setWeek((w) => Math.max(1, w - 1))} disabled={week <= 1}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="text-sm font-medium tabular-nums">Week {week} / {total}</span>
          <Button variant="outline" size="icon" onClick={() => setWeek((w) => Math.min(total, w + 1))} disabled={week >= total}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      } />
      <div className="px-8 py-8 max-w-3xl">
        <div className="h-2 w-full rounded-full bg-secondary mb-6"><div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} /></div>
        <ul className="rounded-xl border border-border bg-card divide-y divide-border">
          {tasks.length === 0 && <li className="px-5 py-8 text-sm text-muted-foreground">No tasks scheduled for this week.</li>}
          {tasks.map((t) => (
            <li key={t.id} className="flex items-center gap-3 px-5 py-3">
              <Checkbox checked={t.completed} onCheckedChange={(v) => toggle.mutate({ id: t.id, completed: !!v })} />
              <span className={`text-sm ${t.completed ? "line-through text-muted-foreground" : ""}`}>{t.title}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
