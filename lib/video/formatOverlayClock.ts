const KST = "Asia/Seoul";

function formatKstClock(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: KST,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function formatKstDotDate(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: KST,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(date)
    .replaceAll("-", ".");
}

export function formatOverlayClock(date: Date = new Date()): string {
  return formatKstClock(date);
}

export function extractDate(uploadedAt?: string): string {
  if (!uploadedAt) {
    return formatKstDotDate(new Date());
  }

  const parsedDate = parseUploadedAtToDate(uploadedAt);
  if (!Number.isNaN(parsedDate.getTime())) {
    return formatKstDotDate(parsedDate);
  }

  const trimmed = uploadedAt.trim();
  const datePart = trimmed.split(/[T\s]+/)[0] ?? trimmed;
  const parts = datePart.replace(/[년월일]/g, ".").split(/[-./]/).filter(Boolean);

  if (parts.length >= 3) {
    const y = parts[0];
    const m = parts[1]?.padStart(2, "0");
    const d = parts[2]?.padStart(2, "0");
    return `${y}.${m}.${d}`;
  }

  return datePart.replaceAll("-", ".");
}

export function extractTime(uploadedAt?: string): string {
  if (!uploadedAt) return formatKstClock(new Date());
  return formatKstClock(parseUploadedAtToDate(uploadedAt));
}

export function parseUploadedAtToDate(uploadedAt?: string): Date {
  if (!uploadedAt) return new Date();
  const trimmed = uploadedAt.trim();
  const naiveIso = /^\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?$/.test(trimmed);
  const parsed = new Date(naiveIso ? `${trimmed.replace(" ", "T")}Z` : trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }
  return new Date();
}
