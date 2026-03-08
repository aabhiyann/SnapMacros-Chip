import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeFood } from "@/lib/agents/vision-agent";
import { getRateLimit } from "@/lib/rate-limit";
import { DEMO_USER_ID } from "@/lib/auth"; // In real prod, this comes from supase.auth.getUser()

// Used constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: Request) {
  try {
    // 1. Validate Auth (Mocked with Demo ID for now, as per Supabase mock auth logic)
    const supabase = createClient();
    // const { data: { user }, error: authError } = await supabase.auth.getUser();
    // if (authError || !user) return NextResponse.json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' }, { status: 401 });
    const user = { id: DEMO_USER_ID }; // MOCK

    // 4. Check rate limit
    const rl = getRateLimit(user.id, 30);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded", code: "RATE_LIMITED", retry_after: rl.resetInSecs },
        { status: 429 }
      );
    }

    // 2. Parse FormData
    const formData = await request.formData();
    const file = formData.get("image") as File | null;
    const portionHint = formData.get("portionHint") as string | undefined;

    if (!file) {
      return NextResponse.json({ error: "Missing image file", code: "INVALID_FILE" }, { status: 400 });
    }

    // 3. Validate file type + size
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type", code: "INVALID_FILE" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large (max 10MB)", code: "FILE_TOO_LARGE" }, { status: 413 });
    }

    // 5. Convert to Base64
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    // 6. Call analyzeFood
    try {
      const result = await analyzeFood(
        base64,
        file.type as "image/jpeg" | "image/png" | "image/webp",
        portionHint
      );

      const mappedResult = {
        food_name: result.food_name,
        calories: result.macros?.calories || 0,
        protein: result.macros?.protein_g || 0,
        carbs: result.macros?.carbs_g || 0,
        fat: result.macros?.fat_g || 0,
        confidence: result.confidence || "medium",
        reasoning: result.confidence_note || result.fun_note || "",
        detected_items: result.items_detected || [],
      };

      // 7. Return Result
      return NextResponse.json(mappedResult, { status: 200 });
    } catch (aiErr) {
      const msg = aiErr instanceof Error ? aiErr.message : "Analysis failed";

      if (msg.includes("Missing ") || msg.includes("MISSING_ENV")) {
        return NextResponse.json({ error: msg, code: "MISSING_ENV_VAR" }, { status: 500 });
      }

      if (msg.toLowerCase().includes("timeout")) {
        return NextResponse.json({ error: "Analysis timed out", code: "TIMEOUT" }, { status: 504 });
      }

      return NextResponse.json({ error: msg, code: "AI_ERROR" }, { status: 500 });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server error";
    if (msg.includes("Missing ") || msg.includes("MISSING_ENV")) {
      return NextResponse.json({ error: msg, code: "MISSING_ENV_VAR" }, { status: 500 });
    }
    return NextResponse.json({ error: msg, code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
