import { API_ENDPOINTS } from "@/config/api-endpoints";
import { getActorUserHeaders } from "@/lib/api/actorHeaders";
import { apiFetch } from "@/lib/api/apiFetch";
import { getApiUrl } from "@/lib/api/env";
import { withAuthRetry } from "@/lib/api/withAuthRetry";
import type {
  ApiCreateTopicRequest,
  ApiTopic,
  ApiTopicFeed,
  ApiTopicListStatus,
  ApiTopicVideo,
  ApiUpdateTopicRequest,
} from "@/types/topic/api";

function topicFetch<T>(path: string, options: Parameters<typeof apiFetch>[1] = {}): Promise<T> {
  return withAuthRetry(async () =>
    apiFetch<T>(path, {
      baseUrl: getApiUrl(),
      headers: await getActorUserHeaders(),
      ...options,
    }),
  );
}

export async function listTopics(agitUuid: string): Promise<ApiTopic[]> {
  return topicFetch<ApiTopic[]>(API_ENDPOINTS.topic.list, {
    method: "GET",
    searchParams: { agitUuid },
  });
}

export async function listTopicsByStatus(
  agitUuid: string,
  status: ApiTopicListStatus,
  limit?: number,
): Promise<ApiTopic[]> {
  return topicFetch<ApiTopic[]>(API_ENDPOINTS.topic.listByStatus, {
    method: "GET",
    searchParams: {
      agitUuid,
      status,
      limit: limit !== undefined ? String(limit) : undefined,
    },
  });
}

export async function createTopic(body: ApiCreateTopicRequest): Promise<ApiTopic> {
  return topicFetch<ApiTopic>(API_ENDPOINTS.topic.list, {
    method: "POST",
    body,
  });
}

export async function getTopic(topicUuid: string): Promise<ApiTopic> {
  return topicFetch<ApiTopic>(API_ENDPOINTS.topic.detail(topicUuid), {
    method: "GET",
  });
}

export async function updateTopic(
  topicUuid: string,
  body: ApiUpdateTopicRequest,
): Promise<ApiTopic> {
  return topicFetch<ApiTopic>(API_ENDPOINTS.topic.detail(topicUuid), {
    method: "PATCH",
    body,
  });
}

export async function deleteTopic(topicUuid: string): Promise<void> {
  await topicFetch<unknown>(API_ENDPOINTS.topic.detail(topicUuid), {
    method: "DELETE",
  });
}

export async function listTopicVideos(topicUuid: string): Promise<ApiTopicVideo[]> {
  const payload = await topicFetch<unknown>(API_ENDPOINTS.topic.videos(topicUuid), {
    method: "GET",
  });
  return toTopicVideoList(payload);
}

function toTopicVideoList(payload: unknown): ApiTopicVideo[] {
  const rows = Array.isArray(payload)
    ? payload
    : payload !== null &&
        typeof payload === "object" &&
        "data" in payload &&
        Array.isArray((payload as { data: unknown }).data)
      ? (payload as { data: unknown[] }).data
      : [];
  return rows.flatMap((row) => {
    if (!row || typeof row !== "object") {
      return [];
    }
    const record = row as Record<string, unknown>;
    const videoUuid = readString(record, ["videoUuid", "videoId", "id"]);
    if (!videoUuid) {
      return [];
    }
    return [
      {
        videoUuid,
        userUuid: readString(record, ["userUuid", "userId", "memberUuid"]) ?? "",
        createdAt: readTimestamp(record.createdAt),
      },
    ];
  });
}

function readString(record: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return undefined;
}

function readTimestamp(value: unknown): string {
  if (typeof value === "string" && value.trim()) {
    return value;
  }
  if (Array.isArray(value) && value.length >= 3 && value.every((part) => typeof part === "number")) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = value as number[];
    return new Date(year, month - 1, day, hour, minute, second).toISOString();
  }
  return new Date(0).toISOString();
}

export async function getTopicFeed(params: {
  agitUuid: string;
  topicUuid?: string;
  date?: string;
  before?: number;
  after?: number;
}): Promise<ApiTopicFeed> {
  return topicFetch<ApiTopicFeed>(API_ENDPOINTS.topic.feed, {
    method: "GET",
    searchParams: {
      agitUuid: params.agitUuid,
      topicUuid: params.topicUuid,
      date: params.date,
      before: params.before !== undefined ? String(params.before) : undefined,
      after: params.after !== undefined ? String(params.after) : undefined,
    },
  });
}
