import { ENV } from "./env";

export type Role = "user" | "model";

export type Message = {
  role: Role;
  parts: Array<{
    text: string;
  }>;
};

export type GenerateContentResponse = {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
  usageMetadata: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
};

const assertApiKey = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
};

export async function invokeGeminiLLM(params: {
  messages: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
  maxTokens?: number;
}): Promise<GenerateContentResponse> {
  assertApiKey();

  // Convert messages to Gemini format
  const contents = params.messages.map((msg) => ({
    role: msg.role === "user" ? "user" : "model",
    parts: [
      {
        text: msg.content,
      },
    ],
  }));

  const payload = {
    contents,
    generationConfig: {
      maxOutputTokens: params.maxTokens || 1024,
      temperature: 1,
      topP: 0.95,
    },
  };

  console.log("[Gemini LLM] Calling Gemini API");
  console.log("[Gemini LLM] Messages count:", contents.length);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  console.log("[Gemini LLM] Response status:", response.status, response.statusText);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[Gemini LLM] Error response:", errorText);
    throw new Error(
      `Gemini API failed: ${response.status} ${response.statusText} – ${errorText}`
    );
  }

  const result = (await response.json()) as GenerateContentResponse;
  console.log("[Gemini LLM] Response received, candidates:", result.candidates.length);
  return result;
}
