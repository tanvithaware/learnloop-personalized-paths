import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { BookText, Eye, ListChecks } from "lucide-react";
import { Logo } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useStore, type Profile } from "@/lib/store";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Set up your profile — LearnLoop AI" },
      { name: "description", content: "Tell LearnLoop how you learn so it can personalize your path." },
      { property: "og:title", content: "Set up your profile — LearnLoop AI" },
      { property: "og:description", content: "Tell LearnLoop how you learn so it can personalize your path." },
    ],
  }),
  component: Onboarding,
});

const FORMATS = [
  { id: "visual", label: "Visual explanations", icon: Eye },
  { id: "text", label: "Text-based notes", icon: BookText },
  { id: "practice", label: "Practice questions", icon: ListChecks },
] as const;
const CONF = ["Not at all", "A little", "Okay", "Fairly", "Very"];

function Onboarding() {
  const { setProfile } = useStore();
  const navigate = useNavigate();
  const [p, setP] = useState<Profile>({ name: "", level: "College – Year 2", subject: "Computer Science", format: "visual", confidence: 3 });
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!p.name.trim()) return setError("Please enter a name or nickname.");
    setProfile({ ...p, name: p.name.trim() });
    navigate({ to: "/quiz", search: { mode: "diagnostic" } });
  };
  const field = "mt-1.5 w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="min-h-screen bg-gradient-soft px-4 py-8">
      <div className="mx-auto max-w-xl">
        <Logo />
        <form onSubmit={submit} className="mt-6 space-y-6 rounded-3xl border bg-card p-6 shadow-card sm:p-8">
          <div>
            <h1 className="text-2xl font-bold">Tell us about you</h1>
            <p className="mt-1 text-sm text-muted-foreground">This helps us empathize with how you learn. No account needed.</p>
          </div>
          <label className="block text-sm font-medium">Name or nickname
            <input className={field} value={p.name} onChange={(e) => { setP({ ...p, name: e.target.value }); setError(""); }} placeholder="e.g. Tanvi" aria-invalid={!!error} />
            {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium">Class / academic level
              <select className={field} value={p.level} onChange={(e) => setP({ ...p, level: e.target.value })}>
                {["School – Grade 11", "School – Grade 12", "College – Year 1", "College – Year 2", "College – Year 3", "College – Year 4"].map((o) => <option key={o}>{o}</option>)}
              </select>
            </label>
            <label className="block text-sm font-medium">Subject of interest
              <select className={field} value={p.subject} onChange={(e) => setP({ ...p, subject: e.target.value })}>
                {["Computer Science", "Mathematics (coming soon)", "Physics (coming soon)"].map((o) => <option key={o}>{o}</option>)}
              </select>
            </label>
          </div>
          <fieldset>
            <legend className="text-sm font-medium">Preferred learning format</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {FORMATS.map((f) => (
                <label key={f.id} className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border p-3 text-center text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring ${p.format === f.id ? "border-primary bg-accent text-accent-foreground" : "hover:bg-muted"}`}>
                  <input type="radio" name="format" className="sr-only" checked={p.format === f.id} onChange={() => setP({ ...p, format: f.id })} />
                  <f.icon className="h-5 w-5" /> {f.label}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="block text-sm font-medium">How confident are you in {p.subject.replace(" (coming soon)", "")}? <span className="text-primary">{CONF[p.confidence - 1]}</span>
            <input type="range" min={1} max={5} value={p.confidence} onChange={(e) => setP({ ...p, confidence: +e.target.value })} className="mt-3 w-full accent-primary" />
          </label>
          {p.subject !== "Computer Science" && <p className="rounded-xl bg-lavender p-3 text-xs text-muted-foreground">This prototype includes Computer Science content only — we'll use it for your demo.</p>}
          <Button variant="hero" size="lg" className="w-full" type="submit">Continue to diagnostic quiz</Button>
        </form>
      </div>
    </div>
  );
}
