"use client";

import { getTopicFeedWindowAction, getTopicVideosAction } from "@/actions/topicActions";
import { HeaderBackLink, ScreenHeader } from "@/components/molecules";
import { TopicGallerySection } from "@/components/organisms/TopicGallerySection";
import { ROUTES } from "@/config/routes";
import { mergeUniqueById } from "@/lib/topic/mergeTopicFeed";
import type { UiTopicDetail, UiTopicFeedWindow, UiTopicVideo } from "@/types/topic/ui";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const NEIGHBOR_LIMIT = 3;

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
  const viewportRef = useRef<HTMLDivElement>(null);
  const loadingEdge = useRef<"start" | "end" | null>(null);
  const loadedVideoIds = useRef(new Set(Object.keys(initialVideos)));
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const gestureAxis = useRef<"x" | "y" | null>(null);
  const dragOffsetRef = useRef(0);
  const wheelLock = useRef(false);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

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
  }, [topics, index, hasMoreBefore, hasMoreAfter]);

  const current = topics[index];
  const backHref = ROUTES.agit.topics(agitId);

  const loadVideosAround = useCallback(
    async (list: UiTopicDetail[], center: number) => {
      const ids = [list[center - 1]?.id, list[center]?.id, list[center + 1]?.id].filter(
        (id): id is string => Boolean(id),
      );
      await Promise.all(
        ids.map(async (id) => {
          if (loadedVideoIds.current.has(id)) {
            return;
          }
          loadedVideoIds.current.add(id);
          const result = await getTopicVideosAction(agitId, id);
          if (!result.ok) {
            loadedVideoIds.current.delete(id);
            return;
          }
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

  const goToIndex = useCallback(
    (nextIndex: number) => {
      const clamped = Math.min(Math.max(nextIndex, 0), topicsRef.current.length - 1);
      if (clamped === indexRef.current) {
        return;
      }
      indexRef.current = clamped;
      setIndex(clamped);
      prefetchNearEdge();
    },
    [prefetchNearEdge],
  );

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
    const root = viewportRef.current;
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
  }, []);

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

  function resetDrag() {
    dragOffsetRef.current = 0;
    setDragOffset(0);
    setIsDragging(false);
    pointerStart.current = null;
    gestureAxis.current = null;
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    pointerStart.current = { x: event.clientX, y: event.clientY };
    gestureAxis.current = null;
    dragOffsetRef.current = 0;
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const start = pointerStart.current;
    if (!start) {
      return;
    }
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (!gestureAxis.current) {
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
        return;
      }
      gestureAxis.current = Math.abs(dy) >= Math.abs(dx) ? "y" : "x";
    }
    if (gestureAxis.current !== "y") {
      return;
    }
    event.preventDefault();
    setIsDragging(true);
    const atStart = indexRef.current === 0;
    const atEnd = indexRef.current >= topicsRef.current.length - 1;
    let nextOffset = dy;
    if ((atStart && nextOffset > 0) || (atEnd && nextOffset < 0)) {
      nextOffset *= 0.28;
    }
    dragOffsetRef.current = nextOffset;
    setDragOffset(nextOffset);
  }

  function handlePointerUp() {
    if (gestureAxis.current === "y") {
      const height = viewportHeight || viewportRef.current?.clientHeight || 1;
      const threshold = Math.max(48, height * 0.18);
      const offset = dragOffsetRef.current;
      if (offset < -threshold) {
        goToIndex(indexRef.current + 1);
      } else if (offset > threshold) {
        goToIndex(indexRef.current - 1);
      }
    }
    resetDrag();
  }

  useEffect(() => {
    const root = viewportRef.current;
    if (!root) {
      return;
    }
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (wheelLock.current || Math.abs(event.deltaY) < 20) {
        return;
      }
      wheelLock.current = true;
      window.setTimeout(() => {
        wheelLock.current = false;
      }, 420);
      if (event.deltaY > 0) {
        goToIndex(indexRef.current + 1);
      } else {
        goToIndex(indexRef.current - 1);
      }
    };
    const onTouchMove = (event: TouchEvent) => {
      if (gestureAxis.current === "y") {
        event.preventDefault();
      }
    };
    root.addEventListener("wheel", onWheel, { passive: false });
    root.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      root.removeEventListener("wheel", onWheel);
      root.removeEventListener("touchmove", onTouchMove);
    };
  }, [current, goToIndex]);

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

  const dateLabel = current.startDate.replaceAll("-", ".");
  const videoCount = videosByTopic[current.id]?.length ?? current.videoCount;
  const slideHeight = viewportHeight;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <ScreenHeader
        leading={<HeaderBackLink href={backHref} />}
        title={current.title || "제목 없음"}
        subtitle={`${dateLabel} · ${videoCount}개 영상`}
      />
      <div
        ref={viewportRef}
        className="relative min-h-0 flex-1 touch-none overflow-hidden"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={resetDrag}
      >
        {topics.map((topic, topicIndex) => (
          <div
            key={topic.id}
            className="absolute inset-x-0 top-0 flex flex-col"
            style={{
              height: slideHeight > 0 ? slideHeight : "100%",
              transform: `translate3d(0, calc(${(topicIndex - index) * 100}% + ${dragOffset}px), 0)`,
              transition: isDragging ? "none" : "transform 240ms ease-out",
            }}
          >
            <TopicGallerySection
              videos={videosByTopic[topic.id] ?? []}
              captureHref={ROUTES.agit.upload(agitId)}
              onSelectVideo={(videoId) => router.push(ROUTES.viewer.clip(videoId))}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
