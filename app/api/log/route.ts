import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { DEMO_USER_ID } from "@/lib/auth";

const logSchema = z.object({
    meal_name: z.string().min(1),
    image_url: z.string().url().optional().nullable(),
    calories: z.number().int().min(0),
    protein: z.number().int().min(0),
    carbs: z.number().int().min(0),
    fat: z.number().int().min(0),
});

export async function POST(request: Request) {
    try {
        const raw = await request.json();
        const parsed = logSchema.safeParse(raw);

        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
        }

        const supabase = createClient();

        // Server-side default to today's date if not passed.
        const { data, error } = await supabase
            .from("logs")
            .insert({
                user_id: DEMO_USER_ID,
                ...parsed.data
            })
            .select()
            .single();

        if (error) {
            console.error("DB Insert Error:", error);
            return NextResponse.json({ error: "Database error" }, { status: 500 });
        }

        return NextResponse.json({ log: data });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Server error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("logs")
            .select("*")
            .eq("user_id", DEMO_USER_ID)
            .order("created_at", { ascending: false });

        if (error) {
            return NextResponse.json({ error: "Database error" }, { status: 500 });
        }

        return NextResponse.json({ logs: data });
    } catch (err) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
