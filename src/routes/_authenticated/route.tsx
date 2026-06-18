import { createFileRoute, Outlet, redirect, useNavigate, useRouterState, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Compass, CalendarDays, Timer, Briefcase, BarChart3, Settings as SettingsIcon, LogOut,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AppShell,
});

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/roadmap", label: "Roadmap", icon: Compass },
  { to: "/weekly", label: "Weekly Plan", icon: CalendarDays },
  { to: "/focus", label: "Focus", icon: Timer },
  { to: "/applications", label: "Applications", icon: Briefcase },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

function AppShell() {
  const { user } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [profile, setProfile] = useState<{ full_name: string | null; onboarded: boolean } | null>(null);

  useEffect(() => {
    let active = true;
    supabase.from("profiles").select("full_name, onboarded").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (!active) return;
      setProfile(data as any);
      if (data && !data.onboarded && pathname !== "/onboarding") {
        navigate({ to: "/onboarding" });
      }
    });
    return () => { active = false; };
  }, [user.id, pathname, navigate]);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  }

  // Hide sidebar on onboarding
  if (pathname.startsWith("/onboarding")) {
    return <Outlet />;
  }

  const initial = (profile?.full_name || user.email || "?").trim().charAt(0).toUpperCase();
  const name = profile?.full_name || user.email?.split("@")[0] || "Account";

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-border bg-sidebar">
        <div className="flex items-center gap-2 px-4 h-14 border-b border-border">
          <div className="h-6 w-6 rounded-md bg-primary text-primary-foreground grid place-items-center text-[11px] font-bold">A</div>
          <span className="font-semibold tracking-tight">APTIMI</span>
        </div>
        <nav className="flex-1 p-2">
          {NAV.map((n) => {
            const active = pathname === n.to;
            const Icon = n.icon;
            return (
              <Link key={n.to} to={n.to as any} className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm mb-0.5 transition-colors ${active ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"}`}>
                <Icon className="h-4 w-4" /> {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-2">
          <div className="flex items-center gap-2 rounded-md px-2 py-2">
            <div className="h-7 w-7 rounded-full bg-accent text-accent-foreground grid place-items-center text-xs font-semibold shrink-0">{initial}</div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-medium">{name}</div>
              <div className="truncate text-[11px] text-muted-foreground">{user.email}</div>
            </div>
            <button onClick={signOut} className="text-muted-foreground hover:text-foreground" aria-label="Sign out">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
