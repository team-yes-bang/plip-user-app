"use client";

import { FeedPill } from "@/components/atoms";
import { CaptureClipOverlays } from "@/components/molecules";
import { BaseVideoViewer, type BaseVideoViewerOverlayProps } from "@/components/organisms/BaseVideoViewer";
import type { VideoViewerItem } from "@/components/providers/VideoViewerProvider";
import { extractDate, parseUploadedAtToDate } from "@/lib/video/formatOverlayClock";

type DiaryVideoViewerProps = {
  initialClipId: string;
  videoList: VideoViewerItem[];
  onClose?: () => void;
};

export function DiaryVideoViewer({
  initialClipId,
  videoList,
  onClose,
}: DiaryVideoViewerProps) {
  const currentItem =
    videoList.find((item) => item.clipId === initialClipId) ?? videoList[0];

  const themeName = currentItem?.themeName || currentItem?.title || "다이어리 테마";
  const dateStr = extractDate(currentItem?.uploadedAt);

  return (
    <BaseVideoViewer
      initialClipId={initialClipId}
      videoList={videoList}
      onClose={onClose}
      headerTitle={
        <FeedPill className="text-sm font-bold">
          {themeName}
        </FeedPill>
      }
      headerSubtitle={dateStr}
      headerTrailing={undefined}
      overlayChildren={({ currentItem: item, currentDetail }: BaseVideoViewerOverlayProps) => (
        <>
          {/* 비디오 중앙 대형 시각 + 캡션 오버레이 (CaptureClipOverlays) */}
          <CaptureClipOverlays
            capturedAt={parseUploadedAtToDate(item.uploadedAt)}
            caption={currentDetail?.caption || ""}
            scale={1}
          />

          {/* 하단 오버레이: 좌측 작성자 */}
          <div className="relative z-10 mt-auto flex items-end justify-between px-6 pb-12 text-white">
            <span className="text-base font-bold truncate">
              {item.authorName || "나의 기록"}
            </span>
          </div>
        </>
      )}
    />
  );
}
