import { TextLink } from "@/components/atoms";
import { RoomInfoRow } from "@/components/molecules";
import { ROUTES } from "@/config/routes";
import type { UiAgit } from "@/types/agit/ui";

type JoinCompleteSectionProps = {
  agit: UiAgit;
  profileName?: string;
};

export function JoinCompleteSection({
  agit,
  profileName = "데일리러너",
}: JoinCompleteSectionProps) {
  const maxMembers = agit.maxMembers ?? agit.memberCount;

  return (
    <section className="flex w-full flex-col gap-3.5">
      <div className="relative w-[72px] h-[72px] overflow-hidden rounded-[36px] bg-[var(--dl-color-bg-brand-subtle)] [&_img]:absolute [&_img]:top-[20px] [&_img]:left-[20px] [&_img]:w-[32px] [&_img]:h-[32px] bg-[var(--dl-color-bg-success)] m-dlHeroIconSuccess">
        <img src="/plip/daily-loop/icon-check.svg" alt="" width={32} height={32} />
      </div>

      <h2 className="m-0 text-[28px] font-bold leading-[34px] text-[var(--dl-color-text-primary)] text-[28px] leading-[41px] m-dlTitleComplete">방 참여가 완료됐어요</h2>
      <p className="m-0 text-sm font-normal leading-5 text-[var(--dl-color-text-secondary)] leading-[22px]">
        이제 원하는 순간에 영상을 올리고
        <br />
        멤버들과 목적을 이어가세요.
      </p>

      <div className="w-full rounded-[var(--dl-radius-lg)] bg-[var(--dl-color-bg-elevated)] p-[16px_14px] flex flex-col gap-[10px] m-dlPanelStack">
        <p className="m-0 text-[18px] font-semibold leading-[26px] text-[var(--dl-color-text-primary)]">
          {agit.name}
        </p>
        <RoomInfoRow
          icon="users"
          title={`${agit.memberCount} / ${maxMembers}명`}
          description={`프로필: ${profileName}`}
        />
      </div>

      <div className="w-full rounded-[var(--dl-radius-lg)] bg-[var(--dl-color-bg-elevated)] p-[16px_14px] bg-[var(--dl-color-bg-brand-subtle)] m-dlPanelSubtle">
        <p className="m-0 text-[13px] font-semibold leading-[19px] text-[var(--dl-color-text-brand)]">처음 할 일</p>
        <p className="m-0 text-xs font-normal leading-[18px] text-[var(--dl-color-text-secondary)] leading-[22px]">
          1. 오늘의 토픽 확인
          <br />
          2. 채팅 알림 설정
          <br />
          3. 자유롭게 첫 영상 등록
        </p>
      </div>

      <div className="flex w-full flex-col gap-[14px] mt-auto">
        <TextLink href={ROUTES.agit.detail(agit.id)} className="inline-flex h-[44px] w-full items-center justify-center gap-[8px] rounded-[var(--dl-radius-md)] p-[12px_20px] text-sm font-medium leading-5 !no-underline border-0 bg-[var(--dl-color-bg-brand-subtle)] border-0 bg-[var(--dl-color-bg-brand)] !text-[var(--dl-color-text-inverse)] shadow-[none] [backdrop-filter:none] m-dlBtnPrimary no-underline">
          방으로 들어가기
        </TextLink>
      </div>
    </section>
  );
}
