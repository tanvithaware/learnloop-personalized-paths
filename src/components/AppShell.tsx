import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { BarChart3, BookOpen, Bot, Brain, LayoutDashboard, Menu, MessageSquareHeart, RotateCcw, Sparkles, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/learn", label: "Lessons", icon: BookOpen },
  { to: "/quiz", label: "Quizzes", icon: Brain },
  { to: "/assistant", label: "AI Assistant", icon: Bot },
  { to: "/progress", label: "Progress", icon: BarChart3 },
  { to: "/feedback", label: "Feedback", icon: MessageSquareHeart },
] as const;

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 font-display text-lg font-bold ${className}`}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-brand text-primary-foreground shadow-glow">
        <Sparkles className="h-5 w-5" />
      </span>
      LearnLoop <span className="text-gradient-brand">AI</span>
    </Link>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1" aria-label="Main">
      {NAV.map(({ to, label, icon: Icon }) => (
        <Link key={to} to={to} onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}>
          <Icon className="h-4 w-4" /> {label}
        </Link>
      ))}
    </nav>
  );
}

export function AppShell({ children, title }: { children: ReactNode; title: string }) {
  const [open, setOpen] = useState(false);
  const { profile, ready, reset } = useStore();
  const navigate = useNavigate();

  const doReset = () => {
    if (confirm("Reset all demo progress?")) { reset(); navigate({ to: "/" }); }
  };

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar p-5 lg:flex">
        <Logo />
        <div className="mt-8 flex-1"><NavLinks /></div>
        <div className="rounded-2xl bg-gradient-soft p-4 text-sm">
          <p className="font-semibold">{profile ? `Hi, ${profile.name}` : "Guest mode"}</p>
          <p className="mt-1 text-xs text-muted-foreground">Demo progress is saved in this browser.</p>
          <Button variant="ghost" size="sm" className="mt-2 -ml-2" onClick={doReset}><RotateCcw /> Reset demo</Button>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-card/90 px-4 py-3 backdrop-blur lg:hidden">
        <Logo />
        <Button variant="ghost" size="icon" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </Button>
      </header>
      {open && (
        <div className="fixed inset-x-0 top-[61px] z-20 border-b bg-card p-4 shadow-card lg:hidden">
          <NavLinks onNavigate={() => setOpen(false)} />
          <Button variant="ghost" size="sm" className="mt-2" onClick={doReset}><RotateCcw /> Reset demo</Button>
        </div>
      )}

      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-10">
          <h1 className="sr-only">{title}</h1>
          {!ready ? (
            <div className="space-y-4" aria-busy="true">
              <div className="h-10 w-1/3 animate-pulse rounded-xl bg-muted" />
              <div className="grid gap-4 md:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="h-36 animate-pulse rounded-2xl bg-muted" />)}</div>
            </div>
          ) : !profile ? (
            <div className="mx-auto max-w-md rounded-3xl border bg-card p-8 text-center shadow-card">
              <Sparkles className="mx-auto h-10 w-10 text-primary" />
              <h2 className="mt-4 text-xl font-bold">Let's set up your learning profile</h2>
              <p className="mt-2 text-sm text-muted-foreground">It takes 30 seconds — no account needed.</p>
              <Button variant="hero" className="mt-6" asChild><Link to="/onboarding">Start onboarding</Link></Button>
            </div>
          ) : children}
        </div>
      </main>
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border bg-card p-5 shadow-card ${className}`}>{children}</section>;
}

export function Bar({ value, className = "" }: { value: number; className?: string }) {
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-muted ${className}`} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-gradient-brand transition-all" style={{ width: `${value}%` }} />
    </div>
  );
}

const STATUS_STYLE: Record<string, string> = {
  Strong: "bg-success/15 text-success",
  Improving: "bg-warning/20 text-warning-foreground",
  "Needs Practice": "bg-destructive/12 text-destructive",
  "Not assessed": "bg-muted text-muted-foreground",
};
export function StatusPill({ status }: { status: string }) {
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[status]}`}>{status}</span>;
}
