import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Star } from "lucide-react";
import { AppShell, Card } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/feedback")({
  head: () => ({
    meta: [
      { title: "Feedback — LearnLoop AI" },
      { name: "description", content: "Help improve LearnLoop by sharing your experience." },
      { property: "og:title", content: "Feedback — LearnLoop AI" },
      { property: "og:description", content: "Help improve LearnLoop by sharing your experience." },
    ],
  }),
  component: () => <AppShell title="Feedback"><Feedback /></AppShell>,
});

function Feedback() {
  const { addFeedback, feedback } = useStore();
  const [useful, setUseful] = useState("");
  const [clarity, setClarity] = useState(0);
  const [improve, setImprove] = useState("");
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!useful || !clarity) return setErr("Please answer both rating questions.");
    addFeedback({ date: new Date().toISOString(), useful, clarity, improve });
    setDone(true);
  };

  if (done) return (
    <Card className="mx-auto max-w-md text-center">
      <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
      <h2 className="mt-3 text-xl font-bold">Thank you for your feedback!</h2>
      <p className="mt-2 text-sm text-muted-foreground">This is the “Test” stage of Design Thinking — your input shapes the next version of LearnLoop.</p>
      <div className="mt-5 flex justify-center gap-2">
        <Button variant="hero" asChild><Link to="/dashboard">Back to dashboard</Link></Button>
        <Button variant="outline" className="rounded-xl" onClick={() => { setDone(false); setUseful(""); setClarity(0); setImprove(""); }}>Send more</Button>
      </div>
    </Card>
  );

  return (
    <div className="mx-auto max-w-xl">
      <Card>
        <h2 className="text-2xl font-bold">Share your feedback</h2>
        <p className="mt-1 text-sm text-muted-foreground">{feedback.length ? `You've shared feedback ${feedback.length} time(s). Thanks!` : "Takes under a minute."}</p>
        <form onSubmit={submit} className="mt-6 space-y-6">
          <fieldset>
            <legend className="text-sm font-medium">Were the recommendations useful?</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {["Very useful", "Somewhat", "Not really"].map((o) => (
                <label key={o} className={`cursor-pointer rounded-xl border px-4 py-2 text-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring ${useful === o ? "border-primary bg-accent text-accent-foreground" : "hover:bg-muted"}`}>
                  <input type="radio" name="useful" className="sr-only" checked={useful === o} onChange={() => { setUseful(o); setErr(""); }} />{o}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-sm font-medium">How easy were the lessons to understand?</legend>
            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button type="button" key={n} aria-label={`${n} star${n > 1 ? "s" : ""}`} aria-pressed={clarity === n} onClick={() => { setClarity(n); setErr(""); }} className="rounded-lg p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Star className={`h-7 w-7 ${n <= clarity ? "fill-warning text-warning" : "text-muted-foreground"}`} />
                </button>
              ))}
            </div>
          </fieldset>
          <label className="block text-sm font-medium">What would you improve?
            <textarea value={improve} onChange={(e) => setImprove(e.target.value)} rows={4} placeholder="More topics, video lessons, harder questions…" className="mt-1.5 w-full rounded-xl border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </label>
          {err && <p className="text-sm text-destructive">{err}</p>}
          <Button variant="hero" size="lg" type="submit" className="w-full">Submit feedback</Button>
        </form>
      </Card>
    </div>
  );
}
