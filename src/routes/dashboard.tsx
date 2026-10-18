import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, BookOpen, Brain, Flame, LineChart, Target, TrendingUp, Zap } from "lucide-react";
import { Bar as RBar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { AppShell, Bar, Card, StatusPill } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { LESSONS, lessonFor, topicName } from "@/lib/data";
import { computeMastery, learningLevel, recommend } from "@/lib/engine";
import { dayKey, useStore } from "@/lib/store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — LearnLoop AI" },
      { name: "description", content: "Your personalized learning dashboard and recommendations." },
      { property: "og:title", content: "Dashboard — LearnLoop AI" },
      { property: "og:description", content: "Your personalized learning dashboard and recommendations." },
    ],
  }),
  component: () => <AppShell title="Dashboard"><Dashboard /></AppShell>,
});

function Dashboard() {
  const s = useStore();
  const mastery = computeMastery(s.history, s.completed);
  const recs = recommend(mastery, s.completed, s.profile?.format);
  const assessed = mastery.filter((m) => m.score !== null);
  const overall = Math.round((s.completed.length / LESSONS.length) * 50 + (assessed.length ? assessed.reduce((a, m) => a + m.score!, 0) / assessed.length / 2 : 0));
  const strong = mastery.filter((m) => m.status === "Strong");
  const weak = mastery.filter((m) => m.status === "Needs Practice" || m.status === "Improving");
  const next = recs.find((r) => r.action === "lesson") ?? recs[0]!;
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000);
    return { day: d.toLocaleDateString("en", { weekday: "short" }), minutes: s.activity[dayKey(d)] ?? 0 };
  });
  const noQuiz = s.history.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl bg-gradient-brand p-6 text-primary-foreground shadow-glow sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <p className="text-sm opacity-90">{s.profile!.level} · {s.profile!.subject}</p>
          <h2 className="mt-1 text-2xl font-bold sm:text-3xl">Welcome back, {s.profile!.name} 👋</h2>
          <p className="mt-1 text-sm opacity-90">{noQuiz ? "Start with a quick diagnostic so we can personalize your path." : "Here's what we recommend next, based on your latest quiz."}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" className="rounded-xl bg-card text-accent-foreground hover:bg-card/90" asChild><Link to="/learn" search={{ topic: next.topic }}><BookOpen /> Start Learning</Link></Button>
          <Button variant="secondary" className="rounded-xl bg-card/20 text-primary-foreground hover:bg-card/30" asChild><Link to="/quiz" search={{ mode: noQuiz ? "diagnostic" : "adaptive" }}><Brain /> Take a Quiz</Link></Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={TrendingUp} label="Overall progress" value={`${overall}%`}><Bar value={overall} className="mt-3" /></Stat>
        <Stat icon={Flame} label="Learning streak" value={`${s.streak} days`} />
        <Stat icon={Award} label="Lessons completed" value={`${s.completed.length} / ${LESSONS.length}`} />
        <Stat icon={Zap} label="Current level" value={learningLevel(mastery)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Recommended next</h3>
            <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">Rule-based engine</span>
          </div>
          <div className="mt-4 rounded-2xl bg-lavender p-4">
            <p className="text-lg font-semibold">{next.title}</p>
            <p className="mt-1 text-sm text-muted-foreground"><strong className="text-foreground">Why: </strong>{next.reason}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {next.action === "diagnostic" ? (
                <Button variant="hero" asChild><Link to="/quiz" search={{ mode: "diagnostic" }}>Take diagnostic quiz</Link></Button>
              ) : next.action === "revision" ? (
                <Button variant="hero" asChild><Link to="/quiz" search={{ mode: "revision" }}>Start revision quiz</Link></Button>
              ) : next.action === "adaptive" ? (
                <Button variant="hero" asChild><Link to="/quiz" search={{ mode: "adaptive" }}>Start adaptive quiz</Link></Button>
              ) : (
                <Button variant="hero" asChild><Link to="/learn" search={{ topic: next.topic }}>Open lesson · {lessonFor(next.topic).minutes} min</Link></Button>
              )}
            </div>
          </div>
          <ul className="mt-4 space-y-2">
            {recs.filter((r) => r !== next).slice(0, 3).map((r) => (
              <li key={r.topic} className="flex items-start gap-3 rounded-xl border p-3 text-sm">
                <Target className={`mt-0.5 h-4 w-4 shrink-0 ${r.priority === "high" ? "text-destructive" : r.priority === "medium" ? "text-warning" : "text-success"}`} />
                <div><p className="font-medium">{r.title}</p><p className="text-muted-foreground">{r.reason}</p></div>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h3 className="font-semibold">Topic mastery</h3>
          <ul className="mt-4 space-y-4">
            {mastery.map((m) => (
              <li key={m.topic}>
                <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
                  <span className="font-medium">{topicName(m.topic)}</span><StatusPill status={m.status} />
                </div>
                <Bar value={m.score ?? 0} />
              </li>
            ))}
          </ul>
          <div className="mt-5 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl bg-success/10 p-3"><p className="font-semibold text-success">Strong</p><p className="mt-1 text-muted-foreground">{strong.map((m) => topicName(m.topic)).join(", ") || "None yet"}</p></div>
            <div className="rounded-xl bg-destructive/10 p-3"><p className="font-semibold text-destructive">Needs work</p><p className="mt-1 text-muted-foreground">{weak.map((m) => topicName(m.topic)).join(", ") || "None 🎉"}</p></div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h3 className="font-semibold">Weekly learning activity <span className="text-xs font-normal text-muted-foreground">(minutes)</span></h3>
          <div className="mt-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={week}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} fontSize={12} />
                <Tooltip cursor={{ fill: "var(--lavender)" }} />
                <RBar dataKey="minutes" fill="var(--primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h3 className="font-semibold">Recent quiz results</h3>
          {noQuiz ? (
            <div className="mt-4 rounded-xl bg-lavender p-4 text-sm text-muted-foreground">No quizzes yet. Take the diagnostic to unlock personalized recommendations.</div>
          ) : (
            <ul className="mt-4 space-y-3">
              {[...s.history].reverse().slice(0, 4).map((h) => (
                <li key={h.id} className="flex items-center justify-between rounded-xl border p-3 text-sm">
                  <div><p className="font-medium capitalize">{h.mode} quiz</p><p className="text-xs text-muted-foreground">{new Date(h.date).toLocaleString()}</p></div>
                  <span className="font-display text-lg font-bold text-primary">{h.score}/{h.total}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="soft" size="sm" asChild><Link to="/progress"><LineChart /> View Progress</Link></Button>
            <Button variant="soft" size="sm" asChild><Link to="/quiz" search={{ mode: "revision" }}><Target /> Review Weak Topics</Link></Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, children }: { icon: typeof Flame; label: string; value: string; children?: React.ReactNode }) {
  return (
    <Card>
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-accent-foreground"><Icon className="h-5 w-5" /></span>
        <div><p className="text-xs text-muted-foreground">{label}</p><p className="font-display text-xl font-bold">{value}</p></div>
      </div>
      {children}
    </Card>
  );
}
