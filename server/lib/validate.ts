/**
 * Validation utilities for achievement statements
 */

/**
 * Count characters in a string (emoji counts as 1 character)
 */
export function countChars(str: string): number {
  return Array.from(str).length;
}

/**
 * Validate that all lines are within 200 character limit
 */
export function validateLines(text: string): boolean {
  return text.split("\n").every((line) => countChars(line) <= 200);
}

/**
 * Check if all required keywords are included in the text
 */
export function validateKeywords(text: string, kws: string[]): boolean {
  return kws.every((kw) => text.includes(kw));
}

/**
 * Trim text to fit within 200 characters, preserving sentence endings
 */
export function trimToLimit(text: string): string {
  if (countChars(text) <= 200) {
    return text;
  }

  // Try to find a sentence ending (。！？) within the 200 character limit
  let trimmed = Array.from(text).slice(0, 200).join("");

  // Look for sentence endings from the end
  const sentenceEndings = ["。", "！", "？"];
  let lastEndingIndex = -1;

  for (const ending of sentenceEndings) {
    const index = trimmed.lastIndexOf(ending);
    if (index > lastEndingIndex) {
      lastEndingIndex = index;
    }
  }

  // If found a sentence ending, trim to that point (inclusive)
  if (lastEndingIndex !== -1) {
    return trimmed.substring(0, lastEndingIndex + 1);
  }

  // Otherwise, just return the 200 character limit
  return trimmed;
}

/**
 * Validate and potentially trim achievement statement
 * Returns { isValid: boolean, text: string, trimmed: boolean }
 */
export function validateAchievementStatement(
  text: string,
  requiredKws: string[]
): {
  isValid: boolean;
  text: string;
  trimmed: boolean;
} {
  // Check line length
  if (!validateLines(text)) {
    return { isValid: false, text, trimmed: false };
  }

  // Check required keywords
  if (!validateKeywords(text, requiredKws)) {
    return { isValid: false, text, trimmed: false };
  }

  return { isValid: true, text, trimmed: false };
}

/**
 * Attempt to fix a failed statement by trimming
 */
export function attemptFix(
  text: string,
  requiredKws: string[]
): {
  success: boolean;
  text: string;
} {
  const trimmed = trimToLimit(text);

  // Check if trimmed version still contains all required keywords
  if (validateKeywords(trimmed, requiredKws)) {
    return { success: true, text: trimmed };
  }

  // If not, return the trimmed version anyway (best effort)
  return { success: false, text: trimmed };
}
