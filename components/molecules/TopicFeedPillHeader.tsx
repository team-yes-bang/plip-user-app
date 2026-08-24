import { DailyIcon, FeedPill, IconLink } from "@/components/atoms";
import { cn } from "@/lib/utils";

type TopicFeedPillHeaderProps = {
  backHref: string;
  title: string;
  videoCount: number;
  dateLabel: string;
};

export function TopicFeedPillHeader({ backHref, title, videoCount, dateLabel }: TopicFeedPillHeaderProps) {
  return (
    <>
      <div className="pointer-events-none absolute top-3 left-3 z-30">
        <IconLink
          href={backHref}
          label="뒤로"
          className={cn(
            "pointer-events-auto size-7 rounded-full bg-transparent text-white shadow-none backdrop-blur-none no-underline hover:no-underline",
            "hover:bg-black/40 hover:shadow-[0_4px_16px_rgba(0,0,0,0.16)] hover:backdrop-blur-md",
            "focus-visible:bg-black/40 focus-visible:shadow-[0_4px_16px_rgba(0,0,0,0.16)] focus-visible:backdrop-blur-md",
            "active:bg-black/40 active:shadow-[0_4px_16px_rgba(0,0,0,0.16)] active:backdrop-blur-md",
          )}
        >
          <DailyIcon name="chevronLeft" size={16} className="brightness-0 invert" />
        </IconLink>
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-3 z-30 flex justify-center px-14">
        <div className="pointer-events-auto relative max-w-full">
          <FeedPill>
            <span className="min-w-0 overflow-hidden [text-overflow:ellipsis] whitespace-nowrap">{title}</span>
          </FeedPill>
          <span
            className="absolute top-1/2 -right-5 grid h-4 min-w-4 -translate-y-1/2 place-items-center rounded-full border-0 bg-black/40 px-1 text-[10px] font-semibold leading-none text-white shadow-[0_4px_16px_rgba(0,0,0,0.16)] backdrop-blur-md"
            aria-label={`${videoCount}개 영상`}
          >
            {videoCount}
          </span>
        </div>
      </div>
      <p className="pointer-events-none absolute top-3 right-3 z-30 m-0 flex h-7 items-center text-[11px] font-medium leading-none text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.55)]">
        {dateLabel}
      </p>
    </>
  );
}
