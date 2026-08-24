import { DailyIcon, TextLink } from "@/components/atoms";

type TopicEmptySlotProps = {
  captureHref: string;
};

export function TopicEmptySlot({ captureHref }: TopicEmptySlotProps) {
  // /video?agitUuid=&topicUuid= 또는 /video?themeId=
  return (
    <TextLink
      href={captureHref}
      aria-label="영상 촬영"
      className="flex min-h-0 flex-1 items-center justify-center rounded-[18px] border border-dashed border-[var(--dl-color-border-brand)] bg-[linear-gradient(135deg,rgba(247,244,255,0.95),rgba(255,255,255,0.98))] no-underline shadow-[0_8px_24px_rgba(23,23,28,0.04)]"
    >
      <span className="grid h-14 w-14 place-items-center rounded-full bg-[var(--dl-color-bg-brand)]">
        <DailyIcon name="plus" size={28} className="brightness-0 invert" />
      </span>
    </TextLink>
  );
}
