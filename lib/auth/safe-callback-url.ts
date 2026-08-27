import { ROUTES } from "@/config/routes";

const DEFAULT_AFTER_AUTH = ROUTES.intro;

function isLandingPath(path: string): boolean {
  const pathname = path.split("?")[0] ?? path;
  return pathname === "/" || pathname === ROUTES.intro || pathname === "/intro";
}

function toInternalPath(raw: string): string | null {
  if (raw.includes("://")) {
    try {
      const url = new URL(raw);
      return `${url.pathname}${url.search}`;
    } catch {
      return null;
    }
  }

  if (!raw.startsWith("/") || raw.startsWith("//")) {
    return null;
  }

  return raw;
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

  const path = toInternalPath(decoded);
  if (!path || isLandingPath(path)) {
    return DEFAULT_AFTER_AUTH;
  }

  return path;
}
