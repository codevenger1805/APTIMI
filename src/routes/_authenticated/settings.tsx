import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { computeAndSaveScore } from "@/lib/aptimi";
import { ROLE_SKILLS, type Role } from "@/lib/roadmap-templates";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings · APTIMI" }] }),
  component: Settings,
});

function Settings() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const [fullName, setFullName] = useState("");
  const [college, setCollege] = useState("");
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  const { data } = useQuery({
    queryKey: ["settings", user.id],
    queryFn: async () => {
      const [profile, goal, skills] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("career_goals").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("skill_assessments").select("*").eq("user_id", user.id),
      ]);
      return { profile: profile.data, goal: goal.data, skills: skills.data ?? [] };
    },
  });

  useEffect(() => {
    if (data?.profile) {
      setFullName(data.profile.full_name ?? "");
      setCollege(data.profile.college ?? "");
    }
    if (data?.skills) {
      const r: Record<string, number> = {};
      data.skills.forEach((s) => { r[s.skill] = s.rating; });
      setRatings(r);
    }
  }, [data]);

  const role = (data?.goal?.target_role ?? "Product Manager") as Role;
  const skills = ROLE_SKILLS[role] ?? [];

  async function saveProfile() {
    setSaving(true);
    await supabase.from("profiles").update({ full_name: fullName, college }).eq("id", user.id);
    setSaving(false);
    qc.invalidateQueries();
    toast.success("Profile saved");
  }

  async function saveSkills() {
    setSaving(true);
    const rows = skills.map((s) => ({ user_id: user.id, skill: s, rating: ratings[s] ?? 3 }));
    await supabase.from("skill_assessments").upsert(rows, { onConflict: "user_id,skill" });
    await computeAndSaveScore(user.id);
    setSaving(false);
    qc.invalidateQueries();
    toast.success("Score recomputed");
  }

  return (
    <div>
      <PageHeader eyebrow="Settings" title="Profile" subtitle="Account details and self-assessment." />
      <div className="px-8 py-8 space-y-8 max-w-2xl">
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="text-sm font-semibold">Account</div>
          <div>
            <Label>Email</Label>
            <Input className="mt-1" value={user.email ?? ""} disabled />
          </div>
          <div>
            <Label>Full name</Label>
            <Input className="mt-1" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div>
            <Label>College</Label>
            <Input className="mt-1" value={college} onChange={(e) => setCollege(e.target.value)} />
          </div>
          <Button onClick={saveProfile} disabled={saving}>Save changes</Button>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div>
            <div className="text-sm font-semibold">Skill self-assessment</div>
            <div className="text-xs text-muted-foreground">Update ratings as you grow. Re-runs the readiness score.</div>
          </div>
          {skills.map((s) => (
            <div key={s}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{s}</span>
                <span className="text-muted-foreground tabular-nums">{ratings[s] ?? 3}/5</span>
              </div>
              <Slider min={1} max={5} step={1} value={[ratings[s] ?? 3]} onValueChange={(v) => setRatings({ ...ratings, [s]: v[0] })} className="mt-2" />
            </div>
          ))}
          <Button onClick={saveSkills} disabled={saving}>Save & recompute</Button>
        </div>
      </div>
    </div>
  );
}
