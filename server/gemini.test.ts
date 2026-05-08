import { describe, expect, it } from "vitest";
import { invokeGeminiLLM } from "./_core/gemini-llm";

describe("Gemini API Integration", () => {
  it("should successfully call Gemini API with valid key", async () => {
    const response = await invokeGeminiLLM({
      messages: [
        {
          role: "user",
          content: 'Say "test successful" in JSON format: {"status": "..."}',
        },
      ],
      maxTokens: 256,
    });

    expect(response).toBeDefined();
    expect(response.candidates).toBeDefined();
    expect(response.candidates.length).toBeGreaterThan(0);
    expect(response.candidates[0]?.content.parts[0]?.text).toBeDefined();
  }, { timeout: 30000 });
});
