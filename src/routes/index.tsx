import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Compass, Target, ListChecks, Timer, Briefcase, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "APTIMI — From career goal to internship offer" },
      { name: "description", content: "APTIMI is the career operating system for students. Turn your target role into a roadmap, weekly tasks, focus sessions, and an application pipeline." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="text-sm font-semibold tracking-tight">APTIMI</span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#problem" className="hover:text-foreground">Problem</a>
            <a href="#how" className="hover:text-foreground">How it works</a>
            <a href="#features" className="hover:text-foreground">Features</a>
            <Link to="/auth" className="text-foreground hover:text-primary">Sign in</Link>
            <Link to="/auth" search={{ mode: "signup" } as any} className="rounded-md bg-primary px-3 py-1.5 text-primary-foreground hover:bg-primary/90">
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-24 pb-20">
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">Career Execution Platform</span>
          <h1 className="mt-4 text-5xl font-bold tracking-tight md:text-6xl">
            Convert career ambition into <span className="text-primary">structured execution</span>.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            APTIMI is the operating system for your career. Set a goal, get a roadmap, execute weekly tasks,
            track focus, and land the internship — all in one place.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link to="/auth" search={{ mode: "signup" } as any} className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Start free <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#how" className="rounded-md border border-border px-5 py-2.5 text-sm font-medium hover:bg-accent">
              See how it works
            </a>
          </div>
        </div>

        {/* Dashboard mock */}
        <div className="mt-16 rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="grid grid-cols-[180px_1fr] min-h-[340px]">
            <div className="border-r border-border bg-sidebar p-4 text-xs">
              <div className="eyebrow mb-3">APTIMI</div>
              {["Dashboard", "Roadmap", "Weekly Plan", "Focus", "Applications", "Analytics"].map((x, i) => (
                <div key={x} className={`rounded-md px-2 py-1.5 mb-0.5 ${i === 0 ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground"}`}>{x}</div>
              ))}
            </div>
            <div className="p-6">
              <div className="eyebrow">Dashboard</div>
              <h3 className="mt-1 text-xl font-semibold">Good evening, Komal.</h3>
              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-border p-4">
                  <div className="eyebrow">Career readiness</div>
                  <div className="mt-1 text-3xl font-bold">73<span className="text-base font-normal text-muted-foreground">/100</span></div>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <div className="eyebrow">Tasks completed</div>
                  <div className="mt-1 text-3xl font-bold">18<span className="text-base font-normal text-muted-foreground">/28</span></div>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <div className="eyebrow">Focus streak</div>
                  <div className="mt-1 text-3xl font-bold">12 <span className="text-base font-normal text-muted-foreground">days</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section id="problem" className="border-y border-border bg-secondary/40">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <span className="eyebrow">The problem</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Students don't lack tools. They lack a connected execution system.
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Notion holds your notes. Google Calendar holds your time. LinkedIn shows jobs. Internshala has listings.
            Excel tracks applications. <span className="text-foreground">Nothing connects your career goal to your daily actions.</span>
          </p>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-6 py-24">
        <div className="text-center">
          <span className="eyebrow">How it works</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">From goal to offer, in one flow.</h2>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-4">
          {[
            { icon: Target, t: "1. Set your goal", d: "Pick your target role and timeline." },
            { icon: Compass, t: "2. Get a roadmap", d: "We turn the goal into weekly milestones." },
            { icon: ListChecks, t: "3. Execute weekly", d: "Specific tasks for every week." },
            { icon: Timer, t: "4. Run focus sessions", d: "Pomodoro to build the habit." },
            { icon: Briefcase, t: "5. Track applications", d: "From saved to offer, in one pipeline." },
            { icon: BarChart3, t: "6. Watch your score", d: "Career readiness, computed weekly." },
            { icon: CheckCircle2, t: "7. Land the offer", d: "Show recruiters real progress." },
          ].map((s) => (
            <div key={s.t} className="rounded-xl border border-border bg-card p-5">
              <s.icon className="h-5 w-5 text-primary" />
              <div className="mt-3 text-sm font-semibold">{s.t}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border bg-secondary/30">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="text-center">
            <span className="eyebrow">Features</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">Everything a serious candidate needs.</h2>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              ["Personalised roadmap", "12-week plan tailored to PM or Data Analyst roles."],
              ["Weekly planner", "Auto-generated tasks from your roadmap milestones."],
              ["Focus mode", "Pomodoro timer that tracks deep-work hours."],
              ["Application tracker", "Kanban pipeline from saved to offer."],
              ["Career readiness score", "A live signal of how interview-ready you are."],
              ["Skill self-assessment", "Re-runs the score as you grow."],
            ].map(([t, d]) => (
              <div key={t} className="rounded-xl border border-border bg-card p-6">
                <div className="text-sm font-semibold">{t}</div>
                <div className="mt-2 text-sm text-muted-foreground">{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials placeholder */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            ["Riya · IIIT Delhi", "APTIMI gave me clarity on what to do every week. I cracked my first PM internship in 9 weeks."],
            ["Aditya · NIT Trichy", "I finally stopped collecting tools and started executing. The readiness score keeps me honest."],
            ["Sneha · DTU", "The roadmap is the difference. I knew exactly what to study and when."],
          ].map(([who, quote]) => (
            <div key={who} className="rounded-xl border border-border bg-card p-6">
              <p className="text-sm leading-relaxed text-foreground">"{quote}"</p>
              <div className="mt-4 eyebrow">{who}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Your goal deserves a system.</h2>
          <p className="mt-4 text-muted-foreground">Sign up and build your career operating system in under five minutes.</p>
          <Link to="/auth" search={{ mode: "signup" } as any} className="mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Get started <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-8 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2"><Logo /> <span>© {new Date().getFullYear()} APTIMI</span></div>
          <div>Built for students who execute.</div>
        </div>
      </footer>
    </div>
  );
}

function Logo() {
  return (
    <div className="h-6 w-6 rounded-md bg-primary text-primary-foreground grid place-items-center text-[11px] font-bold">A</div>
  );
}
