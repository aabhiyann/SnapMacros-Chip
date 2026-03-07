import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-sonnet-4-20250514";

export interface AnalysisResult {
    food_name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    confidence: "high" | "medium" | "low";
    reasoning: string;
}

const SYSTEM_PROMPT = `You are an expert food scientist and nutritionist. Your task is to analyze food images and provide highly accurate macronutrient estimates following USDA guidelines.

RULES:
1. Identify all visible ingredients and consider cooking methods (e.g., fried vs. baked, added oils/sauces).
2. Estimate standard portion sizes unless a specific hint is provided.
3. Your confidence must be "high" for highly recognizable standard items, "medium" for mixed dishes, and "low" if the image is blurry or portions are completely ambiguous.
4. Chip (the mascot) will react to your output, so ensure the food_name is colloquial and descriptive (e.g., "Bacon Double Cheeseburger" instead of "Meat and Bread").
5. Return ONLY a valid JSON object. Do not include markdown code blocks, apologies, or any surrounding text.`;

function buildVisionPrompt(portionHint?: string): string {
    return `Analyze this food image.${portionHint ? ` \nContext: ${portionHint}` : ""}

Return ONLY a JSON object matching this exact schema:
{
  "food_name": "casual, descriptive name of the meal",
  "calories": number (in kcal),
  "protein": number (in grams),
  "carbs": number (in grams),
  "fat": number (in grams),
  "confidence": "high" | "medium" | "low",
  "reasoning": "1 sentence explanation of how you estimated the macros based on visible items and assumed cooking methods."
}`;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function analyzeFood(
    imageBase64: string,
    mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif",
    portionHint?: string,
    maxRetries = 2
): Promise<AnalysisResult> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        throw new Error("Missing ANTHROPIC_API_KEY");
    }

    const client = new Anthropic({ apiKey });
    const prompt = buildVisionPrompt(portionHint);
    const backoffs = [1000, 2000];

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
        const startTime = Date.now();
        try {
            const response = await client.messages.create({
                model: MODEL,
                system: SYSTEM_PROMPT,
                max_tokens: 512,
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "image",
                                source: {
                                    type: "base64",
                                    media_type: mediaType,
                                    data: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
                                },
                            },
                            { type: "text", text: prompt },
                        ],
                    },
                ],
            });

            const textBlock = response.content.find((c) => c.type === "text");
            if (!textBlock || textBlock.type !== "text") {
                throw new Error("No text response from Claude");
            }

            // Strip potential markdown blocks if Claude disobeys
            let rawText = textBlock.text.trim();
            if (rawText.startsWith("```json")) rawText = rawText.replace(/^```json/, "");
            if (rawText.startsWith("```")) rawText = rawText.replace(/^```/, "");
            if (rawText.endsWith("```")) rawText = rawText.replace(/```$/, "");
            rawText = rawText.trim();

            const parsed = JSON.parse(rawText);

            // Validate required fields
            if (
                typeof parsed.food_name !== "string" ||
                typeof parsed.calories !== "number" ||
                typeof parsed.protein !== "number" ||
                typeof parsed.carbs !== "number" ||
                typeof parsed.fat !== "number" ||
                !["high", "medium", "low"].includes(parsed.confidence) ||
                typeof parsed.reasoning !== "string"
            ) {
                throw new Error("Invalid schema returned by Claude");
            }

            const durationMs = Date.now() - startTime;
            console.log(`[Vision Agent] SUCCESS:`, {
                food_name: parsed.food_name,
                confidence: parsed.confidence,
                calories: parsed.calories,
                duration_ms: durationMs,
                attempt,
            });

            return parsed as AnalysisResult;
        } catch (err) {
            const durationMs = Date.now() - startTime;
            console.warn(`[Vision Agent] ATTEMPT ${attempt} FAILED:`, {
                error: err instanceof Error ? err.message : String(err),
                duration_ms: durationMs,
            });

            if (attempt <= maxRetries) {
                const delay = backoffs[attempt - 1] || 2000;
                console.log(`[Vision Agent] Retrying in ${delay}ms...`);
                await sleep(delay);
            } else {
                console.error(`[Vision Agent] ALL RETRIES EXHAUSTED.`);
                throw new Error(err instanceof Error ? `Analysis failed: ${err.message}` : "Analysis failed");
            }
        }
    }

    throw new Error("Unexpected loop exit in analyzeFood");
}
