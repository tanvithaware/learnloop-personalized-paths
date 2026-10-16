/**
 * Assistant provider interface. The prototype ships a SIMULATED provider with
 * predefined responses. To connect a real language model later, implement
 * `AssistantProvider` with a server function call and swap `assistant` below.
 */
import { QUESTIONS, LESSONS, questionById, type TopicId } from "./data";

export interface ChatMessage { role: "user" | "assistant"; content: string }
export interface AssistantContext { lastWrong: string[] }
export interface AssistantProvider {
  label: string;
  ask(messages: ChatMessage[], ctx: AssistantContext): Promise<string>;
}

const KEYWORDS: Record<TopicId, string[]> = {
  prog: ["loop", "function", "variable", "program", "python", "recursion", "if"],
  ds: ["stack", "queue", "array", "tree", "data structure", "linked", "bfs", "graph"],
  dbms: ["sql", "database", "key", "normal", "dbms", "table", "join", "acid"],
  cn: ["network", "osi", "tcp", "udp", "ip", "dns", "http", "router", "protocol"],
};

function detectTopic(text: string): TopicId | null {
  const t = text.toLowerCase();
  for (const [k, words] of Object.entries(KEYWORDS)) if (words.some((w) => t.includes(w))) return k as TopicId;
  return null;
}

function respond(text: string, ctx: AssistantContext): string {
  const t = text.toLowerCase();
  if (t.includes("mistake") || t.includes("incorrect") || t.includes("wrong")) {
    if (!ctx.lastWrong.length) return "You have no incorrect answers in your latest quiz — great job! Take an adaptive quiz and I can help with anything you miss.";
    return "Here's a clarification of your recent incorrect answers:\n\n" + ctx.lastWrong.slice(0, 3).map((id) => {
      const q = questionById(id)!;
      return `• **${q.q}**\n  Correct answer: ${q.options[q.answer]}\n  Why: ${q.explain}\n  In simple terms: ${q.simple}`;
    }).join("\n\n");
  }
  const topic = detectTopic(t);
  if (!topic) return "I can help with Programming, Data Structures, DBMS and Computer Networks. Try: “Explain stacks simply”, “Step-by-step SQL example”, “Revision notes on TCP”, or “Give me a practice question on loops”.";
  const lesson = LESSONS.find((l) => l.topic === topic)!;
  if (t.includes("step") || t.includes("example")) {
    return `**Step-by-step: ${lesson.example.title}**\n\n${lesson.example.body}${lesson.example.code ? `\n\n${lesson.example.code}` : ""}\n\n1. Identify the input.\n2. Apply the rule from the key points.\n3. Check the output matches what you expect.`;
  }
  if (t.includes("note") || t.includes("revis") || t.includes("summary")) {
    return `**Revision notes — ${lesson.title}**\n\n` + lesson.keyPoints.map((k) => `• ${k}`).join("\n");
  }
  if (t.includes("practice") || t.includes("question") || t.includes("quiz")) {
    const q = QUESTIONS.filter((x) => x.topic === topic)[Math.floor(Math.random() * 5)];
    return `**Practice question**\n\n${q.q}\n\nA) ${q.options[0]}\nB) ${q.options[1]}\nC) ${q.options[2]}\nD) ${q.options[3]}\n\nAnswer: ${"ABCD"[q.answer]} — ${q.explain}`;
  }
  const q = QUESTIONS.find((x) => x.topic === topic && x.difficulty === 1)!;
  return `**Simple explanation**\n\n${lesson.explanation}\n\nAnalogy: ${q.simple}`;
}

export const simulatedAssistant: AssistantProvider = {
  label: "Simulated assistant (predefined responses — no AI model connected)",
  ask: (messages, ctx) =>
    new Promise((resolve) => setTimeout(() => resolve(respond(messages[messages.length - 1].content, ctx)), 700)),
};

export const assistant: AssistantProvider = simulatedAssistant;
