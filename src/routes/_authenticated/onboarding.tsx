import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { ROLES, ROLE_SKILLS, type Role } from "@/lib/roadmap-templates";
import { generateRoadmapForUser, computeAndSaveScore } from "@/lib/aptimi";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: Onboarding,
});

function Onboarding() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    college: "",
    academic_year: "3rd Year",
    target_role: "Product Manager" as Role,
    timeline_months: 3,
  });
  const skills = ROLE_SKILLS[form.target_role];
  const [ratings, setRatings] = useState<Record<string, number>>({});

  async function finish() {
    setLoading(true);
    try {
      await supabase.from("profiles").update({
        full_name: form.full_name,
        college: form.college,
        academic_year: form.academic_year,
        onboarded: true,
      }).eq("id", user.id);

      await supabase.from("career_goals").insert({
        user_id: user.id,
        target_role: form.target_role,
        timeline_months: form.timeline_months,
      });

      // skill assessments
      const skillRows = skills.map((s) => ({ user_id: user.id, skill: s, rating: ratings[s] ?? 3 }));
      await supabase.from("skill_assessments").upsert(skillRows, { onConflict: "user_id,skill" });

      await generateRoadmapForUser(user.id, form.target_role);
      await computeAndSaveScore(user.id);

      toast.success("You're all set. Welcome to APTIMI.");
      navigate({ to: "/dashboard" });
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to set up your account");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <div className="flex items-center gap-2 mb-8">
          <div className="h-6 w-6 rounded-md bg-primary text-primary-foreground grid place-items-center text-[11px] font-bold">A</div>
          <span className="font-semibold tracking-tight">APTIMI</span>
        </div>

        <div className="flex items-center gap-2 mb-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`h-1 flex-1 rounded ${i <= step ? "bg-primary" : "bg-border"}`} />
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-5">
            <div>
              <span className="eyebrow">Step 1 of 3</span>
              <h1 className="mt-1 text-2xl font-bold tracking-tight">Tell us about you</h1>
              <p className="text-muted-foreground text-sm mt-1">A bit of context so we can personalize your roadmap.</p>
            </div>
            <div>
              <Label>Full name</Label>
              <Input className="mt-1" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Komal Sharma" required />
            </div>
            <div>
              <Label>College</Label>
              <Input className="mt-1" value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} placeholder="Your university or college" required />
            </div>
            <div>
              <Label>Academic year</Label>
              <select className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.academic_year} onChange={(e) => setForm({ ...form, academic_year: e.target.value })}>
                {["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "Graduate"].map((y) => <option key={y}>{y}</option>)}
              </select>
            </div>
            <Button className="w-full" onClick={() => setStep(1)} disabled={!form.full_name || !form.college}>Continue</Button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <span className="eyebrow">Step 2 of 3</span>
              <h1 className="mt-1 text-2xl font-bold tracking-tight">Pick your target role</h1>
              <p className="text-muted-foreground text-sm mt-1">We'll build a roadmap tailored to it.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {ROLES.map((r) => (
                <button key={r} onClick={() => setForm({ ...form, target_role: r })} className={`text-left rounded-lg border p-4 ${form.target_role === r ? "border-primary ring-2 ring-primary/20 bg-accent" : "border-border hover:bg-accent/60"}`}>
                  <div className="font-semibold">{r}</div>
                  <div className="text-xs text-muted-foreground mt-1">{ROLE_SKILLS[r].slice(0, 3).join(" · ")}…</div>
                </button>
              ))}
            </div>
            <div>
              <Label>Timeline</Label>
              <select className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.timeline_months} onChange={(e) => setForm({ ...form, timeline_months: Number(e.target.value) })}>
                {[3, 6, 9, 12].map((m) => <option key={m} value={m}>{m} months</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(0)} className="flex-1">Back</Button>
              <Button onClick={() => setStep(2)} className="flex-1">Continue</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <span className="eyebrow">Step 3 of 3</span>
              <h1 className="mt-1 text-2xl font-bold tracking-tight">Quick skill check</h1>
              <p className="text-muted-foreground text-sm mt-1">Rate yourself 1–5 on each. Be honest — you'll update this as you grow.</p>
            </div>
            <div className="space-y-4">
              {skills.map((s) => (
                <div key={s}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{s}</span>
                    <span className="text-muted-foreground">{ratings[s] ?? 3}/5</span>
                  </div>
                  <Slider min={1} max={5} step={1} value={[ratings[s] ?? 3]} onValueChange={(v) => setRatings({ ...ratings, [s]: v[0] })} className="mt-2" />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1" disabled={loading}>Back</Button>
              <Button onClick={finish} className="flex-1" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate my roadmap"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
