"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type VideoViewerItem = {
  clipId: string;
  videoUuid?: string;
  title?: string;
  authorName?: string;
  uploadedAt?: string;
  thumbnailUrl?: string;
  rawPlaybackUrl?: string;
  agitName?: string;
};

type VideoViewerContextType = {
  isOpen: boolean;
  activeClipId: string | null;
  videoList: VideoViewerItem[];
  sourceContext?: "agit" | "diary" | "direct";
  openViewer: (clipId: string, list?: VideoViewerItem[], source?: "agit" | "diary" | "direct") => void;
  closeViewer: () => void;
};

const VideoViewerContext = createContext<VideoViewerContextType | null>(null);

export function VideoViewerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeClipId, setActiveClipId] = useState<string | null>(null);
  const [videoList, setVideoList] = useState<VideoViewerItem[]>([]);
  const [sourceContext, setSourceContext] = useState<"agit" | "diary" | "direct">("direct");

  const openViewer = (
    clipId: string,
    list: VideoViewerItem[] = [],
    source: "agit" | "diary" | "direct" = "direct"
  ) => {
    setActiveClipId(clipId);
    setVideoList(list.length > 0 ? list : [{ clipId }]);
    setSourceContext(source);
    setIsOpen(true);
  };

  const closeViewer = () => {
    setIsOpen(false);
    setActiveClipId(null);
  };

  return (
    <VideoViewerContext.Provider
      value={{
        isOpen,
        activeClipId,
        videoList,
        sourceContext,
        openViewer,
        closeViewer,
      }}
    >
      {children}
    </VideoViewerContext.Provider>
  );
}

export function useVideoViewer() {
  const context = useContext(VideoViewerContext);
  if (!context) {
    throw new Error("useVideoViewer must be used within a VideoViewerProvider");
  }
  return context;
}
