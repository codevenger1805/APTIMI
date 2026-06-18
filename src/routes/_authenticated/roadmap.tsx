import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock } from "lucide-react";
import { computeAndSaveScore } from "@/lib/aptimi";

export const Route = createFileRoute("/_authenticated/roadmap")({
  head: () => ({ meta: [{ title: "Roadmap · APTIMI" }] }),
  component: Roadmap,
});

function Roadmap() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["roadmap", user.id],
    queryFn: async () => {
      const [roadmap, milestones, tasks] = await Promise.all([
        supabase.from("roadmaps").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("roadmap_milestones").select("*").eq("user_id", user.id).order("position"),
        supabase.from("tasks").select("*").eq("user_id", user.id).order("position"),
      ]);
      return { roadmap: roadmap.data, milestones: milestones.data ?? [], tasks: tasks.data ?? [] };
    },
  });

  const toggle = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      await supabase.from("tasks").update({ completed, completed_at: completed ? new Date().toISOString() : null }).eq("id", id);
      await computeAndSaveScore(user.id);
    },
    onSuccess: () => qc.invalidateQueries(),
  });

  const r = data?.roadmap;
  const milestones = data?.milestones ?? [];
  const tasksByMilestone = new Map<string, any[]>();
  for (const t of data?.tasks ?? []) {
    const list = tasksByMilestone.get(t.milestone_id) ?? [];
    list.push(t);
    tasksByMilestone.set(t.milestone_id, list);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Roadmap"
        title={r ? `Your ${r.target_role} path` : "Your roadmap"}
        subtitle={r ? `${Math.ceil(r.total_weeks / 4)} months · ${r.total_weeks} weeks · ${milestones.length} milestones` : ""}
      />
      <div className="px-8 py-8 space-y-4 max-w-4xl">
        {milestones.map((m, i) => {
          const list = tasksByMilestone.get(m.id) ?? [];
          const done = list.filter((t) => t.completed).length;
          return (
            <div key={m.id} className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-border">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="h-7 w-7 shrink-0 rounded-md bg-accent text-accent-foreground grid place-items-center text-sm font-semibold">{i + 1}</div>
                  <div className="min-w-0">
                    <div className="font-semibold">{m.title}</div>
                    <div className="text-sm text-muted-foreground">{m.description}</div>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground"><Clock className="h-3 w-3" /> Weeks {m.week_start}{m.week_start !== m.week_end ? `–${m.week_end}` : ""}</div>
                  </div>
                </div>
                <span className="eyebrow shrink-0">{done}/{list.length} tasks</span>
              </div>
              <ul className="divide-y divide-border">
                {list.map((t) => (
                  <li key={t.id} className="flex items-center gap-3 px-5 py-3">
                    <Checkbox checked={t.completed} onCheckedChange={(v) => toggle.mutate({ id: t.id, completed: !!v })} />
                    <span className={`text-sm ${t.completed ? "line-through text-muted-foreground" : ""}`}>{t.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
        {milestones.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            No roadmap yet. Complete onboarding to generate one.
          </div>
        )}
      </div>
    </div>
  );
}
