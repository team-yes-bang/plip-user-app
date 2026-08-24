"use client";

import { getTopicVideosAction } from "@/actions/topicActions";
import { DailyIcon, SubmitButton } from "@/components/atoms";
import { HeaderBackLink, HeaderMenuButton, ScreenHeader, TopicFeedPillHeader } from "@/components/molecules";
import { AgitMenuDrawer } from "@/components/organisms/AgitMenuDrawer";
import { MoveTopicSheet } from "@/components/organisms/MoveTopicSheet";
import { TopicGallerySection } from "@/components/organisms/TopicGallerySection";
import { ViewerActionsSheet } from "@/components/organisms/ViewerActionsSheet";
import { getAgitById } from "@/config/agit-mock";
import { ROUTES } from "@/config/routes";
import { isSameKstDate, shouldShowTopicCaptureSlot } from "@/lib/topic/selectAgitTopic";
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

type TopicFeedEmptyCoverProps = {
  isFullyEmpty: boolean;
  onTopicCreate: () => void;
  onScrollToFeed?: () => void;
  style?: React.CSSProperties;
};

function TopicFeedEmptyCover({
  isFullyEmpty,
  onTopicCreate,
  onScrollToFeed,
  style,
}: TopicFeedEmptyCoverProps) {
  return (
    <div
      className="flex h-full min-h-0 w-full shrink-0 snap-start snap-always flex-col items-center justify-center p-6 text-center bg-[var(--dl-color-bg-surface-default)]"
      style={style}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--dl-color-bg-surface-subtle)]">
        <DailyIcon name="messageBrand" size={28} />
      </div>
      <p className="m-0 mt-4 text-base font-semibold text-[var(--dl-color-text-primary)]">
        {isFullyEmpty ? "등록된 토픽이 없습니다." : "진행 중인 토픽이 없습니다."}
      </p>
      <p className="mt-1.5 mb-6 text-xs font-normal leading-relaxed text-[var(--dl-color-text-secondary)]">
        {isFullyEmpty
          ? "새로운 토픽을 생성하고 영상 기록을 시작해 보세요."
          : "새로운 토픽을 생성하거나, 아래로 끌어 이전 기록을 확인하세요."}
      </p>
      <SubmitButton
        type="button"
        variant="brand"
        className="flex items-center gap-1.5 w-auto px-6 py-3 font-semibold shadow-md"
        onClick={onTopicCreate}
      >
        <DailyIcon name="plus" size={16} className="brightness-0 invert" />
        <span>토픽 생성하기</span>
      </SubmitButton>

      {!isFullyEmpty && onScrollToFeed && (
        <button
          type="button"
          onClick={onScrollToFeed}
          className="mt-8 flex flex-col items-center gap-1.5 text-xs font-semibold text-[var(--dl-color-text-secondary)] animate-bounce cursor-pointer border-0 bg-transparent"
        >
          <span>이전 기록 피드 보기</span>
          <DailyIcon name="chevronLeft" size={16} className="-rotate-90 brightness-0 opacity-60" />
        </button>
      )}
    </div>
  );
}

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
  const [videosByTopic, setVideosByTopic] = useState<Record<string, UiTopicVideo[]>>(initialVideos);
  const [hasMoreBefore, setHasMoreBefore] = useState(initialWindow.hasMoreBefore);
  const [hasMoreAfter, setHasMoreAfter] = useState(initialWindow.hasMoreAfter);

  // 오늘 진행 중인 토픽 존재 여부 확인
  const hasActiveTopic = topics.some((t) => isSameKstDate(t.startDate, new Date()));
  const showCoverSlide = !hasActiveTopic && topics.length > 0;

  const [index, setIndex] = useState(() => {
    if (showCoverSlide) {
      return 0; // 진행 중인 토픽이 없을 때는 무조건 0 (커버 화면)에서 시작!
    }
    const found = initialWindow.topics.findIndex((topic) => topic.id === initialWindow.currentId);
    return found >= 0 ? found : 0;
  });

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

  const resolvedAgit = agit ?? getAgitById(agitId) ?? null;
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

  const prefetchNearEdge = useCallback(() => {
    const list = topicsRef.current;
    const currentIndex = showCoverSlide ? Math.max(0, indexRef.current - 1) : indexRef.current;
    loadVideosAround(list, currentIndex);
  }, [loadVideosAround, showCoverSlide]);

  function handleScroll() {
    const el = scrollerRef.current;
    if (!el) return;
    const h = el.clientHeight;
    if (h <= 0) return;
    const newIndex = Math.round(el.scrollTop / h);
    if (newIndex !== indexRef.current && newIndex >= 0) {
      setIndex(newIndex);
    }
    prefetchNearEdge();
  }

  // 토픽이 아예 0개인 경우
  if (topics.length === 0) {
    return (
      <>
        <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[var(--dl-color-bg-surface-default)]">
          <ScreenHeader
            leading={<HeaderBackLink href={ROUTES.agit.root} />}
            title={resolvedAgit?.name || "아지트"}
            trailing={<HeaderMenuButton label="아지트 메뉴" onClick={() => setMenuOpen(true)} />}
          />
          <TopicFeedEmptyCover
            isFullyEmpty={true}
            onTopicCreate={() => router.push(ROUTES.agit.topicCreate(agitId))}
          />
        </div>

        {resolvedAgit && (
          <AgitMenuDrawer agit={resolvedAgit} open={menuOpen} onClose={() => setMenuOpen(false)} />
        )}
      </>
    );
  }

  // 진행 중 토픽 부재 시 커버 슬라이드 포함 피드 목록 계산
  const effectiveIndex = showCoverSlide ? Math.max(0, index - 1) : index;
  const currentTopic = topics[effectiveIndex] ?? topics[0];
  const isAtCoverSlide = showCoverSlide && index === 0;

  const loadedVideos = videosByTopic[currentTopic.id];
  const videoCount = loadedVideos && loadedVideos.length > 0 ? loadedVideos.length : currentTopic.videoCount;

  return (
    <>
      <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        {/* 상단 헤더: 커버 슬라이드 일 때는 ScreenHeader, 피드 진입 시 TopicFeedPillHeader로 동적 전환 */}
        {isAtCoverSlide ? (
          <ScreenHeader
            leading={<HeaderBackLink href={ROUTES.agit.root} />}
            title={resolvedAgit?.name || "아지트"}
            trailing={<HeaderMenuButton label="아지트 메뉴" onClick={() => setMenuOpen(true)} />}
          />
        ) : (
          <TopicFeedPillHeader
            backHref={backHref}
            title={currentTopic.title || "제목 없음"}
            videoCount={videoCount}
            onMenuClick={() => setMenuOpen(true)}
          />
        )}

        <div
          ref={scrollerRef}
          onScroll={handleScroll}
          className="min-h-0 flex-1 snap-y snap-mandatory overflow-x-hidden overflow-y-auto overscroll-y-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {/* 커버 슬라이드 (진행 중인 토픽이 없을 때 슬라이드 0) */}
          {showCoverSlide && (
            <TopicFeedEmptyCover
              isFullyEmpty={false}
              onTopicCreate={() => router.push(ROUTES.agit.topicCreate(agitId))}
              onScrollToFeed={() => {
                scrollerRef.current?.scrollTo({
                  top: viewportHeight > 0 ? viewportHeight : 500,
                  behavior: "smooth",
                });
              }}
              style={{ height: viewportHeight > 0 ? viewportHeight : "100%" }}
            />
          )}

          {/* 과거/진행 토픽 피드 슬라이드 목록 */}
          {topics.map((topic, topicIndex) => (
            <div
              key={topic.id}
              className="flex h-full min-h-0 w-full shrink-0 snap-start snap-always flex-col"
              style={{ height: viewportHeight > 0 ? viewportHeight : "100%" }}
            >
              {Math.abs(topicIndex - effectiveIndex) <= 1 ? (
                <TopicGallerySection
                  videos={videosByTopic[topic.id] ?? EMPTY_TOPIC_VIDEOS}
                  captureHref={ROUTES.capture.videoWith({ agitUuid: agitId, topicUuid: topic.id })}
                  showCaptureSlot={shouldShowTopicCaptureSlot(topic)}
                />
              ) : null}
            </div>
          ))}
        </div>

        {/* 피드 슬라이드 노출 시 하단 우측 고정 날짜 */}
        {!isAtCoverSlide && (
          <div className="pointer-events-none absolute bottom-4 right-4 z-30 flex items-center">
            <span className="text-xs font-medium text-white/80 [text-shadow:0_1px_3px_rgba(0,0,0,0.55)]">
              {extractDate(currentTopic.startDate)}
            </span>
          </div>
        )}
      </div>

      {resolvedAgit && (
        <AgitMenuDrawer agit={resolvedAgit} open={menuOpen} onClose={() => setMenuOpen(false)} />
      )}
      <ViewerActionsSheet
        open={actionsOpen}
        onClose={() => setActionsOpen(false)}
        onMoveTopic={() => setMoveOpen(true)}
      />
      <MoveTopicSheet open={moveOpen} onClose={() => setMoveOpen(false)} />
    </>
  );
}
