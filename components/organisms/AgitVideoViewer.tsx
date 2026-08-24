"use client";

import { DailyIcon, FeedPill, FeedPillIconButton } from "@/components/atoms";
import { VideoBottomInfo, VideoCenterClock } from "@/components/molecules";
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
          <FeedPillIconButton label="더보기" onClick={() => setActionsOpen(true)}>
            <DailyIcon name="ellipsis" size={16} className="brightness-0 invert" />
          </FeedPillIconButton>
        }
        overlayChildren={({ currentItem: item, currentDetail }: BaseVideoViewerOverlayProps) => (
          <>
            {/* 중앙 크게 시각 표시 (그룹뷰어 오버레이 스타일) */}
            <VideoCenterClock time={extractTime(item.uploadedAt)} />

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

            {/* 하단 좌측 작성자 & 하단 우측 날짜 */}
            <VideoBottomInfo
              authorName={item.authorName}
              date={extractDate(item.uploadedAt)}
              caption={item.title || currentDetail?.caption}
            />
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
