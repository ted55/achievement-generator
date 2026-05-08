import { ENV } from "./env";

export type Role = "user" | "assistant";

export type Message = {
  role: Role;
  content: string;
};

export type InvokeResult = {
  id: string;
  type: string;
  role: "assistant";
  content: Array<{
    type: "text";
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
  if (!ENV.forgeApiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }
};

export async function invokeClaudeLLM(params: {
  messages: Message[];
  maxTokens?: number;
}): Promise<InvokeResult> {
  assertApiKey();

  const payload = {
    model: "claude-3-5-haiku-20241022",
    max_tokens: params.maxTokens || 1024,
    messages: params.messages,
  };

  console.log("[Claude LLM] Calling Claude API with model:", payload.model);
  console.log("[Claude LLM] Messages:", JSON.stringify(payload.messages).substring(0, 200));

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": ENV.forgeApiKey,
      "anthropic-version": "2023-06-01",
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

  const result = (await response.json()) as InvokeResult;
  console.log("[Claude LLM] Response received, content length:", result.content[0]?.text.length);
  return result;
}
