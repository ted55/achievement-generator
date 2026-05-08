import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { invokeClaudeLLM } from "../_core/anthropic-llm";
import {
  getGratitudePrompt,
  getDiaryPrompt,
  getPowerfulPrompt,
  getHealingPrompt,
} from "../lib/prompts";
import {
  validateAchievementStatement,
  attemptFix,
} from "../lib/validate";
import { TRPCError } from "@trpc/server";

const GenerateRequestSchema = z.object({
  goal: z.string().min(1).max(120),
  requiredKws: z.array(z.string()).max(5),
  optionalKws: z.array(z.string()).max(5),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  primaryTone: z.enum(["gratitude", "achievementDiary", "powerful", "healing"]),
});

interface GenerateResponse {
  gratitude: string;
  achievementDiary: string;
  powerful: string;
  healing: string;
  retryCount: number;
  adjustedFlags: {
    gratitude: boolean;
    achievementDiary: boolean;
    powerful: boolean;
    healing: boolean;
  };
}

async function generateWithRetry(
  prompt: string,
  requiredKws: string[],
  maxRetries: number = 3
): Promise<{ text: string; adjusted: boolean; retryCount: number }> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await invokeClaudeLLM({
        messages: [{ role: "user", content: prompt }],
        maxTokens: 1024,
      });

      const textContent = response.content[0];
      if (!textContent || textContent.type !== "text") {
        throw new Error("No text content in Claude response");
      }

      let content = textContent.text;
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch && jsonMatch[1]) content = jsonMatch[1].trim();
      if (!content.trim().startsWith("{")) {
        const objMatch = content.match(/\{[\s\S]*\}/);
        if (objMatch) content = objMatch[0];
      }

      let parsed: { text: string };
      try {
        parsed = JSON.parse(content);
      } catch {
        throw new Error("Invalid JSON response from Claude");
      }

      const text = parsed.text;
      const validation = validateAchievementStatement(text, requiredKws);

      if (validation.isValid) {
        return { text: validation.text, adjusted: false, retryCount: attempt };
      }

      if (attempt === maxRetries) {
        const fixed = attemptFix(text, requiredKws);
        return { text: fixed.text, adjusted: true, retryCount: attempt };
      }
    } catch (error) {
      console.error(`[Achievement] Attempt ${attempt + 1} failed:`, error);
      if (attempt === maxRetries) throw error;
    }
  }
  throw new Error("Failed to generate valid achievement statement");
}

export const achievementRouter = router({
  generate: publicProcedure
    .input(GenerateRequestSchema)
    .mutation(async ({ input }): Promise<GenerateResponse> => {
      const { goal, requiredKws, optionalKws, deadline } = input;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      try {
        // 直列実行（並列だとAPI過負荷になるため）
        const gratitudeResult = await generateWithRetry(getGratitudePrompt(goal, deadline, requiredKws, optionalKws), requiredKws);
        const diaryResult     = await generateWithRetry(getDiaryPrompt(goal, deadline, requiredKws, optionalKws), requiredKws);
        const powerfulResult  = await generateWithRetry(getPowerfulPrompt(goal, deadline, requiredKws, optionalKws), requiredKws);
        const healingResult   = await generateWithRetry(getHealingPrompt(goal, deadline, requiredKws, optionalKws), requiredKws);

        return {
          gratitude: gratitudeResult.text,
          achievementDiary: diaryResult.text,
          powerful: powerfulResult.text,
          healing: healingResult.text,
          retryCount: Math.max(
            gratitudeResult.retryCount,
            diaryResult.retryCount,
            powerfulResult.retryCount,
            healingResult.retryCount
          ),
          adjustedFlags: {
            gratitude: gratitudeResult.adjusted,
            achievementDiary: diaryResult.adjusted,
            powerful: powerfulResult.adjusted,
            healing: healingResult.adjusted,
          },
        };
      } catch (error) {
        console.error("[Achievement] Generation failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "生成に失敗しました。再試行してください。",
          cause: error,
        });
      } finally {
        clearTimeout(timeoutId);
      }
    }),
});
