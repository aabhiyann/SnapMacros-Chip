export interface OnboardingData {
    goal: "bulk" | "lean_bulk" | "maintain" | "fat_loss" | "cut" | "";
    name: string;
    age: string;
    weight: string;
    weightUnit: "kg" | "lbs";
    height: string;
    heightUnit: "cm" | "ft";
    gender: "male" | "female" | "other" | "";
    activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active" | "extra_active" | "";
}

export const initialData: OnboardingData = {
    goal: "",
    name: "",
    age: "",
    weight: "",
    weightUnit: "lbs",
    height: "",
    heightUnit: "ft",
    gender: "",
    activityLevel: "moderate",
};
