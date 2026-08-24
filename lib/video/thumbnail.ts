/** 썸네일 생성 전·로드 실패 시 표시. public/plip/video/not_loaded.png */
export const VIDEO_THUMBNAIL_NOT_LOADED = "/plip/video/not_loaded.png";

export function isRenderableVideoThumbnail(src?: string | null): boolean {
  const trimmed = src?.trim();
  if (!trimmed) {
    return false;
  }

  if (trimmed.startsWith("/")) {
    return true;
  }

  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/** API thumbnailUrl/thumbnailPath → 표시용 src (없으면 not_loaded) */
export function resolveVideoThumbnail(src?: string | null): string {
  if (!isRenderableVideoThumbnail(src)) {
    return VIDEO_THUMBNAIL_NOT_LOADED;
  }

  return src!.trim();
}
