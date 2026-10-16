import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, Lightbulb, ListChecks } from "lucide-react";
import { toast } from "sonner";
import { AppShell, Card, StatusPill } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { LESSONS, TOPICS, type TopicId } from "@/lib/data";
import { computeMastery } from "@/lib/engine";
import { useStore } from "@/lib/store";

const ids = TOPICS.map((t) => t.id) as string[];

export const Route = createFileRoute("/learn")({
  validateSearch: (s: Record<string, unknown>): { topic?: TopicId } =>
    ids.includes(s.topic as string) ? { topic: s.topic as TopicId } : {},
  head: () => ({
    meta: [
      { title: "Lessons — LearnLoop AI" },
      { name: "description", content: "Interactive Computer Science lessons with examples and practice." },
      { property: "og:title", content: "Lessons — LearnLoop AI" },
      { property: "og:description", content: "Interactive Computer Science lessons with examples and practice." },
    ],
  }),
  component: () => <AppShell title="Lessons"><Learn /></AppShell>,
});

function Learn() {
  const { topic = "prog" } = Route.useSearch();
  const navigate = useNavigate();
  const s = useStore();
  const mastery = computeMastery(s.history, s.completed);
  const idx = LESSONS.findIndex((l) => l.topic === topic);
  const lesson = LESSONS[idx];
  const done = s.completed.includes(topic);
  const fmt = s.profile?.format;
  const go = (t: TopicId) => navigate({ to: "/learn", search: { topic: t } });

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <Card className="h-fit">
        <h2 className="font-semibold">Computer Science module</h2>
        <ul className="mt-3 space-y-1">
          {LESSONS.map((l) => {
            const m = mastery.find((x) => x.topic === l.topic)!;
            return (
              <li key={l.topic}>
                <button onClick={() => go(l.topic)} aria-current={l.topic === topic}
                  className={`w-full rounded-xl p-3 text-left text-sm transition-colors ${l.topic === topic ? "bg-accent" : "hover:bg-muted"}`}>
                  <span className="flex items-center gap-2 font-medium">
                    {s.completed.includes(l.topic) && <CheckCircle2 className="h-4 w-4 text-success" />}
                    {TOPICS.find((t) => t.id === l.topic)!.name}
                  </span>
                  <span className="mt-1 block"><StatusPill status={m.status} /></span>
                </button>
              </li>
            );
          })}
        </ul>
      </Card>

      <div className="space-y-5">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Lesson {idx + 1} of {LESSONS.length}</p>
          <h2 className="mt-1 text-2xl font-bold">{lesson.title}</h2>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3.5 w-3.5" /> {lesson.minutes} min · tailored for {fmt === "visual" ? "visual" : fmt === "text" ? "note-based" : "practice-first"} learners</p>
          <p className="mt-4 leading-relaxed">{lesson.explanation}</p>
        </Card>

        <div className="grid gap-5 md:grid-cols-2">
          <Card className={fmt === "text" ? "ring-2 ring-primary/40" : ""}>
            <h3 className="flex items-center gap-2 font-semibold"><ListChecks className="h-4 w-4 text-primary" /> Key points</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {lesson.keyPoints.map((k) => <li key={k} className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />{k}</li>)}
            </ul>
          </Card>
          <Card className={fmt === "visual" ? "ring-2 ring-primary/40" : ""}>
            <h3 className="flex items-center gap-2 font-semibold"><Lightbulb className="h-4 w-4 text-primary" /> Worked example: {lesson.example.title}</h3>
            <p className="mt-3 text-sm text-muted-foreground">{lesson.example.body}</p>
            {lesson.example.code && <pre className="mt-3 overflow-x-auto rounded-xl bg-foreground p-3 text-xs text-background"><code>{lesson.example.code}</code></pre>}
          </Card>
        </div>

        <Practice key={topic} p={lesson.practice} highlight={fmt === "practice"} />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="outline" className="rounded-xl" disabled={idx === 0} onClick={() => go(LESSONS[idx - 1].topic)}><ArrowLeft /> Previous</Button>
          <Button variant={done ? "soft" : "hero"} size="lg" disabled={done}
            onClick={() => { s.completeLesson(topic); toast.success("Lesson completed! Mastery +10%"); }}>
            <CheckCircle2 /> {done ? "Completed" : "Mark as Completed"}
          </Button>
          {idx < LESSONS.length - 1 ? (
            <Button variant="outline" className="rounded-xl" onClick={() => go(LESSONS[idx + 1].topic)}>Next <ArrowRight /></Button>
          ) : (
            <Button variant="outline" className="rounded-xl" asChild><Link to="/quiz" search={{ mode: "adaptive" }}>Adaptive quiz <ArrowRight /></Link></Button>
          )}
        </div>
        {done && (
          <div className="rounded-2xl bg-lavender p-4 text-sm">
            Nice work! Ready to check your understanding? <Link to="/quiz" search={{ mode: "adaptive" }} className="font-semibold text-primary underline">Take an adaptive quiz →</Link>
          </div>
        )}
      </div>
    </div>
  );
}

function Practice({ p, highlight }: { p: (typeof LESSONS)[number]["practice"]; highlight: boolean }) {
  const [pick, setPick] = useState<number | null>(null);
  const checked = pick !== null;
  return (
    <Card className={highlight ? "ring-2 ring-primary/40" : ""}>
      <h3 className="font-semibold">Quick practice</h3>
      <p className="mt-2 text-sm">{p.prompt}</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-4">
        {p.options.map((o, i) => (
          <button key={o} disabled={checked} onClick={() => setPick(i)}
            className={`rounded-xl border p-2.5 text-sm font-medium transition-colors ${checked && i === p.answer ? "border-success bg-success/10" : checked && i === pick ? "border-destructive bg-destructive/10" : "hover:bg-muted"}`}>{o}</button>
        ))}
      </div>
      {checked && (
        <p className={`mt-3 text-sm ${pick === p.answer ? "text-success" : "text-destructive"}`}>
          {pick === p.answer ? "Correct! " : "Not quite. "}<span className="text-muted-foreground">{p.explain}</span>
          <button className="ml-2 font-medium text-primary underline" onClick={() => setPick(null)}>Try again</button>
        </p>
      )}
    </Card>
  );
}
