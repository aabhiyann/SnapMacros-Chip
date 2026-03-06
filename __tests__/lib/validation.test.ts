import { z } from "zod";

describe("Zod validation patterns", () => {
  const analyzeBodySchema = z.object({
    imageBase64: z.string().min(1),
    mediaType: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif"]).optional().default("image/jpeg"),
  });

  it("accepts valid analyze body", () => {
    const result = analyzeBodySchema.safeParse({
      imageBase64: "base64data...",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.mediaType).toBe("image/jpeg");
    }
  });

  it("rejects empty imageBase64", () => {
    const result = analyzeBodySchema.safeParse({
      imageBase64: "",
    });
    expect(result.success).toBe(false);
  });

  it("accepts explicit mediaType", () => {
    const result = analyzeBodySchema.safeParse({
      imageBase64: "data",
      mediaType: "image/png",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.mediaType).toBe("image/png");
    }
  });
});
