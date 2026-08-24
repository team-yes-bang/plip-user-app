import { TextLink } from "@/components/atoms";
import { AuthTopBar } from "@/components/molecules";
import { CreateRoomAccessForm } from "@/components/organisms/CreateRoomAccessForm";
import { CreateRoomBasicForm } from "@/components/organisms/CreateRoomBasicForm";
import { InviteConfirmSection } from "@/components/organisms/InviteConfirmSection";
import { InviteJoinProfileForm } from "@/components/organisms/InviteJoinProfileForm";
import { JoinCompleteSection } from "@/components/organisms/JoinCompleteSection";
import { PublicRoomDetail } from "@/components/organisms/PublicRoomDetail";
import { RoomProfileSelect } from "@/components/organisms/RoomProfileSelect";
import { AgitFlowChrome } from "@/components/templates/AppChromeTemplate";
import { DailyLoopAuthTemplate } from "@/components/templates/DailyLoopAuthTemplate";
import { getAgitById } from "@/config/agit-mock";
import { ROUTES } from "@/config/routes";
import type { UiAgit } from "@/types/agit/ui";

function RoomMissing({ backHref = ROUTES.agit.root }: { backHref?: string }) {
  return (
    <DailyLoopAuthTemplate>
      <p className="m-0 text-sm font-normal leading-5 text-[var(--dl-color-text-secondary)]">방을 찾을 수 없습니다.</p>
      <TextLink href={backHref} className="!text-[var(--dl-color-text-brand)] text-sm font-medium leading-5 !no-underline hover:!underline">
        목록으로
      </TextLink>
    </DailyLoopAuthTemplate>
  );
}

export function PublicRoomTemplate({ agitId }: { agitId: string }) {
  const agit = getAgitById(agitId);
  if (!agit) return <RoomMissing />;

  return (
    <DailyLoopAuthTemplate>
      <p className="m-0 text-xs font-semibold leading-[17px] text-[var(--dl-color-text-brand)]">R01 · PUBLIC ROOM</p>
      <AuthTopBar title="방 정보" backHref={ROUTES.agit.root} />
      <PublicRoomDetail agit={agit} />
    </DailyLoopAuthTemplate>
  );
}

export function InviteConfirmTemplate({ agitId }: { agitId: string }) {
  const agit = getAgitById(agitId);
  if (!agit) return <RoomMissing />;

  return (
    <DailyLoopAuthTemplate>
      <p className="m-0 text-xs font-semibold leading-[17px] text-[var(--dl-color-text-brand)]">R02 · PRIVATE INVITE</p>
      <AuthTopBar title="초대 확인" backHref={ROUTES.agit.root} />
      <div className="h-2" />
      <InviteConfirmSection agit={agit} />
    </DailyLoopAuthTemplate>
  );
}

export function CreateRoomBasicTemplate() {
  return (
    <AgitFlowChrome>
      <AuthTopBar title="아지트 만들기" backHref={ROUTES.agit.root} step="1 / 2 · 기본 정보" />
      <CreateRoomBasicForm />
    </AgitFlowChrome>
  );
}

export function CreateRoomAccessTemplate() {
  return (
    <AgitFlowChrome>
      <AuthTopBar title="아지트 만들기" backHref={ROUTES.agit.create} step="2 / 2 · 프로필" />
      <CreateRoomAccessForm />
    </AgitFlowChrome>
  );
}

export function RoomProfileTemplate({ agitId }: { agitId: string }) {
  const agit = getAgitById(agitId);
  if (!agit) return <RoomMissing />;

  return (
    <DailyLoopAuthTemplate>
      <p className="m-0 text-xs font-semibold leading-[17px] text-[var(--dl-color-text-brand)]">R05 · ROOM PROFILE</p>
      <AuthTopBar title="이 방에서 사용할 프로필" backHref={ROUTES.agit.enter(agitId)} />
      <h2 className="m-0 text-[28px] font-bold leading-[34px] text-[var(--dl-color-text-primary)] text-[24px] leading-[35px] m-dlTitleSection">프로필을 선택해주세요</h2>
      <p className="m-0 text-sm font-normal leading-5 text-[var(--dl-color-text-secondary)]">한 유저는 한 방에서 하나의 프로필만 사용합니다.</p>
      <RoomProfileSelect agitId={agitId} />
    </DailyLoopAuthTemplate>
  );
}

export function JoinCompleteTemplate({
  agit,
  error,
}: {
  agit: UiAgit | null;
  error?: string;
}) {
  if (error) {
    return (
      <DailyLoopAuthTemplate>
        <p className="m-0 text-sm font-normal leading-5 text-[var(--dl-color-text-secondary)]">{error}</p>
        <TextLink href={ROUTES.agit.root} className="!text-[var(--dl-color-text-brand)] text-sm font-medium leading-5 !no-underline hover:!underline">
          목록으로
        </TextLink>
      </DailyLoopAuthTemplate>
    );
  }

  if (!agit) {
    return <RoomMissing />;
  }

  return (
    <DailyLoopAuthTemplate>
      <p className="m-0 text-xs font-semibold leading-[17px] text-[var(--dl-color-text-brand)]">R06 · JOIN COMPLETE</p>
      <div className="h-[42px]" />
      <JoinCompleteSection agit={agit} profileName={agit.ownerName} />
    </DailyLoopAuthTemplate>
  );
}

export function InviteJoinLandingTemplate({
  agit,
  error,
}: {
  agit: UiAgit | null;
  error?: string;
}) {
  if (error) {
    return (
      <DailyLoopAuthTemplate>
        <p className="m-0 text-sm font-normal leading-5 text-[var(--dl-color-text-secondary)]">{error}</p>
        <TextLink href={ROUTES.agit.root} className="!text-[var(--dl-color-text-brand)] text-sm font-medium leading-5 !no-underline hover:!underline">
          목록으로
        </TextLink>
      </DailyLoopAuthTemplate>
    );
  }

  if (!agit) {
    return <RoomMissing />;
  }

  return (
    <DailyLoopAuthTemplate>
      <p className="m-0 text-xs font-semibold leading-[17px] text-[var(--dl-color-text-brand)]">INVITE · LANDING</p>
      <AuthTopBar title="방 정보" backHref={ROUTES.agit.root} />
      <PublicRoomDetail agit={agit} joinHref={ROUTES.agit.joinProfile(agit.inviteCode ?? agit.id)} />
    </DailyLoopAuthTemplate>
  );
}

export function InviteJoinProfileTemplate({ code }: { code: string }) {
  return (
    <DailyLoopAuthTemplate>
      <p className="m-0 text-xs font-semibold leading-[17px] text-[var(--dl-color-text-brand)]">INVITE · PROFILE</p>
      <AuthTopBar title="이 방에서 사용할 프로필" backHref={ROUTES.agit.join(code)} />
      <h2 className="m-0 text-[28px] font-bold leading-[34px] text-[var(--dl-color-text-primary)] text-[24px] leading-[35px] m-dlTitleSection">닉네임을 입력해주세요</h2>
      <p className="m-0 text-sm font-normal leading-5 text-[var(--dl-color-text-secondary)]">아지트에서 사용할 이름입니다. 한 유저는 한 방에서 하나의 프로필만 사용합니다.</p>
      <InviteJoinProfileForm code={code} />
    </DailyLoopAuthTemplate>
  );
}

export function AgitEnterFlowTemplate({ agitId }: { agitId: string }) {
  const agit = getAgitById(agitId);
  if (!agit) return <RoomMissing />;
  if (agit.visibility === "private") {
    return <InviteConfirmTemplate agitId={agitId} />;
  }
  return <PublicRoomTemplate agitId={agitId} />;
}
