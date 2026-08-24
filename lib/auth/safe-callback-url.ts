import { ROUTES } from "@/config/routes";

export function getSafeCallbackUrl(raw: string | null | undefined): string {
  if (!raw) {
    return ROUTES.home;
  }

  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return ROUTES.home;
  }

  if (!decoded.startsWith("/") || decoded.startsWith("//") || decoded.includes("://")) {
    return ROUTES.home;
  }

  return decoded;
}
