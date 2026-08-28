import { THUMBNAIL_CONTENT_TYPE } from "@/lib/video/constants";

export const AGIT_THUMBNAIL_ACCEPT = "image/jpeg,image/png,image/webp";

export function getMediaCdnBaseUrl(): string | undefined {
  const fromPublic = process.env.NEXT_PUBLIC_MEDIA_CDN_BASE_URL?.trim();
  if (fromPublic) {
    return fromPublic.replace(/\/$/, "");
  }
  const fromServer = process.env.MEDIA_CDN_BASE_URL?.trim();
  return fromServer ? fromServer.replace(/\/$/, "") : undefined;
}

export function resolveAgitThumbnailUrl(thumbnailPath?: string | null): string | undefined {
  if (!thumbnailPath?.trim()) {
    return undefined;
  }

  const trimmed = thumbnailPath.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) {
    return trimmed;
  }

  const cdnBaseUrl = getMediaCdnBaseUrl();
  if (cdnBaseUrl) {
    return `${cdnBaseUrl}/${trimmed}`;
  }

  if (trimmed.startsWith("images/")) {
    return `/stub-media/${trimmed}`;
  }

  return undefined;
}

export function agitThumbnailContentType(): string {
  return THUMBNAIL_CONTENT_TYPE;
}
