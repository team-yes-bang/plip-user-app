"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

export type VideoViewerItem = {
  clipId: string;
  videoUuid?: string;
  title?: string;
  authorName?: string;
  uploadedAt?: string;
  thumbnailUrl?: string;
  rawPlaybackUrl?: string;
  agitName?: string;
  topicName?: string;
  themeName?: string;
};

type VideoViewerContextType = {
  isOpen: boolean;
  activeClipId: string | null;
  videoList: VideoViewerItem[];
  sourceContext?: "agit" | "diary" | "direct";
  openViewer: (clipId: string, list?: VideoViewerItem[], source?: "agit" | "diary" | "direct") => void;
  closeViewer: (triggerHistoryBack?: boolean) => void;
};

const VideoViewerContext = createContext<VideoViewerContextType | null>(null);

export function VideoViewerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeClipId, setActiveClipId] = useState<string | null>(null);
  const [videoList, setVideoList] = useState<VideoViewerItem[]>([]);
  const [sourceContext, setSourceContext] = useState<"agit" | "diary" | "direct">("direct");
  const pushedHistoryRef = useRef(false);

  const closeViewer = useCallback((triggerHistoryBack = true) => {
    setIsOpen(false);
    setActiveClipId(null);

    if (triggerHistoryBack && pushedHistoryRef.current) {
      pushedHistoryRef.current = false;
      if (typeof window !== "undefined") {
        window.history.back();
      }
    }
  }, []);

  const openViewer = useCallback(
    (
      clipId: string,
      list: VideoViewerItem[] = [],
      source: "agit" | "diary" | "direct" = "direct"
    ) => {
      setActiveClipId(clipId);
      setVideoList(list.length > 0 ? list : [{ clipId }]);
      setSourceContext(source);
      setIsOpen(true);

      if (typeof window !== "undefined") {
        window.history.pushState({ videoViewerOpen: true }, "");
        pushedHistoryRef.current = true;
      }
    },
    []
  );

  useEffect(() => {
    const handlePopState = () => {
      if (pushedHistoryRef.current) {
        pushedHistoryRef.current = false;
        closeViewer(false);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("popstate", handlePopState);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("popstate", handlePopState);
      }
    };
  }, [closeViewer]);

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
