import { GoogleGenerativeAI } from '@google/generative-ai';
import { AnalysisResult } from '@/lib/types';
import { logger } from '@/lib/logger';

function getGenAI() {
    const key = process.env.GOOGLE_AI_API_KEY;
    if (!key) throw new Error("Missing GOOGLE_AI_API_KEY environment variable. Add it to .env.local");
    return new GoogleGenerativeAI(key);
}

const SYSTEM_PROMPT = `You are NutriLens, an expert food scientist inside SnapMacros.

Analyze food photos and estimate nutritional content with precision.

ACCURACY STANDARDS (use USDA National Nutrient Database as reference):
- Chicken breast, cooked: ~31g protein, ~165 cal per 100g
- White rice, cooked: ~28g carbs, ~130 cal per 100g
- Olive oil: ~14g fat, ~120 cal per tablespoon
- Deep-fried food: adds 30-50% more calories
- Restaurant portions: typically 1.5-2x home portions
- Fast food: use known values (Big Mac ≈ 550 cal, Chipotle bowl ≈ 800-1000 cal)

CONFIDENCE RULES:
- "high":   Clear photo, identifiable food, standard portion
- "medium": Food identifiable but portion unclear or uncommon prep
- "low":    Blurry, very mixed, or unrecognizable

CHIP REACTION RULES:
- "hype":    protein_g > 30 OR clearly healthy/clean meal
- "shocked": calories > 850 OR very indulgent meal
- "happy":   everything else

FUN NOTE: One sentence, max 12 words, Chip's voice, casual and funny, references specific food.

CRITICAL: Return ONLY valid JSON. No markdown. No backticks. No prose.`;

export async function analyzeFood(
    imageBase64: string,
    mediaType: 'image/jpeg' | 'image/png' | 'image/webp',
    portionHint?: string,
    maxRetries = 2
): Promise<AnalysisResult> {
    const startTime = Date.now();
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const userPrompt = `${SYSTEM_PROMPT}

${portionHint ? `User says: "${portionHint}"` : ''}

Analyze this food and return ONLY this JSON, nothing else:
{
  "food_name": "2-5 word descriptive name",
  "items_detected": ["item1", "item2", "item3"],
  "portion_size": "human-readable estimate",
  "confidence": "high" | "medium" | "low",
  "confidence_note": "one sentence why you are/aren't confident",
  "macros": {
    "calories": <integer>,
    "protein_g": <float 1 decimal>,
    "carbs_g": <float 1 decimal>,
    "fat_g": <float 1 decimal>,
    "fiber_g": <float 1 decimal>,
    "sugar_g": <float 1 decimal>
  },
  "chip_reaction": "hype" | "shocked" | "happy",
  "fun_note": "one funny line max 12 words"
}`;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const result = await model.generateContent([
                {
                    inlineData: {
                        data: imageBase64,
                        mimeType: mediaType,
                    },
                },
                { text: userPrompt },
            ]);

            const rawText = result.response.text();
            const cleaned = rawText.replace(/```json\n?|```\n?/g, '').trim();
            const parsed = JSON.parse(cleaned) as AnalysisResult;

            if (!parsed.food_name || !parsed.macros || typeof parsed.macros.calories !== 'number') {
                throw new Error('Invalid response structure from Gemini');
            }

            logger.info('Food analyzed', {
                food_name: parsed.food_name,
                confidence: parsed.confidence,
                calories: parsed.macros.calories,
                duration_ms: Date.now() - startTime,
                attempt: attempt + 1,
            });

            return parsed;

        } catch (err) {
            logger.error(`Vision agent attempt ${attempt + 1} failed`, err);
            if (attempt === maxRetries) throw err;
            await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        }
    }

    throw new Error('Vision agent failed after all retries');
}
