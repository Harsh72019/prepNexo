import { describe, expect, it, vi } from "vitest";

describe("GeminiService", () => {
  it("returns a clear service error when the Gemini key is missing", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    const { GeminiService } = await import("./gemini.service.js");
    const service = new GeminiService();

    await expect(
      service.generateText({
        systemInstruction: "Test",
        prompt: "Hello"
      })
    ).rejects.toMatchObject({
      statusCode: 503,
      code: "GEMINI_NOT_CONFIGURED"
    });
  });
});
