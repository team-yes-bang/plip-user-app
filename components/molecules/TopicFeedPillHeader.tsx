import { DailyIcon, TextLink } from "@/components/atoms";

type TopicFeedPillHeaderProps = {
  backHref: string;
  title: string;
  videoCount: number;
};

export function TopicFeedPillHeader({ backHref, title, videoCount }: TopicFeedPillHeaderProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-3 z-30 flex justify-center px-4">
      <div className="pointer-events-auto flex max-w-[min(100%,22rem)] items-center gap-1.5 rounded-full bg-black/45 py-1.5 pr-3.5 pl-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-md">
        <TextLink
          href={backHref}
          aria-label="뒤로"
          className="grid size-8 shrink-0 place-items-center rounded-full text-white no-underline hover:no-underline"
        >
          <DailyIcon name="chevronLeft" size={18} className="brightness-0 invert" />
        </TextLink>
        <p className="m-0 min-w-0 flex-1 overflow-hidden text-[13px] font-semibold leading-4 text-white [text-overflow:ellipsis] whitespace-nowrap">
          {title}
        </p>
        <p className="m-0 shrink-0 text-[13px] font-semibold leading-4 text-white/90">{videoCount}개</p>
      </div>
    </div>
  );
}
