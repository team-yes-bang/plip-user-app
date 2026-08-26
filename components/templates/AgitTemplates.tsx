import { TextLink } from "@/components/atoms";
import {
  AgitSearchSection,
} from "@/components/organisms/AgitSubSections";
import { RoomChatSection } from "@/components/organisms/RoomChatSection";
import { AgitDetailSection } from "@/components/organisms/AgitDetailSection";
import { AgitListSection } from "@/components/organisms/AgitListSection";
import { AppChromeTemplate } from "@/components/templates/AppChromeTemplate";
import { DailyLoopAuthTemplate } from "@/components/templates/DailyLoopAuthTemplate";
import { ROUTES } from "@/config/routes";
import type { ApiAgitDetailMember } from "@/types/agit/api";
import type { UiAgit } from "@/types/agit/ui";
import type { UiChatHistory } from "@/types/chat/ui";
import type { UiTopicGallery } from "@/types/topic/ui";

export function AgitListTemplate({
  items,
  error,
  currentUserUuid,
  enableRemoteChat = false,
}: {
  items: UiAgit[];
  error?: string;
  currentUserUuid?: string;
  enableRemoteChat?: boolean;
}) {
  return (
    <AppChromeTemplate activeTab="agit" variant="light">
      <AgitListSection
        items={items}
        error={error}
        currentUserUuid={currentUserUuid}
        enableRemoteChat={enableRemoteChat}
      />
    </AppChromeTemplate>
  );
}

export function AgitDetailTemplate({
  agit,
  gallery,
  error,
  galleryError,
}: {
  agit: UiAgit | null;
  gallery: UiTopicGallery;
  error?: string;
  galleryError?: string;
}) {
  return (
    <AppChromeTemplate activeTab="agit" variant="light">
      <AgitDetailSection agit={agit} gallery={gallery} error={error} galleryError={galleryError} />
    </AppChromeTemplate>
  );
}

export { AgitEnterFlowTemplate as AgitEnterTemplate } from "./RoomFlowTemplates";

export {
  InvitesSafetyTemplate as AgitSafetyTemplate,
  MembersPermissionsTemplate as AgitMembersTemplate,
  RoomManageHubTemplate as AgitManageTemplate,
  RoomProfileEditTemplate as AgitProfileEditTemplate,
  TopicCreateTemplate as AgitTopicCreateTemplate,
  TopicEditTemplate as AgitTopicEditTemplate,
  TopicFeedTemplate as AgitTopicFeedTemplate,
  TopicViewerTemplate as AgitTopicViewerTemplate,
  TopicsLayoutTemplate as AgitTopicsTemplate,
} from "./RoomManageTemplates";

export function AgitChatTemplate({
  agit,
  initialHistory,
  members,
  currentUserUuid,
  enableRemoteChat = false,
}: {
  agit: UiAgit | null;
  initialHistory: UiChatHistory;
  members: ApiAgitDetailMember[];
  currentUserUuid?: string;
  enableRemoteChat?: boolean;
}) {
  if (!agit) {
    return (
      <DailyLoopAuthTemplate>
        <p className="m-0 text-sm font-normal leading-5 text-[var(--dl-color-text-secondary)]">방을 찾을 수 없습니다.</p>
        <TextLink href={ROUTES.agit.root} className="!text-[var(--dl-color-text-brand)] text-sm font-medium leading-5 !no-underline hover:!underline">
          목록으로
        </TextLink>
      </DailyLoopAuthTemplate>
    );
  }

  return (
    <AppChromeTemplate activeTab="agit" variant="light" mainOverflow="hidden">
      <RoomChatSection
        agit={agit}
        initialHistory={initialHistory}
        members={members}
        currentUserUuid={currentUserUuid}
        enableRemoteChat={enableRemoteChat}
      />
    </AppChromeTemplate>
  );
}

export function AgitSearchTemplate() {
  return (
    <AppChromeTemplate activeTab="agit" variant="light" showNav={false}>
      <AgitSearchSection />
    </AppChromeTemplate>
  );
}
