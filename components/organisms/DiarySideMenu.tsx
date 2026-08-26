"use client";

import { TextLink } from "@/components/atoms";
import { MenuNavRow, MonthCalendarGrid, SideSheetHeader, buildMonthGridCells } from "@/components/molecules";
import { AnimatedSideSheet } from "@/components/molecules/AnimatedOverlays";
import { ROUTES } from "@/config/routes";
import type { UiDiaryMenuNav } from "@/types/diary/ui";
import { CalendarDays, ChevronLeft, ChevronRight, FolderKanban, LayoutGrid } from "lucide-react";
import { useMemo } from "react";

type DiarySideMenuProps = {
  open: boolean;
  onClose: () => void;
  menuNav?: UiDiaryMenuNav | null;
};

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

export function DiarySideMenu({ open, onClose, menuNav }: DiarySideMenuProps) {
  const cells = useMemo(() => buildMonthGridCells(2026, 7, "adjacent"), []);

  const themeByHref = menuNav?.themeId
    ? ROUTES.diary.themes.detail(menuNav.themeId)
    : ROUTES.diary.themes.root;
  const dateByHref = menuNav?.date ? ROUTES.diary.date(menuNav.date) : ROUTES.diary.root;

  return (
    <AnimatedSideSheet
      open={open}
      onClose={onClose}
      aria-label="다이어리 메뉴"
    >
      <SideSheetHeader title="다이어리" onClose={onClose} />

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
        <div className="flex shrink-0 flex-col gap-2">
          <MenuNavRow href={ROUTES.diary.themes.root} onClick={onClose}>
            <FolderKanban className="size-5 shrink-0 text-[var(--dl-color-text-brand)]" strokeWidth={2.2} />
            테마 관리
          </MenuNavRow>
          <MenuNavRow href={themeByHref} onClick={onClose}>
            <LayoutGrid className="size-5 shrink-0 text-[var(--dl-color-text-brand)]" strokeWidth={2.2} />
            테마별
          </MenuNavRow>
          <MenuNavRow href={dateByHref} onClick={onClose}>
            <CalendarDays className="size-5 shrink-0 text-[var(--dl-color-text-brand)]" strokeWidth={2.2} />
            날짜별
          </MenuNavRow>
        </div>

        <div
          className="flex shrink-0 flex-col gap-3 rounded-[18px] border border-[#e3e0ed] bg-[#fff] p-4 shadow-xs"
          aria-label="캘린더"
        >
          <div className="flex items-center justify-between">
            <button
              type="button"
              className="grid size-7 cursor-pointer place-items-center rounded-full border border-[#e3e0ed] bg-[#fbfaff] text-xs font-bold text-[#262433] transition-colors hover:bg-[var(--dl-color-bg-brand-subtle)] hover:text-[var(--dl-color-text-brand)]"
              aria-label="이전 달"
            >
              <ChevronLeft className="size-3.5" />
            </button>
            <p className="m-0 text-xs font-bold tracking-tight text-[#1f1c29]">2026년 8월</p>
            <button
              type="button"
              className="grid size-7 cursor-pointer place-items-center rounded-full border border-[#e3e0ed] bg-[#fbfaff] text-xs font-bold text-[#262433] transition-colors hover:bg-[var(--dl-color-bg-brand-subtle)] hover:text-[var(--dl-color-text-brand)]"
              aria-label="다음 달"
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>

          <MonthCalendarGrid
            weekdayLabels={WEEKDAYS}
            cells={cells}
            weekdaysClassName="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-[#756e8a]"
            daysClassName="grid grid-cols-7 gap-1"
            renderDay={(cell, index) =>
              cell.date && !cell.outside ? (
                <TextLink
                  key={`${cell.day}-${index}`}
                  href={ROUTES.diary.date(cell.date)}
                  className={`grid aspect-square place-items-center rounded-full text-xs font-bold !no-underline transition-all hover:bg-[var(--dl-color-bg-brand-subtle)] hover:text-[var(--dl-color-text-brand)] ${
                    cell.day === 19
                      ? "bg-[var(--dl-color-bg-brand)] !text-[#fff] shadow-xs hover:!bg-[var(--dl-color-bg-brand)] hover:!text-[#fff]"
                      : "!text-[#262433]"
                  }`}
                  onClick={onClose}
                >
                  {cell.day}
                </TextLink>
              ) : (
                <span
                  key={`${cell.day}-${index}`}
                  className="grid aspect-square place-items-center text-xs font-normal text-[#c4c0d4]"
                >
                  {cell.day}
                </span>
              )
            }
          />
        </div>
      </div>
    </AnimatedSideSheet>
  );
}
