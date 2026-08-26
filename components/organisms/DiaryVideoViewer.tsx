"use client";

import { DailyIcon, FeedPill, FeedPillIconButton } from "@/components/atoms";
import { CaptureClipOverlays } from "@/components/molecules";
import { BaseVideoViewer, type BaseVideoViewerOverlayProps } from "@/components/organisms/BaseVideoViewer";
import { MoveTopicSheet } from "@/components/organisms/MoveTopicSheet";
import { ViewerActionsSheet } from "@/components/organisms/ViewerActionsSheet";
import type { VideoViewerItem } from "@/components/providers/VideoViewerProvider";
import { extractDate, parseUploadedAtToDate } from "@/lib/video/formatOverlayClock";
import { useState } from "react";

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
  const [actionsOpen, setActionsOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);

  const currentItem =
    videoList.find((item) => item.clipId === initialClipId) ?? videoList[0];

  const themeName = currentItem?.themeName || currentItem?.title || "다이어리 테마";

  return (
    <>
      <BaseVideoViewer
        key={initialClipId}
        initialClipId={initialClipId}
        videoList={videoList}
        onClose={onClose}
        headerTitle={
          <FeedPill className="text-sm font-bold">
            {themeName}
          </FeedPill>
        }
        headerSubtitle={undefined}
        headerTrailing={
          <FeedPillIconButton label="더보기" onClick={() => setActionsOpen(true)}>
            <DailyIcon name="ellipsis" size={20} className="brightness-0 invert" />
          </FeedPillIconButton>
        }
        overlayChildren={({ currentItem: item, currentDetail }: BaseVideoViewerOverlayProps) => (
          <>
            {/* 비디오 중앙 대형 시각 + 캡션 오버레이 */}
            <CaptureClipOverlays
              capturedAt={parseUploadedAtToDate(item.uploadedAt)}
              caption={item.caption || currentDetail?.caption || ""}
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

      <ViewerActionsSheet
        open={actionsOpen}
        onClose={() => setActionsOpen(false)}
        onMoveTopic={() => setMoveOpen(true)}
      />
      <MoveTopicSheet open={moveOpen} onClose={() => setMoveOpen(false)} />
    </>
  );
}
