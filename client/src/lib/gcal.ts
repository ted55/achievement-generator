/**
 * Google Calendar URL generation utilities (client-side)
 * 押下時刻を15分刻みに切り上げて、30分のイベントとして登録する
 */

/** 現在時刻を15分刻みに切り上げる */
function getNextQuarterHour(): { hours: number; minutes: number } {
  const now = new Date();
  const m = now.getMinutes();
  const roundedM = Math.ceil(m / 15) * 15;

  if (roundedM >= 60) {
    return { hours: now.getHours() + 1, minutes: 0 };
  }
  return { hours: now.getHours(), minutes: roundedM };
}

/** 数値を2桁ゼロ埋め */
function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function generateGoogleCalendarUrl(text: string, date: string): string {
  const d = date.replace(/-/g, "");

  // 押下時刻 → 15分刻みに切り上げ
  const start = getNextQuarterHour();

  // 終了は30分後（時をまたぐ場合も考慮）
  let endH = start.hours;
  let endM = start.minutes + 30;
  if (endM >= 60) { endH += 1; endM -= 60; }

  // Google Calendar はZ無しでローカル時間として解釈する
  const startStr = `${d}T${pad2(start.hours)}${pad2(start.minutes)}00`;
  const endStr   = `${d}T${pad2(endH)}${pad2(endM)}00`;

  const title  = encodeURIComponent("【達成宣言】" + [...text].slice(0, 25).join("") + "…");
  const detail = encodeURIComponent(text);

  return (
    `https://calendar.google.com/calendar/render?action=TEMPLATE` +
    `&text=${title}` +
    `&dates=${startStr}/${endStr}` +
    `&details=${detail}`
  );
}
