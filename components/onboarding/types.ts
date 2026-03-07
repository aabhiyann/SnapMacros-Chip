export interface OnboardingData {
    goal: "cut" | "maintain" | "bulk" | "";
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
