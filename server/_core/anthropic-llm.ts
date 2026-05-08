/**
 * Anthropic Claude API wrapper using official SDK
 * モデル: claude-haiku-4-5-20251001 (Claude Haiku 3.5)
 */
import Anthropic from "@anthropic-ai/sdk";

const assertApiKey = () => {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY が設定されていません。" +
      ".env ファイルに ANTHROPIC_API_KEY=sk-ant-... を設定してください。"
    );
  }
};

export async function invokeClaudeLLM(params: {
  messages: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
  maxTokens?: number;
}): Promise<Anthropic.Message> {
  assertApiKey();

  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const model = "claude-haiku-4-5-20251001";
  console.log("[Anthropic LLM] model:", model);

  const message = await client.messages.create({
    model,
    max_tokens: params.maxTokens ?? 1024,
    messages: params.messages,
  });

  console.log("[Anthropic LLM] stop_reason:", message.stop_reason);
  return message;
}
