"use client";

import { fetchDiaryDateWindowAction } from "@/actions/diaryActions";
import { TextLink } from "@/components/atoms";
import { DiaryThemeClipGroup, HeaderBackLink, ScreenHeader } from "@/components/molecules";
import { formatDiaryDate } from "@/config/diary-mock";
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
const NAV_ARROW_CLASS =
  "!grid place-items-center w-[2.25rem] h-[2.25rem] rounded-[999px] border border-[var(--dc-glass-border)] bg-[linear-gradient(180deg,_var(--dc-glass-from),_var(--dc-glass-to))] shadow-[var(--dc-shadow)] !text-[var(--dc-fg-primary)] text-[1.35rem] font-bold leading-none !no-underline [&.is-disabled]:opacity-[0.28]";

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

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="shrink-0 px-6 pb-[1.15rem] pt-3">
        <ScreenHeader
          tone="plain"
          titleAlign="center"
          className="mb-[1.15rem]"
          leading={<HeaderBackLink href={ROUTES.diary.root} />}
          title={<span className="sr-only">{formatDiaryDate(focusDate)}</span>}
        />

        <div className="grid grid-cols-[2.25rem_1fr_2.25rem] items-center gap-[0.5rem]">
          <TextLink
            href={ROUTES.diary.date(prevDate)}
            className={NAV_ARROW_CLASS}
            aria-label="이전 날짜"
            onClick={(event) => {
              event.preventDefault();
              goPrev();
            }}
          >
            ‹
          </TextLink>
          <div className="text-center">
            <h1 className="m-0 text-[1.4rem] font-bold leading-tight tracking-tight text-[var(--dl-color-text-primary)]">
              {formatDiaryDate(focusDate)}
            </h1>
            <p className="m-[0.25rem_0_0] text-[0.8rem] font-semibold text-[var(--dl-color-text-secondary)]">
              {focusDate}
            </p>
          </div>
          {canGoNext ? (
            <TextLink
              href={ROUTES.diary.date(nextDate)}
              className={NAV_ARROW_CLASS}
              aria-label="다음 날짜"
              onClick={(event) => {
                event.preventDefault();
                goNext();
              }}
            >
              ›
            </TextLink>
          ) : (
            <span className={`${NAV_ARROW_CLASS} is-disabled`} aria-hidden>
              ›
            </span>
          )}
        </div>
      </div>

      <div
        className="flex min-h-0 flex-1 flex-col gap-[1.15rem] overflow-y-auto px-6 pb-6 touch-pan-y [scrollbar-width:none] [-ms-overflow-style:none]"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        {loading ? (
          <p className="m-0 text-center text-[0.85rem] font-semibold text-[rgba(0,_0,_0,_0.4)]">불러오는 중...</p>
        ) : null}
        {error ? <p className="m-0 text-center text-sm text-red-600">{error}</p> : null}

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
          <p className="m-[2rem_0_0] text-center text-[0.85rem] font-semibold text-[rgba(0,_0,_0,_0.4)]">
            해당 날짜의 다이어리 기록이 없습니다.
          </p>
        ) : null}
      </div>
    </div>
  );
}
