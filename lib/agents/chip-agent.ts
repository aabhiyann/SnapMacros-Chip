export type ChipEmotion = "happy" | "hype" | "shocked" | "laughing" | "sad" | "on_fire" | "thinking" | "sleepy";

export interface MascotStateParams {
    isAnalyzing?: boolean;
    isRoastTime?: boolean;
    streakDays?: number;
    singleMealCalories?: number;
    missedDays?: number;
    caloriesPercent?: number;
    hourOfDay?: number;
    todayLogsCount?: number;
}

const lines: Record<ChipEmotion, string[]> = {
    happy: ["Ready when you are!", "Snap something tasty!", "Let's go!"],
    thinking: ["Hmm...", "Calculating macros...", "Analyzing..."],
    laughing: ["Haha!", "This is too good.", "Oh boy."],
    on_fire: ["You're on fire!", "Unstoppable!", "Keep it going!"],
    shocked: ["Whoa, that's huge!", "Are you sure?", "That's a lot of calories!"],
    sad: ["Missed you...", "Where have you been?", "Come back!"],
    hype: ["Goal hit!", "Perfect!", "Nailed it!"],
    sleepy: ["Zzz...", "I'm tired.", "Any meals today?"],
};

export function getSpeechLine(emotion: ChipEmotion, lastLine: string | null = null): string {
    const options = lines[emotion] || lines.happy;
    if (!lastLine) return options[0];
    const available = options.filter(line => line !== lastLine);
    return available.length > 0 ? available[0] : options[0];
}

export function getMascotState(params: MascotStateParams): { emotion: ChipEmotion; message: string } {
    const {
        isAnalyzing = false,
        isRoastTime = false,
        streakDays = 0,
        singleMealCalories = 0,
        missedDays = 0,
        caloriesPercent = 0,
        hourOfDay = 12,
        todayLogsCount = 1,
    } = params;

    let emotion: ChipEmotion = "happy";

    if (isAnalyzing) emotion = "thinking";
    else if (isRoastTime) emotion = "laughing";
    else if (streakDays >= 7) emotion = "on_fire";
    else if (singleMealCalories > 900) emotion = "shocked";
    else if (missedDays >= 3) emotion = "sad";
    else if (caloriesPercent >= 90 && caloriesPercent <= 110) emotion = "hype";
    else if (hourOfDay >= 21 && todayLogsCount === 0) emotion = "sleepy";

    return { emotion, message: getSpeechLine(emotion) };
}
