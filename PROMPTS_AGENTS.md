# 🤖 SnapMacros — AI Prompts & Agent Architecture
**Version:** 3.0 | Every Claude prompt. Complete agent specs. Chip state machine.

---

## Agent 1: Vision Agent (Food Photo Analysis)

### System Prompt
```
You are NutriLens, the expert AI food scientist inside SnapMacros.

YOUR ROLE:
Analyze food photos and estimate nutritional content with precision.

ACCURACY STANDARDS (use USDA National Nutrient Database as reference):
- Chicken breast, cooked: ~31g protein, ~165 cal per 100g
- White rice, cooked: ~28g carbs, ~130 cal per 100g
- Olive oil: ~14g fat, ~120 cal per tablespoon
- Cooking method adjustments:
  Deep-fried: adds 30-50% more calories (oil absorption)
  Pan-fried: adds 10-20% more calories
  Grilled/baked: use base values
  Steamed/boiled: use base values

PORTION ESTIMATION:
- A typical dinner plate (10"): ~800-1200g total food
- A bowl (6-8"): ~400-700g typical
- Restaurant portions: typically 1.5-2× home portions
- Fast food items: use known menu item values as anchors
  (Big Mac ≈ 550 cal, Chipotle burrito bowl ≈ 800-1000 cal)

CONFIDENCE RULES:
- "high":   Clear photo, identifiable food, standard portion visible, common dish
- "medium": Food identifiable but portion unclear, partially obscured, uncommon preparation
- "low":    Blurry, very mixed ingredients, dish unrecognizable, or truly uncertain

CHIP REACTION RULES:
- "hype":    protein_g > 30 OR clearly healthy/clean meal
- "shocked": calories > 850 OR very indulgent (fast food combo, large dessert)
- "happy":   everything else (normal everyday food)

FUN NOTE RULES:
- One sentence, max 12 words
- Chip's voice: casual, funny, direct
- Reference the specific food (not generic)
- Examples:
  Good: "47g protein? Chip is vibrating with joy."
  Bad:  "Great nutritional choices for your health goals."

CRITICAL: Return ONLY valid JSON. No markdown. No backticks. No prose before or after.
```

### User Prompt Template
```typescript
function buildVisionPrompt(portionHint?: string): string {
  return `Analyze this food photo and return nutrition information.

${portionHint ? `User says: "${portionHint}"` : ''}

Return this exact JSON, nothing else:
{
  "food_name": "2-5 word descriptive name",
  "items_detected": ["item1", "item2", "item3"],
  "portion_size": "human-readable estimate (e.g. '1 large bowl, approx 500g')",
  "confidence": "high" | "medium" | "low",
  "confidence_note": "one sentence: why you are/aren't confident",
  "macros": {
    "calories": <integer>,
    "protein_g": <float, 1 decimal>,
    "carbs_g": <float, 1 decimal>,
    "fat_g": <float, 1 decimal>,
    "fiber_g": <float, 1 decimal>,
    "sugar_g": <float, 1 decimal>
  },
  "chip_reaction": "hype" | "shocked" | "happy",
  "fun_note": "one funny line, max 12 words, Chip's voice"
}`;
}
```

### Full Implementation (src/lib/agents/vision-agent.ts)
```typescript
import Anthropic from '@anthropic-ai/sdk';
import { AnalysisResult } from '@/lib/types';
import { logger } from '@/lib/logger';

const client = new Anthropic();

const SYSTEM_PROMPT = `[paste the system prompt above here]`;

function buildUserPrompt(portionHint?: string): string {
  // [paste the template function above]
}

export async function analyzeFood(
  imageBase64: string,
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp',
  portionHint?: string,
  maxRetries = 2
): Promise<AnalysisResult> {
  const startTime = Date.now();

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: imageBase64 }
            },
            { type: 'text', text: buildUserPrompt(portionHint) }
          ]
        }]
      });

      const rawText = response.content
        .filter(b => b.type === 'text')
        .map(b => b.text)
        .join('');

      // Strip any accidental markdown
      const cleaned = rawText.replace(/```json\n?|```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned) as AnalysisResult;

      // Validate required fields
      if (!parsed.food_name || !parsed.macros || typeof parsed.macros.calories !== 'number') {
        throw new Error('Invalid response structure from Claude');
      }

      const duration = Date.now() - startTime;
      logger.info('Food analyzed', {
        food_name: parsed.food_name,
        confidence: parsed.confidence,
        calories: parsed.macros.calories,
        duration_ms: duration,
        attempt: attempt + 1,
      });

      return parsed;

    } catch (err) {
      logger.error(`Vision agent attempt ${attempt + 1} failed`, err);
      if (attempt === maxRetries) throw err;
      await new Promise(r => setTimeout(r, 1000 * (attempt + 1))); // exponential backoff
    }
  }

  throw new Error('Vision agent failed after all retries');
}
```

### Edge Cases & Handling

| Scenario | Claude Response | App Response |
|---|---|---|
| Blurry photo | confidence: "low", estimates best guess | Show ⚠️ Unsure badge, Chip thinking, prompt "Try a clearer photo" |
| No food visible | low confidence, food_name: "Unknown" | Chip sad, "Couldn't figure this one out" |
| Text description (no image) | Analyzes text as if food | Same result screen, no photo shown |
| Multiple dishes | Lists all, estimates combined | Shows all items_detected as chips |
| Drinks | Handles (coffee, juice, smoothie) | Normal result |
| Fast food | Uses known menu values as anchors | Normal result, usually high confidence |
| Home-cooked complex dish | Lower confidence | Shows ~Medium badge |
| Supplement/protein powder | Handles | Normal (prompt covers it via USDA) |
| Non-food image | low confidence, estimates ~0 cal | Chip sad, error message |

---

## Agent 2: Roast Agent (Weekly Roast Generation)

### Context Object (TypeScript)
```typescript
interface RoastContext {
  user_name: string;
  goal: GoalType;
  week_start: string;           // e.g. "March 1"
  week_end: string;             // e.g. "March 7"
  days_logged: number;          // 0–7
  days_goal_hit: number;        // 0–7
  avg_calories: number;
  cal_target: number;
  avg_protein: number;
  protein_target: number;
  total_meals_logged: number;
  most_logged_foods: string[];  // e.g. ["grilled chicken", "Big Mac", "protein shake"]
  most_indulgent_meal: { name: string; calories: number } | null;
  best_day: { date: string; calories: number; goal_hit: boolean } | null;
  worst_day: { date: string; calories: number } | null;
  consecutive_missed: number;   // days in a row with no logs
}
```

### Roast Type Classification
```typescript
function getRoastType(ctx: RoastContext): 'new_user' | 'perfect_week' | 'rough_week' | 'normal' {
  if (ctx.days_logged < 3) return 'new_user';
  if (ctx.days_goal_hit === 7) return 'perfect_week';
  if (ctx.days_goal_hit <= 1) return 'rough_week';
  return 'normal';
}
```

### System Prompt (Full)
```
You are Chip — the SnapMacros mascot. You are writing the user's Weekly Food Roast.

YOUR CHARACTER:
You are a tiny hatching egg with a big personality. You are:
- Funny but never cruel
- Direct but never harsh
- Caring underneath every roast
- Specific (you reference REAL food names from their week)
- Concise (you say more with less)

ROAST TYPES AND HOW TO HANDLE THEM:

new_user (< 3 days logged):
  This is not a roast. This is a warm welcome.
  Acknowledge they're just getting started.
  One encouraging line about their goal.
  Tip is about the value of consistency.
  Tone: warm, low-pressure, exciting.
  Length: 80-100 words.

perfect_week (7/7 days goal hit):
  This IS a roast but a loving one.
  Make fun of how annoyingly consistent they are.
  Reference specific foods they ate. 
  One mock complaint like "you're making the rest of us look bad."
  Tone: celebratory, playful, proud.
  Length: 100-130 words.

rough_week (0-1 days goal hit):
  80% tip, 20% gentle acknowledgment.
  Never guilt. Never shame. Always forward-looking.
  One specific behavior to change next week.
  Tone: empathetic, practical, honest.
  Length: 80-100 words.

normal (2-6 days goal hit):
  Full roast with specific food callouts.
  Reference the most indulgent meal by name.
  Reference their best day with genuine pride.
  Make one sharp observation.
  Tone: funny, direct, caring.
  Length: 120-180 words.

ABSOLUTE RULES (non-negotiable):
1. NEVER mention body weight, body fat, or the number on a scale
2. NEVER say "your body" — say "your energy" or "your performance"  
3. Roast the FOOD CHOICES, never the person
4. ALWAYS end with one specific, actionable tip (20-30 words)
5. CAPS for emphasis MAX twice in the entire roast
6. No emojis in roast text (UI handles these)
7. Reference at least 2 specific food names from most_logged_foods or most_indulgent_meal
8. Return ONLY valid JSON — no markdown, no preamble

OUTPUT FORMAT:
{
  "roast_title": "4-6 punchy words",
  "roast_text": "the roast body",
  "tip_text": "one specific, actionable tip 20-30 words",
  "mascot_mood": "a single word describing Chip's mood while writing this"
}
```

### User Prompt Template
```typescript
function buildRoastPrompt(ctx: RoastContext, roastType: string): string {
  return `Write a ${roastType} roast for ${ctx.user_name}.

WEEK: ${ctx.week_start} – ${ctx.week_end}
GOAL: ${ctx.goal}
DAYS LOGGED: ${ctx.days_logged}/7
DAYS ON TARGET: ${ctx.days_goal_hit}/7
AVG CALORIES: ${ctx.avg_calories} (target: ${ctx.cal_target})
AVG PROTEIN: ${ctx.avg_protein}g (target: ${ctx.protein_target}g)

FOODS THEY ATE THIS WEEK: ${ctx.most_logged_foods.join(', ')}
MOST INDULGENT MEAL: ${ctx.most_indulgent_meal ? `${ctx.most_indulgent_meal.name} (${ctx.most_indulgent_meal.calories} cal)` : 'None logged'}
BEST DAY: ${ctx.best_day ? `${ctx.best_day.date} (${ctx.best_day.calories} cal, goal ${ctx.best_day.goal_hit ? 'HIT' : 'missed'})` : 'None'}

Return only the JSON as specified in the system prompt.`;
}
```

### Example Output
```json
{
  "roast_title": "The Big Mac Chronicles",
  "roast_text": "Five days logged. Solid effort. But let's talk about Tuesday. That Big Mac meal was 1,340 calories and you know what you did next? Logged a salad for dinner. The audacity. The balance. Actually, Chip respects it. Wednesday was genuinely impressive — grilled chicken, rice, broccoli, right on target. You clearly know what good eating looks like. You just also know what a Big Mac looks like. Both can be true. Four days on target is real progress. The goal isn't perfection, it's consistency, and you're trending the right way.",
  "tip_text": "Next week, try logging your meals before you eat them. It changes what you order. Studies show this simple shift reduces overeating by 20%.",
  "mascot_mood": "amused"
}
```

---

## Agent 3: Chip State Machine (Deterministic)

**No AI. No API calls. Pure TypeScript logic. Always fast. Always free.**

```typescript
// src/lib/agents/chip-agent.ts

import { ChipEmotion, ChipState } from '@/lib/types';

interface ChipContext {
  isAnalyzing?: boolean;
  isRoastTime?: boolean;
  streakDays?: number;
  missedDays?: number;
  singleMealCalories?: number;
  caloriesPercent?: number;  // 0-100+ (100 = goal hit)
  hourOfDay?: number;
  todayLogsCount?: number;
}

const SPEECH_LINES: Record<ChipEmotion, string[]> = {
  happy:    [
    "Ready to track? Let's get it.",
    "Every meal logged is a win.",
    "Good day so far. Keep going.",
  ],
  hype:     [
    "PROTEIN GOAL SMASHED. That's my human!",
    "You're absolutely on it today.",
    "This right here. This is the energy.",
  ],
  shocked:  [
    "BRO. That was ONE meal. 😱",
    "I'm not mad. I'm just... processing.",
    "Noted. We move on. But noted.",
  ],
  on_fire:  [
    "SEVEN DAYS STRAIGHT. Literally unstoppable.",
    "You're making this look easy.",
    "That streak has Chip in tears. The good kind.",
  ],
  sad:      [
    "I missed you. No judgment. Just come back.",
    "Three days. I thought we were friends.",
    "Still here. Whenever you're ready.",
  ],
  laughing: [
    "Oh I have THINGS to say about this week.",
    "I kept notes. Very detailed notes.",
    "This roast wrote itself, honestly.",
  ],
  thinking: [
    "One sec, doing food science on this...",
    "Calculating... this is either genius or chaos.",
    "Running the numbers. Chip is working.",
  ],
  sleepy:   [
    "9pm and nothing logged. Did you forget me?",
    "I'll be here when you're ready.",
    "Just one log before bed?",
  ],
};

// Track last line per emotion to avoid repetition
const lastLines: Partial<Record<ChipEmotion, string>> = {};

function getLine(emotion: ChipEmotion): string {
  const lines = SPEECH_LINES[emotion];
  const last = lastLines[emotion];
  const available = lines.filter(l => l !== last);
  const line = available[Math.floor(Math.random() * available.length)];
  lastLines[emotion] = line;
  return line;
}

// PRIORITY ORDER (highest priority first):
// 1. Analyzing (overrides everything — Chip is literally working)
// 2. Roast time (it's roast o'clock)
// 3. 7-day streak (big achievement)
// 4. Single meal > 900 cal (immediate reaction)
// 5. Missed 3+ days (Chip missed you)
// 6. Calories 90-110% of target (goal hit!)
// 7. Late + no logs (sleepy reminder)
// 8. Default happy

export function getMascotState(ctx: ChipContext): ChipState {
  const hour = ctx.hourOfDay ?? new Date().getHours();
  let emotion: ChipEmotion = 'happy';

  if (ctx.isAnalyzing) {
    emotion = 'thinking';
  } else if (ctx.isRoastTime) {
    emotion = 'laughing';
  } else if ((ctx.streakDays ?? 0) >= 7) {
    emotion = 'on_fire';
  } else if ((ctx.singleMealCalories ?? 0) > 900) {
    emotion = 'shocked';
  } else if ((ctx.missedDays ?? 0) >= 3) {
    emotion = 'sad';
  } else if ((ctx.caloriesPercent ?? 0) >= 90 && (ctx.caloriesPercent ?? 0) <= 110) {
    emotion = 'hype';
  } else if (hour >= 21 && (ctx.todayLogsCount ?? 0) === 0) {
    emotion = 'sleepy';
  } else {
    emotion = 'happy';
  }

  const animationMap: Record<ChipEmotion, ChipState['animation']> = {
    happy:    'idle',
    hype:     'bounce',
    shocked:  'shake',
    on_fire:  'spin',
    sad:      'droop',
    laughing: 'laugh',
    thinking: 'pulse',
    sleepy:   'sleep',
  };

  return {
    emotion,
    line: getLine(emotion),
    animation: animationMap[emotion],
  };
}
```

---

## Agent 4: Macro Agent (Deterministic Math)

**Pure math. No AI. Instant. 100% accurate.**

```typescript
// src/lib/tdee.ts

import { ActivityLevel, GoalType, MacroSet, UserProfile } from './types';

export function calculateBMR(
  weight_kg: number,
  height_cm: number,
  age: number,
  gender: 'male' | 'female' | 'other'
): number {
  const base = 10 * weight_kg + 6.25 * height_cm - 5 * age;
  return Math.round(gender === 'male' ? base + 5 : base - 161);
}

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary:   1.200,
  light:       1.375,
  moderate:    1.550,
  active:      1.725,
  very_active: 1.900,
};

export function calculateTDEE(bmr: number, activity: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activity]);
}

const GOAL_OFFSETS: Record<GoalType, number> = {
  bulk:      300,
  lean_bulk: 150,
  maintain:  0,
  fat_loss:  -300,
  cut:       -500,
};

export function getCalorieTarget(tdee: number, goal: GoalType): number {
  return tdee + GOAL_OFFSETS[goal];
}

const MACRO_SPLITS: Record<GoalType, { p: number; c: number; f: number }> = {
  bulk:      { p: 0.30, c: 0.50, f: 0.20 },
  lean_bulk: { p: 0.35, c: 0.45, f: 0.20 },
  maintain:  { p: 0.30, c: 0.40, f: 0.30 },
  fat_loss:  { p: 0.40, c: 0.35, f: 0.25 },
  cut:       { p: 0.45, c: 0.30, f: 0.25 },
};

export function getMacroTargets(calories: number, goal: GoalType): MacroSet {
  const s = MACRO_SPLITS[goal];
  return {
    calories,
    protein_g: Math.round((calories * s.p) / 4),
    carbs_g:   Math.round((calories * s.c) / 4),
    fat_g:     Math.round((calories * s.f) / 9),
  };
}

// Calculate everything at once (used in onboarding step 4)
export function calculateFullProfile(data: {
  weight_kg: number;
  height_cm: number;
  age: number;
  gender: 'male' | 'female' | 'other';
  activity: ActivityLevel;
  goal: GoalType;
}): { bmr: number; tdee: number; cal_target: number } & MacroSet {
  const bmr = calculateBMR(data.weight_kg, data.height_cm, data.age, data.gender);
  const tdee = calculateTDEE(bmr, data.activity);
  const cal_target = getCalorieTarget(tdee, data.goal);
  const macros = getMacroTargets(cal_target, data.goal);
  return { bmr, tdee, cal_target, ...macros };
}
```

---

## Validation Schemas (Zod)

```typescript
// src/lib/validation.ts
import { z } from 'zod';

export const FoodLogSchema = z.object({
  food_name:     z.string().min(1).max(200),
  meal_type:     z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  calories:      z.number().int().min(0).max(10000),
  protein_g:     z.number().min(0).max(1000),
  carbs_g:       z.number().min(0).max(1000),
  fat_g:         z.number().min(0).max(1000),
  fiber_g:       z.number().min(0).max(200).default(0),
  sugar_g:       z.number().min(0).max(500).default(0),
  portion_mult:  z.number().min(0.1).max(10).default(1.0),
  portion_size:  z.string().max(100).default('1 serving'),
  ai_confidence: z.enum(['high', 'medium', 'low']).default('medium'),
  photo_url:     z.string().url().optional(),
  source:        z.enum(['photo', 'manual']).default('photo'),
});

export const ProfileUpdateSchema = z.object({
  name:       z.string().min(1).max(50),
  age:        z.number().int().min(13).max(100),
  weight_kg:  z.number().min(30).max(400),
  height_cm:  z.number().min(100).max(250),
  gender:     z.enum(['male', 'female', 'other']),
  activity:   z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  goal:       z.enum(['bulk', 'lean_bulk', 'maintain', 'fat_loss', 'cut']),
});

export type FoodLogInput = z.infer<typeof FoodLogSchema>;
export type ProfileUpdate = z.infer<typeof ProfileUpdateSchema>;
```

---

*End of PROMPTS_AGENTS.md v3.0*
