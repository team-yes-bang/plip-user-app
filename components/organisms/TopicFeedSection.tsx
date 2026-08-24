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
  const scrollerRef = useRef<HTMLDivElement>(null);
  const didSyncScroll = useRef(false);
  const loadingEdge = useRef<"start" | "end" | null>(null);
  const loadedVideoIds = useRef(new Set(Object.keys(initialVideos)));

  const [topics, setTopics] = useState(initialWindow.topics);
  const [index, setIndex] = useState(() => {
    const found = initialWindow.topics.findIndex((topic) => topic.id === initialWindow.currentId);
    return found >= 0 ? found : 0;
  });
  const [videosByTopic, setVideosByTopic] = useState<Record<string, UiTopicVideo[]>>(initialVideos);
  const [hasMoreBefore, setHasMoreBefore] = useState(initialWindow.hasMoreBefore);
  const [hasMoreAfter, setHasMoreAfter] = useState(initialWindow.hasMoreAfter);

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
          setHasMoreBefore(false);
        } else {
          setHasMoreAfter(false);
        }
        return;
      }
      setTopics((currentTopics) => {
        const merged = mergeUniqueById(currentTopics, extra, (topic) => topic.id, edge);
        const added = merged.length - currentTopics.length;
        if (edge === "start" && added > 0) {
          setIndex((currentIndex) => currentIndex + added);
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
        setHasMoreBefore(result.data.hasMoreBefore);
      } else {
        setHasMoreAfter(result.data.hasMoreAfter);
      }
    },
    [agitId],
  );

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root || didSyncScroll.current) {
      return;
    }
    didSyncScroll.current = true;
    root.scrollTop = index * root.clientHeight;
  }, [index]);

  useEffect(() => {
    if (!current) {
      return;
    }
    router.replace(ROUTES.agit.topicFeed(agitId, current.id), { scroll: false });
    void loadVideosAround(topics, index);
  }, [agitId, current, index, loadVideosAround, router, topics]);

  useEffect(() => {
    if (index <= 1 && hasMoreBefore && topics[0]) {
      void extendWindow("start", topics[0].id);
    }
  }, [extendWindow, hasMoreBefore, index, topics]);

  useEffect(() => {
    if (index >= topics.length - 2 && hasMoreAfter && topics.at(-1)) {
      void extendWindow("end", topics.at(-1)!.id);
    }
  }, [extendWindow, hasMoreAfter, index, topics]);

  function handleScroll() {
    const root = scrollerRef.current;
    if (!root || root.clientHeight === 0 || topics.length === 0) {
      return;
    }
    const nextIndex = Math.min(
      topics.length - 1,
      Math.max(0, Math.round(root.scrollTop / root.clientHeight)),
    );
    setIndex(nextIndex);
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

  const dateLabel = current.startDate.replaceAll("-", ".");
  const videoCount = videosByTopic[current.id]?.length ?? current.videoCount;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <ScreenHeader
        leading={<HeaderBackLink href={backHref} />}
        title={current.title || "제목 없음"}
        subtitle={`${dateLabel} · ${videoCount}개 영상`}
      />
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 snap-y snap-mandatory overflow-x-hidden overflow-y-auto overscroll-y-contain touch-pan-y [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {topics.map((topic) => (
          <div key={topic.id} className="flex h-full min-h-full w-full shrink-0 snap-start snap-always flex-col">
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
