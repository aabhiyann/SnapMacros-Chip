export function calculateBMR(weightKg: number, heightCm: number, age: number, gender: "male" | "female"): number {
    const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
    return gender === "male" ? base + 5 : base - 161;
}

export function calculateTDEE(bmr: number, activityLevel: "sedentary" | "moderate" | "active"): number {
    const multipliers = { sedentary: 1.2, moderate: 1.55, active: 1.725 };
    return bmr * multipliers[activityLevel];
}

export function getCalorieTarget(tdee: number, goalType: "maintain" | "cut" | "bulk"): number {
    let target = tdee;
    if (goalType === "cut") target -= 500;
    if (goalType === "bulk") target += 500;
    return Math.max(target, 1200); // floor at 1200
}

export function getMacroTargets(calorieTarget: number, goalType: "maintain" | "cut" | "bulk") {
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
    activityLevel: "sedentary" | "moderate" | "active";
    goalType: "maintain" | "cut" | "bulk";
}) {
    const bmr = calculateBMR(params.weightKg, params.heightCm, params.age, params.gender);
    const tdee = calculateTDEE(bmr, params.activityLevel);
    const calorieTarget = getCalorieTarget(tdee, params.goalType);
    const macroTarget = getMacroTargets(calorieTarget, params.goalType);
    return { bmr, tdee, calorieTarget, macroTarget };
}
