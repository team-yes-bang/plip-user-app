import { ROUTES } from "@/config/routes";

export function getSafeCallbackUrl(raw: string | null | undefined): string {
  if (!raw) {
    return ROUTES.diary.root;
  }

  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return ROUTES.diary.root;
  }

  if (!decoded.startsWith("/") || decoded.startsWith("//") || decoded.includes("://")) {
    return ROUTES.diary.root;
  }

  return decoded;
}
