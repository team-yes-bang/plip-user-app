"use client";

import { AgitVideoViewer } from "@/components/organisms/AgitVideoViewer";
import { DiaryVideoViewer } from "@/components/organisms/DiaryVideoViewer";
import { useVideoViewer, type VideoViewerItem } from "@/components/providers/VideoViewerProvider";

type FullpageVideoViewerProps = {
  initialClipId: string;
  videoList: VideoViewerItem[];
  onClose?: () => void;
  isStandalone?: boolean;
};

export function FullpageVideoViewer({
  initialClipId,
  videoList,
  onClose,
}: FullpageVideoViewerProps) {
  const { sourceContext } = useVideoViewer();

  if (sourceContext === "diary") {
    return (
      <DiaryVideoViewer
        initialClipId={initialClipId}
        videoList={videoList}
        onClose={onClose}
      />
    );
  }

  return (
    <AgitVideoViewer
      initialClipId={initialClipId}
      videoList={videoList}
      onClose={onClose}
    />
  );
}
