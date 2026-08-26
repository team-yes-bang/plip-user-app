import type { VideoHTMLAttributes } from "react";

export function isStubPlaybackUrl(url: string): boolean {
  return url.includes("/stub-presigned-get/") || url.startsWith("/stub-media/");
}

/** Returns a browser-playable remote URL, filtering stub / empty values. */
export function resolveRemotePlaybackUrl(
  rawPlaybackUrl: string | null | undefined,
): string | null {
  if (!rawPlaybackUrl?.trim() || isStubPlaybackUrl(rawPlaybackUrl)) {
    return null;
  }
  return rawPlaybackUrl.trim();
}

export type VideoPlaybackMode = "feed" | "viewer";

export const VIDEO_PLAYBACK_ATTRS: Record<
  VideoPlaybackMode,
  Pick<VideoHTMLAttributes<HTMLVideoElement>, "muted" | "loop" | "playsInline" | "autoPlay">
> = {
  feed: { muted: true, loop: true, playsInline: true, autoPlay: true },
  viewer: { muted: false, loop: true, playsInline: true, autoPlay: true },
};

export type PlaybackSource = {
  kind: "local" | "remote" | "none";
  url: string | null;
  note: string | null;
};

export function resolvePlaybackSource(
  localPreviewUrl: string | null | undefined,
  rawPlaybackUrl: string | null | undefined,
): PlaybackSource {
  if (localPreviewUrl) {
    return {
      kind: "local",
      url: localPreviewUrl,
      note: "촬영 직후 로컬 preview (Phase 0-F 기본 재생)",
    };
  }

  const remoteUrl = resolveRemotePlaybackUrl(rawPlaybackUrl);
  if (remoteUrl) {
    return {
      kind: "remote",
      url: remoteUrl,
      note: null,
    };
  }

  if (rawPlaybackUrl && isStubPlaybackUrl(rawPlaybackUrl)) {
    return {
      kind: "none",
      url: null,
      note: "로컬 NoOp stub URL — AWS 연동 후 rawPlaybackUrl 재생 가능",
    };
  }

  return {
    kind: "none",
    url: null,
    note: "재생 URL 없음",
  };
}
