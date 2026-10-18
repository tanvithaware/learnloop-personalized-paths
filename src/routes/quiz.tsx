import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, Gauge, RotateCcw, Sparkles, XCircle } from "lucide-react";
import { AppShell, Bar, Card, StatusPill } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { DIFFICULTY_LABEL, TOPICS, lessonFor, topicName, type Difficulty, type Question, type TopicId } from "@/lib/data";
import { adapt, computeMastery, diagnosticSet, nextQuestion, recommend, statusFor, tally, type AdaptState, type QuizMode } from "@/lib/engine";
import { useStore } from "@/lib/store";

const MODES: QuizMode[] = ["diagnostic", "adaptive", "revision"];

export const Route = createFileRoute("/quiz")({
  validateSearch: (s: Record<string, unknown>): { mode: QuizMode } => ({
    mode: MODES.includes(s['mode'] as QuizMode) ? (s['mode'] as QuizMode) : "adaptive",
  }),
  head: () => ({
    meta: [
      { title: "Adaptive Quiz — LearnLoop AI" },
      { name: "description", content: "Quizzes that adjust difficulty to your performance." },
      { property: "og:title", content: "Adaptive Quiz — LearnLoop AI" },
      { property: "og:description", content: "Quizzes that adjust difficulty to your performance." },
    ],
  }),
  component: QuizPage,
});

function QuizPage() {
  const { mode } = Route.useSearch();
  const [run, setRun] = useState(0);
  return (
    <AppShell title="Quiz">
      <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="Quiz type">
        {MODES.map((m) => (
          <Link key={m} to="/quiz" search={{ mode: m }} onClick={() => setRun((r) => r + 1)} role="tab" aria-selected={m === mode}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize ${m === mode ? "bg-gradient-brand text-primary-foreground" : "bg-card border hover:bg-muted"}`}>
            {m} quiz
          </Link>
        ))}
      </div>
      <Quiz key={`${mode}-${run}`} mode={mode} onRestart={() => setRun((r) => r + 1)} />
    </AppShell>
  );
}

const LENGTH: Record<QuizMode, number> = { diagnostic: 8, adaptive: 8, revision: 6 };

function Quiz({ mode, onRestart }: { mode: QuizMode; onRestart: () => void }) {
  const s = useStore();
  const mastery = computeMastery(s.history, s.completed);

  const [pool] = useState<TopicId[]>(() => {
    if (mode !== "revision") return TOPICS.map((t) => t.id);
    const weak = mastery.filter((m) => m.status === "Needs Practice" || m.status === "Improving").map((m) => m.topic);
    return weak.length ? weak : TOPICS.map((t) => t.id);
  });
  const [fixed] = useState(() => (mode === "diagnostic" ? diagnosticSet() : null));
  const startDiff: Difficulty = mode === "revision" ? 1 : mode === "adaptive" && mastery.some((m) => m.status === "Strong") ? 2 : 1;
  const [ad, setAd] = useState<AdaptState>({ difficulty: startDiff, correctRun: 0, wrongRun: 0, simpleMode: mode === "revision" });
  const [notice, setNotice] = useState<string>();
  const [answers, setAnswers] = useState<{ q: Question; correct: boolean; picked: number }[]>([]);
  const [current, setCurrent] = useState<Question | null>(() => fixed ? fixed[0]! : nextQuestion(pool, startDiff, [], 0));
  const [picked, setPicked] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const saved = useRef(false);

  const total = Math.min(LENGTH[mode], fixed?.length ?? 99);
  const finished = !current || answers.length >= total && !submitted;

  const submit = () => {
    if (picked === null || !current) return;
    const correct = picked === current.answer;
    setAnswers((a) => [...a, { q: current, correct, picked }]);
    setSubmitted(true);
    if (mode !== "diagnostic") {
      const n = adapt(ad, correct);
      setNotice(n.notice);
      setAd(n);
    }
  };
  const next = () => {
    setSubmitted(false); setPicked(null); setNotice(undefined);
    if (answers.length >= total) { setCurrent(null); return; }
    setCurrent(fixed ? fixed[answers.length]! : nextQuestion(pool, ad.difficulty, answers.map((a) => a.q.id), answers.length));
  };

  const result = useMemo(() => tally(answers), [answers]);
  useEffect(() => {
    if (finished && answers.length && !saved.current) {
      saved.current = true;
      s.addQuiz({ id: crypto.randomUUID(), date: new Date().toISOString(), mode, ...result });
    }
  }, [finished]); // eslint-disable-line react-hooks/exhaustive-deps

  if (finished) return <Results mode={mode} result={result} answers={answers} onRestart={onRestart} />;
  if (!current) return null;

  const showSimple = submitted && (ad.simpleMode || mode === "revision");
  const isCorrect = picked === current.answer;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="font-medium">Question {answers.length + (submitted ? 0 : 1)} of {total}</span>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">{topicName(current.topic)}</span>
            <span className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium"><Gauge className="h-3 w-3" />{DIFFICULTY_LABEL[current.difficulty]}</span>
          </div>
        </div>
        <Bar value={((answers.length) / total) * 100} className="mt-3" />
        <h2 className="mt-6 text-xl font-semibold">{current.q}</h2>
        <div className="mt-5 grid gap-3" role="radiogroup" aria-label="Answer options">
          {current.options.map((o, i) => {
            const state = submitted ? (i === current.answer ? "correct" : i === picked ? "wrong" : "idle") : picked === i ? "picked" : "idle";
            return (
              <button key={o} role="radio" aria-checked={picked === i} disabled={submitted} onClick={() => setPicked(i)}
                className={`flex items-center gap-3 rounded-xl border p-4 text-left text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  state === "correct" ? "border-success bg-success/10" : state === "wrong" ? "border-destructive bg-destructive/10" : state === "picked" ? "border-primary bg-accent" : "hover:border-primary/50 hover:bg-lavender"}`}>
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-muted text-xs font-bold">{"ABCD"[i]}</span>{o}
                {state === "correct" && <CheckCircle2 className="ml-auto h-5 w-5 text-success" />}
                {state === "wrong" && <XCircle className="ml-auto h-5 w-5 text-destructive" />}
              </button>
            );
          })}
        </div>

        {submitted && (
          <div className={`mt-5 rounded-xl p-4 text-sm ${isCorrect ? "bg-success/10" : "bg-destructive/10"}`} aria-live="polite">
            <p className={`font-semibold ${isCorrect ? "text-success" : "text-destructive"}`}>{isCorrect ? "Correct!" : `Incorrect — the answer is “${current.options[current.answer]}”.`}</p>
            <p className="mt-1">{current.explain}</p>
            {!isCorrect && <p className="mt-1 text-muted-foreground">You chose “{current.options[picked!]}”, which doesn't fit here.</p>}
            {showSimple && !isCorrect && <p className="mt-2 rounded-lg bg-card p-3"><strong>Simpler explanation: </strong>{current.simple}</p>}
          </div>
        )}
        {notice && <p className="mt-3 flex items-center gap-2 rounded-xl bg-lavender p-3 text-sm text-accent-foreground"><Sparkles className="h-4 w-4" /> Adaptive engine: {notice}</p>}

        <div className="mt-6 flex justify-end">
          {submitted ? <Button variant="hero" size="lg" onClick={next}>{answers.length >= total ? "See results" : "Next question"} <ArrowRight /></Button>
            : <Button variant="hero" size="lg" disabled={picked === null} onClick={submit}>Submit Answer</Button>}
        </div>
      </Card>
      <p className="text-center text-xs text-muted-foreground">
        {mode === "diagnostic" ? "Diagnostic: 2 questions per topic to find your starting level." :
          "Rule: 2 correct in a row → harder questions. 2 wrong in a row → easier questions + simpler explanations."}
      </p>
    </div>
  );
}

function Results({ mode, result, answers, onRestart }: { mode: QuizMode; result: ReturnType<typeof tally>; answers: { q: Question; correct: boolean }[]; onRestart: () => void }) {
  const s = useStore();
  const pct = Math.round((result.score / Math.max(1, result.total)) * 100);
  const recs = recommend(computeMastery(s.history, s.completed), s.completed, s.profile?.format);
  const top = recs[0]!;
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Card className="text-center">
        <p className="text-sm font-medium capitalize text-muted-foreground">{mode} quiz complete</p>
        <p className="mt-2 font-display text-5xl font-extrabold text-gradient-brand">{result.score}/{result.total}</p>
        <p className="mt-1 text-sm text-muted-foreground">{pct}% — {pct >= 75 ? "Excellent work!" : pct >= 50 ? "Good progress, keep going." : "Let's strengthen the basics together."}</p>
      </Card>
      <Card>
        <h3 className="font-semibold">Performance analysis by topic</h3>
        <ul className="mt-4 space-y-4">
          {(Object.entries(result.byTopic) as [TopicId, { correct: number; total: number }][]).map(([t, v]) => {
            const p = Math.round((v.correct / v.total) * 100);
            return (
              <li key={t}>
                <div className="mb-1.5 flex items-center justify-between text-sm"><span className="font-medium">{topicName(t)} · {v.correct}/{v.total}</span><StatusPill status={statusFor(p)} /></div>
                <Bar value={p} />
              </li>
            );
          })}
        </ul>
      </Card>
      <Card className="bg-lavender">
        <h3 className="flex items-center gap-2 font-semibold"><Sparkles className="h-4 w-4 text-primary" /> Your personalized recommendation</h3>
        <p className="mt-2 font-medium">{top.title}</p>
        <p className="mt-1 text-sm text-muted-foreground"><strong className="text-foreground">Why: </strong>{top.reason}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {top.action === "lesson" || top.action === "diagnostic" ? (
            <Button variant="hero" asChild><Link to="/learn" search={{ topic: top.topic }}>Open {lessonFor(top.topic).title} <ArrowRight /></Link></Button>
          ) : (
            <Button variant="hero" asChild><Link to="/quiz" search={{ mode: top.action }} onClick={onRestart}>Start {top.action} quiz <ArrowRight /></Link></Button>
          )}
          <Button variant="outline" className="rounded-xl" onClick={onRestart}><RotateCcw /> Retake</Button>
          <Button variant="outline" className="rounded-xl" asChild><Link to="/dashboard">Updated dashboard</Link></Button>
        </div>
      </Card>
      {answers.some((a) => !a.correct) && (
        <Card>
          <h3 className="font-semibold">Review your mistakes</h3>
          <ul className="mt-3 space-y-3 text-sm">
            {answers.filter((a) => !a.correct).map((a) => (
              <li key={a.q.id} className="rounded-xl border p-3"><p className="font-medium">{a.q.q}</p><p className="mt-1 text-muted-foreground">Answer: {a.q.options[a.q.answer]} — {a.q.explain}</p></li>
            ))}
          </ul>
          <Button variant="soft" size="sm" className="mt-3" asChild><Link to="/assistant">Ask the assistant to clarify</Link></Button>
        </Card>
      )}
    </div>
  );
}
