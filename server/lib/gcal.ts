/**
 * Google Calendar URL generation utilities
 */

export function generateGoogleCalendarUrl(text: string, date: string): string {
  // Convert date from YYYY-MM-DD to YYYYMMDD format
  const d = date.replace(/-/g, "");

  // Create title and details
  const title = encodeURIComponent("【達成宣言】" + text.slice(0, 30) + "...");
  const detail = encodeURIComponent(text);

  // Build the Google Calendar URL
  return (
    `https://calendar.google.com/calendar/` +
    `render?action=TEMPLATE` +
    `&text=${title}` +
    `&dates=${d}/${d}` +
    `&details=${detail}`
  );
}
