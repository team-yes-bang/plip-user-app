"use client";

import { useState } from "react";
import { ko } from "date-fns/locale";
import { format, parseISO } from "date-fns";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { DailyIcon, Label } from "@/components/atoms";
import { ui } from "@/components/atoms/styles";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toKstDateString } from "@/lib/topic/selectAgitTopic";
import { cn } from "@/lib/utils";

type TopicDatePickerProps = {
  id?: string;
  name?: string;
  label?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (date: string) => void;
  required?: boolean;
};

export function TopicDatePicker({
  id = "topic-date-picker",
  name = "startDate",
  label = "토픽 진행 날짜",
  defaultValue,
  value: controlledValue,
  onChange,
  required = true,
}: TopicDatePickerProps) {
  const today = toKstDateString(new Date());

  // 내일 날짜 구하기
  const tomorrowObj = new Date();
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const tomorrow = toKstDateString(tomorrowObj);

  const [internalValue, setInternalValue] = useState(defaultValue || today);
  const selectedDateStr = controlledValue !== undefined ? controlledValue : internalValue;

  const [open, setOpen] = useState(false);

  function handleDateChange(newDateStr: string) {
    if (newDateStr < today) {
      newDateStr = today;
    }
    setInternalValue(newDateStr);
    onChange?.(newDateStr);
  }

  // Date 객체 변환 (Calendar 컴포넌트에 넘길 용도)
  const selectedDateObj = selectedDateStr ? parseISO(selectedDateStr) : new Date();

  const isToday = selectedDateStr === today;
  const isTomorrow = selectedDateStr === tomorrow;

  // 표시용 포맷 (예: 2026.08.25 (화))
  const formattedDisplay = (() => {
    try {
      return format(selectedDateObj, "yyyy.MM.dd (eee)", { locale: ko });
    } catch {
      return selectedDateStr;
    }
  })();

  // 오늘 자정 (disabled 비교용)
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  return (
    <div className={ui.field}>
      {label && (
        <Label htmlFor={id} className={ui.fieldLabel}>
          {label} {required && <span className="text-[var(--dl-color-text-brand)]">*</span>}
        </Label>
      )}

      {/* 폼 전송용 hidden input */}
      <input type="hidden" id={id} name={name} value={selectedDateStr} />

      <div className="flex flex-col gap-2.5 rounded-[var(--dl-radius-lg)] border border-[var(--dl-color-border-default)] bg-[var(--dl-color-bg-surface)] p-3 shadow-none">
        {/* 오늘 / 내일 빠른 선택 칩 */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleDateChange(today)}
            className={cn(
              "flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold cursor-pointer transition-all border",
              isToday
                ? "border-[var(--dl-color-text-brand)] bg-[var(--dl-color-bg-brand-subtle)] text-[var(--dl-color-text-brand)]"
                : "border-[var(--dl-color-border-default)] bg-[var(--dl-color-bg-elevated)] text-[var(--dl-color-text-secondary)] hover:bg-[var(--dl-color-bg-brand-subtle)]"
            )}
          >
            <DailyIcon name="check" size={14} className={isToday ? "opacity-100" : "opacity-0"} />
            오늘
          </button>

          <button
            type="button"
            onClick={() => handleDateChange(tomorrow)}
            className={cn(
              "flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold cursor-pointer transition-all border",
              isTomorrow
                ? "border-[var(--dl-color-text-brand)] bg-[var(--dl-color-bg-brand-subtle)] text-[var(--dl-color-text-brand)]"
                : "border-[var(--dl-color-border-default)] bg-[var(--dl-color-bg-elevated)] text-[var(--dl-color-text-secondary)] hover:bg-[var(--dl-color-bg-brand-subtle)]"
            )}
          >
            <DailyIcon name="check" size={14} className={isTomorrow ? "opacity-100" : "opacity-0"} />
            내일
          </button>
        </div>

        {/* shadcn Popover + Calendar 결합 트리거 */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            type="button"
            className={cn(
              "flex h-12 w-full items-center justify-between rounded-[var(--dl-radius-md)] border border-[var(--dl-color-border-default)] bg-[var(--dl-color-bg-elevated)] px-4 text-sm font-medium text-[var(--dl-color-text-primary)] outline-none transition-all hover:border-[var(--dl-color-text-brand)] focus:border-2 focus:border-[var(--dl-color-border-brand)] cursor-pointer shadow-none"
            )}
          >
            <span className="flex items-center gap-2.5">
              <CalendarIcon className="size-4 text-[var(--dl-color-text-brand)]" />
              <span className="font-semibold text-sm leading-6 text-[var(--dl-color-text-primary)]">{formattedDisplay}</span>
            </span>
            <span className="flex items-center gap-1 text-xs text-[var(--dl-color-text-secondary)] font-normal">
              <span>날짜 변경</span>
              <ChevronDown className="size-3.5 opacity-60" />
            </span>
          </PopoverTrigger>

          <PopoverContent
            className="w-auto p-3.5 rounded-[var(--dl-radius-lg)] border border-[var(--dl-color-border-default)] bg-[var(--dl-color-bg-elevated)] shadow-xl"
            align="start"
          >
            <Calendar
              mode="single"
              selected={selectedDateObj}
              onSelect={(date) => {
                if (date) {
                  const dateStr = toKstDateString(date);
                  handleDateChange(dateStr);
                  setOpen(false);
                }
              }}
              disabled={(date) => date < startOfToday}
              locale={ko}
            />
          </PopoverContent>
        </Popover>

        <p className={ui.hint}>
          오늘 이후만 선택할 수 있습니다.
        </p>
      </div>
    </div>
  );
}
