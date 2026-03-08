import { NextResponse } from "next/server";
import { z } from "zod";
export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";

const querySchema = z.object({
  limit: z.coerce.number().min(1).max(100).optional().default(20),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({ limit: searchParams.get("limit") });
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid query", details: parsed.error.flatten() }, { status: 400 });
    }
    const supabase = await createClient();
    // Assume table: meals (id, user_id, image_url?, macros?, created_at, ...)
    const { data, error } = await supabase
      .from("meals")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(parsed.data.limit);

    if (error) {
      return NextResponse.json({ error: error.message, code: "MEALS_FETCH_ERROR" }, { status: 500 });
    }
    return NextResponse.json({ meals: data ?? [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message, code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
