"use client";

import { getTopicVideosAction } from "@/actions/topicActions";
import { HeaderBackLink, HeaderMenuButton, ScreenHeader, TopicFeedPillHeader } from "@/components/molecules";
import { AgitMenuDrawer } from "@/components/organisms/AgitMenuDrawer";
import { MoveTopicSheet } from "@/components/organisms/MoveTopicSheet";
import { TopicGallerySection } from "@/components/organisms/TopicGallerySection";
import { ViewerActionsSheet } from "@/components/organisms/ViewerActionsSheet";
import { getAgitById } from "@/config/agit-mock";
import { ROUTES } from "@/config/routes";
import { shouldShowTopicCaptureSlot } from "@/lib/topic/selectAgitTopic";
import { extractDate } from "@/lib/video/formatOverlayClock";
import type { UiAgit } from "@/types/agit/ui";
import type { UiTopicDetail, UiTopicFeedWindow, UiTopicVideo } from "@/types/topic/ui";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const EMPTY_TOPIC_VIDEOS: UiTopicVideo[] = [];

type TopicFeedSectionProps = {
  agitId: string;
  agit?: UiAgit | null;
  initialWindow: UiTopicFeedWindow;
  initialVideos: Record<string, UiTopicVideo[]>;
};

export function TopicFeedSection({ agitId, agit, initialWindow, initialVideos }: TopicFeedSectionProps) {
  const router = useRouter();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const loadingVideoIds = useRef(new Set<string>());
  const videosRef = useRef(initialVideos);
  const [viewportHeight, setViewportHeight] = useState(0);

  const [actionsOpen, setActionsOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

  useEffect(() => {
    function updateHeight() {
      if (scrollerRef.current) {
        setViewportHeight(scrollerRef.current.clientHeight);
      }
    }
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  const current = topics[index];
  const backHref = ROUTES.agit.topics(agitId);
  const resolvedAgit = agit ?? getAgitById(agitId) ?? null;

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

  const prefetchNearEdge = useCallback(() => {
    const list = topicsRef.current;
    const currentIndex = indexRef.current;
    loadVideosAround(list, currentIndex);
  }, [loadVideosAround]);

  function handleScroll() {
    const el = scrollerRef.current;
    if (!el) return;
    const h = el.clientHeight;
    if (h <= 0) return;
    const newIndex = Math.round(el.scrollTop / h);
    if (newIndex !== indexRef.current && newIndex >= 0 && newIndex < topicsRef.current.length) {
      setIndex(newIndex);
    }
    prefetchNearEdge();
  }

  if (!current) {
    return (
      <>
        <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[var(--dl-color-bg-surface-default)]">
          <ScreenHeader
            leading={<HeaderBackLink href={ROUTES.agit.root} />}
            title={resolvedAgit?.name || "아지트"}
            subtitle="아직 토픽이 없습니다"
            trailing={<HeaderMenuButton label="아지트 메뉴" onClick={() => setMenuOpen(true)} />}
          />
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center p-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--dl-color-bg-surface-subtle)] mb-4 text-2xl">
              💬
            </div>
            <p className="m-0 text-base font-semibold text-[var(--dl-color-text-primary)]">
              등록된 토픽이 없습니다.
            </p>
            <p className="mt-1.5 mb-6 text-xs font-normal leading-relaxed text-[var(--dl-color-text-secondary)]">
              새로운 토픽을 생성하고 영상 기록을 시작해 보세요.
            </p>
            <button
              type="button"
              onClick={() => router.push(ROUTES.agit.topicCreate(agitId))}
              className="flex items-center justify-center rounded-xl bg-[#09080f] px-5 py-3 text-sm font-semibold text-white transition-opacity active:opacity-80 shadow-md"
            >
              ＋ 토픽 생성하기
            </button>
          </div>
        </div>

        {resolvedAgit && (
          <AgitMenuDrawer agit={resolvedAgit} open={menuOpen} onClose={() => setMenuOpen(false)} />
        )}
      </>
    );
  }

  const loadedVideos = videosByTopic[current.id];
  const videoCount = loadedVideos && loadedVideos.length > 0 ? loadedVideos.length : current.videoCount;

  return (
    <>
      <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        <TopicFeedPillHeader
          backHref={backHref}
          title={current.title || "제목 없음"}
          videoCount={videoCount}
          onMenuClick={() => setActionsOpen(true)}
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
                />
              ) : null}
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute bottom-4 right-4 z-30 flex items-center">
          <span className="text-xs font-medium text-white/80 [text-shadow:0_1px_3px_rgba(0,0,0,0.55)]">
            {extractDate(current.startDate)}
          </span>
        </div>
      </div>

      <ViewerActionsSheet
        open={actionsOpen}
        onClose={() => setActionsOpen(false)}
        onMoveTopic={() => setMoveOpen(true)}
      />
      <MoveTopicSheet open={moveOpen} onClose={() => setMoveOpen(false)} />
    </>
  );
}
