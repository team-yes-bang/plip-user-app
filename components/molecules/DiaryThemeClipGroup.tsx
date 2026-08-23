"use client";

import { TextLink } from "@/components/atoms";
import { formatDiaryDate } from "@/config/diary-mock";
import { ROUTES } from "@/config/routes";
import type { UiDiaryClip } from "@/types/diary/ui";
import { useState } from "react";

type DiaryThemeClipGroupProps = {
  themeName: string;
  date: string;
  clipCount: number;
  clips?: UiDiaryClip[];
  showDateLink?: boolean;
};

const THUMB_GRID_CLASS = "grid w-full grid-cols-[repeat(3,_minmax(0,_1fr))] gap-[1px] bg-[#fff]";

const THUMB_PLACEHOLDER_CLASS =
  "aspect-[1_/_1] w-full rounded-[0] bg-[linear-gradient(160deg,_rgba(37,_244,_238,_0.12),_transparent_50%),_linear-gradient(145deg,_#5a5a5a,_#1f1f1f)] [&:nth-child(3n+2)]:bg-[linear-gradient(160deg,_rgba(254,_44,_85,_0.16),_transparent_55%),_linear-gradient(145deg,_#4a4a4a,_#181818)] [&:nth-child(3n)]:bg-[linear-gradient(145deg,_#6a6a6a,_#242424)]";

const THUMB_IMAGE_CLASS = "aspect-[1_/_1] h-full w-full rounded-[0] object-cover";

function isRenderableThumbnail(src?: string): boolean {
  const trimmed = src?.trim();
  if (!trimmed) {
    return false;
  }

  if (trimmed.startsWith("/")) {
    return true;
  }

  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function DiaryClipThumb({ thumbnailSrc }: { thumbnailSrc?: string }) {
  const [failed, setFailed] = useState(!isRenderableThumbnail(thumbnailSrc));

  if (failed) {
    return <div className={THUMB_PLACEHOLDER_CLASS} aria-hidden />;
  }

  return (
    <div className={`${THUMB_PLACEHOLDER_CLASS} overflow-hidden`}>
      <img
        src={thumbnailSrc}
        alt=""
        className={THUMB_IMAGE_CLASS}
        onError={() => setFailed(true)}
        onLoad={(event) => {
          if (event.currentTarget.naturalWidth === 0) {
            setFailed(true);
          }
        }}
      />
    </div>
  );
}

function ThumbGrid({ clips, clipCount }: { clips?: UiDiaryClip[]; clipCount: number }) {
  const slotCount = Math.max(clipCount, clips?.length ?? 0);

  if (slotCount === 0) {
    return null;
  }

  return (
    <div className={THUMB_GRID_CLASS}>
      {Array.from({ length: slotCount }, (_, index) => {
        const clip = clips?.[index];
        const slotKey = clip?.id ?? `slot-${index}`;

        return (
          <DiaryClipThumb
            key={slotKey}
            thumbnailSrc={clip?.thumbnailSrc}
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
        <TextLink href={ROUTES.diary.date(date)} className="m-0 text-[0.88rem] font-extrabold !text-[#111] !no-underline">
          {title}
        </TextLink>
      ) : (
        <h3 className="m-0 text-[0.88rem] font-extrabold !text-[#111] !no-underline">{title}</h3>
      )}
      <ThumbGrid clips={clips} clipCount={clipCount} />
    </section>
  );
}
