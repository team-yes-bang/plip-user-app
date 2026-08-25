import { API_ENDPOINTS } from "@/config/api-endpoints";
import { getActorUserHeaders } from "@/lib/api/actorHeaders";
import { apiFetch } from "@/lib/api/apiFetch";
import { getApiUrl } from "@/lib/api/env";
import { withAuthRetry } from "@/lib/api/withAuthRetry";
import type { ApiChatHistory } from "@/types/chat/api";

type ChatHistoryQuery = {
  cursorCreatedAt?: string;
  cursorId?: string;
  size?: number;
};

export async function getChatHistory(
  agitUuid: string,
  query: ChatHistoryQuery = {},
): Promise<ApiChatHistory> {
  return withAuthRetry(async () =>
    apiFetch<ApiChatHistory>(API_ENDPOINTS.chat.messages(agitUuid), {
      method: "GET",
      baseUrl: getApiUrl(),
      headers: await getActorUserHeaders(),
      searchParams: {
        cursorCreatedAt: query.cursorCreatedAt,
        cursorId: query.cursorId,
        size: query.size !== undefined ? String(query.size) : undefined,
      },
    }),
  );
}

export async function markChatRead(agitUuid: string): Promise<void> {
  await withAuthRetry(async () =>
    apiFetch<void>(API_ENDPOINTS.chat.read(agitUuid), {
      method: "POST",
      baseUrl: getApiUrl(),
      headers: await getActorUserHeaders(),
    }),
  );
}
