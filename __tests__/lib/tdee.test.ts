import {
    calculateBMR,
    calculateTDEE,
    getCalorieTarget,
    getMacroTargets,
    calculateFullProfile,
} from "@/lib/tdee";

describe("calculateBMR", () => {
    it("calculates male BMR correctly", () => {
        // 80kg, 175cm, 30yo male: 10*80 + 6.25*175 - 5*30 + 5 = 800 + 1093.75 - 150 + 5 = 1748.75
        expect(calculateBMR(80, 175, 30, "male")).toBeCloseTo(1748.75);
    });

    it("calculates female BMR correctly", () => {
        // 60kg, 165cm, 25yo female: 10*60 + 6.25*165 - 5*25 - 161 = 600 + 1031.25 - 125 - 161 = 1345.25
        expect(calculateBMR(60, 165, 25, "female")).toBeCloseTo(1345.25);
    });

    it("returns lower value for female vs male with same params", () => {
        const male = calculateBMR(70, 170, 28, "male");
        const female = calculateBMR(70, 170, 28, "female");
        expect(male).toBeGreaterThan(female);
        expect(male - female).toBeCloseTo(166); // 5 - (-161) = 166
    });
});

describe("calculateTDEE", () => {
    it("applies sedentary multiplier (1.2)", () => {
        expect(calculateTDEE(1500, "sedentary")).toBeCloseTo(1800);
    });

    it("applies moderate multiplier (1.55)", () => {
        expect(calculateTDEE(1500, "moderate")).toBeCloseTo(2325);
    });

    it("applies very_active multiplier (1.9)", () => {
        expect(calculateTDEE(1500, "very_active")).toBeCloseTo(2850);
    });

    it("falls back to moderate (1.55) for unknown activity level", () => {
        expect(calculateTDEE(1000, "unknown_level")).toBeCloseTo(1550);
    });
});

describe("getCalorieTarget", () => {
    it("subtracts 500 for cut goal", () => {
        expect(getCalorieTarget(2000, "cut")).toBe(1500);
    });

    it("subtracts 500 for fat_loss goal", () => {
        expect(getCalorieTarget(2000, "fat_loss")).toBe(1500);
    });

    it("adds 500 for bulk goal", () => {
        expect(getCalorieTarget(2000, "bulk")).toBe(2500);
    });

    it("adds 500 for lean_bulk goal", () => {
        expect(getCalorieTarget(2000, "lean_bulk")).toBe(2500);
    });

    it("keeps TDEE for maintain goal", () => {
        expect(getCalorieTarget(2000, "maintain")).toBe(2000);
    });

    it("floors at 1200 calories minimum", () => {
        // Very low TDEE with cut: 1500 - 500 = 1000 → clamped to 1200
        expect(getCalorieTarget(1500, "cut")).toBe(1200);
    });
});

describe("getMacroTargets", () => {
    it("allocates 30/40/30 split for protein/carbs/fat", () => {
        const targets = getMacroTargets(2000);
        // Protein: 30% of 2000 = 600 cal / 4 = 150g
        expect(targets.protein).toBe(150);
        // Carbs: 40% of 2000 = 800 cal / 4 = 200g
        expect(targets.carbs).toBe(200);
        // Fat: 30% of 2000 = 600 cal / 9 ≈ 67g
        expect(targets.fat).toBe(67);
        expect(targets.calories).toBe(2000);
    });
});

describe("calculateFullProfile", () => {
    it("returns expected values for a typical male athlete profile", () => {
        const profile = calculateFullProfile({
            weightKg: 85,
            heightCm: 180,
            age: 25,
            gender: "male",
            activityLevel: "active",
            goalType: "bulk",
        });

        expect(profile.bmr).toBeGreaterThan(1800);
        expect(profile.tdee).toBeGreaterThan(profile.bmr);
        expect(profile.calorieTarget).toBeCloseTo(profile.tdee + 500, 0);
        expect(profile.macroTarget.protein).toBeGreaterThan(0);
        expect(profile.macroTarget.carbs).toBeGreaterThan(0);
        expect(profile.macroTarget.fat).toBeGreaterThan(0);
    });

    it("enforces 1200 calorie floor for very restrictive cut", () => {
        const profile = calculateFullProfile({
            weightKg: 50,
            heightCm: 150,
            age: 70,
            gender: "female",
            activityLevel: "sedentary",
            goalType: "cut",
        });
        expect(profile.calorieTarget).toBeGreaterThanOrEqual(1200);
    });

    it("computes higher targets for active vs sedentary", () => {
        const active = calculateFullProfile({
            weightKg: 75, heightCm: 175, age: 30, gender: "male",
            activityLevel: "active", goalType: "maintain",
        });
        const sedentary = calculateFullProfile({
            weightKg: 75, heightCm: 175, age: 30, gender: "male",
            activityLevel: "sedentary", goalType: "maintain",
        });
        expect(active.calorieTarget).toBeGreaterThan(sedentary.calorieTarget);
    });
});
