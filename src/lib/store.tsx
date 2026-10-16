import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { QuizRecord } from "./engine";

export interface Profile {
  name: string;
  level: string;
  subject: string;
  format: "visual" | "text" | "practice";
  confidence: number;
}
export interface Feedback { date: string; useful: string; clarity: number; improve: string }

export interface AppState {
  profile: Profile | null;
  completed: string[];
  history: QuizRecord[];
  activity: Record<string, number>;
  streak: number;
  lastActive: string | null;
  feedback: Feedback[];
}

const KEY = "learnloop-state-v1";
export const dayKey = (d: Date) => d.toISOString().slice(0, 10);

function seed(): AppState {
  const activity: Record<string, number> = {};
  const sample = [20, 35, 0, 25, 40, 15];
  const now = Date.now();
  sample.forEach((m, i) => { activity[dayKey(new Date(now - (6 - i) * 86400000))] = m; });
  return { profile: null, completed: [], history: [], activity, streak: 3,
    lastActive: dayKey(new Date(now - 86400000)), feedback: [] };
}

interface Ctx extends AppState {
  ready: boolean;
  setProfile: (p: Profile) => void;
  completeLesson: (topic: string) => void;
  addQuiz: (r: QuizRecord) => void;
  addFeedback: (f: Feedback) => void;
  reset: () => void;
}
const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      setState(raw ? (JSON.parse(raw) as AppState) : seed());
    } catch { setState(seed()); }
  }, []);
  useEffect(() => { if (state) localStorage.setItem(KEY, JSON.stringify(state)); }, [state]);

  const touch = (s: AppState, minutes: number): AppState => {
    const today = dayKey(new Date());
    const yesterday = dayKey(new Date(Date.now() - 86400000));
    const streak = s.lastActive === today ? s.streak : s.lastActive === yesterday ? s.streak + 1 : 1;
    return { ...s, streak, lastActive: today, activity: { ...s.activity, [today]: (s.activity[today] ?? 0) + minutes } };
  };

  const update = useCallback((fn: (s: AppState) => AppState) => setState((s) => (s ? fn(s) : s)), []);
  const value: Ctx = {
    ...(state ?? seed()),
    ready: !!state,
    setProfile: (p) => update((s) => ({ ...s, profile: p })),
    completeLesson: (t) => update((s) => s.completed.includes(t) ? s : touch({ ...s, completed: [...s.completed, t] }, 15)),
    addQuiz: (r) => update((s) => touch({ ...s, history: [...s.history, r] }, r.total * 2)),
    addFeedback: (f) => update((s) => ({ ...s, feedback: [...s.feedback, f] })),
    reset: () => { localStorage.removeItem(KEY); setState(seed()); },
  };
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore outside provider");
  return c;
}
