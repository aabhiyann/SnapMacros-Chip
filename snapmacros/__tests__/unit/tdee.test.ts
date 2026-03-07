import { calculateBMR, calculateTDEE, getCalorieTarget, getMacroTargets, calculateFullProfile } from "@/lib/tdee";

describe("TDEE Calculator", () => {
  describe("calculates BMR accurately", () => {
    it("returns correct BMR for male", () => {
      // 10 * 80 + 6.25 * 180 - 5 * 30 + 5 = 800 + 1125 - 150 + 5 = 1780
      const bmr = calculateBMR(80, 180, 30, "male");
      expect(bmr).toBe(1780);
    });

    it("returns correct BMR for female", () => {
      // 10 * 65 + 6.25 * 165 - 5 * 28 - 161 = 650 + 1031.25 - 140 - 161 = 1380.25
      const bmr = calculateBMR(65, 165, 28, "female");
      expect(bmr).toBe(1380.25);
    });
  });

  describe("calculates TDEE safely", () => {
    it("applies sedentary multiplier", () => {
      const bmr = 2000;
      expect(calculateTDEE(bmr, "sedentary")).toBe(2400);
    });

    it("applies active multiplier", () => {
      const bmr = 2000;
      expect(calculateTDEE(bmr, "active")).toBe(3450);
    });
  });

  describe("calculates Macro Targets safely", () => {
    it("calculates balanced maintaining goals", () => {
      expect(getCalorieTarget(2000, "maintain")).toBe(2000);
    });

    it("creates strict cutting limits floored at 1200", () => {
      expect(getCalorieTarget(2000, "cut")).toBe(1500);
      expect(getCalorieTarget(1500, "cut")).toBe(1200); // properly floors
    });

    it("calculates realistic bulking surplus", () => {
      expect(getCalorieTarget(2500, "bulk")).toBe(3000);
    });
  });

  describe("full profile integrations matches inputs", () => {
    it("works correctly for full profile", () => {
      const profile = calculateFullProfile({
        weightKg: 80,
        heightCm: 180,
        age: 30,
        gender: "male",
        activityLevel: "moderate",
        goalType: "cut"
      });
      // 1780 * 1.55 = 2759 TDEE -> CUT = 2259 Target
      expect(profile.bmr).toBe(1780);
      expect(profile.tdee).toBe(2759);
      expect(profile.calorieTarget).toBe(2259);
      expect(profile.macroTarget.calories).toBe(2259);
      expect(profile.macroTarget.protein).toBe(169); // Math.round((2259*0.3)/4)
      expect(profile.macroTarget.carbs).toBe(226); // Math.round((2259*0.4)/4)
      expect(profile.macroTarget.fat).toBe(75); // Math.round((2259*0.3)/9)
    });
  });
});
