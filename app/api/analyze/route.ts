import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeFood } from "@/lib/agents/vision-agent";
import { getRateLimit } from "@/lib/rate-limit";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
type AllowedMimeType = typeof ALLOWED_TYPES[number];

// Validate magic bytes to guard against spoofed Content-Type
const MAGIC_BYTES: Record<AllowedMimeType, number[][]> = {
    "image/jpeg": [[0xFF, 0xD8, 0xFF]],
    "image/png":  [[0x89, 0x50, 0x4E, 0x47]],
    "image/webp": [[0x52, 0x49, 0x46, 0x46]], // RIFF header (WEBP follows at byte 8)
};

function checkMagicBytes(buffer: ArrayBuffer, mimeType: AllowedMimeType): boolean {
    const bytes = new Uint8Array(buffer, 0, 12);
    return MAGIC_BYTES[mimeType].some(sig => sig.every((b, i) => bytes[i] === b));
}

export async function POST(request: Request) {
    try {
        // 0. Verify API key exists before doing anything
        if (!process.env.GOOGLE_AI_API_KEY) {
            return NextResponse.json(
                { error: "AI service not configured", code: "CONFIG_ERROR" },
                { status: 500 }
            );
        }

        // 1. Validate Auth
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized", code: "AUTH_REQUIRED" }, { status: 401 });
        }

        // 2. Check rate limit
        const rl = getRateLimit(user.id, 30);
        const rateLimitHeaders = {
            "X-RateLimit-Remaining": String(rl.remaining),
            "X-RateLimit-Reset": String(rl.resetTime),
        };

        if (!rl.success) {
            return NextResponse.json(
                { error: "Rate limit exceeded", code: "RATE_LIMITED", retry_after: rl.resetInSecs },
                { status: 429, headers: rateLimitHeaders }
            );
        }

        // 3. Parse FormData
        const formData = await request.formData();
        const file = formData.get("image") as File | null;
        const portionHint = formData.get("portionHint") as string | undefined;

        if (!file) {
            return NextResponse.json({ error: "Missing image file", code: "INVALID_FILE" }, { status: 400, headers: rateLimitHeaders });
        }

        // 4. Validate declared MIME type
        if (!ALLOWED_TYPES.includes(file.type as AllowedMimeType)) {
            return NextResponse.json({ error: "Invalid file type", code: "INVALID_FILE" }, { status: 400, headers: rateLimitHeaders });
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: "File too large (max 10MB)", code: "FILE_TOO_LARGE" }, { status: 413, headers: rateLimitHeaders });
        }

        // 5. Read buffer and validate magic bytes
        const buffer = await file.arrayBuffer();
        if (!checkMagicBytes(buffer, file.type as AllowedMimeType)) {
            return NextResponse.json({ error: "File content does not match declared type", code: "INVALID_FILE" }, { status: 400, headers: rateLimitHeaders });
        }

        const base64 = Buffer.from(buffer).toString("base64");

        // 6. Call analyzeFood
        try {
            const result = await analyzeFood(
                base64,
                file.type as AllowedMimeType,
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
                chip_reaction: result.chip_reaction || "happy",
            };

            return NextResponse.json(mappedResult, { status: 200, headers: rateLimitHeaders });
        } catch (aiErr) {
            const msg = aiErr instanceof Error ? aiErr.message : "Analysis failed";

            if (msg.includes("Missing ") || msg.includes("MISSING_ENV")) {
                return NextResponse.json({ error: msg, code: "MISSING_ENV_VAR" }, { status: 500, headers: rateLimitHeaders });
            }

            if (msg.toLowerCase().includes("timeout") || msg.toLowerCase().includes("aborted")) {
                return NextResponse.json({ error: "Analysis timed out", code: "TIMEOUT", retryable: true }, { status: 504, headers: rateLimitHeaders });
            }

            if (msg.includes("429") || msg.toLowerCase().includes("quota") || msg.toLowerCase().includes("too many requests")) {
                return NextResponse.json(
                    { error: "Daily AI limit reached. Try again later or log this meal manually.", code: "QUOTA_EXCEEDED", retryable: false },
                    { status: 429, headers: rateLimitHeaders }
                );
            }

            // All models exhausted — service unavailable
            if (msg.toLowerCase().includes("all retries") || msg.toLowerCase().includes("after all")) {
                return NextResponse.json(
                    { error: "AI analysis unavailable. Please try again later.", code: "SERVICE_UNAVAILABLE", retryable: true },
                    { status: 503, headers: rateLimitHeaders }
                );
            }

            return NextResponse.json({ error: msg, code: "AI_ERROR", retryable: true }, { status: 500, headers: rateLimitHeaders });
        }
    } catch (err) {
        const msg = err instanceof Error ? err.message : "Server error";
        if (msg.includes("Missing ") || msg.includes("MISSING_ENV")) {
            return NextResponse.json({ error: msg, code: "MISSING_ENV_VAR" }, { status: 500 });
        }
        return NextResponse.json({ error: msg, code: "INTERNAL_ERROR" }, { status: 500 });
    }
}
