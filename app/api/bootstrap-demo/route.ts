import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";

/**
 * Ensures the demo user's profile has onboarding_completed=true.
 * Called after demo login so they land on dashboard, not onboarding.
 */
export async function POST() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        if (user.email !== "demo@snapmacros.app") {
            return NextResponse.json({ error: "Not demo user" }, { status: 403 });
        }

        const { error } = await supabase
            .from("profiles")
            .upsert({
                user_id: user.id,
                onboarding_completed: true,
                name: "Alex",
                target_calories: 2500,
                target_protein: 150,
                target_carbs: 300,
                target_fat: 80,
                streak_days: 5,
                updated_at: new Date().toISOString(),
            }, { onConflict: "user_id" });

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Bootstrap demo error:", err);
        return NextResponse.json({ error: "Failed to bootstrap demo", details: err instanceof Error ? err.message : String(err) }, { status: 500 });
    }
}
