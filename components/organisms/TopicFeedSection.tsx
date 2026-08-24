"use client";

import { getTopicFeedWindowAction, getTopicVideosAction } from "@/actions/topicActions";
import { HeaderBackLink, ScreenHeader, TopicFeedPillHeader } from "@/components/molecules";
import { TopicGallerySection } from "@/components/organisms/TopicGallerySection";
import { ROUTES } from "@/config/routes";
import { mergeUniqueById } from "@/lib/topic/mergeTopicFeed";
import { shouldShowTopicCaptureSlot } from "@/lib/topic/selectAgitTopic";
import type { UiTopicDetail, UiTopicFeedWindow, UiTopicVideo } from "@/types/topic/ui";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const NEIGHBOR_LIMIT = 3;
const EMPTY_TOPIC_VIDEOS: UiTopicVideo[] = [];

type TopicFeedSectionProps = {
  agitId: string;
  initialWindow: UiTopicFeedWindow;
  initialVideos: Record<string, UiTopicVideo[]>;
};

function sliceAroundAnchor(topics: UiTopicDetail[], anchorId: string, edge: "start" | "end"): UiTopicDetail[] {
  const index = topics.findIndex((topic) => topic.id === anchorId);
  if (index < 0) {
    return [];
  }
  return edge === "start" ? topics.slice(0, index) : topics.slice(index + 1);
}

export function TopicFeedSection({ agitId, initialWindow, initialVideos }: TopicFeedSectionProps) {
  const router = useRouter();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const didSyncScroll = useRef(false);
  const loadingEdge = useRef<"start" | "end" | null>(null);
  const loadingVideoIds = useRef(new Set<string>());
  const videosRef = useRef(initialVideos);
  const [viewportHeight, setViewportHeight] = useState(0);

  const [topics, setTopics] = useState(initialWindow.topics);
  const [index, setIndex] = useState(() => {
    const found = initialWindow.topics.findIndex((topic) => topic.id === initialWindow.currentId);
    return found >= 0 ? found : 0;
  });
  const [videosByTopic, setVideosByTopic] = useState<Record<string, UiTopicVideo[]>>(initialVideos);
  const [hasMoreBefore, setHasMoreBefore] = useState(initialWindow.hasMoreBefore);
  const [hasMoreAfter, setHasMoreAfter] = useState(initialWindow.hasMoreAfter);

  const topicsRef = useRef(topics);
  const indexRef = useRef(index);
  const hasMoreBeforeRef = useRef(hasMoreBefore);
  const hasMoreAfterRef = useRef(hasMoreAfter);

  useEffect(() => {
    topicsRef.current = topics;
    indexRef.current = index;
    hasMoreBeforeRef.current = hasMoreBefore;
    hasMoreAfterRef.current = hasMoreAfter;
    videosRef.current = videosByTopic;
  }, [hasMoreAfter, hasMoreBefore, index, topics, videosByTopic]);

  const current = topics[index];
  const backHref = ROUTES.agit.topics(agitId);

  const loadVideosAround = useCallback(
    async (list: UiTopicDetail[], center: number) => {
      const ids = [list[center - 1]?.id, list[center]?.id, list[center + 1]?.id].filter(
        (id): id is string => Boolean(id),
      );
      await Promise.all(
        ids.map(async (id) => {
          const topic = list.find((item) => item.id === id);
          const existing = videosRef.current[id];
          const knownEmpty = (topic?.videoCount ?? 0) === 0;
          if (existing && (existing.length > 0 || knownEmpty)) {
            return;
          }
          if (loadingVideoIds.current.has(id)) {
            return;
          }
          loadingVideoIds.current.add(id);
          const result = await getTopicVideosAction(agitId, id);
          loadingVideoIds.current.delete(id);
          if (!result.ok) {
            return;
          }
          videosRef.current = { ...videosRef.current, [id]: result.data };
          setVideosByTopic((currentMap) => ({ ...currentMap, [id]: result.data }));
        }),
      );
    },
    [agitId],
  );

  const extendWindowRef = useRef<(edge: "start" | "end", anchorId: string) => Promise<void>>(
    async () => undefined,
  );

  const prefetchNearEdge = useCallback(() => {
    const list = topicsRef.current;
    const currentIndex = indexRef.current;
    const startId = list[0]?.id;
    const endId = list.at(-1)?.id;
    if (currentIndex <= 1 && hasMoreBeforeRef.current && startId) {
      void extendWindowRef.current("start", startId);
      return;
    }
    if (currentIndex >= list.length - 2 && hasMoreAfterRef.current && endId) {
      void extendWindowRef.current("end", endId);
    }
  }, []);

  const extendWindow = useCallback(
    async (edge: "start" | "end", anchorId: string) => {
      if (loadingEdge.current) {
        return;
      }
      loadingEdge.current = edge;
      const result = await getTopicFeedWindowAction(agitId, {
        topicUuid: anchorId,
        before: edge === "start" ? NEIGHBOR_LIMIT : 0,
        after: edge === "end" ? NEIGHBOR_LIMIT : 0,
      });
      loadingEdge.current = null;
      if (!result.ok) {
        return;
      }
      const extra = sliceAroundAnchor(result.data.topics, anchorId, edge);
      if (extra.length === 0) {
        if (edge === "start") {
          hasMoreBeforeRef.current = false;
          setHasMoreBefore(false);
        } else {
          hasMoreAfterRef.current = false;
          setHasMoreAfter(false);
        }
        prefetchNearEdge();
        return;
      }
      setTopics((currentTopics) => {
        const merged = mergeUniqueById(currentTopics, extra, (topic) => topic.id, edge);
        const added = merged.length - currentTopics.length;
        topicsRef.current = merged;
        if (edge === "start" && added > 0) {
          const nextIndex = indexRef.current + added;
          indexRef.current = nextIndex;
          setIndex(nextIndex);
          requestAnimationFrame(() => {
            const root = scrollerRef.current;
            if (root) {
              root.scrollTop += added * root.clientHeight;
            }
          });
        }
        return merged;
      });
      if (edge === "start") {
        hasMoreBeforeRef.current = result.data.hasMoreBefore;
        setHasMoreBefore(result.data.hasMoreBefore);
      } else {
        hasMoreAfterRef.current = result.data.hasMoreAfter;
        setHasMoreAfter(result.data.hasMoreAfter);
      }
      prefetchNearEdge();
    },
    [agitId, prefetchNearEdge],
  );

  useEffect(() => {
    extendWindowRef.current = extendWindow;
  }, [extendWindow]);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) {
      return;
    }
    const applyHeight = () => {
      const nextHeight = root.clientHeight;
      setViewportHeight((currentHeight) => (currentHeight === nextHeight ? currentHeight : nextHeight));
    };
    applyHeight();
    const observer = new ResizeObserver(applyHeight);
    observer.observe(root);
    return () => observer.disconnect();
  }, [current]);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root || viewportHeight === 0 || didSyncScroll.current) {
      return;
    }
    didSyncScroll.current = true;
    root.scrollTop = indexRef.current * viewportHeight;
  }, [viewportHeight]);

  useEffect(() => {
    const timer = window.setTimeout(() => prefetchNearEdge(), 0);
    return () => window.clearTimeout(timer);
  }, [prefetchNearEdge]);

  useEffect(() => {
    if (!current) {
      return;
    }
    const nextUrl = ROUTES.agit.topicFeed(agitId, current.id);
    const currentUrl = `${window.location.pathname}${window.location.search}`;
    if (currentUrl !== nextUrl) {
      window.history.replaceState(window.history.state, "", nextUrl);
    }
    void loadVideosAround(topics, index);
  }, [agitId, current, index, loadVideosAround, topics]);

  function handleScroll() {
    const root = scrollerRef.current;
    if (!root || root.clientHeight === 0 || topics.length === 0) {
      return;
    }
    const nextIndex = Math.min(
      topics.length - 1,
      Math.max(0, Math.round(root.scrollTop / root.clientHeight)),
    );
    if (nextIndex !== indexRef.current) {
      indexRef.current = nextIndex;
      setIndex(nextIndex);
    }
    prefetchNearEdge();
  }

  if (!current) {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        <ScreenHeader leading={<HeaderBackLink href={backHref} />} title="토픽" />
        <div className="min-h-0 flex-1 px-[23px] pb-6">
          <p className="m-0 text-sm font-normal leading-5 text-[var(--dl-color-text-secondary)]">
            피드에 보여줄 토픽이 없습니다.
          </p>
        </div>
      </div>
    );
  }

  const loadedVideos = videosByTopic[current.id];
  const videoCount = loadedVideos && loadedVideos.length > 0 ? loadedVideos.length : current.videoCount;

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <TopicFeedPillHeader
        backHref={backHref}
        title={current.title || "제목 없음"}
        videoCount={videoCount}
      />
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 snap-y snap-mandatory overflow-x-hidden overflow-y-auto overscroll-y-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {topics.map((topic, topicIndex) => (
          <div
            key={topic.id}
            className="flex h-full min-h-0 w-full shrink-0 snap-start snap-always flex-col"
            style={{ height: viewportHeight > 0 ? viewportHeight : "100%" }}
          >
            {Math.abs(topicIndex - index) <= 1 ? (
              <TopicGallerySection
                videos={videosByTopic[topic.id] ?? EMPTY_TOPIC_VIDEOS}
                captureHref={ROUTES.capture.videoWith({ agitUuid: agitId, topicUuid: topic.id })}
                showCaptureSlot={shouldShowTopicCaptureSlot(topic)}
                onSelectVideo={(videoId) => router.push(ROUTES.viewer.clip(videoId))}
              />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
