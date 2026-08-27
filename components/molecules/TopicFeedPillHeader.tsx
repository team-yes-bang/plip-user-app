import { DailyIcon, FeedPill, FeedPillIconButton, IconLink } from "@/components/atoms";

type TopicFeedPillHeaderProps = {
  backHref?: string;
  onBack?: () => void;
  title: string;
  videoCount?: number;
  onMenuClick?: () => void;
};

export function TopicFeedPillHeader({ backHref = "#", onBack, title, onMenuClick }: TopicFeedPillHeaderProps) {
  return (
    <>
      <div className="pointer-events-none absolute top-4 left-6 z-30">
        {onBack ? (
          <FeedPillIconButton label="뒤로" onClick={onBack}>
            <DailyIcon name="chevronLeft" size={20} className="brightness-0 invert" />
          </FeedPillIconButton>
        ) : (
          <IconLink
            href={backHref}
            label="뒤로"
            variant="overlay"
            size="lg"
            className="pointer-events-auto"
          >
            <DailyIcon name="chevronLeft" size={20} className="brightness-0 invert" />
          </IconLink>
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-4 z-30 flex justify-center px-16">
        <div className="pointer-events-auto relative max-w-full">
          <FeedPill>
            <span className="min-w-0 overflow-hidden [text-overflow:ellipsis] whitespace-nowrap">{title}</span>
          </FeedPill>
        </div>
      </div>

      {onMenuClick && (
        <div className="pointer-events-none absolute top-4 right-6 z-30">
          <FeedPillIconButton label="메뉴" onClick={onMenuClick}>
            <DailyIcon name="ellipsis" size={20} className="brightness-0 invert" />
          </FeedPillIconButton>
        </div>
      )}
    </>
  );
}
