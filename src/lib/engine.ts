/**
 * LearnLoop Adaptive Engine — transparent RULE-BASED logic (no ML model).
 * Every function is pure so a real AI/ML model can replace any rule later
 * by implementing the same signatures.
 */
import { QUESTIONS, TOPICS, lessonFor, topicName, type Difficulty, type Question, type TopicId } from "./data";

export type TopicStatus = "Strong" | "Improving" | "Needs Practice" | "Not assessed";
export type QuizMode = "diagnostic" | "adaptive" | "revision";
export type TopicScore = { correct: number; total: number };

export interface QuizRecord {
  id: string;
  date: string;
  mode: QuizMode;
  score: number;
  total: number;
  byTopic: Partial<Record<TopicId, TopicScore>>;
  wrong: string[];
}

export const RULES = {
  strongAt: 75,
  improvingAt: 50,
  lessonBonus: 10,
  stepUpAfterCorrect: 2,
  stepDownAfterWrong: 2,
};

export function statusFor(score: number | null): TopicStatus {
  if (score === null) return "Not assessed";
  if (score >= RULES.strongAt) return "Strong";
  if (score >= RULES.improvingAt) return "Improving";
  return "Needs Practice";
}

export interface Mastery {
  topic: TopicId;
  score: number | null;
  status: TopicStatus;
  last?: TopicScore;
}

/** Mastery = accuracy in the most recent quiz covering the topic (+bonus if lesson completed). */
export function computeMastery(history: QuizRecord[], completed: string[]): Mastery[] {
  return TOPICS.map(({ id }) => {
    const latest = [...history].reverse().find((h) => h.byTopic[id]?.total);
    if (!latest) return { topic: id, score: null, status: "Not assessed" as TopicStatus };
    const t = latest.byTopic[id]!;
    let score = Math.round((t.correct / t.total) * 100);
    if (completed.includes(id)) score = Math.min(100, score + RULES.lessonBonus);
    return { topic: id, score, status: statusFor(score), last: t };
  });
}

export function learningLevel(m: Mastery[]): string {
  const s = m.filter((x) => x.score !== null).map((x) => x.score!);
  if (!s.length) return "Not assessed";
  const avg = s.reduce((a, b) => a + b, 0) / s.length;
  return avg >= 75 ? "Advanced" : avg >= 50 ? "Intermediate" : "Beginner";
}

export interface Recommendation {
  topic: TopicId;
  priority: "high" | "medium" | "low";
  title: string;
  reason: string;
  action: "lesson" | "revision" | "adaptive" | "diagnostic";
}

export function recommend(m: Mastery[], completed: string[], format?: string): Recommendation[] {
  const order = { "Needs Practice": 0, "Not assessed": 1, Improving: 2, Strong: 3 } as const;
  const tip =
    format === "visual" ? " Start with the worked example diagram-style walkthrough." :
    format === "text" ? " Read the key-point notes first." :
    format === "practice" ? " Jump straight to the practice activity." : "";
  return [...m]
    .sort((a, b) => order[a.status] - order[b.status] || (a.score ?? 0) - (b.score ?? 0))
    .map((x): Recommendation => {
      const name = topicName(x.topic);
      const lesson = lessonFor(x.topic).title;
      const got = x.last ? `${x.last.correct} out of ${x.last.total}` : "";
      switch (x.status) {
        case "Needs Practice":
          return { topic: x.topic, priority: "high", action: completed.includes(x.topic) ? "revision" : "lesson",
            title: completed.includes(x.topic) ? `Revision quiz: ${name}` : `Review “${lesson}”`,
            reason: `You scored ${got} in ${name}, so we recommend ${completed.includes(x.topic) ? "a revision quiz with easier questions" : `reviewing ${lesson}`} before moving to the next topic.${tip}` };
        case "Not assessed":
          return { topic: x.topic, priority: "medium", action: "diagnostic", title: `Assess ${name}`,
            reason: `We have no quiz data for ${name} yet, so take the diagnostic to find your starting level.` };
        case "Improving":
          return { topic: x.topic, priority: "medium", action: completed.includes(x.topic) ? "adaptive" : "lesson",
            title: completed.includes(x.topic) ? `Adaptive practice: ${name}` : `Strengthen with “${lesson}”`,
            reason: `You scored ${got} in ${name} (${x.score}%). You're close — a bit more practice will move this to Strong.${tip}` };
        default:
          return { topic: x.topic, priority: "low", action: "adaptive", title: `Challenge mode: ${name}`,
            reason: `You're strong in ${name} (${x.score}%), so the engine will serve harder questions to keep you growing.` };
      }
    });
}

/** Fixed diagnostic: one easy + one medium question per topic. */
export function diagnosticSet(): Question[] {
  return TOPICS.flatMap(({ id }) => [
    QUESTIONS.find((q) => q.topic === id && q.difficulty === 1)!,
    QUESTIONS.find((q) => q.topic === id && q.difficulty === 2)!,
  ]);
}

/** Pick the next question for a topic pool at a target difficulty, avoiding repeats. */
export function nextQuestion(topics: TopicId[], difficulty: Difficulty, asked: string[], turn: number): Question | null {
  const remaining = QUESTIONS.filter((q) => topics.includes(q.topic) && !asked.includes(q.id));
  if (!remaining.length) return null;
  const preferredTopic = topics[turn % topics.length];
  const score = (q: Question) => Math.abs(q.difficulty - difficulty) * 10 + (q.topic === preferredTopic ? 0 : 1);
  const best = Math.min(...remaining.map(score));
  const pool = remaining.filter((q) => score(q) === best);
  return pool[Math.floor(Math.random() * pool.length)];
}

export interface AdaptState {
  difficulty: Difficulty;
  correctRun: number;
  wrongRun: number;
  simpleMode: boolean;
}

/** Core adaptation rule: step difficulty up/down after consecutive results. */
export function adapt(s: AdaptState, correct: boolean): AdaptState & { notice?: string } {
  const correctRun = correct ? s.correctRun + 1 : 0;
  const wrongRun = correct ? 0 : s.wrongRun + 1;
  if (correctRun >= RULES.stepUpAfterCorrect && s.difficulty < 3) {
    const d = (s.difficulty + 1) as Difficulty;
    return { difficulty: d, correctRun: 0, wrongRun: 0, simpleMode: false,
      notice: `${RULES.stepUpAfterCorrect} correct in a row — difficulty increased.` };
  }
  if (wrongRun >= RULES.stepDownAfterWrong) {
    const d = Math.max(1, s.difficulty - 1) as Difficulty;
    return { difficulty: d, correctRun: 0, wrongRun: 0, simpleMode: true,
      notice: `${RULES.stepDownAfterWrong} incorrect in a row — easier questions and simpler explanations enabled.` };
  }
  return { ...s, correctRun, wrongRun };
}

export function tally(answers: { q: Question; correct: boolean }[]) {
  const byTopic: Partial<Record<TopicId, TopicScore>> = {};
  for (const a of answers) {
    const t = (byTopic[a.q.topic] ??= { correct: 0, total: 0 });
    t.total++;
    if (a.correct) t.correct++;
  }
  return {
    score: answers.filter((a) => a.correct).length,
    total: answers.length,
    byTopic,
    wrong: answers.filter((a) => !a.correct).map((a) => a.q.id),
  };
}
