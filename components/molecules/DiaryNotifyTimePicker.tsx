"use client";

import { cn } from "@/lib/utils";
import {
  DIARY_NOTIFY_HOURS_12,
  DIARY_NOTIFY_MINUTES,
  composeDiaryNotifyTime,
  parseDiaryNotifyTime,
  type DiaryNotifyPeriod,
} from "@/lib/user/diaryNotifyTime";
import { useEffect, useRef } from "react";

type DiaryNotifyTimePickerProps = {
  value: string;
  disabled?: boolean;
  className?: string;
  onChange: (value: string) => void;
};

type PickerColumnProps<T extends string | number> = {
  options: readonly T[];
  value: T;
  disabled?: boolean;
  formatOption: (option: T) => string;
  onChange: (option: T) => void;
};

const ITEM_HEIGHT = 44;
const VISIBLE_COUNT = 3;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_COUNT;
const SCROLL_END_DELAY_MS = 100;

function getSelectedIndex<T extends string | number>(options: readonly T[], value: T): number {
  const index = options.indexOf(value);
  return index >= 0 ? index : 0;
}

function PickerColumn<T extends string | number>({
  options,
  value,
  disabled,
  formatOption,
  onChange,
}: PickerColumnProps<T>) {
  const listRef = useRef<HTMLDivElement>(null);
  const scrollEndTimerRef = useRef<number | null>(null);
  const isUserScrollingRef = useRef(false);

  function scrollToIndex(index: number, behavior: ScrollBehavior = "auto") {
    const container = listRef.current;
    if (!container) return;

    container.scrollTo({
      top: index * ITEM_HEIGHT,
      behavior,
    });
  }

  useEffect(() => {
    if (isUserScrollingRef.current) return;
    scrollToIndex(getSelectedIndex(options, value));
  }, [options, value]);

  useEffect(() => {
    return () => {
      if (scrollEndTimerRef.current) {
        window.clearTimeout(scrollEndTimerRef.current);
      }
    };
  }, []);

  function snapToNearestOption() {
    const container = listRef.current;
    if (!container || disabled) return;

    const index = Math.round(container.scrollTop / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(options.length - 1, index));
    const nextValue = options[clampedIndex];

    scrollToIndex(clampedIndex, "smooth");

    if (nextValue !== value) {
      onChange(nextValue);
    }

    window.setTimeout(() => {
      isUserScrollingRef.current = false;
    }, SCROLL_END_DELAY_MS);
  }

  function handleScroll() {
    if (disabled) return;

    isUserScrollingRef.current = true;

    if (scrollEndTimerRef.current) {
      window.clearTimeout(scrollEndTimerRef.current);
    }

    scrollEndTimerRef.current = window.setTimeout(snapToNearestOption, SCROLL_END_DELAY_MS);
  }

  function handleOptionSelect(option: T) {
    if (disabled) return;

    const index = getSelectedIndex(options, option);
    isUserScrollingRef.current = true;
    scrollToIndex(index, "smooth");
    onChange(option);

    window.setTimeout(() => {
      isUserScrollingRef.current = false;
    }, SCROLL_END_DELAY_MS);
  }

  return (
    <div
      ref={listRef}
      onScroll={handleScroll}
      className="relative min-w-0 flex-1 overflow-y-auto overscroll-y-contain [scrollbar-width:none] snap-y snap-mandatory [&::-webkit-scrollbar]:hidden"
      style={{ height: PICKER_HEIGHT }}
    >
      <div className="snap-none" style={{ height: ITEM_HEIGHT }} aria-hidden />
      {options.map((option) => {
        const selected = option === value;

        return (
          <button
            key={String(option)}
            type="button"
            data-value={String(option)}
            disabled={disabled}
            className={cn(
              "flex h-[44px] w-full shrink-0 snap-center snap-always items-center justify-center border-0 bg-[transparent] text-base leading-6",
              selected
                ? "font-semibold text-[var(--dl-color-text-primary)]"
                : "font-normal text-[var(--dl-color-text-secondary)]",
              disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
            )}
            onClick={() => handleOptionSelect(option)}
          >
            {formatOption(option)}
          </button>
        );
      })}
      <div className="snap-none" style={{ height: ITEM_HEIGHT }} aria-hidden />
    </div>
  );
}

const PERIOD_OPTIONS: DiaryNotifyPeriod[] = ["AM", "PM"];

function formatPeriod(period: DiaryNotifyPeriod): string {
  return period === "AM" ? "오전" : "오후";
}

function formatHour(hour: number): string {
  return String(hour).padStart(2, "0");
}

function formatMinute(minute: number): string {
  return String(minute).padStart(2, "0");
}

export function DiaryNotifyTimePicker({
  value,
  disabled,
  className,
  onChange,
}: DiaryNotifyTimePickerProps) {
  const parts = parseDiaryNotifyTime(value);

  function updateParts(next: Partial<typeof parts>) {
    onChange(composeDiaryNotifyTime({ ...parts, ...next }));
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[var(--dl-radius-md)] border border-[var(--dl-color-border-default)] bg-[var(--dl-color-bg-surface)]",
        disabled && "opacity-50",
        className,
      )}
      aria-disabled={disabled}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-[44px] z-10 h-[44px] border-y border-[var(--dl-color-border-default)] bg-[var(--dl-color-bg-elevated)]/40"
        aria-hidden
      />
      <div className="relative flex">
        <PickerColumn
          options={PERIOD_OPTIONS}
          value={parts.period}
          disabled={disabled}
          formatOption={formatPeriod}
          onChange={(period) => updateParts({ period })}
        />
        <PickerColumn
          options={DIARY_NOTIFY_HOURS_12}
          value={parts.hour12}
          disabled={disabled}
          formatOption={formatHour}
          onChange={(hour12) => updateParts({ hour12 })}
        />
        <PickerColumn
          options={DIARY_NOTIFY_MINUTES}
          value={parts.minute}
          disabled={disabled}
          formatOption={formatMinute}
          onChange={(minute) => updateParts({ minute })}
        />
      </div>
    </div>
  );
}
