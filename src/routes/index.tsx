import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Brain, FlaskConical, HeartHandshake, Lightbulb, Target, TestTube2 } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/AppShell";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LearnLoop AI — Learning that adapts to you" },
      { name: "description", content: "Adaptive quizzes, personalized lessons and progress tracking for students." },
      { property: "og:title", content: "LearnLoop AI — Learning that adapts to you" },
      { property: "og:description", content: "Adaptive quizzes, personalized lessons and progress tracking for students." },
    ],
  }),
  component: Welcome,
});

const STAGES = [
  { icon: HeartHandshake, name: "Empathize", text: "Onboarding asks how you learn, your level and confidence — every student is different." },
  { icon: Target, name: "Define", text: "A diagnostic quiz pinpoints weak topics and gaps in understanding." },
  { icon: Lightbulb, name: "Ideate", text: "The engine builds a personal path, explaining why each lesson is suggested." },
  { icon: FlaskConical, name: "Prototype", text: "Lessons, adaptive quizzes and an assistant let you learn by doing." },
  { icon: TestTube2, name: "Test", text: "Progress analytics and your feedback show what works and what to improve." },
];

function AdaptsSection() {
  return (
    <section aria-labelledby="adapts" className="rounded-3xl border bg-card p-6 shadow-card sm:p-8">
      <h2 id="adapts" className="text-2xl font-bold">How LearnLoop Adapts to You</h2>
      <p className="mt-1 text-sm text-muted-foreground">Built around the five stages of Design Thinking.</p>
      <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {STAGES.map((s, i) => (
          <li key={s.name} className="rounded-2xl bg-lavender p-4">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-brand text-primary-foreground"><s.icon className="h-4 w-4" /></span>
              <span className="text-xs font-semibold text-muted-foreground">Step {i + 1}</span>
            </div>
            <h3 className="mt-3 font-semibold">{s.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Welcome() {
  const { profile, ready } = useStore();
  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo />
        {ready && profile && <Button variant="outline" asChild><Link to="/dashboard">Go to dashboard</Link></Button>}
      </header>
      <main className="mx-auto max-w-6xl space-y-12 px-4 pb-16 sm:px-6">
        <section className="grid items-center gap-10 pt-6 md:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1 text-xs font-semibold text-accent-foreground shadow-card">
              <Brain className="h-3.5 w-3.5" /> Adaptive learning prototype
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-5xl">
              Learning that <span className="text-gradient-brand">adapts</span> to the way you think.
            </h1>
            <p className="mt-4 max-w-md text-lg text-muted-foreground">
              Find your weak spots, get lessons picked for you, and practice at exactly the right difficulty.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="hero" size="lg" asChild>
                <Link to={ready && profile ? "/dashboard" : "/onboarding"}>Start Learning <ArrowRight /></Link>
              </Button>
              <Button variant="outline" size="lg" className="rounded-xl" asChild><a href="#adapts">How it works</a></Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">No account needed · progress saved in your browser</p>
          </div>
          <img src={hero} alt="Student learning with personalized progress cards" width={1024} height={896} className="w-full rounded-3xl" />
        </section>
        <AdaptsSection />
      </main>
    </div>
  );
}
