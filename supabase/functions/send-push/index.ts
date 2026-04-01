/**
 * Supabase Edge Function: send-push
 *
 * Sends a push notification to one or all users via FCM HTTP v1 API.
 *
 * Invoke via Supabase dashboard cron or a direct POST from a server:
 *   POST /functions/v1/send-push
 *   Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>
 *   Body: { "user_id"?: "uuid", "title": "...", "body": "...", "data"?: {...} }
 *
 * If user_id is omitted, sends to ALL registered tokens (broadcast).
 *
 * Required env vars (set in Supabase dashboard → Edge Functions → Secrets):
 *   FCM_SERVICE_ACCOUNT_JSON  — full Firebase service account JSON (stringified)
 *   SUPABASE_URL              — auto-injected
 *   SUPABASE_SERVICE_ROLE_KEY — auto-injected
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL              = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FCM_JSON_RAW              = Deno.env.get("FCM_SERVICE_ACCOUNT_JSON") ?? "";

interface PushPayload {
    user_id?: string;
    title:    string;
    body:     string;
    data?:    Record<string, string>;
}

/** Exchange a Firebase service account for a short-lived OAuth2 access token */
async function getFcmAccessToken(serviceAccountJson: string): Promise<string> {
    const sa = JSON.parse(serviceAccountJson);
    const now  = Math.floor(Date.now() / 1000);
    const claim = {
        iss:   sa.client_email,
        scope: "https://www.googleapis.com/auth/firebase.messaging",
        aud:   "https://oauth2.googleapis.com/token",
        iat:   now,
        exp:   now + 3600,
    };

    // Encode JWT
    const header  = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" })).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    const payload = btoa(JSON.stringify(claim)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    const toSign  = `${header}.${payload}`;

    // Import private key
    const pemBody = sa.private_key.replace(/-----[^-]+-----/g, "").replace(/\s/g, "");
    const keyBuf  = Uint8Array.from(atob(pemBody), c => c.charCodeAt(0));
    const cryptoKey = await crypto.subtle.importKey(
        "pkcs8", keyBuf,
        { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
        false, ["sign"]
    );

    const sigBuf  = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, new TextEncoder().encode(toSign));
    const sig     = btoa(String.fromCharCode(...new Uint8Array(sigBuf))).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    const jwt     = `${toSign}.${sig}`;

    // Exchange JWT for access token
    const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }),
    });
    const { access_token } = await res.json() as { access_token: string };
    return access_token;
}

/** Send one FCM message to a single device token */
async function sendFcm(
    accessToken: string,
    projectId: string,
    deviceToken: string,
    title: string,
    body: string,
    data?: Record<string, string>
): Promise<boolean> {
    const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type":  "application/json",
        },
        body: JSON.stringify({
            message: {
                token: deviceToken,
                notification: { title, body },
                apns: {
                    payload: { aps: { sound: "default", badge: 1 } },
                },
                data: data ?? {},
            },
        }),
    });
    return res.ok;
}

Deno.serve(async (req) => {
    if (req.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    if (!FCM_JSON_RAW) {
        return new Response(JSON.stringify({ error: "FCM_SERVICE_ACCOUNT_JSON not configured" }), {
            status: 503, headers: { "Content-Type": "application/json" },
        });
    }

    const payload = await req.json() as PushPayload;
    if (!payload.title || !payload.body) {
        return new Response(JSON.stringify({ error: "title and body are required" }), {
            status: 400, headers: { "Content-Type": "application/json" },
        });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch target tokens
    let query = supabase.from("push_tokens").select("token, platform");
    if (payload.user_id) {
        query = query.eq("user_id", payload.user_id);
    }
    const { data: tokens, error } = await query;
    if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500, headers: { "Content-Type": "application/json" },
        });
    }

    if (!tokens || tokens.length === 0) {
        return new Response(JSON.stringify({ sent: 0 }), {
            status: 200, headers: { "Content-Type": "application/json" },
        });
    }

    const sa = JSON.parse(FCM_JSON_RAW);
    const accessToken = await getFcmAccessToken(FCM_JSON_RAW);
    let sent = 0;

    await Promise.allSettled(
        tokens.map(async ({ token }) => {
            const ok = await sendFcm(accessToken, sa.project_id, token, payload.title, payload.body, payload.data);
            if (ok) sent++;
        })
    );

    return new Response(JSON.stringify({ sent, total: tokens.length }), {
        status: 200, headers: { "Content-Type": "application/json" },
    });
});
