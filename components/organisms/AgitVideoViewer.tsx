"use client";

import { DailyIcon, FeedPill, FeedPillIconButton } from "@/components/atoms";
import { CaptureClipOverlays, VideoReactionBar } from "@/components/molecules";
import { BaseVideoViewer, type BaseVideoViewerOverlayProps } from "@/components/organisms/BaseVideoViewer";
import { MoveTopicSheet } from "@/components/organisms/MoveTopicSheet";
import { ViewerActionsSheet } from "@/components/organisms/ViewerActionsSheet";
import type { VideoViewerItem } from "@/components/providers/VideoViewerProvider";
import { extractDate, parseUploadedAtToDate } from "@/lib/video/formatOverlayClock";
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
  const dateStr = extractDate(currentItem?.uploadedAt);
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
        headerSubtitle={dateStr}
        headerTrailing={
          <FeedPillIconButton label="더보기" onClick={() => setActionsOpen(true)}>
            <DailyIcon name="ellipsis" size={16} className="brightness-0 invert" />
          </FeedPillIconButton>
        }
        overlayChildren={({ currentItem: item, currentDetail }: BaseVideoViewerOverlayProps) => (
          <>
            {/* 비디오 중앙 대형 시각 + 캡션 오버레이 (CaptureClipOverlays) */}
            <CaptureClipOverlays
              capturedAt={parseUploadedAtToDate(item.uploadedAt)}
              caption={currentDetail?.caption || ""}
              scale={1}
            />

            {/* 우측 이모지 리액션 바 */}
            <VideoReactionBar />

            {/* 하단 오버레이: 좌측 작성자 / 우측 아지트명 */}
            <div className="relative z-10 mt-auto flex items-end justify-between px-6 pb-12 text-white">
              <span className="text-base font-bold truncate max-w-[60%]">
                {item.authorName || "작성자"}
              </span>

              {agitName && (
                <span className="text-xs font-medium text-white/80 shrink-0 ml-2">
                  {agitName}
                </span>
              )}
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
