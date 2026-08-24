export function formatOverlayClock(date: Date = new Date()): string {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function extractDate(uploadedAt?: string): string {
  if (!uploadedAt) {
    const now = new Date();
    const y = now.getFullYear();
    const m = (now.getMonth() + 1).toString().padStart(2, "0");
    const d = now.getDate().toString().padStart(2, "0");
    return `${y}.${m}.${d}`;
  }

  const trimmed = uploadedAt.trim();
  const datePart = trimmed.split(/\s+/)[0] ?? trimmed;
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
  if (!uploadedAt) return "14:30";
  const trimmed = uploadedAt.trim();

  const spaceSplit = trimmed.split(/\s+/);
  if (spaceSplit.length >= 2 && spaceSplit[1]) {
    return spaceSplit[1].slice(0, 5);
  }

  if (trimmed.includes("T")) {
    const timePart = trimmed.split("T")[1];
    return timePart ? timePart.slice(0, 5) : "14:30";
  }

  return "14:30";
}

export function parseUploadedAtToDate(uploadedAt?: string): Date {
  if (!uploadedAt) return new Date();
  const parsed = new Date(uploadedAt);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }
  return new Date();
}
