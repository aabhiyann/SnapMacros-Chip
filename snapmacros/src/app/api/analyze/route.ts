import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { rateLimitAnalyze } from "@/lib/rate-limit";
import { analyzeFood } from "@/lib/agents/vision-agent";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerSupabaseClient({
      getAll: () => cookieStore.getAll(),
      setAll: (cookies) => {
        cookies.forEach((c) => {
          try {
            cookieStore.set(c.name, c.value, c.options as Record<string, unknown> | undefined);
          } catch {
            // ignore in route handler
          }
        });
      },
    });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized", code: "AUTH_REQUIRED" },
        { status: 401 }
      );
    }

    const rl = rateLimitAnalyze(`analyze:${user.id}`);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded", code: "RATE_LIMITED", retry_after: rl.retryAfter },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const image = formData.get("image");
    if (!image || !(image instanceof File)) {
      return NextResponse.json(
        { error: "Missing or invalid image field", code: "INVALID_FILE" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(image.type)) {
      return NextResponse.json(
        { error: "Invalid file type", code: "INVALID_FILE" },
        { status: 400 }
      );
    }
    if (image.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large (max 10MB)", code: "FILE_TOO_LARGE" },
        { status: 413 }
      );
    }

    const buffer = await image.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const portionHint = typeof formData.get("portionHint") === "string" ? formData.get("portionHint") as string : undefined;

    const result = await analyzeFood(base64, image.type, { portionHint });
    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Analysis failed";
    if (message.includes("timed out") || message.includes("timeout")) {
      return NextResponse.json(
        { error: "Analysis timed out", code: "TIMEOUT" },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { error: "Analysis failed", code: "AI_ERROR" },
      { status: 500 }
    );
  }
}
