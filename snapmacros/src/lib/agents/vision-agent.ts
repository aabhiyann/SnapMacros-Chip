import Anthropic from "@anthropic-ai/sdk";
import type { ImageBlockParam } from "@anthropic-ai/sdk/resources/messages";
import type { AnalysisResult, Confidence, MacroSet, MealType } from "../types";
import { logger } from "../logger";

const MODEL = "claude-sonnet-4-20250514";

const SYSTEM_PROMPT = `You are an expert food scientist and registered dietitian. Analyze the food image and estimate nutritional content.

Rules:
- Use USDA and standard reference data. Adjust for cooking method (e.g. fried adds fat, grilled retains more protein).
- Estimate portion size from the image. If unclear, state "medium portion" assumption.
- Report confidence: "high" (clear single dish, known food), "medium" (multiple items or estimated portion), "low" (unclear or heavily processed).
- Return ONLY valid JSON. No markdown, no code fences, no explanation.

Output schema: { "description": string, "calories": number, "protein_g": number, "carbs_g": number, "fat_g": number, "confidence": "low"|"medium"|"high", "meal_type_suggestion": "breakfast"|"lunch"|"dinner"|"snack"|"other" }
All number fields are required. description is a short food name or description (e.g. "Grilled chicken salad").`;

function buildVisionPrompt(portionHint?: string): string {
  const hint = portionHint?.trim()
    ? `\nThe user indicated: "${portionHint}". Use this to refine portion estimate.`
    : "";
  return `Analyze this food image and return a single JSON object with: description, calories, protein_g, carbs_g, fat_g, confidence, meal_type_suggestion.${hint}\nReturn only the JSON object, no other text.`;
}

const CONFIDENCE_VALUES: Confidence[] = ["low", "medium", "high"];
const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack", "other"];

function parseVisionResponse(text: string): AnalysisResult {
  let raw = text.trim();
  const codeBlock = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock) raw = codeBlock[1]!.trim();
  const parsed = JSON.parse(raw) as Record<string, unknown>;
  const description = typeof parsed.description === "string" ? parsed.description : "";
  const calories = Number(parsed.calories);
  const protein = Number(parsed.protein_g);
  const carbs = Number(parsed.carbs_g);
  const fat = Number(parsed.fat_g);
  const confidence = typeof parsed.confidence === "string" && CONFIDENCE_VALUES.includes(parsed.confidence as Confidence)
    ? (parsed.confidence as Confidence)
    : "medium";
  const mealTypeSuggestion = typeof parsed.meal_type_suggestion === "string" && MEAL_TYPES.includes(parsed.meal_type_suggestion as MealType)
    ? (parsed.meal_type_suggestion as MealType)
    : "other";

  if (!Number.isFinite(calories) || !Number.isFinite(protein) || !Number.isFinite(carbs) || !Number.isFinite(fat)) {
    throw new Error("Vision response missing or invalid numeric macros");
  }

  const macros: MacroSet = {
    calories: Math.round(calories),
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fat: Math.round(fat),
  };
  return { description, macros, confidence, mealTypeSuggestion };
}

export interface AnalyzeFoodOptions {
  portionHint?: string;
  maxRetries?: number;
}

export async function analyzeFood(
  imageBase64: string,
  mediaType: string,
  options: AnalyzeFoodOptions = {}
): Promise<AnalysisResult> {
  const { portionHint, maxRetries = 2 } = options;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const imageBlock: ImageBlockParam = {
    type: "image",
    source: {
      type: "base64",
      media_type: mediaType as "image/jpeg" | "image/png" | "image/webp" | "image/gif",
      data: imageBase64,
    },
  };
  const userMessage = buildVisionPrompt(portionHint);
  const start = Date.now();
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: [imageBlock, { type: "text", text: userMessage }] }],
      });
      const text = response.content
        .filter((c) => c.type === "text")
        .map((c) => (c as { type: "text"; text: string }).text)
        .join("");
      if (!text) throw new Error("Empty vision response");
      const result = parseVisionResponse(text);
      const duration_ms = Date.now() - start;
      logger.info("Vision analysis completed", {
        food_name: result.description,
        confidence: result.confidence,
        calories: result.macros.calories,
        duration_ms,
        attempt,
      });
      return result;
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      if (attempt <= maxRetries) {
        const delay = 1000 * attempt;
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  const duration_ms = Date.now() - start;
  logger.error("Vision analysis failed after retries", { duration_ms, error: lastError?.message });
  throw new Error(lastError?.message ?? "Analysis failed");
}

export { buildVisionPrompt };
