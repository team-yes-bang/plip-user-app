"use client";

import { TextLink } from "@/components/atoms";
import { DiaryThemeClipGroup, HeaderBackLink, ScreenHeader } from "@/components/molecules";
import { formatDiaryDate } from "@/config/diary-mock";
import { ROUTES } from "@/config/routes";
import type { UiDiaryDateThemeGroup } from "@/types/diary/ui";
import { useRouter } from "next/navigation";
import { useRef, type PointerEvent } from "react";

type DiaryDateDetailSectionProps = {
  date: string;
  themes: UiDiaryDateThemeGroup[];
  prevDate: string;
  nextDate: string;
  canGoNext: boolean;
  error?: string;
};

const SWIPE_THRESHOLD = 48;
const NAV_ARROW_CLASS =
  "!grid place-items-center w-[2.25rem] h-[2.25rem] rounded-[999px] border border-[var(--dc-glass-border)] bg-[linear-gradient(180deg,_var(--dc-glass-from),_var(--dc-glass-to))] shadow-[var(--dc-shadow)] !text-[var(--dc-fg-primary)] text-[1.35rem] font-bold leading-none !no-underline [&.is-disabled]:opacity-[0.28]";

export function DiaryDateDetailSection({
  date,
  themes,
  prevDate,
  nextDate,
  canGoNext,
  error,
}: DiaryDateDetailSectionProps) {
  const router = useRouter();
  const pointerStart = useRef<{ x: number; y: number; scrollTop: number } | null>(null);

  function isInteractiveTarget(target: EventTarget | null): boolean {
    return target instanceof Element && Boolean(target.closest("a, button, input, textarea, select"));
  }

  function getRelativeX(clientX: number, element: HTMLDivElement): number {
    const rect = element.getBoundingClientRect();
    return (clientX - rect.left) / rect.width;
  }

  function goPrev() {
    router.push(ROUTES.diary.date(prevDate));
  }

  function goNext() {
    if (!canGoNext) {
      return;
    }

    router.push(ROUTES.diary.date(nextDate));
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
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[var(--dc-page-bg)]">
      <div className="shrink-0 px-4 pb-[1.15rem] pt-[0.9rem]">
        <ScreenHeader
          tone="plain"
          titleAlign="center"
          className="mb-[1.15rem]"
          leading={<HeaderBackLink href={ROUTES.diary.root} />}
          title={<span className="sr-only">{formatDiaryDate(date)}</span>}
        />

        <div className="grid grid-cols-[2.25rem_1fr_2.25rem] items-center gap-[0.5rem]">
          <TextLink
            href={ROUTES.diary.date(prevDate)}
            className={NAV_ARROW_CLASS}
            aria-label="이전 날짜"
          >
            ‹
          </TextLink>
          <h2 className="m-0 text-center text-[1rem] font-extrabold text-[#111]">{formatDiaryDate(date)}</h2>
          {canGoNext ? (
            <TextLink
              href={ROUTES.diary.date(nextDate)}
              className={NAV_ARROW_CLASS}
              aria-label="다음 날짜"
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
        className="flex min-h-0 flex-1 flex-col gap-[1.15rem] overflow-y-auto px-4 pb-7 touch-pan-y [scrollbar-width:none] [-ms-overflow-style:none]"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        {error ? <p className="m-0 text-center text-sm text-red-600">{error}</p> : null}

        {themes.length > 0 ? (
          themes.map((group) => (
            <DiaryThemeClipGroup
              key={group.themeId}
              themeName={group.themeName}
              date={date}
              clipCount={group.clipCount}
              clips={group.clips}
            />
          ))
        ) : (
          <p className="m-[2rem_0_0] text-center text-[0.85rem] font-semibold text-[rgba(0,_0,_0,_0.4)]">
            해당 날짜의 다이어리 기록이 없습니다.
          </p>
        )}
      </div>
    </div>
  );
}
