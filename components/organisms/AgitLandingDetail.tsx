import { DailyIcon, TextLink } from "@/components/atoms";
import { RoomInfoRow } from "@/components/molecules";
import { ROUTES } from "@/config/routes";
import type { UiAgit } from "@/types/agit/ui";
import Image from "next/image";

type AgitLandingDetailProps = {
  agit: UiAgit;
  joinHref?: string;
};

function isUsableImageSrc(src?: string): boolean {
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

export function AgitLandingDetail({ agit, joinHref }: AgitLandingDetailProps) {
  const maxMembers = agit.maxMembers ?? agit.memberCount;
  const remaining = Math.max(0, maxMembers - agit.memberCount);
  const participateHref = joinHref ?? ROUTES.agit.profile(agit.id);
  const thumbnailSrc = isUsableImageSrc(agit.thumbnailSrc) ? agit.thumbnailSrc : undefined;

  return (
    <section className="flex w-full flex-col gap-3.5">
      <div
        className="relative w-full h-[190px] overflow-hidden rounded-[18px] [&_img]:w-full [&_img]:h-full [&_img]:object-cover"
        style={thumbnailSrc ? undefined : { background: agit.coverGradient }}
      >
        {thumbnailSrc ? (
          <Image src={thumbnailSrc} alt="" fill className="object-cover" sizes="350px" />
        ) : null}
        <DailyIcon name="video" size={32} className="absolute top-[50%] left-[50%] w-[32px] h-[32px] [transform:translate(-50%,_-50%)]" />
      </div>

      {agit.category ? (
        <div className="flex flex-wrap gap-[8px] items-center">
          <span className="inline-flex items-center border border-[var(--dl-color-border-default)] rounded-[18px] bg-[var(--dl-color-bg-surface)] p-[8px_14px] text-[13px] font-medium leading-[19px] text-[var(--dl-color-text-secondary)] border-[var(--dl-color-border-brand)] bg-[var(--dl-color-bg-brand)] text-[#fff] m-dlPillBrand">
            {agit.category}
          </span>
        </div>
      ) : null}

      <h2 className="m-0 text-[28px] font-bold leading-[34px] text-[var(--dl-color-text-primary)]">{agit.name}</h2>
      <p className="m-0 text-sm font-normal leading-5 text-[var(--dl-color-text-secondary)]">{agit.description}</p>

      <div className="w-full rounded-[var(--dl-radius-lg)] bg-[var(--dl-color-bg-elevated)] p-[16px_14px] flex flex-col gap-[10px] m-dlPanelStack">
        <RoomInfoRow
          icon="users"
          title={`${agit.memberCount} / ${maxMembers}명`}
          description={remaining > 0 ? `현재 ${remaining}자리 남음` : "정원이 가득 찼어요"}
        />
        <RoomInfoRow
          icon="video"
          title={`오늘 영상 ${agit.todayVideoCount ?? 0}개`}
          description={`토픽: ${agit.topicSummary ?? "자유"}`}
        />
      </div>

      <p className="m-0 text-sm font-normal leading-5 text-[var(--dl-color-text-secondary)] text-[12px] leading-[17px]">
        방장은 {agit.ownerName ?? "방장"}입니다.
      </p>

      <div className="flex w-full flex-col gap-[14px] mt-auto">
        <TextLink href={participateHref} className="inline-flex h-[44px] w-full items-center justify-center gap-[8px] rounded-[var(--dl-radius-md)] p-[12px_20px] text-sm font-medium leading-5 !no-underline border-0 bg-[var(--dl-color-bg-brand-subtle)] border-0 bg-[var(--dl-color-bg-brand)] !text-[var(--dl-color-text-inverse)] shadow-[none] [backdrop-filter:none] m-dlBtnPrimary no-underline">
          이 아지트에 참여하기
        </TextLink>
      </div>
    </section>
  );
}
