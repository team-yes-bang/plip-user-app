const MINUTES_STEP = 10;

export type DiaryNotifyPeriod = "AM" | "PM";

export type DiaryNotifyTimeParts = {
  period: DiaryNotifyPeriod;
  hour12: number;
  minute: number;
};

export const DIARY_NOTIFY_MINUTES = [0, 10, 20, 30, 40, 50] as const;

export const DIARY_NOTIFY_HOURS_12 = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;

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

export function parseDiaryNotifyTime(value: string): DiaryNotifyTimeParts {
  const normalized = normalizeDiaryNotifyTime(value);
  const [hourText, minuteText] = normalized.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);

  if (hour < 12) {
    return {
      period: "AM",
      hour12: hour === 0 ? 12 : hour,
      minute,
    };
  }

  return {
    period: "PM",
    hour12: hour === 12 ? 12 : hour - 12,
    minute,
  };
}

export function composeDiaryNotifyTime(parts: DiaryNotifyTimeParts): string {
  let hour24: number;

  if (parts.period === "AM") {
    hour24 = parts.hour12 === 12 ? 0 : parts.hour12;
  } else {
    hour24 = parts.hour12 === 12 ? 12 : parts.hour12 + 12;
  }

  return `${String(hour24).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}`;
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
  const parts = parseDiaryNotifyTime(value);
  const periodLabel = parts.period === "AM" ? "오전" : "오후";

  return `${periodLabel} ${String(parts.hour12).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}`;
}

export const DIARY_NOTIFY_TIME_OPTIONS = buildDiaryNotifyTimeOptions();
