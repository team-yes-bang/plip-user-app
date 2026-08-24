"use client";

import { HeaderBackLink, HeaderMenuButton, ScreenHeader } from "@/components/molecules";
import { MoveTopicSheet } from "@/components/organisms/MoveTopicSheet";
import { ViewerActionsSheet } from "@/components/organisms/ViewerActionsSheet";
import type { VideoViewerItem } from "@/components/providers/VideoViewerProvider";
import { getVideoDetail } from "@/services/videoService";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type FullpageVideoViewerProps = {
  initialClipId: string;
  videoList: VideoViewerItem[];
  onClose?: () => void;
  isStandalone?: boolean;
};

export function FullpageVideoViewer({
  initialClipId,
  videoList,
  onClose,
}: FullpageVideoViewerProps) {
  const list = videoList.length > 0 ? videoList : [{ clipId: initialClipId }];
  const initialIndex = Math.max(
    0,
    list.findIndex((item) => item.clipId === initialClipId)
  );

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [videoDetails, setVideoDetails] = useState<
    Record<string, { playbackUrl?: string; thumbnailUrl?: string; caption?: string }>
  >({});
  const [actionsOpen, setActionsOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  const currentItem = list[currentIndex] ?? list[0];
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Fetch video detail for current item if videoUuid exists
  useEffect(() => {
    const item = list[currentIndex];
    if (!item) return;

    const uuid = item.videoUuid || item.clipId;
    if (uuid && !videoDetails[uuid]) {
      getVideoDetail(uuid)
        .then((detail) => {
          setVideoDetails((prev) => ({
            ...prev,
            [uuid]: {
              playbackUrl: detail.rawPlaybackUrl,
              thumbnailUrl: detail.thumbnailUrl,
              caption: detail.caption,
            },
          }));
        })
        .catch(() => {
          // Fallback if API call fails
        });
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
      // Swiped Up -> Next Video
      setCurrentIndex((prev) => prev + 1);
    } else if (diff < -50 && currentIndex > 0) {
      // Swiped Down -> Prev Video
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
      aria-label="개별 영상 풀페이지 뷰어"
    >
      {/* Background Media / Video Player */}
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
        leading={
          <HeaderBackLink
            href="#"
            label="닫기"
            onClick={(e) => {
              e.preventDefault();
              if (onClose) onClose();
            }}
          />
        }
        title={currentItem.agitName || "오늘의 영상"}
        subtitle={currentItem.uploadedAt || "PLIP Clip"}
        trailing={<HeaderMenuButton label="더보기" onClick={() => setActionsOpen(true)} />}
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

      {/* Side Reaction Actions */}
      <div
        className="absolute right-5 bottom-40 z-20 flex flex-col gap-3 rounded-2xl bg-black/30 p-3 text-white text-xs font-medium backdrop-blur-md"
        aria-label="이모지 리액션"
      >
        <span>🔥 12</span>
        <span>💜 8</span>
        <span>👏 5</span>
        <span>＋</span>
      </div>

      {/* Bottom Info Overlay */}
      <div className="relative z-10 mt-auto flex flex-col gap-1 px-6 pb-12 text-white">
        <p className="m-0 text-lg font-bold">{currentItem.title || currentDetail?.caption || "영상 클립"}</p>
        <p className="m-0 text-sm text-white/80">
          {currentItem.authorName || "작성자"} · {list.length > 1 ? `${currentIndex + 1} / ${list.length}` : ""}
        </p>
      </div>

      <ViewerActionsSheet
        open={actionsOpen}
        onClose={() => setActionsOpen(false)}
        onMoveTopic={() => setMoveOpen(true)}
      />
      <MoveTopicSheet open={moveOpen} onClose={() => setMoveOpen(false)} />
    </section>
  );
}
