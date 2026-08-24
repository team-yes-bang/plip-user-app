"use client";

import { BaseVideoViewer, type BaseVideoViewerOverlayProps } from "@/components/organisms/BaseVideoViewer";
import type { VideoViewerItem } from "@/components/providers/VideoViewerProvider";

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

  return (
    <BaseVideoViewer
      initialClipId={initialClipId}
      videoList={videoList}
      onClose={onClose}
      headerTitle="다이어리 기록"
      headerSubtitle={currentItem?.uploadedAt || "기록된 영상"}
      headerTrailing={null}
      overlayChildren={({ currentItem: item, currentDetail, currentIndex, totalCount }: BaseVideoViewerOverlayProps) => (
        <div className="relative z-10 mt-auto flex flex-col gap-1 px-6 pb-12 text-white">
          <p className="m-0 text-lg font-bold">
            {item.title || currentDetail?.caption || "다이어리 영상"}
          </p>
          <p className="m-0 text-sm text-white/80">
            {item.uploadedAt || "기록 일자"}{" "}
            {totalCount > 1 ? `· ${currentIndex + 1} / ${totalCount}` : ""}
          </p>
        </div>
      )}
    />
  );
}
