const DEFAULT_API_URL = "http://localhost:8000";
const DEFAULT_DEV_USER_UUID = "00000000-0000-4000-8000-000000000001";

export function getApiUrl(): string {
  return process.env.API_URL?.trim() || DEFAULT_API_URL;
}

export function getDevUserUuid(): string {
  return process.env.DEV_USER_UUID?.trim() || DEFAULT_DEV_USER_UUID;
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
