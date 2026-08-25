"use client"

import * as React from "react"
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
  type Locale,
} from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  locale,
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "group/calendar bg-transparent p-1 [--cell-radius:var(--dl-radius-md,12px)] [--cell-size:2.25rem] select-none",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      locale={locale}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString(locale?.code, { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "relative flex flex-col gap-3 md:flex-row",
          defaultClassNames.months
        ),
        month: cn("flex w-full flex-col gap-3", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          defaultClassNames.nav
        ),
        button_previous: cn(
          "size-8 rounded-full p-0 text-[var(--dl-color-text-secondary)] hover:bg-[var(--dl-color-bg-brand-subtle)] hover:text-[var(--dl-color-text-brand)] transition-colors select-none aria-disabled:opacity-30",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          "size-8 rounded-full p-0 text-[var(--dl-color-text-secondary)] hover:bg-[var(--dl-color-bg-brand-subtle)] hover:text-[var(--dl-color-text-brand)] transition-colors select-none aria-disabled:opacity-30",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex h-8 w-full items-center justify-center px-8",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "flex h-8 w-full items-center justify-center gap-1.5 text-sm font-semibold text-[var(--dl-color-text-primary)]",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "relative rounded-[var(--dl-radius-md,12px)]",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "absolute inset-0 bg-[var(--dl-color-bg-elevated)] opacity-0",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "text-sm font-semibold text-[var(--dl-color-text-primary)] select-none",
          defaultClassNames.caption_label
        ),
        month_grid: cn("w-full border-collapse", defaultClassNames.month_grid),
        weekdays: cn("flex mb-1", defaultClassNames.weekdays),
        weekday: cn(
          "flex-1 text-center text-xs font-semibold text-[var(--dl-color-text-secondary)] select-none py-1",
          defaultClassNames.weekday
        ),
        week: cn("mt-1 flex w-full", defaultClassNames.week),
        week_number_header: cn(
          "w-8 select-none",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "text-xs text-[var(--dl-color-text-secondary)] select-none",
          defaultClassNames.week_number
        ),
        day: cn(
          "group/day relative aspect-square h-full w-full rounded-[var(--dl-radius-md,12px)] p-0.5 text-center select-none",
          defaultClassNames.day
        ),
        range_start: cn(
          "relative isolate z-0 rounded-l-[var(--dl-radius-md,12px)] bg-[var(--dl-color-bg-brand-subtle)]",
          defaultClassNames.range_start
        ),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn(
          "relative isolate z-0 rounded-r-[var(--dl-radius-md,12px)] bg-[var(--dl-color-bg-brand-subtle)]",
          defaultClassNames.range_end
        ),
        today: cn(
          "font-bold text-[var(--dl-color-text-brand)]",
          defaultClassNames.today
        ),
        outside: cn(
          "text-[var(--dl-color-text-secondary)] opacity-30 aria-selected:text-[var(--dl-color-text-secondary)]",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-gray-300 opacity-40 pointer-events-none",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeft className={cn("size-4", className)} {...props} />
            )
          }

          if (orientation === "right") {
            return (
              <ChevronRight className={cn("size-4", className)} {...props} />
            )
          }

          return (
            <ChevronDown className={cn("size-4", className)} {...props} />
          )
        },
        DayButton: ({ ...props }) => (
          <CalendarDayButton locale={locale} {...props} />
        ),
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-8 items-center justify-center text-center">
                {children}
              </div>
            </td>
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  locale,
  ...props
}: React.ComponentProps<typeof DayButton> & { locale?: Partial<Locale> }) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString(locale?.code)}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "relative isolate z-10 flex aspect-square size-9 w-full min-w-8 flex-col items-center justify-center rounded-[var(--dl-radius-md,10px)] border-0 text-xs font-medium transition-all",
        "hover:bg-[var(--dl-color-bg-brand-subtle)] hover:text-[var(--dl-color-text-brand)]",
        "data-[selected-single=true]:bg-[var(--dl-color-bg-brand)] data-[selected-single=true]:text-white data-[selected-single=true]:font-bold data-[selected-single=true]:shadow-xs",
        "data-[range-start=true]:bg-[var(--dl-color-bg-brand)] data-[range-start=true]:text-white",
        "data-[range-end=true]:bg-[var(--dl-color-bg-brand)] data-[range-end=true]:text-white",
        "cursor-pointer",
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
