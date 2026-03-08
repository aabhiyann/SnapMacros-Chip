export function calculateBMR(weightKg: number, heightCm: number, age: number, gender: "male" | "female"): number {
    const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
    return gender === "male" ? base + 5 : base - 161;
}

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
    extra_active: 1.9,
};

export function calculateTDEE(bmr: number, activityLevel: string): number {
    const mult = ACTIVITY_MULTIPLIERS[activityLevel] ?? 1.55;
    return bmr * mult;
}

export function getCalorieTarget(tdee: number, goalType: string): number {
    let target = tdee;
    if (goalType === "cut" || goalType === "fat_loss") target -= 500;
    if (goalType === "bulk" || goalType === "lean_bulk") target += 500;
    return Math.max(target, 1200); // floor at 1200
}

export function getMacroTargets(calorieTarget: number, _goalType?: string) {
    const pCal = calorieTarget * 0.3;
    const cCal = calorieTarget * 0.4;
    const fCal = calorieTarget * 0.3;
    return {
        calories: calorieTarget,
        protein: Math.round(pCal / 4),
        carbs: Math.round(cCal / 4),
        fat: Math.round(fCal / 9),
    };
}

export function calculateFullProfile(params: {
    weightKg: number;
    heightCm: number;
    age: number;
    gender: "male" | "female";
    activityLevel: string;
    goalType: string;
}) {
    const bmr = calculateBMR(params.weightKg, params.heightCm, params.age, params.gender);
    const tdee = calculateTDEE(bmr, params.activityLevel);
    const calorieTarget = getCalorieTarget(tdee, params.goalType);
    const macroTarget = getMacroTargets(calorieTarget, params.goalType);
    return { bmr, tdee, calorieTarget, macroTarget };
}
