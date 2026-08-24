"use client";

import { FeedPill } from "@/components/atoms";
import { VideoBottomInfo, VideoCenterClock } from "@/components/molecules";
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
      headerSubtitle={undefined}
      headerTrailing={undefined}
      overlayChildren={({ currentItem: item, currentDetail }: BaseVideoViewerOverlayProps) => (
        <>
          {/* 중앙 크게 시각 표시 (그룹뷰어 오버레이 스타일) */}
          <VideoCenterClock time={extractTime(item.uploadedAt)} />

          {/* 하단 좌측 작성자 & 하단 우측 날짜 */}
          <VideoBottomInfo
            authorName={item.authorName || "나의 기록"}
            date={extractDate(item.uploadedAt)}
            caption={currentDetail?.caption}
          />
        </>
      )}
    />
  );
}
