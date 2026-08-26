import { TextLink } from "@/components/atoms";
import { Card } from "@/components/ui/card";
import { formatDiaryDate, formatDiaryWeekday } from "@/config/diary-mock";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";
import type { UiDiaryDateEntry } from "@/types/diary/ui";
import { Plus } from "lucide-react";

type DiaryDateScrollSectionProps = {
  entry: UiDiaryDateEntry;
  className?: string;
};

const TILES = ["bg-[#1a2744]", "bg-[#032426]", "bg-[#2a1a3a]"] as const;

/** Figma Hybrid Diary — 일자 + 3열 모자이크 */
export function DiaryDateScrollSection({ entry, className }: DiaryDateScrollSectionProps) {
  const dateLabel = formatDiaryDate(entry.date);
  const weekday = formatDiaryWeekday(entry.date);
  const isEmpty = entry.isEmpty || !entry.hasClips;
  const href = isEmpty ? ROUTES.capture.video : ROUTES.diary.date(entry.date);

  return (
    <article
      className={cn("flex min-h-0 flex-1 flex-col gap-2", className)}
      aria-label={`${dateLabel} 다이어리`}
    >
      <TextLink
        href={ROUTES.diary.date(entry.date)}
        className="shrink-0 px-0.5 text-sm font-semibold text-[#1f1c29] no-underline"
      >
        {dateLabel} · {weekday}
      </TextLink>


      <TextLink href={href} className="block min-h-0 flex-1 no-underline">
        <Card className="flex h-full min-h-0 flex-col overflow-hidden border-0 p-0 shadow-none ring-0">
          {isEmpty ? (
            <div className="flex h-full min-h-0 min-h-[96px] flex-1 flex-col items-center justify-center gap-2 rounded-[18px] border border-dashed border-[var(--dl-color-border-brand)] bg-[linear-gradient(135deg,rgba(247,244,255,0.85),rgba(255,255,255,0.95))] p-4 shadow-[0_8px_24px_rgba(23,_23,_28,_0.03)] transition-all hover:bg-[var(--dl-color-bg-brand-subtle)]">
              <div className="grid size-10 place-items-center rounded-xl bg-[var(--dl-color-bg-brand)] text-white shadow-sm">
                <Plus className="size-5 stroke-[2.5]" />
              </div>
              <span className="text-xs font-bold text-[var(--dl-color-text-brand)]">다이어리 기록</span>
            </div>
          ) : (
            <div className="grid h-full min-h-0 flex-1 grid-cols-3 gap-px bg-white rounded-[18px] overflow-hidden">
              {TILES.map((tile) => (
                <div key={tile} className={cn("min-h-0", tile)} aria-hidden />
              ))}
            </div>
          )}
        </Card>
      </TextLink>
    </article>
  );
}
