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
        <Card className="flex h-full min-h-0 flex-col overflow-hidden border-0 p-0 shadow-none ring-1 ring-black/5">
          {isEmpty ? (
            <div className="flex h-full min-h-0 flex-1 flex-col items-center justify-center gap-2 bg-secondary text-muted-foreground">
              <span className="grid size-10 place-items-center rounded-full bg-white shadow-sm ring-1 ring-black/5">
                <Plus className="size-5 text-primary" />
              </span>
              <span className="text-xs font-semibold">다이어리 기록</span>
            </div>
          ) : (
            <div className="grid h-full min-h-0 flex-1 grid-cols-3 gap-px bg-white">
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
