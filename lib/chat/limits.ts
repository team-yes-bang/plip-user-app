export const MAX_CHAT_MESSAGE_LENGTH = 2000;

/** 목록 버블 최대 높이(px) */
export const CHAT_BUBBLE_COLLAPSED_MAX_HEIGHT = 160;

export function normalizeChatDraft(content: string): string {
  return content
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
}
