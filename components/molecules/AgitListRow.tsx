import { DailyIcon, Pill, TextLink } from "@/components/atoms";
import { ROUTES } from "@/config/routes";
import type { UiAgit } from "@/types/agit/ui";
import Image from "next/image";

type AgitListRowProps = {
  agit: UiAgit;
};

function topicBadgeLabel(topicSummary: string) {
  return topicSummary.startsWith("#")
    ? topicSummary
    : `#${topicSummary.replace(/\s+/g, "_")}`;
}

const ACTION_CLASS =
  "relative grid h-[40px] w-[40px] place-items-center rounded-[12px] border border-[var(--dl-color-border-default)] bg-[var(--dl-color-bg-elevated)] text-[var(--dl-color-text-primary)] no-underline transition-all duration-300 hover:border-[var(--dl-color-border-brand)]/40 hover:bg-gradient-to-b hover:from-[var(--dl-color-bg-brand-subtle)]/60 hover:to-[var(--dl-color-bg-elevated)] hover:text-[var(--dl-color-text-brand)] hover:shadow-[0_2px_12px_rgba(79,70,229,0.12)]";

export function AgitListRow({ agit }: AgitListRowProps) {
  return (
    <article className="overflow-hidden rounded-[18px] border border-[var(--dl-color-border-default)] bg-[var(--dl-color-bg-elevated)] shadow-[0_8px_24px_rgba(23,_23,_28,_0.04)]">
      <div className="relative">
        <TextLink
          href={ROUTES.agit.detail(agit.id)}
          className="flex min-w-0 flex-col text-[inherit] no-underline"
        >
          <div
            className="relative aspect-square w-full overflow-hidden"
            style={{ background: agit.coverGradient }}
          >
            {agit.thumbnailSrc ? (
              <Image
                src={agit.thumbnailSrc}
                alt=""
                fill
                sizes="(max-width: 768px) 50vw, 200px"
                className="object-cover object-center"
              />
            ) : null}
            {agit.topicSummary ? (
              <Pill
                as="span"
                className="absolute bottom-[8px] left-[8px] z-[1] h-[22px] max-w-[calc(100%-16px)] truncate p-[0_8px] text-[10px] font-semibold leading-[22px] text-[var(--dl-color-text-brand)] shadow-[0_2px_8px_rgba(23,_23,_28,_0.12)]"
              >
                {topicBadgeLabel(agit.topicSummary)}
              </Pill>
            ) : null}
          </div>
          <p className="m-0 overflow-hidden px-[10px] py-[10px] text-[13px] font-semibold leading-[1.25] text-[var(--dl-color-text-primary)] text-ellipsis whitespace-nowrap">
            {agit.name}
          </p>
        </TextLink>

        <div className="absolute top-[8px] right-[8px] z-[2] flex flex-col gap-[8px]">
          <TextLink href={ROUTES.agit.chat(agit.id)} className={ACTION_CLASS} aria-label={`${agit.name} 채팅`}>
            <DailyIcon name="message" size={20} />
            {agit.hasNewChat ? (
              <span
                className="absolute top-[7px] right-[7px] h-[7px] w-[7px] rounded-[999px] border border-[#fff] bg-[var(--dl-color-bg-brand)]"
                aria-hidden
              />
            ) : null}
          </TextLink>
          <TextLink href={ROUTES.agit.upload(agit.id)} className={ACTION_CLASS} aria-label={`${agit.name} 촬영`}>
            <DailyIcon name="camera" size={20} />
            {agit.hasTodayTopic ? (
              <span
                className="absolute top-[7px] right-[7px] h-[7px] w-[7px] rounded-[999px] border border-[#fff] bg-[var(--dl-color-bg-brand)]"
                aria-hidden
              />
            ) : null}
          </TextLink>
        </div>
      </div>
    </article>
  );
}
