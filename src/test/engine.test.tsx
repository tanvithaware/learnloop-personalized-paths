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
});
