export type UiChatMessageType = "TALK" | "SYSTEM";

export type UiChatMessage = {
  id: string;
  agitUuid: string;
  senderUuid: string | null;
  type: UiChatMessageType;
  content: string;
  payload?: Record<string, unknown>;
  createdAt: string;
  senderName: string;
  isMine: boolean;
  timeLabel: string;
  profileImageSrc?: string;
  unreadMemberCount?: number;
};

export type UiChatHistory = {
  messages: UiChatMessage[];
  nextCursor: { createdAt: string; id: string } | null;
  hasNext: boolean;
};
