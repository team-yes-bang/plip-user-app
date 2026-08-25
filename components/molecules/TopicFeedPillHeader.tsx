import { DailyIcon, FeedPill, feedPillIconButtonClass, FeedPillIconButton, IconLink } from "@/components/atoms";

type TopicFeedPillHeaderProps = {
  backHref?: string;
  onBack?: () => void;
  title: string;
  videoCount: number;
  onMenuClick?: () => void;
};

export function TopicFeedPillHeader({ backHref = "#", onBack, title, videoCount, onMenuClick }: TopicFeedPillHeaderProps) {
  return (
    <>
      <div className="pointer-events-none absolute top-3 left-3 z-30">
        {onBack ? (
          <FeedPillIconButton label="뒤로" onClick={onBack}>
            <DailyIcon name="chevronLeft" size={16} className="brightness-0 invert" />
          </FeedPillIconButton>
        ) : (
          <IconLink
            href={backHref}
            label="뒤로"
            className={feedPillIconButtonClass}
          >
            <DailyIcon name="chevronLeft" size={16} className="brightness-0 invert" />
          </IconLink>
        )}
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

      {onMenuClick && (
        <div className="pointer-events-none absolute top-3 right-3 z-30">
          <FeedPillIconButton label="메뉴" onClick={onMenuClick}>
            <DailyIcon name="ellipsis" size={16} className="brightness-0 invert" />
          </FeedPillIconButton>
        </div>
      )}
    </>
  );
}
