import type { ChipContext, ChipState, ChipEmotion } from "@/lib/types";
import { CHIP_EMOTION_CONFIGS } from "@/components/chip/chip-states";

const SPEECH_LINES: Record<ChipEmotion, [string, string, string]> = {
  happy: ["Ready when you are!", "Snap something tasty!", "Let's go!"],
  hype: ["You're crushing it!", "So close to your goal!", "Yes! Yes! Yes!"],
  shocked: ["Whoa!", "That's a lot!", "No way!"],
  laughing: ["That's hilarious!", "I can't even!", "Haha!"],
  sad: ["Tomorrow's a new day.", "It's okay, we all slip.", "I believe in you."],
  on_fire: ["Unstoppable!", "Seven days strong!", "Legend!"],
  thinking: ["Let me think...", "Hmm...", "One sec..."],
  sleepy: ["Zzz...", "Past my bedtime.", "So tired..."],
};

/**
 * Resolves mascot emotion and optional message from app context.
 * Priority order (first match wins).
 */
export function getMascotState(context: ChipContext): ChipState {
  const emotion = resolveEmotion(context);
  const message = getSpeechLine(emotion);
  return { emotion, message };
}

function resolveEmotion(context: ChipContext): ChipEmotion {
  if (context.isAnalyzing === true) return "thinking";
  if (context.isRoastTime === true) return "laughing";
  if (typeof context.streakDays === "number" && context.streakDays >= 7) return "on_fire";
  if (typeof context.singleMealCalories === "number" && context.singleMealCalories > 900)
    return "shocked";
  if (typeof context.missedDays === "number" && context.missedDays >= 3) return "sad";
  if (
    typeof context.caloriesPercent === "number" &&
    context.caloriesPercent >= 90 &&
    context.caloriesPercent <= 110
  )
    return "hype";
  if (
    typeof context.hourOfDay === "number" &&
    context.hourOfDay >= 21 &&
    typeof context.todayLogsCount === "number" &&
    context.todayLogsCount === 0
  )
    return "sleepy";
  return "happy";
}

let lastSpeechLine: string | null = null;

/**
 * Returns a random speech line for the emotion. Avoids repeating the last line.
 */
export function getSpeechLine(emotion: ChipEmotion, lastLine?: string | null): string {
  const pool = SPEECH_LINES[emotion];
  const avoid = lastLine ?? lastSpeechLine;
  const other =
    avoid && pool.includes(avoid) ? pool.filter((s) => s !== avoid) : [...pool];
  const chosen = other[Math.floor(Math.random() * other.length)]!;
  lastSpeechLine = chosen;
  return chosen;
}

/**
 * Get the default line for an emotion (from chip-states). Use when you don't need randomization.
 */
export function getDefaultLine(emotion: ChipEmotion): string {
  return CHIP_EMOTION_CONFIGS[emotion].defaultLine;
}
