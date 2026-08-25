export type ApiChatMessageType = "TALK" | "SYSTEM";

export type ApiChatMessage = {
  id: string;
  agitUuid: string;
  senderUuid: string | null;
  type: ApiChatMessageType;
  content: string;
  payload?: Record<string, unknown> | null;
  createdAt: string;
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
