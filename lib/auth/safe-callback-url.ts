import { ROUTES } from "@/config/routes";

const DEFAULT_AFTER_AUTH = ROUTES.home;

function isLandingPath(path: string): boolean {
  return path === "/" || path === ROUTES.intro || path === "/intro";
}

export function getSafeCallbackUrl(raw: string | null | undefined): string {
  if (!raw) {
    return DEFAULT_AFTER_AUTH;
  }

  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return DEFAULT_AFTER_AUTH;
  }

  if (!decoded.startsWith("/") || decoded.startsWith("//") || decoded.includes("://")) {
    return DEFAULT_AFTER_AUTH;
  }

  if (isLandingPath(decoded)) {
    return DEFAULT_AFTER_AUTH;
  }

  return decoded;
}
