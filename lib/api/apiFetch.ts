import { getApiUrl } from "@/lib/api/env";
import { getSessionAuthHeaders } from "@/lib/auth/server-token";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  searchParams?: Record<string, string | string[] | undefined>;
  /** 생략 시 API_URL (gateway base) */
  baseUrl?: string;
  /** false면 세션 토큰을 붙이지 않음. 로그인/재발급 등 공개 API용. 기본 true */
  auth?: boolean;
};

function buildUrl(
  path: string,
  searchParams?: Record<string, string | string[] | undefined>,
  baseUrl?: string,
): string {
  const base = (baseUrl ?? getApiUrl()).replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${base}${normalizedPath}`);

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value === undefined || value === "") {
        continue;
      }
      if (Array.isArray(value)) {
        for (const item of value) {
          if (item !== undefined && item !== "") {
            url.searchParams.append(key, item);
          }
        }
        continue;
      }
      url.searchParams.set(key, value);
    }
  }

  return url.toString();
}

async function requestApi(path: string, options: ApiFetchOptions = {}): Promise<Response> {
  const { body, searchParams, headers, baseUrl, auth = true, ...rest } = options;
  const hasJsonBody = body !== undefined;
  const sessionHeaders = auth ? await getSessionAuthHeaders() : {};

  return fetch(buildUrl(path, searchParams, baseUrl), {
    ...rest,
    headers: {
      ...sessionHeaders,
      ...(hasJsonBody ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: hasJsonBody ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
}

async function parseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  return contentType.includes("application/json")
    ? await response.json().catch(() => undefined)
    : await response.text().catch(() => undefined);
}

function toApiError(status: number, parsedBody: unknown): ApiError {
  const message =
    typeof parsedBody === "object" &&
    parsedBody !== null &&
    "message" in parsedBody &&
    typeof parsedBody.message === "string"
      ? parsedBody.message
      : `API request failed (${status})`;

  return new ApiError(message, status, parsedBody);
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const response = await requestApi(path, options);
  const parsedBody = await parseBody(response);

  if (!response.ok) {
    throw toApiError(response.status, parsedBody);
  }

  return parsedBody as T;
}

export async function apiFetchWithStatus<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<{ status: number; data: T }> {
  const response = await requestApi(path, options);
  const parsedBody = await parseBody(response);

  if (!response.ok) {
    throw toApiError(response.status, parsedBody);
  }

  return { status: response.status, data: parsedBody as T };
}
