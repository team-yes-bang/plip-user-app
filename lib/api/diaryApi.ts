import { API_ENDPOINTS } from "@/config/api-endpoints";
import { getActorUserHeaders } from "@/lib/api/actorHeaders";
import { apiFetch } from "@/lib/api/apiFetch";
import { getApiUrl } from "@/lib/api/env";
import { withAuthRetry } from "@/lib/api/withAuthRetry";
import type {
  ApiCreateDiaryThemeRequest,
  ApiDiaryCalendarResponse,
  ApiDiaryDateResponse,
  ApiDiaryDateWindowResponse,
  ApiDiaryHomeResponse,
  ApiDiaryTheme,
  ApiDiaryThemesResponse,
  ApiDiaryTimelineResponse,
  ApiDiaryTopicTransferRequest,
  ApiUpdateDiaryThemeNameRequest,
} from "@/types/diary/api";

function diaryFetch<T>(path: string, options: Parameters<typeof apiFetch>[1] = {}): Promise<T> {
  return withAuthRetry(async () =>
    apiFetch<T>(path, {
      baseUrl: getApiUrl(),
      headers: await getActorUserHeaders(),
      ...options,
    }),
  );
}

export async function getDiaryThemes(): Promise<ApiDiaryThemesResponse> {
  return diaryFetch<ApiDiaryThemesResponse>(API_ENDPOINTS.diary.themes, { method: "GET" });
}

export async function getDiaryTheme(themeId: string): Promise<ApiDiaryTheme> {
  return diaryFetch<ApiDiaryTheme>(API_ENDPOINTS.diary.themeDetail(themeId), { method: "GET" });
}

export async function createDiaryTheme(body: ApiCreateDiaryThemeRequest): Promise<ApiDiaryTheme> {
  return diaryFetch<ApiDiaryTheme>(API_ENDPOINTS.diary.themes, {
    method: "POST",
    body,
  });
}

export async function updateDiaryThemeName(
  themeId: string,
  body: ApiUpdateDiaryThemeNameRequest,
): Promise<ApiDiaryTheme> {
  return diaryFetch<ApiDiaryTheme>(API_ENDPOINTS.diary.themeDetail(themeId), {
    method: "PATCH",
    body,
  });
}

export async function deleteDiaryTheme(themeId: string): Promise<void> {
  await diaryFetch<void>(API_ENDPOINTS.diary.themeDetail(themeId), { method: "DELETE" });
}

export async function getDiaryHome(): Promise<ApiDiaryHomeResponse> {
  return diaryFetch<ApiDiaryHomeResponse>(API_ENDPOINTS.diary.home, { method: "GET" });
}

export async function getDiaryCalendar(
  year: number,
  month: number,
): Promise<ApiDiaryCalendarResponse> {
  return diaryFetch<ApiDiaryCalendarResponse>(API_ENDPOINTS.diary.calendar, {
    method: "GET",
    searchParams: {
      year: String(year),
      month: String(month),
    },
  });
}

export async function getDiaryByDate(date: string, window = 0): Promise<ApiDiaryDateResponse> {
  return diaryFetch<ApiDiaryDateResponse>(API_ENDPOINTS.diary.dateDetail(date), {
    method: "GET",
    searchParams: window > 0 ? { window: String(window) } : undefined,
  });
}

export async function getDiaryDateWindow(
  date: string,
  window = 1,
): Promise<ApiDiaryDateWindowResponse> {
  return diaryFetch<ApiDiaryDateWindowResponse>(API_ENDPOINTS.diary.dateDetail(date), {
    method: "GET",
    searchParams: { window: String(window) },
  });
}

export async function getDiaryThemeTimeline(
  themeId: string,
  cursor?: string,
  limit = 50,
): Promise<ApiDiaryTimelineResponse> {
  return diaryFetch<ApiDiaryTimelineResponse>(API_ENDPOINTS.diary.themeTimeline(themeId), {
    method: "GET",
    searchParams: {
      limit: String(limit),
      ...(cursor ? { cursor } : {}),
    },
  });
}

export async function transferDiaryVideoTopic(
  diaryVideoId: string,
  body: ApiDiaryTopicTransferRequest,
): Promise<void> {
  await diaryFetch<void>(API_ENDPOINTS.diary.videoTopicTransfer(diaryVideoId), {
    method: "POST",
    body,
  });
}

export async function unbindDiaryVideo(diaryVideoId: string): Promise<void> {
  await diaryFetch<void>(API_ENDPOINTS.diary.videoUnbind(diaryVideoId), { method: "DELETE" });
}
