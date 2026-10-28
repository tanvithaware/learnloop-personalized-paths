import { describe, expect, it } from "vitest";
import { adapt, statusCounts, statusFor } from "@/lib/engine";

describe("adaptive engine rules", () => {
  it("raises difficulty after 2 correct in a row", () => {
    const s1 = adapt({ difficulty: 1, correctRun: 0, wrongRun: 0, simpleMode: false }, true);
    expect(adapt(s1, true).difficulty).toBe(2);
  });
  it("lowers difficulty and enables simple mode after 2 wrong in a row", () => {
    const s1 = adapt({ difficulty: 2, correctRun: 0, wrongRun: 0, simpleMode: false }, false);
    const s2 = adapt(s1, false);
    expect(s2.difficulty).toBe(1);
    expect(s2.simpleMode).toBe(true);
  });
  it("categorizes topics", () => {
    expect(statusFor(80)).toBe("Strong");
    expect(statusFor(60)).toBe("Improving");
    expect(statusFor(40)).toBe("Needs Practice");
  });
  it("counts topics per status for the results pie chart", () => {
    const counts = statusCounts([
      { status: "Strong" }, { status: "Strong" }, { status: "Needs Practice" }, { status: "Not assessed" },
    ]);
    expect(counts).toEqual([
      { name: "Strong", value: 2 },
      { name: "Needs Practice", value: 1 },
      { name: "Not assessed", value: 1 },
    ]);
  });
  it("adds up results per subject for the subject pie chart", () => {
    const rows = subjectResults([
      { id: "a", date: "2026-10-01", mode: "diagnostic", score: 3, total: 4, wrong: [],
        byTopic: { prog: { correct: 2, total: 2 }, ds: { correct: 1, total: 2 } } },
      { id: "b", date: "2026-10-02", mode: "adaptive", score: 1, total: 2, wrong: ["q9"],
        byTopic: { prog: { correct: 1, total: 2 }, dbms: { correct: 0, total: 1 } } },
    ]);
    expect(rows).toEqual([
      { topic: "prog", name: "Programming", correct: 3, total: 4, accuracy: 75 },
      { topic: "ds", name: "Data Structures", correct: 1, total: 2, accuracy: 50 },
      { topic: "dbms", name: "DBMS", correct: 0, total: 1, accuracy: 0 },
    ]);
  });
});
