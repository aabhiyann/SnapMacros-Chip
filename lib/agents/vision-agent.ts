import { GoogleGenerativeAI } from '@google/generative-ai';
import { AnalysisResult } from '@/lib/types';
import { logger } from '@/lib/logger';

function getGenAI() {
    const key = process.env.GOOGLE_AI_API_KEY;
    if (!key) throw new Error("Missing GOOGLE_AI_API_KEY environment variable. Add it to .env.local");
    return new GoogleGenerativeAI(key);
}

const SYSTEM_PROMPT = `You are NutriLens, an expert food scientist inside SnapMacros.

Analyze food photos or text descriptions and estimate nutritional content with precision.

ACCURACY STANDARDS (use USDA National Nutrient Database as reference):
- Chicken breast, cooked: ~31g protein, ~165 cal per 100g
- White rice, cooked: ~28g carbs, ~130 cal per 100g
- Olive oil: ~14g fat, ~120 cal per tablespoon
- Oatmeal with banana and honey: ~350-450 cal, ~10-12g protein
- Deep-fried food: adds 30-50% more calories
- Restaurant portions: typically 1.5-2x home portions
- Fast food: use known values (Big Mac ≈ 550 cal, Chipotle bowl ≈ 800-1000 cal)

CONFIDENCE RULES:
- "high":   Clear photo or detailed description, identifiable food, standard portion
- "medium": Food identifiable but portion unclear or uncommon prep
- "low":    Blurry, very mixed, or vague description

CHIP REACTION RULES:
- "hype":    protein_g > 30 OR clearly healthy/clean meal
- "shocked": calories > 850 OR very indulgent meal
- "happy":   everything else

FUN NOTE: One sentence, max 12 words, Chip's voice, casual and funny, references specific food.

CRITICAL: Return ONLY valid JSON. No markdown. No backticks. No prose. No explanation before or after the JSON.`;

const JSON_SCHEMA_PROMPT = `Return ONLY this JSON, nothing else:
{
  "food_name": "2-5 word descriptive name",
  "items_detected": ["item1", "item2", "item3"],
  "portion_size": "human-readable estimate",
  "confidence": "high" | "medium" | "low",
  "confidence_note": "one sentence why you are/aren't confident",
  "macros": {
    "calories": <integer>,
    "protein_g": <number>,
    "carbs_g": <number>,
    "fat_g": <number>,
    "fiber_g": <number>,
    "sugar_g": <number>
  },
  "chip_reaction": "hype" | "shocked" | "happy",
  "fun_note": "one funny line max 12 words"
}`;

function parseGeminiResponse(rawText: string): AnalysisResult {
    const cleaned = rawText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
    const startIndex = cleaned.indexOf('{');
    const endIndex = cleaned.lastIndexOf('}');
    const jsonOnly = startIndex >= 0 && endIndex > startIndex
        ? cleaned.slice(startIndex, endIndex + 1)
        : cleaned;
    const parsed = JSON.parse(jsonOnly) as Record<string, unknown>;

    const macros = (parsed.macros as Record<string, unknown>) || {};
    const foodName = typeof parsed.food_name === 'string' ? parsed.food_name : 'Meal';
    const calories = Number(macros.calories) || 0;
    const protein = Number(macros.protein_g) ?? 0;
    const carbs = Number(macros.carbs_g) ?? 0;
    const fat = Number(macros.fat_g) ?? 0;

    return {
        food_name: foodName,
        items_detected: Array.isArray(parsed.items_detected) ? parsed.items_detected as string[] : [],
        portion_size: typeof parsed.portion_size === 'string' ? parsed.portion_size : undefined,
        confidence: ['high', 'medium', 'low'].includes(parsed.confidence as string) ? parsed.confidence as 'high' | 'medium' | 'low' : 'medium',
        confidence_note: typeof parsed.confidence_note === 'string' ? parsed.confidence_note : undefined,
        macros: {
            calories: Math.round(calories),
            protein_g: protein,
            carbs_g: carbs,
            fat_g: fat,
            fiber_g: typeof macros.fiber_g === 'number' ? macros.fiber_g : undefined,
            sugar_g: typeof macros.sugar_g === 'number' ? macros.sugar_g : undefined,
        },
        chip_reaction: ['hype', 'shocked', 'happy'].includes(parsed.chip_reaction as string) ? parsed.chip_reaction as 'hype' | 'shocked' | 'happy' : 'happy',
        fun_note: typeof parsed.fun_note === 'string' ? parsed.fun_note : undefined,
    };
}

// Models available in Google AI Studio (generativelanguage.googleapis.com)
const MODELS = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];

export async function analyzeFood(
    imageBase64: string,
    mediaType: 'image/jpeg' | 'image/png' | 'image/webp',
    portionHint?: string,
    maxRetries = 2
): Promise<AnalysisResult> {
    const startTime = Date.now();
    const isTextOnly = !!portionHint && imageBase64.length < 500;
    console.log("Vision agent called, textOnly:", isTextOnly, "portionHint:", !!portionHint);

    const genAI = getGenAI();
    const userPrompt = `${SYSTEM_PROMPT}

${portionHint ? `User ${isTextOnly ? 'described their meal (no photo)' : 'says'}: "${portionHint}"` : ''}

${isTextOnly ? 'Estimate macros from this description. ' : ''}

${JSON_SCHEMA_PROMPT}`;

    let lastError: Error | null = null;

    for (let modelIdx = 0; modelIdx < MODELS.length; modelIdx++) {
        const modelName = MODELS[modelIdx];
        const model = genAI.getGenerativeModel({ model: modelName });

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const content: Array<{ inlineData?: { data: string; mimeType: string }; text?: string }> = [];
                if (!isTextOnly) {
                    content.push({
                        inlineData: { data: imageBase64, mimeType: mediaType },
                    });
                }
                content.push({ text: userPrompt });

                const result = await model.generateContent(content);
                const rawText = result.response.text();
                if (!rawText || !rawText.trim()) throw new Error('Empty response from model');

                const parsed = parseGeminiResponse(rawText);
                if (!parsed.food_name || parsed.macros.calories <= 0) {
                    throw new Error('Invalid response structure from Gemini');
                }

                logger.info('Food analyzed', {
                    food_name: parsed.food_name,
                    model: modelName,
                    calories: parsed.macros.calories,
                    duration_ms: Date.now() - startTime,
                });
                return parsed;
            } catch (err) {
                lastError = err instanceof Error ? err : new Error(String(err));
                logger.error(`Vision agent ${modelName} attempt ${attempt + 1} failed`, lastError);
                if (attempt < maxRetries) {
                    await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
                }
            }
        }
    }

    throw lastError || new Error('Vision agent failed after all retries');
}
