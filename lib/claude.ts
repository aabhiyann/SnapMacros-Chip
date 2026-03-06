import Anthropic from "@anthropic-ai/sdk";
import type { ImageBlockParam } from "@anthropic-ai/sdk/resources/messages";

const MODEL = "claude-sonnet-4-20250514";

export interface MacroResult {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  description?: string;
}

const MACRO_PROMPT = `You are a nutrition analyst. Given a photo of food, estimate the macronutrients.
Respond with ONLY a JSON object (no markdown, no code block) with this exact shape:
{"calories": number, "protein": number, "carbs": number, "fat": number, "description": "short description of the food"}
Numbers should be reasonable estimates.`;

export async function analyzeFoodImage(
  imageBase64: string,
  mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif" = "image/jpeg"
): Promise<MacroResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Missing ANTHROPIC_API_KEY");
  }
  const client = new Anthropic({ apiKey });

  const imageBlock: ImageBlockParam = {
    type: "image",
    source: {
      type: "base64",
      media_type: mediaType,
      data: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
    },
  };

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 256,
    messages: [
      {
        role: "user",
        content: [imageBlock, { type: "text", text: MACRO_PROMPT }],
      },
    ],
  });

  const text = response.content.find((c) => c.type === "text");
  if (!text || text.type !== "text") {
    throw new Error("No text in Claude response");
  }
  const raw = text.text.trim();
  const parsed = JSON.parse(raw) as MacroResult;
  if (
    typeof parsed.calories !== "number" ||
    typeof parsed.protein !== "number" ||
    typeof parsed.carbs !== "number" ||
    typeof parsed.fat !== "number"
  ) {
    throw new Error("Invalid macro shape from Claude");
  }
  return parsed;
}

const ROAST_PROMPT = `You are Chip, a tiny hatching egg mascot for a nutrition app. The user has logged the following meals this week (each with optional description and macros). Write a short, funny, affectionate "roast" of their eating habits — 2–4 sentences. Be warm and playful, not mean.`;

export async function generateWeeklyRoast(mealsSummary: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Missing ANTHROPIC_API_KEY");
  }
  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 300,
    messages: [
      {
        role: "user",
        content: `${ROAST_PROMPT}\n\nMeals this week:\n${mealsSummary}`,
      },
    ],
  });

  const text = response.content.find((c) => c.type === "text");
  if (!text || text.type !== "text") {
    throw new Error("No text in Claude response");
  }
  return text.text.trim();
}
