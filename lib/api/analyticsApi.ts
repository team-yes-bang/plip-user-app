import { API_ENDPOINTS } from "@/config/api-endpoints";
import { getActorUserHeaders } from "@/lib/api/actorHeaders";
import { apiFetch } from "@/lib/api/apiFetch";
import { getApiUrl } from "@/lib/api/env";
import { withAuthRetry } from "@/lib/api/withAuthRetry";
import type { ApiDiscoverSearchPage, ApiDiscoverSort } from "@/types/agit/api";

export async function searchDiscoverAgits(input: {
  q?: string;
  sort?: ApiDiscoverSort;
  page?: number;
  size?: number;
}): Promise<ApiDiscoverSearchPage> {
  return apiFetch<ApiDiscoverSearchPage>(API_ENDPOINTS.analytics.search, {
    method: "GET",
    baseUrl: getApiUrl(),
    auth: false,
    searchParams: {
      q: input.q,
      sort: input.sort,
      page: input.page == null ? undefined : String(input.page),
      size: input.size == null ? undefined : String(input.size),
    },
  });
}

export async function publishAnalyticsEvent(type: string, agitUuid: string): Promise<void> {
  await withAuthRetry(async () =>
    apiFetch<void>(API_ENDPOINTS.analytics.events, {
      method: "POST",
      baseUrl: getApiUrl(),
      headers: await getActorUserHeaders(),
      body: { type, agitUuid },
    }),
  );
}
