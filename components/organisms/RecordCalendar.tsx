"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchDiaryDateWindowAction } from "@/actions/diaryActions";
import { DailyIcon, IconButton, TextLink } from "@/components/atoms";
import { HeaderBackLink, MonthCalendarGrid, ScreenHeader, buildMonthGridCells } from "@/components/molecules";
import { DiaryVideoViewerModal } from "@/components/organisms/DiaryVideoViewerModal";
import { ROUTES } from "@/config/routes";
import type { UiDiaryDateThemeGroup, UiDiaryDateWindow } from "@/types/diary/ui";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

type RecordCalendarProps = {
  agitId: string;
};

export function RecordCalendar({ agitId }: RecordCalendarProps) {
  const [today] = useState(() => new Date());
  const [year, setYear] = useState(() => today.getFullYear());
  const [month, setMonth] = useState(() => today.getMonth());
  const [selectedDay, setSelectedDay] = useState(() => today.getDate());

  const [dateWindow, setDateWindow] = useState<UiDiaryDateWindow | null>(null);
  const [loading, setLoading] = useState(false);

  // 개별 뷰어 모달 관련 상태
  const [viewerOpen, setViewerOpen] = useState(false);
  const [activeClipId, setActiveClipId] = useState<string | null>(null);
  const [activeVideoUuid, setActiveVideoUuid] = useState<string | undefined>(undefined);
  const [activeCaption, setActiveCaption] = useState<string | undefined>(undefined);
  const [activeThumbnail, setActiveThumbnail] = useState<string | undefined>(undefined);

  const formattedDateString = useMemo(() => {
    const m = String(month + 1).padStart(2, "0");
    const d = String(selectedDay).padStart(2, "0");
    return `${year}-${m}-${d}`;
  }, [year, month, selectedDay]);

  const cells = useMemo(() => buildMonthGridCells(year, month, "empty"), [year, month]);

  // 해당 일자 데이터 가져오기
  useEffect(() => {
    let isMounted = true;

    Promise.resolve().then(() => {
      if (isMounted) {
        setLoading(true);
      }
    });

    fetchDiaryDateWindowAction(formattedDateString, 1)
      .then((res) => {
        if (!isMounted) return;
        if (res.ok) {
          setDateWindow(res.data);
        } else {
          setDateWindow(null);
        }
      })
      .catch(() => {
        if (isMounted) setDateWindow(null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [formattedDateString]);

  function shiftMonth(delta: number) {
    const next = new Date(year, month + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
    setSelectedDay(1);
  }

  // 선택된 날짜의 테마 섹션 목록
  const currentDaySections: UiDiaryDateThemeGroup[] = useMemo(() => {
    if (!dateWindow || !dateWindow.days) return [];
    return dateWindow.days[formattedDateString] ?? [];
  }, [dateWindow, formattedDateString]);

  // 영상 총 개수
  const totalVideoCount = useMemo(() => {
    return currentDaySections.reduce((acc, s) => acc + s.clipCount, 0);
  }, [currentDaySections]);

  const hasClips = totalVideoCount > 0;

  function handleOpenClip(clipId: string, videoUuid?: string, caption?: string, thumbnail?: string) {
    setActiveClipId(clipId);
    setActiveVideoUuid(videoUuid || clipId);
    setActiveCaption(caption);
    setActiveThumbnail(thumbnail);
    setViewerOpen(true);
  }

  return (
    <section className="flex flex-col gap-[16px] px-[23px] pb-8 pt-3" aria-label="기록 캘린더">
      <ScreenHeader
        tone="plain"
        className="mb-[4px]"
        leading={<HeaderBackLink href={ROUTES.agit.detail(agitId)} />}
        title="기록 캘린더"
      />

      <div className="flex items-center justify-between gap-[12px]">
        <IconButton variant="surface" label="이전 달" onClick={() => shiftMonth(-1)}>
          <DailyIcon name="chevronLeft" size={20} />
        </IconButton>
        <p className="m-0 flex-1 text-center text-lg font-semibold text-[var(--dl-color-text-primary)]">
          {year}년 {month + 1}월
        </p>
        <IconButton variant="surface" label="다음 달" onClick={() => shiftMonth(1)}>
          <DailyIcon name="chevronRight" size={20} />
        </IconButton>
      </div>

      <MonthCalendarGrid
        weekdayLabels={WEEKDAYS}
        cells={cells}
        weekdaysClassName="grid grid-cols-[repeat(7,_1fr)] gap-[4px]"
        daysClassName="grid grid-cols-[repeat(7,_1fr)] gap-[4px]"
        renderWeekday={(label, index) => (
          <span
            key={label}
            className={
              index === 0
                ? "text-center text-[11px] font-medium text-[var(--dl-color-text-danger)]"
                : "text-center text-[11px] font-medium text-[var(--dl-color-text-secondary)]"
            }
          >
            {label}
          </span>
        )}
        renderDay={(cell, index) => {
          if (cell.outside || !cell.day) {
            return (
              <span
                key={`empty-${index}`}
                className="relative flex h-[36px] flex-col items-center justify-center gap-[4px] rounded-[12px] border-0 bg-[transparent] text-sm font-medium text-[var(--dl-color-text-tertiary)]"
                aria-hidden
              />
            );
          }

          const selected = cell.day === selectedDay;

          return (
            <button
              key={cell.day}
              type="button"
              className={`relative flex h-[36px] flex-col items-center justify-center gap-[4px] rounded-[12px] border-0 bg-[transparent] text-sm font-medium cursor-pointer transition-colors text-[var(--dl-color-text-primary)] hover:bg-[var(--dl-color-bg-surface-subtle)] ${
                selected
                  ? "bg-[var(--dl-color-bg-brand)] !text-[var(--dl-color-text-inverse)] font-bold shadow-sm"
                  : ""
              }`}
              aria-pressed={selected}
              onClick={() => setSelectedDay(cell.day!)}
            >
              {cell.day}
            </button>
          );
        }}
      />

      {/* 선택된 일자의 데이터 표출 */}
      <div className="flex flex-col gap-[12px] min-h-[112px] p-[16px] rounded-[16px] bg-[var(--dl-color-bg-brand-subtle,#f3f4f6)]">
        <div className="flex items-center justify-between">
          <p className="m-0 text-base font-semibold text-[var(--dl-color-text-primary)]">
            {month + 1}월 {selectedDay}일 기록
          </p>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--dl-color-bg-surface-default,#ffffff)] text-[var(--dl-color-text-brand,#6b4af5)]">
            {loading ? "불러오는 중..." : `영상 ${totalVideoCount}개`}
          </span>
        </div>

        {hasClips ? (
          <div className="flex flex-col gap-[12px] mt-2">
            {currentDaySections.map((section) => (
              <div key={section.themeId} className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-[var(--dl-color-text-secondary)]">
                  # {section.themeName} ({section.clipCount})
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {section.clips.map((clip) => (
                    <button
                      key={clip.id}
                      type="button"
                      onClick={() => handleOpenClip(clip.id, clip.id, "", clip.thumbnailSrc)}
                      className="group relative aspect-square overflow-hidden rounded-xl bg-black/10 cursor-pointer border-0 p-0"
                    >
                      {clip.thumbnailSrc ? (
                        <img
                          src={clip.thumbnailSrc}
                          alt="다이어리 영상 썸네일"
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[var(--dl-color-bg-surface-subtle)]">
                          <DailyIcon name="messageBrand" size={16} className="opacity-40" />
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DailyIcon name="chevronRight" size={18} className="brightness-0 invert" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          !loading && (
            <p className="m-0 text-xs font-normal text-[var(--dl-color-text-secondary)]">
              이 날짜에 작성된 다이어리 기록이 없습니다.
            </p>
          )
        )}
      </div>

      <TextLink
        href={ROUTES.agit.detail(agitId)}
        className="flex items-center gap-[12px] min-h-[64px] p-[12px] border border-[var(--dl-color-border-default)] rounded-[14px] bg-[var(--dl-color-bg-elevated)] text-[var(--dl-color-text-primary)] no-underline hover:bg-[var(--dl-color-bg-surface-subtle)] transition-colors"
      >
        <div className="w-[44px] h-[44px] shrink-0 rounded-[10px] bg-[linear-gradient(135deg,_#fc8c6e_0%,_#6b4af5_100%)] flex items-center justify-center text-white">
          <DailyIcon name="messageBrand" size={20} className="brightness-0 invert" />
        </div>
        <span>
          <span className="block text-[13px] font-semibold">아지트 피드로 이동</span>
          <span className="block mt-[2px] text-[11px] text-[var(--dl-color-text-secondary)]">
            오늘의 모임 영상과 기록을 확인해보세요
          </span>
        </span>
      </TextLink>

      {/* 다이어리 개별 뷰어 모달 */}
      <DiaryVideoViewerModal
        open={viewerOpen}
        clipId={activeClipId}
        videoUuid={activeVideoUuid}
        date={formattedDateString}
        caption={activeCaption}
        thumbnailUrl={activeThumbnail}
        onClose={() => setViewerOpen(false)}
      />
    </section>
  );
}
