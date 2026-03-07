import { getMascotState, getSpeechLine } from "@/lib/agents/chip-agent";

describe("chip-agent", () => {
  describe("getMascotState", () => {
    it("returns thinking when isAnalyzing is true", () => {
      const state = getMascotState({ isAnalyzing: true });
      expect(state.emotion).toBe("thinking");
      expect(typeof state.message).toBe("string");
    });

    it("returns laughing when isRoastTime is true", () => {
      const state = getMascotState({ isRoastTime: true });
      expect(state.emotion).toBe("laughing");
    });

    it("returns on_fire when streakDays >= 7", () => {
      const state = getMascotState({ streakDays: 7 });
      expect(state.emotion).toBe("on_fire");
    });

    it("returns shocked when singleMealCalories > 900", () => {
      const state = getMascotState({ singleMealCalories: 901 });
      expect(state.emotion).toBe("shocked");
    });

    it("returns sad when missedDays >= 3", () => {
      const state = getMascotState({ missedDays: 3 });
      expect(state.emotion).toBe("sad");
    });

    it("returns hype when caloriesPercent in 90-110", () => {
      const state = getMascotState({ caloriesPercent: 95 });
      expect(state.emotion).toBe("hype");
    });

    it("returns sleepy when hourOfDay >= 21 and todayLogsCount === 0", () => {
      const state = getMascotState({ hourOfDay: 21, todayLogsCount: 0 });
      expect(state.emotion).toBe("sleepy");
    });

    it("returns happy by default", () => {
      const state = getMascotState({});
      expect(state.emotion).toBe("happy");
    });

    it("priority: isAnalyzing beats isRoastTime", () => {
      const state = getMascotState({ isAnalyzing: true, isRoastTime: true });
      expect(state.emotion).toBe("thinking");
    });
  });

  describe("getSpeechLine", () => {
    it("returns a string from the emotion pool", () => {
      const line = getSpeechLine("happy");
      expect(["Ready when you are!", "Snap something tasty!", "Let's go!"]).toContain(line);
    });

    it("avoids repeating lastLine when provided", () => {
      const first = getSpeechLine("happy", null);
      for (let i = 0; i < 10; i++) {
        const next = getSpeechLine("happy", first);
        expect(next).not.toBe(first);
      }
    });
  });
});
