import { DailyIcon, TextLink } from "@/components/atoms";
import { ui } from "@/components/atoms/styles";
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
  const participateHref = joinHref ?? ROUTES.agit.profile(agit.id);
  const thumbnailSrc = isUsableImageSrc(agit.thumbnailSrc) ? agit.thumbnailSrc : undefined;

  return (
    <section className="flex w-full flex-col gap-3.5">
      <div className="w-full overflow-hidden rounded-[18px] border border-[var(--dl-color-border-default)] bg-[var(--dl-color-bg-elevated)] shadow-[0_8px_24px_rgba(23,_23,_28,_0.04)]">
        <div
          className="relative h-[190px] w-full overflow-hidden [&_img]:h-full [&_img]:w-full [&_img]:object-cover"
          style={thumbnailSrc ? undefined : { background: agit.coverGradient }}
        >
          {thumbnailSrc ? (
            <Image src={thumbnailSrc} alt="" fill className="object-cover" sizes="350px" />
          ) : null}
        </div>

        <div className="flex flex-col gap-3.5 p-4">
          {agit.category ? (
            <span className="inline-flex w-fit items-center rounded-[18px] border-0 bg-[var(--dl-color-bg-brand)] p-[8px_14px] text-[13px] font-medium leading-[19px] text-[#fff]">
              {agit.category}
            </span>
          ) : null}

          <h2 className={`${ui.title} font-[family-name:var(--font-title)]`}>{agit.name}</h2>
          {agit.description ? (
            <p className={ui.subtitle}>{agit.description}</p>
          ) : null}

          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2.5">
              <DailyIcon name="users" size={20} />
              <span className="text-sm font-medium leading-5 text-[var(--dl-color-text-primary)]">
                {agit.memberCount}/{maxMembers}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <DailyIcon name="crownBrand" size={20} />
              <span className="min-w-0 truncate text-sm font-medium leading-5 text-[var(--dl-color-text-primary)]">
                {agit.ownerName ?? "방장"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto flex w-full flex-col gap-[14px] pt-2">
        <TextLink
          href={participateHref}
          className="group relative inline-flex h-14 w-full items-center justify-center overflow-visible rounded-full bg-[linear-gradient(145deg,var(--dl-color-bg-brand),#3b82f6)] text-[17px] font-bold !text-white !no-underline ring-4 ring-white/20 shadow-[0_8px_24px_rgba(79,70,229,0.45)] transition-all duration-200 hover:scale-[1.03] hover:ring-white/40 hover:shadow-[0_12px_32px_rgba(79,70,229,0.6)] active:scale-95"
        >
          <span className="font-[family-name:var(--font-title)] drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
            입장
          </span>
        </TextLink>
      </div>
    </section>
  );
}
