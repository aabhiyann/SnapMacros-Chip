import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DEMO_USER_ID } from "@/lib/auth"; // Mock Auth
import { calculateFullProfile } from "@/lib/tdee";

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
        }

        const userId = user.id;

        // 1. Process Frontend Body
        const body = await request.json();
        const { goal, name, age, weight, weightUnit, height, heightUnit, gender, activityLevel } = body;

        // 2. Normalize units to Kg / Cm for DB store
        const weightKg = weightUnit === "kg" ? parseFloat(weight) : parseFloat(weight) * 0.453592;
        const heightCm = heightUnit === "cm" ? parseFloat(height) : parseFloat(height) * 30.48;

        // 3. Server-side authoritative validation
        const profile = calculateFullProfile({
            weightKg,
            heightCm,
            age: parseInt(age),
            gender: gender as "male" | "female",
            activityLevel: activityLevel as any,
            goalType: goal as any,
        });

        // 4. Upsert `profiles` tracking
        const { data, error } = await supabase
            .from("profiles")
            .upsert({
                user_id: userId,
                name,
                target_calories: profile.calorieTarget,
                target_protein: profile.macroTarget.protein,
                target_carbs: profile.macroTarget.carbs,
                target_fat: profile.macroTarget.fat,
                onboarding_completed: true,
                updated_at: new Date().toISOString()
            }, { onConflict: "user_id" })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, profile: data }, { status: 200 });

    } catch (err) {
        console.error("Profile API Error:", err);
        return NextResponse.json({ error: "Failed to sync profile configuration", code: "PROFILE_SYNC_ERROR" }, { status: 500 });
    }
}
