"use client";

import { TextLink } from "@/components/atoms";
import { VideoClipThumbnail } from "@/components/molecules/VideoClipThumbnail";
import { useVideoViewer } from "@/components/providers/VideoViewerProvider";
import { formatDiaryDate } from "@/config/diary-mock";
import { ROUTES } from "@/config/routes";
import type { UiDiaryClip } from "@/types/diary/ui";

type DiaryThemeClipGroupProps = {
  themeName: string;
  date: string;
  clipCount: number;
  clips?: UiDiaryClip[];
  showDateLink?: boolean;
};

const THUMB_GRID_CLASS = "grid w-full grid-cols-[repeat(3,_minmax(0,_1fr))] gap-[1px] bg-[#fff]";

const THUMB_SLOT_CLASS =
  "aspect-[1_/_1] w-full overflow-hidden rounded-[0] bg-[#f3f3f3] cursor-pointer";

const THUMB_IMAGE_CLASS = "aspect-[1_/_1] h-full w-full rounded-[0] object-cover";

function DiaryClipThumb({
  thumbnailSrc,
  onClick,
}: {
  thumbnailSrc?: string;
  onClick?: () => void;
}) {
  return (
    <div className={THUMB_SLOT_CLASS} onClick={onClick}>
      <VideoClipThumbnail src={thumbnailSrc} className={THUMB_IMAGE_CLASS} />
    </div>
  );
}

function ThumbGrid({ clips, clipCount, date, themeName }: { clips?: UiDiaryClip[]; clipCount: number; date: string; themeName?: string }) {
  const { openViewer } = useVideoViewer();
  const slotCount = Math.max(clipCount, clips?.length ?? 0);

  if (slotCount === 0) {
    return null;
  }

  const handleThumbClick = (clipId: string) => {
    const list = (clips ?? []).map((c) => ({
      clipId: c.id,
      videoUuid: c.id,
      title: themeName || "다이어리 영상",
      themeName,
      uploadedAt: formatDiaryDate(date),
      thumbnailUrl: c.thumbnailSrc,
    }));

    openViewer(clipId, list, "diary");
  };

  return (
    <div className={THUMB_GRID_CLASS}>
      {Array.from({ length: slotCount }, (_, index) => {
        const clip = clips?.[index];
        const slotKey = clip?.id ?? `slot-${index}`;

        return (
          <DiaryClipThumb
            key={slotKey}
            thumbnailSrc={clip?.thumbnailSrc}
            onClick={() => clip && handleThumbClick(clip.id)}
          />
        );
      })}
    </div>
  );
}

export function DiaryThemeClipGroup({
  themeName,
  date,
  clipCount,
  clips,
  showDateLink = false,
}: DiaryThemeClipGroupProps) {
  const title = showDateLink ? formatDiaryDate(date) : themeName;

  return (
    <section className="flex flex-col gap-[0.65rem]" aria-label={title}>
      {showDateLink ? (
        <TextLink href={ROUTES.diary.date(date)} className="m-0 text-sm font-semibold text-[#1f1c29] !no-underline">
          {title}
        </TextLink>
      ) : (
        <h3 className="m-0 text-sm font-semibold text-[#1f1c29]">{title}</h3>
      )}

      <ThumbGrid clips={clips} clipCount={clipCount} date={date} themeName={themeName} />
    </section>
  );
}
