import { getMascotState, getSpeechLine } from "@/lib/agents/chip-agent";

describe("Chip Agent Emotion Matrix", () => {
  it("defaults to happy", () => {
    const result = getMascotState({});
    expect(result.emotion).toBe("happy");
    expect(result.message).toBeTruthy();
  });

  it("prioritizes isAnalyzing correctly (thinking)", () => {
    // Should think even if streak is 7 or missed days is 3
    const result = getMascotState({ isAnalyzing: true, streakDays: 7, missedDays: 5 });
    expect(result.emotion).toBe("thinking");
    expect(["Hmm...", "Calculating macros...", "Analyzing..."]).toContain(result.message);
  });

  it("prioritizes isRoastTime correctly (laughing)", () => {
    const result = getMascotState({ isRoastTime: true, streakDays: 7, missedDays: 5 });
    expect(result.emotion).toBe("laughing");
    expect(["Haha!", "This is too good.", "Oh boy."]).toContain(result.message);
  });

  it("triggers on_fire for week+ streaks", () => {
    const result = getMascotState({ streakDays: 7 });
    expect(result.emotion).toBe("on_fire");
  });

  it("triggers shocked for huge single meals over 900cals", () => {
    const result = getMascotState({ singleMealCalories: 950 });
    expect(result.emotion).toBe("shocked");
  });

  it("triggers sad state for missing 3 or more days", () => {
    const result = getMascotState({ missedDays: 3 });
    expect(result.emotion).toBe("sad");
  });

  it("triggers hype state for hitting goals (90-110%)", () => {
    const result = getMascotState({ caloriesPercent: 100 });
    expect(result.emotion).toBe("hype");
  });

  it("triggers sleepy state late at night if zero logs", () => {
    const result = getMascotState({ hourOfDay: 22, todayLogsCount: 0 });
    expect(result.emotion).toBe("sleepy");
  });

  it("ensures alternating speech behavior from getSpeechLine", () => {
    // test getSpeechLine fallback options 
    const firstLine = getSpeechLine("happy");
    const secondLine = getSpeechLine("happy", firstLine);
    expect(firstLine).not.toBe(secondLine);
  });
});
