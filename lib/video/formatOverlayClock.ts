export function extractDate(uploadedAt?: string): string {
  if (!uploadedAt) return "2026.08.24";
  const trimmed = uploadedAt.trim();

  const spaceSplit = trimmed.split(/\s+/);
  if (spaceSplit.length >= 1 && spaceSplit[0]) {
    return spaceSplit[0].replaceAll("-", ".");
  }

  if (trimmed.includes("T")) {
    return trimmed.split("T")[0].replaceAll("-", ".");
  }

  return trimmed;
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
