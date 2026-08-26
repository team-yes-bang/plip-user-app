export type ApiChatMessageType = "TALK" | "SYSTEM";

export type ApiChatMessage = {
  id: string;
  agitUuid: string;
  senderUuid: string | null;
  type: ApiChatMessageType;
  content: string;
  payload?: Record<string, unknown> | null;
  createdAt: string;
  unreadMemberCount?: number | null;
};

export type ApiChatReceiptPayload = {
  messageId: string;
  unreadMemberCount: number;
};

export type ApiAgitChatUnreadItem = {
  agitUuid: string;
  unreadMessageCount: number;
};

export type ApiMyAgitsChatUnreadResponse = {
  items: ApiAgitChatUnreadItem[];
};

export type ApiChatCursor = {
  createdAt: string;
  id: string;
};

export type ApiChatHistory = {
  messages: ApiChatMessage[];
  nextCursor: ApiChatCursor | null;
  hasNext: boolean;
};

export type ApiChatWsTicket = {
  ticket: string;
  expiresInSeconds: number;
};
