import { TextLink } from "@/components/atoms";
import { AuthTopBar, HeaderBackLink, ScreenHeader } from "@/components/molecules";
import { AgitManageForm } from "@/components/organisms/AgitManageForm";
import { AgitProfileEditForm } from "@/components/organisms/AgitProfileEditForm";
import { InvitesSafetySection } from "@/components/organisms/InvitesSafetySection";
import { MembersPermissionsSection } from "@/components/organisms/MembersPermissionsSection";
import { TopicCreateForm } from "@/components/organisms/TopicCreateForm";
import { TopicEditForm } from "@/components/organisms/TopicEditForm";
import { TopicViewerSection } from "@/components/organisms/TopicViewerSection";
import { TopicsLayoutSection } from "@/components/organisms/TopicsLayoutSection";
import { AgitFlowChrome, AppChromeTemplate } from "@/components/templates/AppChromeTemplate";
import { DailyLoopAuthTemplate } from "@/components/templates/DailyLoopAuthTemplate";
import { getAgitById } from "@/config/agit-mock";
import { ROUTES } from "@/config/routes";
import type { ApiAgitDetailMember } from "@/types/agit/api";
import type { UiAgit } from "@/types/agit/ui";
import type { UiTopicDetail, UiTopicListSections, UiTopicVideo } from "@/types/topic/ui";

type AgitIdProps = { agitId: string };

function RoomMissing() {
  return (
    <AgitFlowChrome>
      <p className="m-0 text-sm font-normal leading-5 text-[var(--dl-color-text-secondary)]">방을 찾을 수 없습니다.</p>
      <TextLink href={ROUTES.agit.root} className="text-sm font-medium leading-5 !text-[var(--dl-color-text-brand)] !no-underline hover:!underline">
        목록으로
      </TextLink>
    </AgitFlowChrome>
  );
}

export function RoomManageHubTemplate({ agit }: { agit: UiAgit | null }) {
  if (!agit) return <RoomMissing />;

  return (
    <AgitFlowChrome>
      <AuthTopBar title="아지트관리" backHref={ROUTES.agit.detail(agit.id)} />
      <AgitManageForm agit={agit} />
    </AgitFlowChrome>
  );
}

export function TopicsLayoutTemplate({
  agit,
  sections,
  currentUserUuid,
}: {
  agit: UiAgit | null;
  sections: UiTopicListSections;
  currentUserUuid?: string;
}) {
  if (!agit) return <RoomMissing />;

  return (
    <AppChromeTemplate activeTab="agit" variant="light">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <ScreenHeader
          leading={<HeaderBackLink href={ROUTES.agit.detail(agit.id)} />}
          title="토픽관리"
        />
        <div className="min-h-0 flex-1 overflow-y-auto px-[23px] pb-6">
          <TopicsLayoutSection
            agitId={agit.id}
            sections={sections}
            myRole={agit.myRole}
            currentUserUuid={currentUserUuid}
          />
        </div>
      </div>
    </AppChromeTemplate>
  );
}

export function TopicViewerTemplate({
  agit,
  topic,
  videos,
}: {
  agit: UiAgit | null;
  topic: UiTopicDetail | null;
  videos: UiTopicVideo[];
}) {
  if (!agit || !topic) return <RoomMissing />;

  const dateLabel = topic.startDate.replaceAll("-", ".");

  return (
    <AppChromeTemplate activeTab="agit" variant="light">
      <TopicViewerSection
        agitId={agit.id}
        title={topic.title || "제목 없음"}
        meta={`${dateLabel} · ${videos.length}개 영상`}
        videos={videos}
        backHref={ROUTES.agit.topics(agit.id)}
      />
    </AppChromeTemplate>
  );
}

export function TopicEditTemplate({
  agit,
  topic,
}: {
  agit: UiAgit | null;
  topic: UiTopicDetail | null;
}) {
  if (!agit || !topic) return <RoomMissing />;

  return (
    <AgitFlowChrome>
      <AuthTopBar title="토픽 편집" backHref={ROUTES.agit.topics(agit.id)} />
      <TopicEditForm agitId={agit.id} topic={topic} />
    </AgitFlowChrome>
  );
}

export function TopicCreateTemplate({ agit }: { agit: UiAgit | null }) {
  if (!agit) return <RoomMissing />;

  return (
    <AgitFlowChrome>
      <AuthTopBar
        title="토픽 만들기"
        backHref={ROUTES.agit.topics(agit.id)}
        step="토픽 이름과 진행 날짜를 정합니다"
      />
      <TopicCreateForm agitId={agit.id} />
    </AgitFlowChrome>
  );
}

export function MembersPermissionsTemplate({
  agit,
  members,
  currentUserUuid,
}: {
  agit: UiAgit | null;
  members: ApiAgitDetailMember[];
  currentUserUuid?: string;
}) {
  if (!agit) return <RoomMissing />;

  const countLabel = agit.maxMembers
    ? `${agit.memberCount} / ${agit.maxMembers}명`
    : `${agit.memberCount}명`;

  return (
    <AgitFlowChrome>
      <AuthTopBar title="멤버리스트" backHref={ROUTES.agit.detail(agit.id)} />
      <p className="m-0 text-sm font-normal leading-5 text-[var(--dl-color-text-secondary)]">{countLabel}</p>
      <MembersPermissionsSection
        agitId={agit.id}
        members={members}
        myRole={agit.myRole}
        currentUserUuid={currentUserUuid}
      />
    </AgitFlowChrome>
  );
}

export function RoomProfileEditTemplate({
  agit,
  nickname,
}: {
  agit: UiAgit | null;
  nickname: string;
}) {
  if (!agit) return <RoomMissing />;

  return (
    <AgitFlowChrome>
      <AuthTopBar title="내프로필관리" backHref={ROUTES.agit.detail(agit.id)} />
      <AgitProfileEditForm agitId={agit.id} nickname={nickname} />
    </AgitFlowChrome>
  );
}

export function InvitesSafetyTemplate({ agitId }: AgitIdProps) {
  if (!getAgitById(agitId)) return <RoomMissing />;

  return (
    <DailyLoopAuthTemplate>
      <p className="m-0 text-xs font-semibold leading-[17px] text-[var(--dl-color-text-brand)]">03 · SAFETY</p>
      <AuthTopBar title="초대 및 안전" backHref={ROUTES.agit.manage(agitId)} step="03" />
      <InvitesSafetySection />
    </DailyLoopAuthTemplate>
  );
}
