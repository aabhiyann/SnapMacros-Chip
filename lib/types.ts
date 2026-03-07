export interface AnalysisResult {
    food_name: string;
    items_detected?: string[];
    portion_size?: string;
    confidence: "high" | "medium" | "low";
    confidence_note?: string;
    macros: {
        calories: number;
        protein_g: number;
        carbs_g: number;
        fat_g: number;
        fiber_g?: number;
        sugar_g?: number;
    };
    chip_reaction?: "hype" | "shocked" | "happy";
    fun_note?: string;
}
