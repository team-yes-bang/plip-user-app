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
  // 게이트웨이 검색은 permitAll이지만, analytics가 X-User-UUID를 요구하면
  // 세션이 있을 때 JWT를 붙여 500을 피한다. 비로그인 요청은 헤더 없이 그대로 호출한다.
  return withAuthRetry(() =>
    apiFetch<ApiDiscoverSearchPage>(API_ENDPOINTS.analytics.search, {
      method: "GET",
      baseUrl: getApiUrl(),
      searchParams: {
        q: input.q,
        sort: input.sort,
        page: input.page == null ? undefined : String(input.page),
        size: input.size == null ? undefined : String(input.size),
      },
    }),
  );
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
