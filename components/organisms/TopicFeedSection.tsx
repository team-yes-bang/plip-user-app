"use client";

import { getTopicVideosAction } from "@/actions/topicActions";
import { DailyIcon, SubmitButton } from "@/components/atoms";
import { ScreenHeader, TopicFeedPillHeader } from "@/components/molecules";
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
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const EMPTY_TOPIC_VIDEOS: UiTopicVideo[] = [];
const FEED_SCROLL_END_DELAY_MS = 120;

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
      className="relative flex min-h-full w-full shrink-0 snap-start snap-always flex-col items-center justify-center p-6 text-center bg-[var(--dl-color-bg-surface-default)]"
      style={style}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--dl-color-bg-surface-subtle)]">
        <DailyIcon name="messageBrand" size={28} />
      </div>
      <p className="m-0 mt-4 text-base font-semibold text-[var(--dl-color-text-primary)]">
        {isFullyEmpty ? "등록된 토픽이 없습니다." : "진행 중인 토픽이 없습니다."}
      </p>
      <p className="mt-1.5 mb-6 text-xs font-normal leading-relaxed text-[var(--dl-color-text-secondary)] max-w-xs break-keep">
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
          className="absolute top-[75%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 border-0 bg-transparent p-2 text-center cursor-pointer group"
        >
          <span className="text-[11px] font-medium text-[var(--dl-color-text-tertiary)] group-hover:text-[var(--dl-color-text-primary)] transition-colors whitespace-nowrap">
            이전 기록 피드 보기
          </span>
          <span className="inline-block animate-bounce">
            <DailyIcon
              name="chevronLeft"
              size={16}
              className="-rotate-90 text-[var(--dl-color-text-tertiary)] group-hover:text-[var(--dl-color-text-primary)] opacity-70 transition-colors"
            />
          </span>
        </button>
      )}
    </div>
  );
}

export function TopicFeedSection({ agitId, agit, initialWindow, initialVideos }: TopicFeedSectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const loadingVideoIds = useRef(new Set<string>());
  const videosRef = useRef(initialVideos);
  const scrollEndTimerRef = useRef<number | null>(null);
  const [, setViewportHeight] = useState(0);
  const [isFeedScrolling, setIsFeedScrolling] = useState(false);

  const [actionsOpen, setActionsOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [topics] = useState(initialWindow.topics);
  const [videosByTopic, setVideosByTopic] = useState<Record<string, UiTopicVideo[]>>(initialVideos);
  const [hasMoreBefore] = useState(initialWindow.hasMoreBefore);
  const [hasMoreAfter] = useState(initialWindow.hasMoreAfter);

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
    return () => {
      window.removeEventListener("resize", updateHeight);
      if (scrollEndTimerRef.current) {
        window.clearTimeout(scrollEndTimerRef.current);
      }
    };
  }, []);

  const resolvedAgit = agit ?? getAgitById(agitId) ?? null;

  // 동적 뒤로가기 핸들러
  const handleBack = useCallback(() => {
    const fromParam = searchParams.get("from");
    const hasHistory = typeof window !== "undefined" && window.history.length > 1 && document.referrer;

    if (fromParam === "topics") {
      router.push(ROUTES.agit.topics(agitId));
    } else if (fromParam === "agit") {
      router.push(ROUTES.agit.detail(agitId));
    } else if (hasHistory) {
      router.back();
    } else {
      router.push(ROUTES.agit.topics(agitId));
    }
  }, [agitId, router, searchParams]);

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

    setIsFeedScrolling((prev) => (prev ? prev : true));
    if (scrollEndTimerRef.current) {
      window.clearTimeout(scrollEndTimerRef.current);
    }
    scrollEndTimerRef.current = window.setTimeout(() => {
      setIsFeedScrolling(false);
      scrollEndTimerRef.current = null;
    }, FEED_SCROLL_END_DELAY_MS);

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
            tone="default"
            backHref={ROUTES.agit.root}
            title={resolvedAgit?.name || "아지트"}
            onMenuOpen={() => setMenuOpen(true)}
            menuLabel="아지트 메뉴"
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
        {/* 상단 헤더: 커버 슬라이드에서는 아지트 표준 헤더, 실제 영상 피드 슬라이드에서는 TopicFeedPillHeader */}
        {isAtCoverSlide ? (
          <div className="pointer-events-auto absolute top-0 inset-x-0 z-30">
            <ScreenHeader
              tone="default"
              onBack={handleBack}
              title={resolvedAgit?.name || "아지트"}
              onMenuOpen={() => setMenuOpen(true)}
              menuLabel="아지트 메뉴"
            />
          </div>
        ) : (
          <TopicFeedPillHeader
            onBack={handleBack}
            title={currentTopic.title || "제목 없음"}
            videoCount={videoCount}
            onMenuClick={() => setMenuOpen(true)}
          />
        )}

        <div
          ref={scrollerRef}
          onScroll={handleScroll}
          className="h-full min-h-0 flex-1 snap-y snap-mandatory overflow-x-hidden overflow-y-auto overscroll-y-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {/* 커버 슬라이드 (진행 중인 토픽이 없을 때 슬라이드 0) */}
          {showCoverSlide && (
            <div className="h-full w-full shrink-0 snap-start snap-always">
              <TopicFeedEmptyCover
                isFullyEmpty={false}
                onTopicCreate={() => router.push(ROUTES.agit.topicCreate(agitId))}
                onScrollToFeed={() => {
                  scrollerRef.current?.scrollTo({
                    top: scrollerRef.current?.clientHeight || 500,
                    behavior: "smooth",
                  });
                }}
              />
            </div>
          )}

          {/* 과거/진행 토픽 피드 슬라이드 목록 */}
          {topics.map((topic, topicIndex) => (
            <div
              key={topic.id}
              className="flex h-full min-h-0 w-full shrink-0 snap-start snap-always flex-col"
            >
              {Math.abs(topicIndex - effectiveIndex) <= 1 ? (
                <TopicGallerySection
                  videos={videosByTopic[topic.id] ?? EMPTY_TOPIC_VIDEOS}
                  captureHref={ROUTES.capture.videoWith({ agitUuid: agitId, topicUuid: topic.id })}
                  showCaptureSlot={shouldShowTopicCaptureSlot(topic)}
                  topicTitle={topic.title}
                  agitName={resolvedAgit?.name}
                  playbackEnabled={!isAtCoverSlide && topicIndex === effectiveIndex && !isFeedScrolling}
                />
              ) : null}
            </div>
          ))}
        </div>

        {/* 피드 슬라이드 노출 시 하단 우측 고정 날짜 */}
        {!isAtCoverSlide && (
          <div className="pointer-events-none absolute bottom-7 right-6 z-30 flex items-center">
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
