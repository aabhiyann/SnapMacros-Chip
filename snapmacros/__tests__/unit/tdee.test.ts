import {
  calculateBMR,
  calculateTDEE,
  getCalorieTarget,
  getMacroTargets,
  calculateFullProfile,
} from "@/lib/tdee";

describe("tdee", () => {
  describe("calculateBMR", () => {
    it("returns higher BMR for male than female at same inputs", () => {
      const male = calculateBMR(70, 175, 30, "male");
      const female = calculateBMR(70, 175, 30, "female");
      expect(male).toBeGreaterThan(female);
    });

    it("Mifflin-St Jeor: male 70kg 175cm 30yr", () => {
      const bmr = calculateBMR(70, 175, 30, "male");
      // 10*70 + 6.25*175 - 5*30 + 5 = 700 + 1093.75 - 150 + 5 = 1648.75
      expect(bmr).toBeCloseTo(1648.75, 1);
    });
  });

  describe("calculateTDEE", () => {
    it("multiplies BMR by activity factor", () => {
      const bmr = 1600;
      expect(calculateTDEE(bmr, "sedentary")).toBe(1920);
      expect(calculateTDEE(bmr, "moderate")).toBe(2480);
    });
  });

  describe("getCalorieTarget", () => {
    it("applies goal offset: maintain 0, cut -500", () => {
      const tdee = 2500;
      expect(getCalorieTarget(tdee, "maintain")).toBe(2500);
      expect(getCalorieTarget(tdee, "cut")).toBe(2000);
    });

    it("floors at 1200", () => {
      expect(getCalorieTarget(1000, "cut")).toBe(1200);
    });
  });

  describe("getMacroTargets", () => {
    it("returns calories and protein/carbs/fat in grams", () => {
      const m = getMacroTargets(2000, "maintain");
      expect(m.calories).toBe(2000);
      expect(m.protein).toBeGreaterThan(0);
      expect(m.carbs).toBeGreaterThan(0);
      expect(m.fat).toBeGreaterThan(0);
    });

    it("maintain split 30/40/30: protein and carbs 4 cal/g, fat 9 cal/g", () => {
      const m = getMacroTargets(2000, "maintain");
      const fromMacros = m.protein * 4 + m.carbs * 4 + m.fat * 9;
      expect(fromMacros).toBeLessThanOrEqual(2000 + 50);
      expect(fromMacros).toBeGreaterThanOrEqual(2000 - 50);
    });
  });

  describe("calculateFullProfile", () => {
    it("returns bmr, tdee, calorieTarget, macroTarget", () => {
      const result = calculateFullProfile({
        weightKg: 70,
        heightCm: 175,
        age: 30,
        gender: "male",
        activityLevel: "moderate",
        goalType: "maintain",
      });
      expect(result.bmr).toBeGreaterThan(0);
      expect(result.tdee).toBeGreaterThanOrEqual(result.bmr);
      expect(result.calorieTarget).toBe(result.tdee);
      expect(result.macroTarget.calories).toBe(result.calorieTarget);
    });
  });
});
