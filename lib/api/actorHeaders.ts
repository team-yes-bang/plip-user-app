import { getDevAccessToken } from "@/lib/api/devAccessToken";
import { getSessionAuthHeaders } from "@/lib/auth/server-token";

/** RSC/API 레이어 전용. NextAuth JWT 우선, 명시적 dev env 설정 시에만 fallback. */
export async function getActorUserHeaders(): Promise<Record<string, string>> {
  const sessionHeaders = await getSessionAuthHeaders();
  if (sessionHeaders.Authorization) {
    return sessionHeaders;
  }

  if (process.env.NODE_ENV === "production") {
    return sessionHeaders;
  }

  const devUserUuid = process.env.DEV_USER_UUID?.trim();
  if (!devUserUuid) {
    return sessionHeaders;
  }

  const devToken = await getDevAccessToken();
  if (!devToken) {
    return sessionHeaders;
  }

  return {
    ...sessionHeaders,
    Authorization: `Bearer ${devToken}`,
    "X-User-UUID": devUserUuid,
  };
}
