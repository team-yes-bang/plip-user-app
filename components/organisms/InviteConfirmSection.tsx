import { TextLink } from "@/components/atoms";
import { RoomInfoRow } from "@/components/molecules";
import { ROUTES } from "@/config/routes";
import type { UiAgit } from "@/types/agit/ui";

type InviteConfirmSectionProps = {
  agit: UiAgit;
};

export function InviteConfirmSection({ agit }: InviteConfirmSectionProps) {
  const maxMembers = agit.maxMembers ?? agit.memberCount;

  return (
    <section className="flex w-full flex-col gap-3.5">
      <div className="w-full rounded-[var(--dl-radius-lg)] bg-[var(--dl-color-bg-elevated)] p-[16px_14px] bg-[var(--dl-color-bg-brand-subtle)] m-dlPanelSubtle">
        <RoomInfoRow icon="link" title="아지트 초대" description="초대 링크가 유효합니다" />
      </div>

      <h2 className="m-0 text-[28px] font-bold leading-[34px] text-[var(--dl-color-text-primary)]">{agit.name}</h2>
      <p className="m-0 text-sm font-normal leading-5 text-[var(--dl-color-text-secondary)]">{agit.description}</p>

      <div className="w-full rounded-[var(--dl-radius-lg)] bg-[var(--dl-color-bg-elevated)] p-[16px_14px] flex flex-col gap-[10px] m-dlPanelStack">
        <RoomInfoRow
          icon="users"
          title={`${agit.memberCount} / ${maxMembers}명`}
          description={`방장 ${agit.ownerName ?? "방장"}`}
        />
        <RoomInfoRow
          icon="video"
          title={`토픽 ${agit.topicCount}개`}
          description={agit.topicSummary ?? "초대된 방의 토픽"}
        />
      </div>

      <div className="w-full rounded-[var(--dl-radius-lg)] bg-[var(--dl-color-bg-elevated)] p-[16px_14px] bg-[var(--dl-color-bg-brand-subtle)] m-dlPanelSubtle">
        <p className="m-0 text-[13px] font-semibold leading-[19px] text-[var(--dl-color-text-brand)]">참여 전 확인</p>
        <p className="m-0 text-xs font-normal leading-[18px] text-[var(--dl-color-text-secondary)]">
          이 링크는 방장이 재발급하면 사용할 수 없습니다. 참여 후 방별 프로필을 선택합니다.
        </p>
      </div>

      <div className="flex w-full flex-col gap-[14px] mt-auto">
        <TextLink href={ROUTES.agit.profile(agit.id)} className="inline-flex h-[44px] w-full items-center justify-center gap-[8px] rounded-[var(--dl-radius-md)] p-[12px_20px] text-sm font-medium leading-5 !no-underline border-0 bg-[var(--dl-color-bg-brand-subtle)] border-0 bg-[var(--dl-color-bg-brand)] !text-[var(--dl-color-text-inverse)] shadow-[none] [backdrop-filter:none] m-dlBtnPrimary no-underline">
          초대 수락하기
        </TextLink>
        <TextLink href={ROUTES.agit.root} className="inline-flex h-[44px] w-full items-center justify-center gap-[8px] rounded-[var(--dl-radius-md)] p-[12px_20px] text-sm font-medium leading-5 !no-underline border-0 bg-[var(--dl-color-bg-brand-subtle)] border-0 bg-[var(--dl-color-bg-brand-subtle)] !text-[var(--dl-color-text-brand)] shadow-[none] [backdrop-filter:none] m-dlBtnSecondary no-underline">
          나중에 하기
        </TextLink>
      </div>
    </section>
  );
}
