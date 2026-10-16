import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Bot, Info, Send, User } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { assistant, type ChatMessage } from "@/lib/assistant";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "Learning Assistant — LearnLoop AI" },
      { name: "description", content: "Ask for explanations, examples, revision notes and practice questions." },
      { property: "og:title", content: "Learning Assistant — LearnLoop AI" },
      { property: "og:description", content: "Ask for explanations, examples, revision notes and practice questions." },
    ],
  }),
  component: () => <AppShell title="AI Learning Assistant"><Assistant /></AppShell>,
});

const QUICK = ["Explain stacks simply", "Step-by-step SQL example", "Revision notes on TCP", "Practice question on loops", "Clarify my incorrect answers"];

function Assistant() {
  const { history, profile } = useStore();
  const [msgs, setMsgs] = useState<ChatMessage[]>([
    { role: "assistant", content: `Hi ${profile?.name}! I'm your learning assistant. Ask me to explain a concept, show an example, write revision notes, give practice questions, or clarify your quiz mistakes.` },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, loading]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const next = [...msgs, { role: "user" as const, content: text.trim() }];
    setMsgs(next); setInput(""); setLoading(true);
    const reply = await assistant.ask(next, { lastWrong: history.at(-1)?.wrong ?? [] });
    setMsgs([...next, { role: "assistant", content: reply }]); setLoading(false);
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col rounded-3xl border bg-card shadow-card lg:h-[calc(100vh-5rem)]">
      <div className="flex items-center gap-3 border-b p-4">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-brand text-primary-foreground"><Bot className="h-5 w-5" /></span>
        <div><h2 className="font-semibold">Learning Assistant</h2>
          <p className="flex items-center gap-1 text-xs text-muted-foreground"><Info className="h-3 w-3" /> {assistant.label}</p></div>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto p-4" aria-live="polite">
        {msgs.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : ""}`}>
            {m.role === "assistant" && <Bot className="mt-1 h-5 w-5 shrink-0 text-primary" />}
            <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm ${m.role === "user" ? "bg-gradient-brand text-primary-foreground" : "bg-lavender"}`}>
              {m.content.split(/(\*\*[^*]+\*\*)/).map((part, j) => part.startsWith("**") ? <strong key={j}>{part.slice(2, -2)}</strong> : part)}
            </div>
            {m.role === "user" && <User className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />}
          </div>
        ))}
        {loading && <div className="flex gap-2"><Bot className="h-5 w-5 text-primary" /><div className="flex gap-1 rounded-2xl bg-lavender px-4 py-3">{[0, 1, 2].map((d) => <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: `${d * 120}ms` }} />)}</div></div>}
        <div ref={end} />
      </div>
      <div className="border-t p-3">
        <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
          {QUICK.map((q) => <button key={q} onClick={() => send(q)} className="shrink-0 rounded-full border px-3 py-1 text-xs font-medium hover:bg-accent">{q}</button>)}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2">
          <label htmlFor="ask" className="sr-only">Ask a question</label>
          <input id="ask" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about loops, SQL, TCP…" className="flex-1 rounded-xl border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          <Button variant="hero" type="submit" size="icon" aria-label="Send" disabled={loading || !input.trim()}><Send /></Button>
        </form>
      </div>
    </div>
  );
}
