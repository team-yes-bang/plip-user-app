"use client";

import { getVideoAction } from "@/actions/videoActions";
import { DailyIcon, FeedPillIconButton } from "@/components/atoms";
import { ScreenHeader } from "@/components/molecules";
import type { VideoViewerItem } from "@/components/providers/VideoViewerProvider";
import { extractDate } from "@/lib/video/formatOverlayClock";
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
    [videoList, initialClipId]
  );
  const initialIndex = Math.max(
    0,
    list.findIndex((item) => item.clipId === initialClipId)
  );

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [videoDetails, setVideoDetails] = useState<
    Record<string, { playbackUrl?: string; thumbnailUrl?: string; caption?: string }>
  >({});
  const [isPlaying, setIsPlaying] = useState(true);

  const currentItem = list[currentIndex] ?? list[0];
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const item = list[currentIndex];
    if (!item) return;

    const uuid = item.videoUuid || item.clipId;
    if (uuid && !videoDetails[uuid]) {
      getVideoAction(uuid)
        .then((result) => {
          if (!result.ok) return;
          setVideoDetails((prev) => ({
            ...prev,
            [uuid]: {
              playbackUrl: result.data.rawPlaybackUrl,
              thumbnailUrl: result.data.thumbnailUrl ?? undefined,
              caption: result.data.caption ?? undefined,
            },
          }));
        })
        .catch(() => {});
    }
  }, [currentIndex, list, videoDetails]);

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
    } else if (diff < -50 && currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
    touchStartY.current = null;
  };

  const activeUuid = currentItem.videoUuid || currentItem.clipId;
  const currentDetail = videoDetails[activeUuid];
  const playbackUrl = currentItem.rawPlaybackUrl || currentDetail?.playbackUrl;
  const coverSrc =
    currentItem.thumbnailUrl ||
    currentDetail?.thumbnailUrl ||
    "/plip/v13/runner-preview.png";

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

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
          autoPlay
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
          onClick={togglePlay}
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

      <div className="pointer-events-none absolute inset-0 bg-black/20" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />

      {/* Header Overlay */}
      <ScreenHeader
        tone="overlay"
        titleAlign="center"
        leading={
          <FeedPillIconButton label="닫기" onClick={() => onClose?.()}>
            <DailyIcon name="chevronLeft" size={16} className="brightness-0 invert" />
          </FeedPillIconButton>
        }
        title={headerTitle ?? currentItem.topicName ?? currentItem.title ?? "오늘의 영상"}
        subtitle={headerSubtitle ?? extractDate(currentItem.uploadedAt)}
        trailing={headerTrailing}
      />

      {/* Play/Pause Indicator */}
      {!isPlaying && (
        <div
          className="pointer-events-auto absolute inset-0 z-10 flex items-center justify-center bg-black/30"
          onClick={togglePlay}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/60 text-white text-2xl">
            ▶
          </div>
        </div>
      )}

      {/* Custom Overlay (Side reactions, Bottom info, Center clock & caption overlay etc.) */}
      {typeof overlayChildren === "function"
        ? overlayChildren({ currentItem, currentDetail, currentIndex, totalCount: list.length })
        : overlayChildren}
    </section>
  );
}
