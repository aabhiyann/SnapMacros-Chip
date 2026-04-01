import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

/**
 * DELETE /api/account
 * Permanently deletes all user data and the auth account.
 * Required by Apple App Store Review Guideline 5.1.1.
 */
export async function DELETE() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized", code: "AUTH_REQUIRED" }, { status: 401 });
        }

        const userId = user.id;

        // 1. Delete all user data (RLS ensures we can only touch our own rows)
        await Promise.all([
            supabase.from("logs").delete().eq("user_id", userId),
            supabase.from("daily_summaries").delete().eq("user_id", userId),
            supabase.from("weekly_roasts").delete().eq("user_id", userId),
            supabase.from("rate_limits").delete().eq("user_id", userId),
        ]);

        // profiles table — delete last (FK constraint with some tables may depend on it)
        await supabase.from("profiles").delete().eq("user_id", userId);

        // 2. Delete the auth user — requires service role key
        const admin = createAdminClient();
        const { error: deleteAuthError } = await admin.auth.admin.deleteUser(userId);

        if (deleteAuthError) {
            console.error("Failed to delete auth user:", deleteAuthError);
            return NextResponse.json(
                { error: "Failed to delete account. Please contact support@snapmacros.app", code: "DELETE_AUTH_FAILED" },
                { status: 500 }
            );
        }

        // 3. Sign out (clear cookies)
        await supabase.auth.signOut();

        return NextResponse.json({ success: true, message: "Account permanently deleted." }, { status: 200 });
    } catch (err) {
        console.error("Account deletion error:", err);
        return NextResponse.json(
            { error: "Account deletion failed. Please contact support@snapmacros.app", code: "DELETE_ERROR" },
            { status: 500 }
        );
    }
}
