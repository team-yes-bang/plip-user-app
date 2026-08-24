"use client";

import { FeedPill } from "@/components/atoms";
import { BaseVideoViewer, type BaseVideoViewerOverlayProps } from "@/components/organisms/BaseVideoViewer";
import type { VideoViewerItem } from "@/components/providers/VideoViewerProvider";
import { extractDate, extractTime } from "@/lib/video/formatOverlayClock";

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
      headerSubtitle={null}
      headerTrailing={
        <span className="text-xs font-medium text-white/90">
          {extractTime(currentItem?.uploadedAt)}
        </span>
      }
      overlayChildren={({ currentItem: item, currentDetail }: BaseVideoViewerOverlayProps) => (
        <div className="relative z-10 mt-auto flex items-end justify-between px-6 pb-12 text-white">
          {/* 하단 좌측 작성자 & 캡션 */}
          <div className="flex flex-col gap-0.5">
            <span className="text-base font-bold">
              {item.authorName || "나의 기록"}
            </span>
            {currentDetail?.caption && (
              <span className="text-xs text-white/80">
                {currentDetail.caption}
              </span>
            )}
          </div>

          {/* 하단 우측 날짜 */}
          <span className="text-xs font-medium text-white/80">
            {extractDate(item.uploadedAt)}
          </span>
        </div>
      )}
    />
  );
}
