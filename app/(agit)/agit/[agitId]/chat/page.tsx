import { AgitChatTemplate } from "@/components/templates";
import { ROUTES } from "@/config/routes";
import { buildSeedChatHistory } from "@/lib/chat/seedMessages";
import { getServerUserUuid } from "@/lib/auth/server-token";
import { getAgitAndMembers } from "@/services/agitService";
import type { UiAgit } from "@/types/agit/ui";
import type { ApiAgitDetailMember } from "@/types/agit/api";
import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ agitId: string }>;
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

  const initialHistory = buildSeedChatHistory(agitId, members, currentUserUuid);

  return (
    <AgitChatTemplate
      agit={agit}
      initialHistory={initialHistory}
      members={members}
      currentUserUuid={currentUserUuid}
    />
  );
}
