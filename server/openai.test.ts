import { describe, expect, it } from "vitest";
import { invokeLLM } from "./_core/llm";

describe("OpenAI API Integration", () => {
  it("should successfully call OpenAI API with valid key", async () => {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant.",
        },
        {
          role: "user",
          content: "Say 'test successful' in JSON format: {\"status\": \"...\"}",
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "test_response",
          strict: true,
          schema: {
            type: "object",
            properties: {
              status: { type: "string" },
            },
            required: ["status"],
            additionalProperties: false,
          },
        },
      },
    });

    expect(response).toBeDefined();
    expect(response.choices).toBeDefined();
    expect(response.choices.length).toBeGreaterThan(0);
    expect(response.choices[0]?.message.content).toBeDefined();
  }, { timeout: 30000 });
});
