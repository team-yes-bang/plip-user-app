import { getChatHistoryAction } from "@/actions/chatActions";
import { AgitChatTemplate } from "@/components/templates";
import { ROUTES } from "@/config/routes";
import { isEnableRemoteChatEnabled } from "@/lib/api/env";
import { buildSeedChatHistory } from "@/lib/chat/seedMessages";
import { getServerUserUuid } from "@/lib/auth/server-token";
import { getAgitAndMembers } from "@/services/agitService";
import type { ApiAgitDetailMember } from "@/types/agit/api";
import type { UiAgit } from "@/types/agit/ui";
import type { UiChatHistory } from "@/types/chat/ui";
import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ agitId: string }>;
};

const EMPTY_CHAT_HISTORY: UiChatHistory = {
  messages: [],
  nextCursor: null,
  hasNext: false,
};

export default async function AgitChatPage({ params }: PageProps) {
  const { agitId } = await params;
  const enableRemoteChat = isEnableRemoteChatEnabled();

  let agit: UiAgit | null = null;
  let members: ApiAgitDetailMember[] = [];
  const currentUserUuid = await getServerUserUuid();

  try {
    const detail = await getAgitAndMembers(agitId);
    agit = detail.agit;
    members = detail.members;
  } catch {
    redirect(ROUTES.agit.detail(agitId));
  }

  let initialHistory: UiChatHistory;
  if (enableRemoteChat) {
    const historyResult = await getChatHistoryAction(agitId);
    initialHistory = historyResult.ok ? historyResult.data : EMPTY_CHAT_HISTORY;
  } else {
    initialHistory = buildSeedChatHistory(agitId, members, currentUserUuid);
  }

  return (
    <AgitChatTemplate
      agit={agit}
      initialHistory={initialHistory}
      members={members}
      currentUserUuid={currentUserUuid}
      enableRemoteChat={enableRemoteChat}
    />
  );
}
