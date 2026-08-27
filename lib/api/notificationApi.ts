import { API_ENDPOINTS } from "@/config/api-endpoints";
import { getActorUserHeaders } from "@/lib/api/actorHeaders";
import { apiFetch } from "@/lib/api/apiFetch";
import { getApiUrl } from "@/lib/api/env";
import { withAuthRetry } from "@/lib/api/withAuthRetry";
import type {
  ApiNotificationInboxResponse,
  ApiNotificationItem,
  ApiNotificationReadAllResponse,
  ApiNotificationUnreadCountResponse,
} from "@/types/notification/api";

export async function listNotifications(limit = 30): Promise<ApiNotificationInboxResponse> {
  return withAuthRetry(async () =>
    apiFetch<ApiNotificationInboxResponse>(API_ENDPOINTS.users.notifications, {
      method: "GET",
      baseUrl: getApiUrl(),
      headers: await getActorUserHeaders(),
      searchParams: { limit: String(limit) },
    }),
  );
}

export async function getUnreadNotificationCount(): Promise<ApiNotificationUnreadCountResponse> {
  return withAuthRetry(async () =>
    apiFetch<ApiNotificationUnreadCountResponse>(API_ENDPOINTS.users.notificationUnreadCount, {
      method: "GET",
      baseUrl: getApiUrl(),
      headers: await getActorUserHeaders(),
    }),
  );
}

export async function markNotificationRead(id: number): Promise<ApiNotificationItem> {
  return withAuthRetry(async () =>
    apiFetch<ApiNotificationItem>(API_ENDPOINTS.users.notificationRead(id), {
      method: "PATCH",
      baseUrl: getApiUrl(),
      headers: await getActorUserHeaders(),
    }),
  );
}

export async function markAllNotificationsRead(): Promise<ApiNotificationReadAllResponse> {
  return withAuthRetry(async () =>
    apiFetch<ApiNotificationReadAllResponse>(API_ENDPOINTS.users.notificationReadAll, {
      method: "POST",
      baseUrl: getApiUrl(),
      headers: await getActorUserHeaders(),
    }),
  );
}

export async function seedNotifications(): Promise<ApiNotificationInboxResponse> {
  return withAuthRetry(async () =>
    apiFetch<ApiNotificationInboxResponse>(API_ENDPOINTS.users.notificationSeed, {
      method: "POST",
      baseUrl: getApiUrl(),
      headers: await getActorUserHeaders(),
    }),
  );
}
