import { getApiUrl } from "@/lib/api/env";

/** Gateway `/api/{serviceId}/**` + StripPrefix=2 */
function gatewayPath(serviceId: string, servicePath: string): string {
  const normalized = servicePath.startsWith("/") ? servicePath : `/${servicePath}`;
  return `/api/${serviceId}${normalized}`;
}

export function shouldUseVideoGateway(): boolean {
  const raw = process.env.VIDEO_USE_GATEWAY?.trim().toLowerCase();
  return raw === "true" || raw === "1";
}

export function resolveVideoServicePath(servicePath: string): string {
  if (shouldUseVideoGateway()) {
    return gatewayPath("video", servicePath);
  }
  return servicePath.startsWith("/") ? servicePath : `/${servicePath}`;
}

export function getVideoRequestBaseUrl(): string {
  if (shouldUseVideoGateway()) {
    return getApiUrl();
  }
  return process.env.VIDEO_API_BASE_URL?.trim() || "http://localhost:8085";
}
