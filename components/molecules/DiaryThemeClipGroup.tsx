"use client";

import { TextLink } from "@/components/atoms";
import { VideoClipThumbnail } from "@/components/molecules/VideoClipThumbnail";
import { useVideoViewer } from "@/components/providers/VideoViewerProvider";
import { formatDiaryDate } from "@/config/diary-mock";
import { toDiaryVideoViewerItems } from "@/lib/diary/toVideoViewerItems";
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
  disabled,
}: {
  thumbnailSrc?: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={`${THUMB_SLOT_CLASS}${disabled ? " cursor-default" : ""}`}
      onClick={disabled ? undefined : onClick}
      role={disabled ? undefined : "button"}
      tabIndex={disabled ? undefined : 0}
      onKeyDown={
        disabled
          ? undefined
          : (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onClick?.();
              }
            }
      }
    >
      <VideoClipThumbnail src={thumbnailSrc} className={THUMB_IMAGE_CLASS} />
    </div>
  );
}

function ThumbGrid({
  clips,
  clipCount,
  themeName,
}: {
  clips?: UiDiaryClip[];
  clipCount: number;
  themeName: string;
}) {
  const { openViewer } = useVideoViewer();
  const slotCount = Math.max(clipCount, clips?.length ?? 0);

  if (slotCount === 0) {
    return null;
  }

  function handleThumbClick(clip: UiDiaryClip) {
    if (!clip.videoUuid?.trim()) {
      return;
    }

    const list = toDiaryVideoViewerItems(clips ?? [], themeName);
    if (list.length === 0) {
      return;
    }

    openViewer(clip.id, list, "diary");
  }

  return (
    <div className={THUMB_GRID_CLASS}>
      {Array.from({ length: slotCount }, (_, index) => {
        const clip = clips?.[index];
        const slotKey = clip?.id ?? `slot-${index}`;
        const canOpen = Boolean(clip?.videoUuid?.trim());

        return (
          <DiaryClipThumb
            key={slotKey}
            thumbnailSrc={clip?.thumbnailSrc}
            disabled={!canOpen}
            onClick={() => clip && handleThumbClick(clip)}
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

      <ThumbGrid clips={clips} clipCount={clipCount} themeName={themeName} />
    </section>
  );
}
