import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowDownRight, ArrowUpRight, BookOpen } from "lucide-react";
import { Bar as RBar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell, Card, StatusPill } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { LESSONS, TOPICS, topicName } from "@/lib/data";
import { computeMastery, recommend, statusCounts, subjectResults, type Mastery, type QuizRecord } from "@/lib/engine";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Progress & Analytics — LearnLoop AI" },
      { name: "description", content: "Track quiz scores, topic strengths and study priorities." },
      { property: "og:title", content: "Progress & Analytics — LearnLoop AI" },
      { property: "og:description", content: "Track quiz scores, topic strengths and study priorities." },
    ],
  }),
  component: () => <AppShell title="Progress"><Progress /></AppShell>,
});

function Progress() {
  const s = useStore();
  const mastery = computeMastery(s.history, s.completed);
  const recs = recommend(mastery, s.completed, s.profile?.format).filter((r) => r.priority !== "low");
  const line = s.history.map((h, i) => ({ name: `#${i + 1} ${h.mode.slice(0, 4)}`, score: Math.round((h.score / h.total) * 100) }));
  const diag = s.history.find((h) => h.mode === "diagnostic");
  const latest = s.history.at(-1);
  const pct = (h?: { score: number; total: number }) => (h ? Math.round((h.score / h.total) * 100) : 0);
  const delta = diag && latest && latest !== diag ? pct(latest) - pct(diag) : null;
  const topicData = mastery.map((m) => ({ name: TOPICS.find((t) => t.id === m.topic)!.short, mastery: m.score ?? 0 }));

  if (!s.history.length) {
    return (
      <Card className="mx-auto max-w-md text-center">
        <h2 className="text-xl font-bold">No progress data yet</h2>
        <p className="mt-2 text-sm text-muted-foreground">Complete the diagnostic quiz and your analytics will appear here.</p>
        <Button variant="hero" className="mt-5" asChild><Link to="/quiz" search={{ mode: "diagnostic" }}>Take diagnostic quiz</Link></Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Progress & analytics</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><p className="text-xs text-muted-foreground">Diagnostic score</p><p className="font-display text-3xl font-bold">{pct(diag)}%</p></Card>
        <Card><p className="text-xs text-muted-foreground">Improvement since diagnostic</p>
          <p className={`flex items-center gap-1 font-display text-3xl font-bold ${delta === null ? "" : delta >= 0 ? "text-success" : "text-destructive"}`}>
            {delta === null ? "—" : <>{delta >= 0 ? <ArrowUpRight /> : <ArrowDownRight />}{delta > 0 ? "+" : ""}{delta}%</>}
          </p>
          {delta === null && <p className="text-xs text-muted-foreground">Take another quiz to compare.</p>}
        </Card>
        <Card><p className="text-xs text-muted-foreground">Lessons completed</p><p className="font-display text-3xl font-bold">{s.completed.length}/{LESSONS.length}</p>
          <p className="truncate text-xs text-muted-foreground">{s.completed.map((t) => topicName(t as never)).join(", ") || "None yet"}</p></Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="font-semibold">Quiz scores over time</h3>
          <div className="mt-4 h-60"><ResponsiveContainer><LineChart data={line}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="name" fontSize={11} /><YAxis domain={[0, 100]} fontSize={11} /><Tooltip />
            <Line type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={3} dot={{ r: 5, fill: "var(--secondary)" }} />
          </LineChart></ResponsiveContainer></div>
        </Card>
        <Card>
          <h3 className="font-semibold">Topic-wise strengths</h3>
          <div className="mt-4 h-60"><ResponsiveContainer><BarChart data={topicData} layout="vertical">
            <XAxis type="number" domain={[0, 100]} fontSize={11} /><YAxis type="category" dataKey="name" width={100} fontSize={11} /><Tooltip />
            <RBar dataKey="mastery" fill="var(--secondary)" radius={[0, 8, 8, 0]} />
          </BarChart></ResponsiveContainer></div>
        </Card>
      </div>
      <ResultsPie mastery={mastery} history={s.history} />
      <Card>
        <h3 className="font-semibold">Recommended study priorities</h3>
        {recs.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">All topics are strong — try challenge-mode adaptive quizzes!</p> : (
          <ol className="mt-4 space-y-3">
            {recs.map((r, i) => (
              <li key={r.topic} className="flex flex-col gap-2 rounded-xl border p-4 sm:flex-row sm:items-center">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-brand font-bold text-primary-foreground">{i + 1}</span>
                <div className="flex-1"><p className="flex items-center gap-2 font-medium">{r.title} <StatusPill status={mastery.find((m) => m.topic === r.topic)!.status} /></p><p className="text-sm text-muted-foreground">{r.reason}</p></div>
                <Button variant="soft" size="sm" asChild><Link to="/learn" search={{ topic: r.topic }}><BookOpen /> Study</Link></Button>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
}

const PIE_COLOR: Record<string, string> = {
  Strong: "var(--chart-4)",
  Improving: "var(--chart-5)",
  "Needs Practice": "var(--destructive)",
  "Not assessed": "var(--muted-foreground)",
  Correct: "var(--chart-4)",
  Incorrect: "var(--destructive)",
};

const SUBJECT_COLOR: Record<string, string> = {
  prog: "var(--chart-1)",
  ds: "var(--chart-2)",
  dbms: "var(--chart-3)",
  cn: "var(--chart-4)",
};

type PieView = "mastery" | "answers" | "subjects";
type PieDatum = { name: string; value: number; color: string; detail?: string; status?: string };

const VIEWS: { id: PieView; label: string; caption: string; unit: string }[] = [
  { id: "mastery", label: "Topic mastery", caption: "How your topics are tracking after your quizzes.", unit: "topics" },
  { id: "answers", label: "Answer accuracy", caption: "Correct vs incorrect answers across every quiz.", unit: "answers" },
  { id: "subjects", label: "Subject results", caption: "Questions answered in each subject, with your accuracy there.", unit: "questions" },
];

function ResultsPie({ mastery, history }: { mastery: Mastery[]; history: QuizRecord[] }) {
  const [view, setView] = useState<PieView>("mastery");
  const answered = history.reduce((a, h) => a + h.total, 0);
  const right = history.reduce((a, h) => a + h.score, 0);

  const data: PieDatum[] =
    view === "mastery"
      ? statusCounts(mastery).map((d) => ({ ...d, color: PIE_COLOR[d.name] ?? "var(--chart-1)" }))
      : view === "answers"
        ? [{ name: "Correct", value: right }, { name: "Incorrect", value: answered - right }]
            .filter((d) => d.value > 0)
            .map((d) => ({ ...d, color: PIE_COLOR[d.name] ?? "var(--chart-1)" }))
        : subjectResults(history).map((r) => ({
            name: r.name,
            value: r.total,
            color: SUBJECT_COLOR[r.topic] ?? "var(--chart-1)",
            detail: `${r.correct}/${r.total} correct · ${r.accuracy}%`,
            status: mastery.find((m) => m.topic === r.topic)?.status,
          }));

  const sum = data.reduce((a, d) => a + d.value, 0);
  const total = sum || 1;
  const active = VIEWS.find((v) => v.id === view)!;

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">Results breakdown</h3>
          <p className="text-sm text-muted-foreground">{active.caption}</p>
        </div>
        <div className="flex rounded-full border bg-muted p-1 text-xs font-semibold">
          {VIEWS.map((v) => (
            <button key={v.id} type="button" onClick={() => setView(v.id)} aria-pressed={view === v.id}
              className={`rounded-full px-3 py-1.5 transition-colors ${view === v.id ? "bg-card shadow-card" : "text-muted-foreground"}`}>
              {v.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 grid items-center gap-6 sm:grid-cols-2">
        <div className="relative h-64">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="88%" paddingAngle={1.5} stroke="none" isAnimationActive={false}>
                {data.map((d) => <Cell key={d.name} fill={d.color} />)}
              </Pie>
              <Tooltip formatter={(value: number | string, name: string) => {
                const d = data.find((x) => x.name === name);
                return [`${value} (${Math.round((Number(value) / total) * 100)}%)`, d?.status ? `${name} — ${d.status}` : name];
              }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
            <div>
              <p className="font-display text-2xl font-bold">{sum}</p>
              <p className="text-xs text-muted-foreground">{active.unit}</p>
            </div>
          </div>
        </div>
        <ul className="space-y-2 text-sm">
          {data.map((d) => (
            <li key={d.name} className="flex items-center gap-3">
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: d.color }} />
              <span className="min-w-0 flex-1">
                <span className="block truncate">{d.name}</span>
                {d.detail && <span className="block text-xs text-muted-foreground">{d.detail}</span>}
              </span>
              <span className="font-semibold">{d.value}</span>
              <span className="w-12 text-right text-muted-foreground">{Math.round((d.value / total) * 100)}%</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

