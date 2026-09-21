export function normalizeChatMessageId(id: unknown): string {
  return String(id ?? "").trim().toLowerCase();
}
