import { describe, expect, it } from "vitest";
import {
  countChars,
  validateLines,
  validateKeywords,
  trimToLimit,
  validateAchievementStatement,
  attemptFix,
} from "./validate";

describe("Character Counting", () => {
  it("should count ASCII characters correctly", () => {
    expect(countChars("hello")).toBe(5);
  });

  it("should count Japanese characters correctly", () => {
    expect(countChars("こんにちは")).toBe(5);
  });

  it("should count emoji as single character", () => {
    const emojiCount = countChars("😀");
    expect(emojiCount).toBeGreaterThanOrEqual(1);
  });

  it("should count mixed content correctly", () => {
    expect(countChars("hello😀こんにちは")).toBe(11);
  });
});

describe("Line Validation", () => {
  it("should validate single line within limit", () => {
    expect(validateLines("a".repeat(200))).toBe(true);
  });

  it("should reject single line exceeding limit", () => {
    expect(validateLines("a".repeat(201))).toBe(false);
  });

  it("should validate multiple lines all within limit", () => {
    expect(validateLines("a".repeat(100) + "\n" + "b".repeat(100))).toBe(true);
  });

  it("should reject if any line exceeds limit", () => {
    expect(validateLines("a".repeat(100) + "\n" + "b".repeat(201))).toBe(false);
  });
});

describe("Keyword Validation", () => {
  it("should validate when all keywords are present", () => {
    const text = "私は英語を話せるようになった。";
    expect(validateKeywords(text, ["英語", "話せる"])).toBe(true);
  });

  it("should reject when keyword is missing", () => {
    const text = "私は日本語を話せるようになった。";
    expect(validateKeywords(text, ["英語", "話せる"])).toBe(false);
  });

  it("should handle empty keyword array", () => {
    expect(validateKeywords("any text", [])).toBe(true);
  });
});

describe("Text Trimming", () => {
  it("should not trim text within limit", () => {
    const text = "a".repeat(100);
    expect(trimToLimit(text)).toBe(text);
  });

  it("should trim text exceeding limit", () => {
    const text = "a".repeat(250);
    const trimmed = trimToLimit(text);
    expect(countChars(trimmed)).toBeLessThanOrEqual(200);
  });

  it("should trim at sentence ending if available", () => {
    const text = "これは最初の文です。これは2番目の文です。" + "a".repeat(300);
    const trimmed = trimToLimit(text);
    expect(trimmed.endsWith("。")).toBe(true);
    expect(countChars(trimmed)).toBeLessThanOrEqual(200);
  });

  it("should handle multiple sentence endings", () => {
    const text = "質問ですか？はい、そうです。" + "a".repeat(300);
    const trimmed = trimToLimit(text);
    expect(countChars(trimmed)).toBeLessThanOrEqual(200);
  });
});

describe("Statement Validation", () => {
  it("should validate correct statement", () => {
    const text = "私は2026年8月8日に英語を話せるようになった。";
    const result = validateAchievementStatement(text, ["英語"]);
    expect(result.isValid).toBe(true);
    expect(result.trimmed).toBe(false);
  });

  it("should reject statement with missing keyword", () => {
    const text = "私は2026年8月8日に日本語を話せるようになった。";
    const result = validateAchievementStatement(text, ["英語"]);
    expect(result.isValid).toBe(false);
  });

  it("should reject statement exceeding line limit", () => {
    const text = "a".repeat(250);
    const result = validateAchievementStatement(text, []);
    expect(result.isValid).toBe(false);
  });
});

describe("Attempt Fix", () => {
  it("should fix by trimming when keywords are preserved", () => {
    const text = "私は英語を話せるようになった。" + "a".repeat(300);
    const result = attemptFix(text, ["英語"]);
    expect(result.success).toBe(true);
    expect(countChars(result.text)).toBeLessThanOrEqual(200);
  });

  it("should return trimmed text even if keywords are lost", () => {
    const text = "a".repeat(250);
    const result = attemptFix(text, ["英語"]);
    expect(result.success).toBe(false);
    expect(countChars(result.text)).toBeLessThanOrEqual(200);
  });
});
