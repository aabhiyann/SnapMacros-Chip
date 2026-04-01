/**
 * Supabase Edge Function: daily-reminder
 *
 * Finds users who have NOT logged any food today and sends them a nudge.
 * Scheduled via Supabase cron at 18:00 UTC daily (configurable).
 *
 * Required env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, FCM_SERVICE_ACCOUNT_JSON
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL              = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SEND_PUSH_URL             = `${SUPABASE_URL}/functions/v1/send-push`;

Deno.serve(async () => {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const today = new Date().toISOString().split("T")[0];

    // Users who have push tokens but haven't logged today
    const { data: users, error } = await supabase.rpc("users_without_log_today", { target_date: today });

    if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500, headers: { "Content-Type": "application/json" },
        });
    }

    const nudges = [
        "Have you snapped today? 📸 Chip's waiting.",
        "Don't break your streak! Log something — even a snack counts.",
        "Your macros won't track themselves. Snap a meal!",
        "Chip misses you. Log something and keep that streak alive! 🔥",
    ];
    const body = nudges[new Date().getDay() % nudges.length];

    let totalSent = 0;
    for (const { user_id } of (users ?? [])) {
        try {
            const res = await fetch(SEND_PUSH_URL, {
                method: "POST",
                headers: {
                    "Content-Type":  "application/json",
                    "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                },
                body: JSON.stringify({
                    user_id,
                    title: "SnapMacros",
                    body,
                    data: { type: "daily_reminder" },
                }),
            });
            const json = await res.json() as { sent?: number };
            totalSent += json.sent ?? 0;
        } catch { /* skip individual failures */ }
    }

    return new Response(JSON.stringify({ notified: users?.length ?? 0, sent: totalSent }), {
        status: 200, headers: { "Content-Type": "application/json" },
    });
});
