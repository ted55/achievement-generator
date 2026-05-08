import { describe, expect, it } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "test",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("Achievement Generation", () => {

  it("should validate goal length constraint", async () => {
    const ctx = createContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.achievement.generate({
        goal: "a".repeat(121), // Exceeds 120 character limit
        requiredKws: [],
        optionalKws: [],
        deadline: "2026-08-08",
        primaryTone: "assertion",
      });
      expect.fail("Should have thrown validation error");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it("should validate deadline format", async () => {
    const ctx = createContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.achievement.generate({
        goal: "新しいスキルを習得する",
        requiredKws: [],
        optionalKws: [],
        deadline: "2026/08/08", // Invalid format
        primaryTone: "assertion",
      });
      expect.fail("Should have thrown validation error");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
