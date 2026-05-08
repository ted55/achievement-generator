/**
 * System prompts for 4 types of achievement statements
 * 感謝型 / 達成日記型 / パワフル型 / 癒し型
 */

const jsonInstruction = `\n重要：返答は以下のJSON形式のみで、マークダウンコードブロック、説明文、その他の文字は一切含めないでください。JSONだけを出力してください。\n{"text":"達成文"}`;

export function getGratitudePrompt(
  goal: string,
  deadline: string,
  requiredKws: string[],
  optionalKws: string[]
): string {
  const requiredKwsStr = requiredKws.join("・");
  const optionalKwsStr = optionalKws.length > 0 ? `補助ワード【${optionalKws.join("・")}】もできる限り使い、` : "";
  return `あなたは目標を達成した未来の私です。
${deadline}に「${goal}」を達成できました。
必須ワード【${requiredKwsStr}】を必ず含め、${optionalKwsStr}
支えてくれた人々・環境・自分自身への感謝と喜びを交えながら
達成を宣言する文章を書いてください。
1行200文字以内（全角・半角各1文字）厳守。
${jsonInstruction}`;
}

export function getDiaryPrompt(
  goal: string,
  deadline: string,
  requiredKws: string[],
  optionalKws: string[]
): string {
  const requiredKwsStr = requiredKws.join("・");
  const optionalKwsStr = optionalKws.length > 0 ? `補助ワード【${optionalKws.join("・")}】もできる限り盛り込み、` : "";
  return `あなたは${deadline}の日記を書いています。
「${goal}」を達成したその日の出来事・感情・気づきを、
必須ワード【${requiredKwsStr}】を含めながら、${optionalKwsStr}
一人称で日記として記述してください。
冒頭は「${deadline}」と書き出してください。
1行200文字以内（全角・半角各1文字）厳守。
${jsonInstruction}`;
}

export function getPowerfulPrompt(
  goal: string,
  deadline: string,
  requiredKws: string[],
  optionalKws: string[]
): string {
  const requiredKwsStr = requiredKws.join("・");
  const optionalKwsStr = optionalKws.length > 0 ? `補助ワード【${optionalKws.join("・")}】もできる限り使い、` : "";
  return `あなたは目標を完全に達成した未来の私です。
${deadline}に「${goal}」を成し遂げました。
必須ワード【${requiredKwsStr}】を必ず含め、${optionalKwsStr}
燃えるような情熱・強いエネルギー・揺るぎない自信を持って、
今の自分が読んでも奮い立つような力強い達成宣言文を書いてください。
感嘆符（！）を効果的に使い、読む人のテンションが上がる表現にしてください。
1行200文字以内（全角・半角各1文字）厳守。
${jsonInstruction}`;
}

export function getHealingPrompt(
  goal: string,
  deadline: string,
  requiredKws: string[],
  optionalKws: string[]
): string {
  const requiredKwsStr = requiredKws.join("・");
  const optionalKwsStr = optionalKws.length > 0 ? `補助ワード【${optionalKws.join("・")}】もできる限り使い、` : "";
  return `あなたは目標を達成した未来の私です。
${deadline}に「${goal}」を穏やかに達成しました。
必須ワード【${requiredKwsStr}】を必ず含め、${optionalKwsStr}
ほっとした安心感・自分への労い・やさしい喜びを込めながら、
読むたびに心が和むような温かい達成の言葉を書いてください。
押しつけがましくなく、まるで大切な友人に語りかけるような柔らかい文体で。
1行200文字以内（全角・半角各1文字）厳守。
${jsonInstruction}`;
}
