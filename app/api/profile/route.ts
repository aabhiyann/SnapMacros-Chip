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

export async function PATCH(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
        }
        const body = await request.json() as Record<string, unknown>;
        const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (typeof body.name === "string") patch.name = body.name.trim().slice(0, 50) || "User";
        if (typeof body.target_calories === "number") patch.target_calories = Math.max(500,  Math.min(10000, Math.round(body.target_calories)));
        if (typeof body.target_protein  === "number") patch.target_protein  = Math.max(0,    Math.min(500,   Math.round(body.target_protein)));
        if (typeof body.target_carbs    === "number") patch.target_carbs    = Math.max(0,    Math.min(1000,  Math.round(body.target_carbs)));
        if (typeof body.target_fat      === "number") patch.target_fat      = Math.max(0,    Math.min(300,   Math.round(body.target_fat)));
        const { error } = await supabase.from("profiles").update(patch).eq("user_id", user.id);
        if (error) throw new Error(error.message);
        return NextResponse.json({ ok: true });
    } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ error: msg, code: "PROFILE_PATCH_ERROR" }, { status: 500 });
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

        // 2. Normalize units to Kg / Cm (ft = total inches from AboutStep)
        const weightKg = weightUnit === "kg" ? parseFloat(weight) : parseFloat(weight) * 0.453592;
        const heightCm = heightUnit === "cm" ? parseFloat(height) : parseFloat(height) * 2.54;

        // 3. Sanitize to prevent NaN
        const safeWeightKg = isNaN(weightKg) ? 70 : Math.max(30, Math.min(350, weightKg));
        const safeHeightCm = isNaN(heightCm) ? 175 : Math.max(100, Math.min(250, heightCm));
        const safeAge = Math.max(13, Math.min(85, parseInt(age) || 25));
        const safeGender = (gender === "female" ? "female" : "male") as "male" | "female";
        const safeActivity = activityLevel || "moderate";
        const safeGoal = goal || "maintain";

        // 4. Server-side authoritative validation
        const profile = calculateFullProfile({
            weightKg: safeWeightKg,
            heightCm: safeHeightCm,
            age: safeAge,
            gender: safeGender,
            activityLevel: safeActivity,
            goalType: safeGoal,
        });

        // 5. Ensure profile row exists (trigger may not have run), then upsert
        const { data: existing } = await supabase
            .from("profiles")
            .select("user_id")
            .eq("user_id", userId)
            .maybeSingle();

        if (!existing) {
            const { error: insertErr } = await supabase
                .from("profiles")
                .insert({ user_id: userId });
            if (insertErr) {
                console.error("Profile insert error:", insertErr);
                throw new Error(insertErr.message);
            }
        }

        const payload = {
            user_id: userId,
            name: name || "User",
            target_calories: Math.round(profile.calorieTarget),
            target_protein: profile.macroTarget.protein,
            target_carbs: profile.macroTarget.carbs,
            target_fat: profile.macroTarget.fat,
            onboarding_completed: true,
            updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
            .from("profiles")
            .update(payload)
            .eq("user_id", userId)
            .select()
            .single();

        if (error) throw new Error(error.message);

        return NextResponse.json({ success: true, profile: data }, { status: 200 });
    } catch (err) {
        console.error("Profile API Error:", err);
        const msg = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json(
            { error: "Failed to sync profile configuration", code: "PROFILE_SYNC_ERROR", details: msg },
            { status: 500 }
        );
    }
}
