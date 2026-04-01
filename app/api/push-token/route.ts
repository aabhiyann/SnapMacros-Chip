import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const RegisterSchema = z.object({
    token:    z.string().min(10),
    platform: z.enum(["ios", "android", "web"]),
});

/** POST /api/push-token — register a device token */
export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const parsed = RegisterSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        const { token, platform } = parsed.data;

        // Upsert — if the token already exists for this user, update timestamp
        const { error } = await supabase
            .from("push_tokens")
            .upsert(
                { user_id: user.id, token, platform, updated_at: new Date().toISOString() },
                { onConflict: "user_id,token" }
            );

        if (error) throw error;

        return NextResponse.json({ ok: true });
    } catch (e) {
        const message = e instanceof Error ? e.message : "Server error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

/** DELETE /api/push-token — unregister a device token (e.g. on sign-out) */
export async function DELETE(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { token } = await request.json() as { token?: string };
        if (!token) {
            return NextResponse.json({ error: "Missing token" }, { status: 400 });
        }

        await supabase
            .from("push_tokens")
            .delete()
            .eq("user_id", user.id)
            .eq("token", token);

        return new NextResponse(null, { status: 204 });
    } catch (e) {
        const message = e instanceof Error ? e.message : "Server error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
