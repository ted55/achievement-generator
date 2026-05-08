/**
 * Claude API wrapper using Anthropic SDK
 */

export type Message = {
  role: "user" | "assistant";
  content: string;
};

export type ClaudeResponse = {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  model: string;
  stop_reason: string;
  stop_sequence: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
};

const assertApiKey = () => {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }
};

export async function invokeClaudeLLM(params: {
  messages: Message[];
  maxTokens?: number;
}): Promise<ClaudeResponse> {
  assertApiKey();

  const payload = {
    model: "claude-3-5-haiku-20241022",
    max_tokens: params.maxTokens || 1024,
    messages: params.messages,
  };

  console.log("[Claude LLM] Calling Claude API with model:", payload.model);
  console.log("[Claude LLM] Messages count:", params.messages.length);

  const apiKey = process.env.ANTHROPIC_API_KEY || "";
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  console.log("[Claude LLM] Response status:", response.status, response.statusText);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[Claude LLM] Error response:", errorText);
    throw new Error(
      `Claude API failed: ${response.status} ${response.statusText} – ${errorText}`
    );
  }

  const result = (await response.json()) as ClaudeResponse;
  console.log("[Claude LLM] Response received, content parts:", result.content.length);
  return result;
}
