const MINUTES_STEP = 10;

export function normalizeDiaryNotifyTime(value: string): string {
  const match = /^(\d{2}):(\d{2})/.exec(value);
  if (!match) {
    return "21:00";
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const roundedMinutes = Math.round(minutes / MINUTES_STEP) * MINUTES_STEP;
  const normalizedMinutes = roundedMinutes >= 60 ? 0 : roundedMinutes;
  const normalizedHours = roundedMinutes >= 60 ? (hours + 1) % 24 : hours;

  return `${String(normalizedHours).padStart(2, "0")}:${String(normalizedMinutes).padStart(2, "0")}`;
}

export function buildDiaryNotifyTimeOptions(): string[] {
  const options: string[] = [];

  for (let hour = 0; hour < 24; hour += 1) {
    for (let minute = 0; minute < 60; minute += MINUTES_STEP) {
      options.push(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
    }
  }

  return options;
}

export function formatDiaryNotifyTimeLabel(value: string): string {
  const normalized = normalizeDiaryNotifyTime(value);
  const [hourText, minuteText] = normalized.split(":");
  const hour = Number(hourText);
  const period = hour < 12 ? "오전" : "오후";
  const hour12 = hour % 12 || 12;

  return `${period} ${String(hour12).padStart(2, "0")}:${minuteText}`;
}

export const DIARY_NOTIFY_TIME_OPTIONS = buildDiaryNotifyTimeOptions();
