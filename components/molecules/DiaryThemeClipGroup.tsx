import { TextLink } from "@/components/atoms";
import { VideoClipThumbnail } from "@/components/molecules/VideoClipThumbnail";
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
  "aspect-[1_/_1] w-full overflow-hidden rounded-[0] bg-[#f3f3f3]";

const THUMB_IMAGE_CLASS = "aspect-[1_/_1] h-full w-full rounded-[0] object-cover";

function DiaryClipThumb({ thumbnailSrc }: { thumbnailSrc?: string }) {
  return (
    <div className={THUMB_SLOT_CLASS}>
      <VideoClipThumbnail src={thumbnailSrc} className={THUMB_IMAGE_CLASS} />
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
