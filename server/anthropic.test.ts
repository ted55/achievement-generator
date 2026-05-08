import { describe, expect, it } from "vitest";
import { invokeClaudeLLM } from "./_core/anthropic-llm";

describe("Anthropic Claude SDK Integration", () => {
  it("should successfully call Claude API with Anthropic SDK", async () => {
    const response = await invokeClaudeLLM({
      messages: [
        {
          role: "user",
          content: 'Say "test successful" in JSON format: {"status": "..."}',
        },
      ],
      maxTokens: 256,
    });

    expect(response).toBeDefined();
    expect(response.content).toBeDefined();
    expect(response.content.length).toBeGreaterThan(0);
    expect(response.content[0]?.type).toBe("text");
    if (response.content[0]?.type === "text") {
      expect(response.content[0].text).toBeDefined();
    }
  }, { timeout: 30000 });
});
