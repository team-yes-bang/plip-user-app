/** 카카오톡 등 OG 크롤러용 기본 이미지. public/plip/og-default.png */
export const DEFAULT_OG_IMAGE_PATH = "/plip/og-default.png";

export function getMetadataBase(): URL {
  const fromAuth = process.env.AUTH_URL?.trim() || process.env.NEXTAUTH_URL?.trim();
  if (fromAuth) {
    return new URL(fromAuth.endsWith("/") ? fromAuth : `${fromAuth}/`);
  }

  const vercelHost =
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() || process.env.VERCEL_URL?.trim();
  if (vercelHost) {
    const host = vercelHost.replace(/^https?:\/\//, "");
    return new URL(`https://${host}/`);
  }

  return new URL("http://localhost:3000/");
}

export function resolveOgImageSrc(src?: string | null): string {
  const trimmed = src?.trim();
  if (!trimmed) {
    return DEFAULT_OG_IMAGE_PATH;
  }
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) {
    return trimmed;
  }
  return DEFAULT_OG_IMAGE_PATH;
}
