import { supabase } from "@/integrations/supabase/client";
import { ROADMAP_TEMPLATES, type Role } from "./roadmap-templates";

export const STATUSES = ["saved", "applied", "assessment", "interview", "offer", "rejected"] as const;
export type AppStatus = (typeof STATUSES)[number];

export const STATUS_LABELS: Record<AppStatus, string> = {
  saved: "Saved", applied: "Applied", assessment: "Assessment",
  interview: "Interview", offer: "Offer", rejected: "Rejected",
};

// ISO week number (1..)
export function isoWeek(d = new Date()) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - dayNum + 3);
  const firstThursday = date.valueOf();
  date.setUTCMonth(0, 1);
  if (date.getUTCDay() !== 4) date.setUTCMonth(0, 1 + ((4 - date.getUTCDay()) + 7) % 7);
  return 1 + Math.ceil((firstThursday - date.valueOf()) / 604800000);
}

export async function generateRoadmapForUser(userId: string, role: Role) {
  const template = ROADMAP_TEMPLATES[role];
  const totalWeeks = Math.max(...template.map((m) => m.week_end));

  // Insert roadmap
  const { data: roadmap, error: rErr } = await supabase
    .from("roadmaps")
    .insert({ user_id: userId, target_role: role, total_weeks: totalWeeks })
    .select()
    .single();
  if (rErr) throw rErr;

  // Insert milestones
  const milestonesPayload = template.map((m, idx) => ({
    roadmap_id: roadmap.id,
    user_id: userId,
    position: idx + 1,
    title: m.title,
    description: m.description,
    week_start: m.week_start,
    week_end: m.week_end,
  }));
  const { data: milestones, error: mErr } = await supabase
    .from("roadmap_milestones")
    .insert(milestonesPayload)
    .select();
  if (mErr) throw mErr;

  // Insert tasks (one row per task per milestone, anchored at week_start)
  const tasksPayload: any[] = [];
  milestones!.forEach((ms, idx) => {
    template[idx].tasks.forEach((t, ti) => {
      tasksPayload.push({
        user_id: userId,
        milestone_id: ms.id,
        title: t,
        week_number: ms.week_start,
        position: ti,
      });
    });
  });
  const { error: tErr } = await supabase.from("tasks").insert(tasksPayload);
  if (tErr) throw tErr;

  return roadmap;
}

export interface ScoreParts {
  skills: number;
  roadmap: number;
  focus: number;
  applications: number;
  consistency: number;
  total: number;
}

export async function computeAndSaveScore(userId: string): Promise<ScoreParts> {
  const [skills, tasks, focus, apps] = await Promise.all([
    supabase.from("skill_assessments").select("rating").eq("user_id", userId),
    supabase.from("tasks").select("completed").eq("user_id", userId),
    supabase.from("focus_sessions").select("duration_minutes, started_at").eq("user_id", userId),
    supabase.from("applications").select("status").eq("user_id", userId),
  ]);

  // Skills: average rating 1-5 -> 0..100, then sub-score 0..30
  const ratings = (skills.data ?? []).map((r) => r.rating);
  const skillPct = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length) / 5 : 0;
  const skillsScore = Math.round(skillPct * 100);

  // Roadmap: % tasks complete -> 0..100
  const totalTasks = tasks.data?.length ?? 0;
  const doneTasks = (tasks.data ?? []).filter((t) => t.completed).length;
  const roadmapScore = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // Focus: total hours capped at 40h -> 0..100
  const totalMin = (focus.data ?? []).reduce((a, b) => a + (b.duration_minutes ?? 0), 0);
  const focusScore = Math.min(100, Math.round((totalMin / 60 / 40) * 100));

  // Applications: count >=20 -> 100
  const appCount = apps.data?.length ?? 0;
  const applicationsScore = Math.min(100, Math.round((appCount / 20) * 100));

  // Consistency: distinct days with focus sessions in last 14 days
  const recent = (focus.data ?? []).filter((f) => {
    const d = new Date(f.started_at).getTime();
    return Date.now() - d <= 14 * 86400_000;
  });
  const days = new Set(recent.map((f) => new Date(f.started_at).toDateString()));
  const consistencyScore = Math.min(100, Math.round((days.size / 14) * 100));

  const total = Math.round(
    skillsScore * 0.30 +
    roadmapScore * 0.30 +
    focusScore * 0.15 +
    applicationsScore * 0.15 +
    consistencyScore * 0.10,
  );

  await supabase.from("career_scores").upsert({
    user_id: userId,
    skills_score: skillsScore,
    roadmap_score: roadmapScore,
    focus_score: focusScore,
    applications_score: applicationsScore,
    consistency_score: consistencyScore,
    total_score: total,
    updated_at: new Date().toISOString(),
  });

  return { skills: skillsScore, roadmap: roadmapScore, focus: focusScore, applications: applicationsScore, consistency: consistencyScore, total };
}

export function focusStreak(sessions: { started_at: string }[]): number {
  const days = new Set(sessions.map((s) => new Date(s.started_at).toDateString()));
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    if (days.has(d.toDateString())) streak++;
    else if (i > 0) break;
  }
  return streak;
}
