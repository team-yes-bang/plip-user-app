"use client";

import { getVideoAction } from "@/actions/videoActions";
import { DailyIcon, FeedPillIconButton } from "@/components/atoms";
import { ScreenHeader } from "@/components/molecules";
import type { VideoViewerItem } from "@/components/providers/VideoViewerProvider";
import { extractDate } from "@/lib/video/formatOverlayClock";
import { resolveRemotePlaybackUrl, VIDEO_PLAYBACK_ATTRS } from "@/lib/video/playback";
import { safeVideoPlay } from "@/lib/video/safeVideoPlay";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

export type BaseVideoViewerOverlayProps = {
  currentItem: VideoViewerItem;
  currentDetail?: { playbackUrl?: string; thumbnailUrl?: string; caption?: string };
  currentIndex: number;
  totalCount: number;
};

export type BaseVideoViewerProps = {
  initialClipId: string;
  videoList: VideoViewerItem[];
  onClose?: () => void;
  headerTitle?: ReactNode;
  headerSubtitle?: ReactNode;
  headerTrailing?: ReactNode;
  overlayChildren?: ReactNode | ((props: BaseVideoViewerOverlayProps) => ReactNode);
};

export function BaseVideoViewer({
  initialClipId,
  videoList,
  onClose,
  headerTitle,
  headerSubtitle,
  headerTrailing,
  overlayChildren,
}: BaseVideoViewerProps) {
  const list = useMemo(
    () => (videoList.length > 0 ? videoList : [{ clipId: initialClipId }]),
    [videoList, initialClipId],
  );
  const initialIndex = Math.max(
    0,
    list.findIndex((item) => item.clipId === initialClipId),
  );

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [videoDetails, setVideoDetails] = useState<
    Record<string, { playbackUrl?: string; thumbnailUrl?: string; caption?: string }>
  >({});
  const [failedUuids, setFailedUuids] = useState<Record<string, true>>({});
  const [isPlaying, setIsPlaying] = useState(true);

  const currentItem = list[currentIndex] ?? list[0];
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fetchingRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const item = list[currentIndex];
    if (!item) {
      return;
    }

    const uuid = item.videoUuid || item.clipId;
    const hasInlineUrl = resolveRemotePlaybackUrl(item.rawPlaybackUrl);
    if (!uuid || hasInlineUrl || videoDetails[uuid] || failedUuids[uuid] || fetchingRef.current.has(uuid)) {
      return;
    }

    fetchingRef.current.add(uuid);

    getVideoAction(uuid)
      .then((result) => {
        if (!result.ok) {
          setFailedUuids((prev) => ({ ...prev, [uuid]: true }));
          return;
        }

        const playbackUrl = resolveRemotePlaybackUrl(result.data.rawPlaybackUrl);
        if (!playbackUrl) {
          setFailedUuids((prev) => ({ ...prev, [uuid]: true }));
          return;
        }

        setVideoDetails((prev) => ({
          ...prev,
          [uuid]: {
            playbackUrl,
            thumbnailUrl: result.data.thumbnailUrl ?? undefined,
            caption: result.data.caption ?? undefined,
          },
        }));
      })
      .catch(() => {
        setFailedUuids((prev) => ({ ...prev, [uuid]: true }));
      })
      .finally(() => {
        fetchingRef.current.delete(uuid);
      });
  }, [currentIndex, failedUuids, list, videoDetails]);

  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0]?.clientY ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const touchEndY = e.changedTouches[0]?.clientY ?? touchStartY.current;
    const diff = touchStartY.current - touchEndY;

    if (diff > 50 && currentIndex < list.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsPlaying(true);
    } else if (diff < -50 && currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsPlaying(true);
    }
    touchStartY.current = null;
  };

  const activeUuid = currentItem.videoUuid || currentItem.clipId;
  const currentDetail = videoDetails[activeUuid];
  const playbackUrl =
    resolveRemotePlaybackUrl(currentItem.rawPlaybackUrl) ??
    resolveRemotePlaybackUrl(currentDetail?.playbackUrl);
  const coverSrc =
    currentItem.thumbnailUrl ||
    currentDetail?.thumbnailUrl ||
    "/plip/v13/runner-preview.png";
  const fetchFailed = Boolean(activeUuid && failedUuids[activeUuid]);

  useEffect(() => {
    const node = videoRef.current;
    if (!node || !playbackUrl || !isPlaying) {
      node?.pause();
      return;
    }

    safeVideoPlay(node);
  }, [playbackUrl, isPlaying, currentIndex]);

  const togglePlay = useCallback(() => {
    const node = videoRef.current;
    if (!node) {
      return;
    }

    if (isPlaying) {
      node.pause();
      setIsPlaying(false);
      return;
    }

    safeVideoPlay(node);
    setIsPlaying(true);
  }, [isPlaying]);

  const viewerVideoProps = VIDEO_PLAYBACK_ATTRS.viewer;

  return (
    <section
      className="relative flex h-full w-full flex-1 flex-col overflow-hidden bg-[#09080f] select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="비디오 뷰어"
    >
      {playbackUrl ? (
        <video
          ref={videoRef}
          src={playbackUrl}
          poster={coverSrc}
          {...viewerVideoProps}
          className="absolute inset-0 h-full w-full object-cover"
          onClick={togglePlay}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      ) : (
        <Image
          src={coverSrc}
          alt={currentItem.title || "비디오 썸네일"}
          fill
          className="object-cover"
          priority
          sizes="100vw"
          onClick={togglePlay}
        />
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40" />

      <ScreenHeader
        tone="overlay"
        titleAlign="center"
        leading={
          <FeedPillIconButton label="닫기" onClick={() => onClose?.()}>
            <DailyIcon name="chevronLeft" size={20} className="brightness-0 invert" />
          </FeedPillIconButton>
        }
        title={headerTitle ?? currentItem.topicName ?? currentItem.title ?? "오늘의 영상"}
        subtitle={headerSubtitle ?? extractDate(currentItem.uploadedAt)}
        trailing={headerTrailing}
      />

      {!isPlaying && playbackUrl ? (
        <div
          className="pointer-events-auto absolute inset-0 z-10 flex items-center justify-center bg-black/30"
          onClick={togglePlay}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/60 text-white text-2xl">
            ▶
          </div>
        </div>
      ) : null}

      {!playbackUrl && fetchFailed ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-28 z-10 px-6 text-center text-xs font-medium text-white/70">
          재생 URL을 불러오지 못했습니다.
        </div>
      ) : null}

      {typeof overlayChildren === "function"
        ? overlayChildren({ currentItem, currentDetail, currentIndex, totalCount: list.length })
        : overlayChildren}
    </section>
  );
}
