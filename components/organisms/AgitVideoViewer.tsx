"use client";

import { DailyIcon, FeedPillIconButton } from "@/components/atoms";
import { BaseVideoViewer, type BaseVideoViewerOverlayProps } from "@/components/organisms/BaseVideoViewer";
import { MoveTopicSheet } from "@/components/organisms/MoveTopicSheet";
import { ViewerActionsSheet } from "@/components/organisms/ViewerActionsSheet";
import type { VideoViewerItem } from "@/components/providers/VideoViewerProvider";
import { useState } from "react";

type AgitVideoViewerProps = {
  initialClipId: string;
  videoList: VideoViewerItem[];
  onClose?: () => void;
};

export function AgitVideoViewer({
  initialClipId,
  videoList,
  onClose,
}: AgitVideoViewerProps) {
  const [actionsOpen, setActionsOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);

  const currentItem =
    videoList.find((item) => item.clipId === initialClipId) ?? videoList[0];

  return (
    <>
      <BaseVideoViewer
        initialClipId={initialClipId}
        videoList={videoList}
        onClose={onClose}
        headerTitle={currentItem?.agitName || "오늘의 영상"}
        headerSubtitle={currentItem?.uploadedAt || "PLIP Clip"}
        headerTrailing={
          <FeedPillIconButton label="더보기" onClick={() => setActionsOpen(true)}>
            <DailyIcon name="ellipsis" size={16} className="brightness-0 invert" />
          </FeedPillIconButton>
        }
        overlayChildren={({ currentItem: item, currentDetail, currentIndex, totalCount }: BaseVideoViewerOverlayProps) => (
          <>
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
              <p className="m-0 text-lg font-bold">
                {item.title || currentDetail?.caption || "영상 클립"}
              </p>
              <p className="m-0 text-sm text-white/80">
                {item.authorName || "작성자"}{" "}
                {totalCount > 1 ? `· ${currentIndex + 1} / ${totalCount}` : ""}
              </p>
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
