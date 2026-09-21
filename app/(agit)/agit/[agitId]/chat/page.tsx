import { getChatHistoryAction } from "@/actions/chatActions";
import { AgitChatTemplate } from "@/components/templates";
import { ROUTES } from "@/config/routes";
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

  const historyResult = await getChatHistoryAction(agitId, { members });
  const initialHistory = historyResult.ok ? historyResult.data : EMPTY_CHAT_HISTORY;

  return (
    <AgitChatTemplate
      agit={agit}
      initialHistory={initialHistory}
      members={members}
      currentUserUuid={currentUserUuid}
    />
  );
}
