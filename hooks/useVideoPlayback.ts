"use client";

import { getVideoAction } from "@/actions/videoActions";
import {
  resolveRemotePlaybackUrl,
  VIDEO_PLAYBACK_ATTRS,
  type VideoPlaybackMode,
} from "@/lib/video/playback";
import { resolveVideoThumbnail, VIDEO_THUMBNAIL_NOT_LOADED } from "@/lib/video/thumbnail";
import { safeVideoPlay } from "@/lib/video/safeVideoPlay";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

const VISIBILITY_THRESHOLD = 0.35;

type UseVideoPlaybackOptions = {
  videoUuid: string;
  rawPlaybackUrl?: string | null;
  thumbnailUrl?: string;
  mode: VideoPlaybackMode;
  /** Parent slide/gallery is active (e.g. current topic in feed). */
  enabled?: boolean;
  /** Fetch video detail when no playable URL is available. */
  fetchIfMissing?: boolean;
};

type UseVideoPlaybackResult = {
  containerRef: RefObject<HTMLDivElement | null>;
  videoRef: RefObject<HTMLVideoElement | null>;
  playbackUrl: string | null;
  posterUrl: string | undefined;
  shouldRenderVideo: boolean;
  videoProps: React.VideoHTMLAttributes<HTMLVideoElement>;
  pause: () => void;
};

export function useVideoPlayback({
  videoUuid,
  rawPlaybackUrl,
  thumbnailUrl,
  mode,
  enabled = true,
  fetchIfMissing = true,
}: UseVideoPlaybackOptions): UseVideoPlaybackResult {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [fetchedDetail, setFetchedDetail] = useState<
    Record<string, { playbackUrl?: string; thumbnailSrc?: string; caption?: string }>
  >({});
  const [isVisible, setIsVisible] = useState(mode === "viewer");
  const shouldPlayRef = useRef(false);
  const fetchingRef = useRef<Set<string>>(new Set());

  const initialUrl = resolveRemotePlaybackUrl(rawPlaybackUrl);
  const cachedDetail = fetchedDetail[videoUuid];
  const cachedUrl = resolveRemotePlaybackUrl(cachedDetail?.playbackUrl);
  const playbackUrl = initialUrl ?? cachedUrl ?? null;
  const resolvedPoster =
    cachedDetail?.thumbnailSrc ??
    (thumbnailUrl && thumbnailUrl !== VIDEO_THUMBNAIL_NOT_LOADED ? thumbnailUrl : undefined);

  const needsDetailFetch =
    fetchIfMissing &&
    enabled &&
    (!initialUrl && !cachedUrl || !resolvedPoster || resolvedPoster === VIDEO_THUMBNAIL_NOT_LOADED);

  const fetchVideoDetail = useCallback(async (uuid: string) => {
    if (fetchingRef.current.has(uuid)) {
      return;
    }

    fetchingRef.current.add(uuid);
    try {
      const result = await getVideoAction(uuid);
      if (!result.ok) {
        return;
      }

      const url = resolveRemotePlaybackUrl(result.data.rawPlaybackUrl);
      const thumbnailSrc = resolveVideoThumbnail(result.data.thumbnailUrl);

      setFetchedDetail((prev) => ({
        ...prev,
        [uuid]: {
          playbackUrl: url ?? prev[uuid]?.playbackUrl,
          thumbnailSrc: thumbnailSrc !== VIDEO_THUMBNAIL_NOT_LOADED ? thumbnailSrc : prev[uuid]?.thumbnailSrc,
          caption: result.data.caption?.trim() ?? prev[uuid]?.caption ?? "",
        },
      }));
    } finally {
      fetchingRef.current.delete(uuid);
    }
  }, []);

  useEffect(() => {
    if (mode !== "feed") {
      return;
    }

    const node = containerRef.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry?.isIntersecting ?? false;
        setIsVisible(visible);

        if (visible && needsDetailFetch) {
          void fetchVideoDetail(videoUuid);
        }
      },
      { threshold: VISIBILITY_THRESHOLD },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchVideoDetail, mode, needsDetailFetch, videoUuid]);

  useEffect(() => {
    if (mode !== "viewer" || !needsDetailFetch || !videoUuid) {
      return;
    }

    void fetchVideoDetail(videoUuid);
  }, [fetchVideoDetail, mode, needsDetailFetch, videoUuid]);

  const shouldPlay = enabled && playbackUrl !== null && (mode === "viewer" || isVisible);

  useEffect(() => {
    shouldPlayRef.current = shouldPlay;
    const node = videoRef.current;
    if (!node) {
      return;
    }

    if (shouldPlay) {
      safeVideoPlay(node);
      return;
    }

    node.pause();
  }, [shouldPlay, playbackUrl]);

  const pause = useCallback(() => {
    videoRef.current?.pause();
  }, []);

  const handleCanPlay = useCallback(() => {
    if (shouldPlayRef.current && videoRef.current) {
      safeVideoPlay(videoRef.current);
    }
  }, []);

  const attrs = VIDEO_PLAYBACK_ATTRS[mode];

  return {
    containerRef,
    videoRef,
    playbackUrl,
    posterUrl: resolvedPoster ?? thumbnailUrl,
    shouldRenderVideo: playbackUrl !== null,
    pause,
    videoProps: {
      src: playbackUrl ?? undefined,
      poster: resolvedPoster ?? thumbnailUrl,
      ...attrs,
      onCanPlay: handleCanPlay,
    },
  };
}
