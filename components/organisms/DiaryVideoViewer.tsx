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
      headerSubtitle={undefined}
      headerTrailing={undefined}
      overlayChildren={({ currentItem: item, currentDetail }: BaseVideoViewerOverlayProps) => (
        <>
          {/* 비디오 중앙 대형 시각 + 캡션 오버레이 */}
          <CaptureClipOverlays
            capturedAt={parseUploadedAtToDate(item.uploadedAt)}
            caption={currentDetail?.caption || ""}
            scale={1}
          />

          {/* 하단 우측: 날짜 */}
          <div className="relative z-10 mt-auto flex items-end justify-end px-6 pb-12 text-white pointer-events-none">
            <span className="text-xs font-medium text-white/80 shrink-0">
              {extractDate(item.uploadedAt)}
            </span>
          </div>
        </>
      )}
    />
  );
}
