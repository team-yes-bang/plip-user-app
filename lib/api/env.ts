import { getVideoRequestBaseUrl, shouldUseVideoGateway } from "@/config/video-path";

const DEFAULT_API_URL = "http://localhost:8000";
const DEFAULT_DEV_USER_UUID = "00000000-0000-4000-8000-000000000001";

export { getVideoRequestBaseUrl, shouldUseVideoGateway };

export function getApiUrl(): string {
  return process.env.API_URL?.trim() || DEFAULT_API_URL;
}

/** VIDEO_USE_GATEWAY=true 이면 gateway(8000), 아니면 VIDEO_API_BASE_URL(8085) */
export function getVideoApiBaseUrl(): string {
  return getVideoRequestBaseUrl();
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
