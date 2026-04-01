import { analyzeFood } from "@/lib/agents/vision-agent";

// Mock the Google Generative AI SDK
const mockGenerateContent = jest.fn();
const mockGetGenerativeModel = jest.fn(() => ({
    generateContent: mockGenerateContent,
}));

jest.mock("@google/generative-ai", () => ({
    GoogleGenerativeAI: jest.fn(() => ({
        getGenerativeModel: mockGetGenerativeModel,
    })),
}));

// Mock logger to avoid noise
jest.mock("@/lib/logger", () => ({
    logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

const VALID_RESPONSE = {
    food_name: "Grilled Chicken Salad",
    items_detected: ["chicken breast", "lettuce", "tomato"],
    portion_size: "1 large plate (~400g)",
    confidence: "high",
    confidence_note: "Clear photo, identifiable protein and vegetables",
    macros: {
        calories: 420,
        protein_g: 38,
        carbs_g: 18,
        fat_g: 14,
        fiber_g: 4,
        sugar_g: 6,
    },
    chip_reaction: "hype",
    fun_note: "That chicken is basically a gym membership on a plate!",
};

function mockResponse(text: string) {
    mockGenerateContent.mockResolvedValueOnce({
        response: { text: () => text },
    });
}

beforeEach(() => {
    jest.clearAllMocks();
    process.env.GOOGLE_AI_API_KEY = "test-key";
    process.env.GEMINI_MODEL = "gemini-1.5-pro"; // pin to single model for tests
});

describe("analyzeFood — JSON parsing robustness", () => {
    it("parses clean JSON response correctly", async () => {
        mockResponse(JSON.stringify(VALID_RESPONSE));
        const result = await analyzeFood("base64data", "image/jpeg");
        expect(result.food_name).toBe("Grilled Chicken Salad");
        expect(result.macros.calories).toBe(420);
        expect(result.macros.protein_g).toBe(38);
        expect(result.confidence).toBe("high");
        expect(result.chip_reaction).toBe("hype");
    });

    it("strips markdown code fences from response", async () => {
        mockResponse("```json\n" + JSON.stringify(VALID_RESPONSE) + "\n```");
        const result = await analyzeFood("base64data", "image/jpeg");
        expect(result.food_name).toBe("Grilled Chicken Salad");
        expect(result.macros.calories).toBe(420);
    });

    it("extracts JSON when surrounded by prose text", async () => {
        mockResponse(
            "Here is the nutritional breakdown:\n" +
                JSON.stringify(VALID_RESPONSE) +
                "\nHope this helps!"
        );
        const result = await analyzeFood("base64data", "image/jpeg");
        expect(result.food_name).toBe("Grilled Chicken Salad");
    });

    it("defaults confidence to medium for unknown confidence value", async () => {
        mockResponse(
            JSON.stringify({ ...VALID_RESPONSE, confidence: "unknown_value" })
        );
        const result = await analyzeFood("base64data", "image/jpeg");
        expect(result.confidence).toBe("medium");
    });

    it("defaults chip_reaction to happy for unknown reaction value", async () => {
        mockResponse(
            JSON.stringify({ ...VALID_RESPONSE, chip_reaction: "sad" })
        );
        const result = await analyzeFood("base64data", "image/jpeg");
        expect(result.chip_reaction).toBe("happy");
    });

    it("defaults food_name to Meal when missing", async () => {
        const { food_name: _, ...noName } = VALID_RESPONSE;
        mockResponse(JSON.stringify(noName));
        // calories still > 0 so won't throw
        const result = await analyzeFood("base64data", "image/jpeg");
        expect(result.food_name).toBe("Meal");
    });

    it("rounds calories to integer", async () => {
        mockResponse(
            JSON.stringify({
                ...VALID_RESPONSE,
                macros: { ...VALID_RESPONSE.macros, calories: 420.7 },
            })
        );
        const result = await analyzeFood("base64data", "image/jpeg");
        expect(result.macros.calories).toBe(421);
    });
});

describe("analyzeFood — model fallback logic", () => {
    beforeEach(() => {
        // Remove pinned model so fallback chain is used
        delete process.env.GEMINI_MODEL;
    });

    it("falls back to next model on 404 error", async () => {
        // First model returns 404
        mockGenerateContent
            .mockRejectedValueOnce(new Error("404 Model not found"))
            // Second model succeeds
            .mockResolvedValueOnce({
                response: { text: () => JSON.stringify(VALID_RESPONSE) },
            });

        const result = await analyzeFood("base64data", "image/jpeg", undefined, 0);
        expect(result.food_name).toBe("Grilled Chicken Salad");
        // getGenerativeModel called twice (once per model tried)
        expect(mockGetGenerativeModel).toHaveBeenCalledTimes(2);
    });

    it("throws after all models fail with 404", async () => {
        // All models return 404
        mockGenerateContent.mockRejectedValue(new Error("404 Not Found"));
        await expect(
            analyzeFood("base64data", "image/jpeg", undefined, 0)
        ).rejects.toThrow();
    });

    it("retries same model on non-404 error (up to maxRetries)", async () => {
        process.env.GEMINI_MODEL = "gemini-1.5-pro";
        mockGenerateContent
            .mockRejectedValueOnce(new Error("500 Internal Server Error"))
            .mockResolvedValueOnce({
                response: { text: () => JSON.stringify(VALID_RESPONSE) },
            });

        const result = await analyzeFood("base64data", "image/jpeg", undefined, 1);
        expect(result.food_name).toBe("Grilled Chicken Salad");
        expect(mockGenerateContent).toHaveBeenCalledTimes(2);
    });
});

describe("analyzeFood — text-only mode", () => {
    it("uses text-only path when imageBase64 is short and portionHint provided", async () => {
        process.env.GEMINI_MODEL = "gemini-1.5-pro";
        mockResponse(JSON.stringify(VALID_RESPONSE));

        const result = await analyzeFood("short", "image/jpeg", "oatmeal with banana");
        expect(result.food_name).toBe("Grilled Chicken Salad");

        // In text-only mode, content should NOT include inlineData
        const callArgs = mockGenerateContent.mock.calls[0][0] as Array<{ text?: string; inlineData?: object }>;
        const hasImagePart = callArgs.some((part) => "inlineData" in part);
        expect(hasImagePart).toBe(false);
    });
});
