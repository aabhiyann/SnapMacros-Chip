import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calculateFullProfile } from "@/lib/tdee";

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
        }

        const { data: profile, error } = await supabase
            .from("profiles")
            .select("name, target_calories, target_protein, target_carbs, target_fat, streak_days, longest_streak, created_at")
            .eq("user_id", user.id)
            .single();

        if (error || !profile) {
            return NextResponse.json({ error: "Profile not found", code: "NOT_FOUND" }, { status: 404 });
        }

        const { count: logsCount } = await supabase
            .from("logs")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id);

        const { count: roastsCount } = await supabase
            .from("weekly_roasts")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id);

        return NextResponse.json({
            name: profile.name || "User",
            goal: "Maintain",
            targets: {
                cal: profile.target_calories ?? 2000,
                pro: profile.target_protein ?? 150,
                carb: profile.target_carbs ?? 250,
                fat: profile.target_fat ?? 65,
            },
            mealsLogged: logsCount ?? 0,
            bestStreak: profile.longest_streak ?? 0,
            roastsReceived: roastsCount ?? 0,
            joined: profile.created_at ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "—",
        }, { status: 200 });
    } catch (err) {
        console.error("Profile GET Error:", err);
        return NextResponse.json({ error: "Failed to fetch profile", code: "PROFILE_FETCH_ERROR" }, { status: 500 });
    }
}

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
        const heightCm = heightUnit === "cm" ? parseFloat(height) : parseFloat(height) * 2.54;

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
