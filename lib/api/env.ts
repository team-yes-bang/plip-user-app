const DEFAULT_API_URL = "http://localhost:8000";
const DEFAULT_VIDEO_API_BASE_URL = "http://localhost:8085";
const DEFAULT_CHAT_WS_URL = "http://localhost:8082/ws/chat";
const DEFAULT_DEV_USER_UUID = "00000000-0000-4000-8000-000000000001";

export function getApiUrl(): string {
  return process.env.API_URL?.trim() || DEFAULT_API_URL;
}

export function getVideoApiBaseUrl(): string {
  return process.env.VIDEO_API_BASE_URL?.trim() || DEFAULT_VIDEO_API_BASE_URL;
}

export function getDevUserUuid(): string {
  return process.env.DEV_USER_UUID?.trim() || DEFAULT_DEV_USER_UUID;
}

/** STOMP WebSocket 엔드포인트. Gateway 미경유 시 chat-service 직접 연결 */
export function getChatWsUrl(): string {
  return process.env.CHAT_WS_URL?.trim() || DEFAULT_CHAT_WS_URL;
}

export function getDevLoginEmail(): string | undefined {
  const email = process.env.DEV_LOGIN_EMAIL?.trim();
  return email || undefined;
}

export function getDevLoginPassword(): string | undefined {
  const password = process.env.DEV_LOGIN_PASSWORD?.trim();
  return password || undefined;
}

export function isVideoDestinationNotWiredFallbackEnabled(): boolean {
  const raw = process.env.VIDEO_DESTINATION_NOT_WIRED_FALLBACK?.trim().toLowerCase();
  if (raw === "false" || raw === "0" || raw === "off") {
    return false;
  }
  return true;
}

/** plip-chat REST/WS 원격 연동. 로컬 양방향 E2E 시 true */
export function isEnableRemoteChatEnabled(): boolean {
  const raw = process.env.ENABLE_REMOTE_CHAT?.trim().toLowerCase();
  return raw === "true" || raw === "1" || raw === "on";
}
