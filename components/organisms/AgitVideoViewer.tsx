"use client";

import { DailyIcon, FeedPill, FeedPillIconButton } from "@/components/atoms";
import { BaseVideoViewer, type BaseVideoViewerOverlayProps } from "@/components/organisms/BaseVideoViewer";
import { MoveTopicSheet } from "@/components/organisms/MoveTopicSheet";
import { ViewerActionsSheet } from "@/components/organisms/ViewerActionsSheet";
import type { VideoViewerItem } from "@/components/providers/VideoViewerProvider";
import { extractDate, extractTime } from "@/lib/video/formatOverlayClock";
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

  const topicName = currentItem?.topicName || currentItem?.title || "오늘의 토픽";
  const agitName = currentItem?.agitName;

  return (
    <>
      <BaseVideoViewer
        initialClipId={initialClipId}
        videoList={videoList}
        onClose={onClose}
        headerTitle={
          <FeedPill className="text-sm font-bold">
            {topicName}
          </FeedPill>
        }
        headerSubtitle={agitName}
        headerTrailing={
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-white/90">
              {extractTime(currentItem?.uploadedAt)}
            </span>
            <FeedPillIconButton label="더보기" onClick={() => setActionsOpen(true)}>
              <DailyIcon name="ellipsis" size={16} className="brightness-0 invert" />
            </FeedPillIconButton>
          </div>
        }
        overlayChildren={({ currentItem: item, currentDetail }: BaseVideoViewerOverlayProps) => (
          <>
            {/* Side Reaction Actions */}
            <div
              className="absolute right-5 bottom-32 z-20 flex flex-col gap-3 rounded-2xl bg-black/30 p-3 text-white text-xs font-medium backdrop-blur-md"
              aria-label="이모지 리액션"
            >
              <span>🔥 12</span>
              <span>💜 8</span>
              <span>👏 5</span>
              <span>＋</span>
            </div>

            {/* Bottom Info Overlay */}
            <div className="relative z-10 mt-auto flex items-end justify-between px-6 pb-12 text-white">
              {/* 하단 좌측 작성자 & 캡션 */}
              <div className="flex flex-col gap-0.5">
                <span className="text-base font-bold">
                  {item.authorName || "작성자"}
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
