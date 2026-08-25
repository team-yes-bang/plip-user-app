"use client";

import { fetchDiaryDateWindowAction } from "@/actions/diaryActions";
import { DailyIcon } from "@/components/atoms";
import { DiaryThemeClipGroup, ScreenHeader } from "@/components/molecules";
import { DiarySideMenu } from "@/components/organisms/DiarySideMenu";
import { ROUTES } from "@/config/routes";
import type { UiDiaryDateWindow } from "@/types/diary/ui";
import {
  getTodayKstDateString,
  isFutureDiaryDate,
  shiftDiaryDate,
} from "@/types/diary/schema";
import { useRouter } from "next/navigation";
import { useRef, useState, type PointerEvent } from "react";

type DiaryDateDetailSectionProps = {
  initialWindow: UiDiaryDateWindow;
  error?: string;
};

const SWIPE_THRESHOLD = 48;

export function DiaryDateDetailSection({
  initialWindow,
  error: initialError,
}: DiaryDateDetailSectionProps) {
  const router = useRouter();
  const pointerStart = useRef<{ x: number; y: number; scrollTop: number } | null>(null);
  const [focusDate, setFocusDate] = useState(initialWindow.focusDate);
  const [daysCache, setDaysCache] = useState(initialWindow.days);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialError);
  const [menuOpen, setMenuOpen] = useState(false);

  const themes = daysCache[focusDate] ?? [];
  const prevDate = shiftDiaryDate(focusDate, -1);
  const nextDate = shiftDiaryDate(focusDate, 1);
  const canGoNext = !isFutureDiaryDate(nextDate, getTodayKstDateString());

  function isInteractiveTarget(target: EventTarget | null): boolean {
    return target instanceof Element && Boolean(target.closest("a, button, input, textarea, select"));
  }

  function getRelativeX(clientX: number, element: HTMLDivElement): number {
    const rect = element.getBoundingClientRect();
    return (clientX - rect.left) / rect.width;
  }

  async function navigateToDate(targetDate: string) {
    if (isFutureDiaryDate(targetDate)) {
      return;
    }

    if (Object.prototype.hasOwnProperty.call(daysCache, targetDate)) {
      setFocusDate(targetDate);
      router.replace(ROUTES.diary.date(targetDate));
      return;
    }

    setLoading(true);
    const result = await fetchDiaryDateWindowAction(targetDate, 1);
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setDaysCache((current) => ({ ...current, ...result.data.days }));
    setFocusDate(result.data.focusDate);
    setError(undefined);
    router.replace(ROUTES.diary.date(result.data.focusDate));
  }

  function goPrev() {
    void navigateToDate(prevDate);
  }

  function goNext() {
    if (!canGoNext) {
      return;
    }

    void navigateToDate(nextDate);
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (isInteractiveTarget(event.target)) {
      pointerStart.current = null;
      return;
    }

    pointerStart.current = {
      x: event.clientX,
      y: event.clientY,
      scrollTop: event.currentTarget.scrollTop,
    };
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!pointerStart.current) {
      return;
    }

    const start = pointerStart.current;
    pointerStart.current = null;

    if (isInteractiveTarget(event.target)) {
      return;
    }

    if (Math.abs(event.currentTarget.scrollTop - start.scrollTop) > 5) {
      return;
    }

    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    const startRatio = getRelativeX(start.x, event.currentTarget);

    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) {
        goNext();
      } else {
        goPrev();
      }
      return;
    }

    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
      if (startRatio < 1 / 8) {
        goPrev();
      } else if (startRatio > 7 / 8) {
        goNext();
      }
    }
  }

  function handlePointerCancel() {
    pointerStart.current = null;
  }

  const formattedDate = focusDate.replaceAll("-", ".");

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <ScreenHeader
        tone="plain"
        titleAlign="center"
        backHref={ROUTES.diary.root}
        title={formattedDate}
        onMenuOpen={() => setMenuOpen(true)}
        menuLabel="다이어리 메뉴"
        className="shrink-0 px-6 pt-3 pb-3"
      />

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* 화면 중앙 좌우 플로팅 날짜 이동 버튼 */}
        <button
          type="button"
          className="absolute left-2.5 top-1/2 z-20 -translate-y-1/2 grid size-10 cursor-pointer place-items-center rounded-full border border-[var(--dl-color-border-default)] bg-[var(--dl-color-bg-elevated)]/85 text-[var(--dl-color-text-primary)] shadow-[0_4px_16px_rgba(23,23,28,0.08)] backdrop-blur-md transition-opacity hover:opacity-100 disabled:pointer-events-none disabled:opacity-20"
          aria-label="이전 날짜"
          onClick={goPrev}
        >
          <DailyIcon name="chevronLeft" size={20} />
        </button>

        <button
          type="button"
          className="absolute right-2.5 top-1/2 z-20 -translate-y-1/2 grid size-10 cursor-pointer place-items-center rounded-full border border-[var(--dl-color-border-default)] bg-[var(--dl-color-bg-elevated)]/85 text-[var(--dl-color-text-primary)] shadow-[0_4px_16px_rgba(23,23,28,0.08)] backdrop-blur-md transition-opacity hover:opacity-100 disabled:pointer-events-none disabled:opacity-20"
          aria-label="다음 날짜"
          disabled={!canGoNext}
          onClick={goNext}
        >
          <DailyIcon name="chevronRight" size={20} />
        </button>

        {/* 다이어리 클립 목록 */}
        <div
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 pt-2 pb-6 touch-pan-y [scrollbar-width:none] [-ms-overflow-style:none]"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
        >
          {loading ? (
            <p className="m-0 text-center text-xs font-semibold text-[var(--dl-color-text-secondary)]">불러오는 중...</p>
          ) : null}
          {error ? <p className="m-0 text-center text-sm text-[var(--dl-color-text-danger)]">{error}</p> : null}

          {themes.length > 0 ? (
            themes.map((group) => (
              <DiaryThemeClipGroup
                key={group.themeId}
                themeName={group.themeName}
                date={focusDate}
                clipCount={group.clipCount}
                clips={group.clips}
              />
            ))
          ) : !loading ? (
            <div className="my-auto flex flex-col items-center justify-center p-8 text-center">
              <p className="m-0 text-sm font-medium text-[var(--dl-color-text-secondary)]">
                해당 날짜의 다이어리 기록이 없습니다.
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <DiarySideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
