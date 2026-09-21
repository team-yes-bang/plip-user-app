import { AgitProfileEditTemplate } from "@/components/templates";
import { getServerUserUuid } from "@/lib/auth/server-token";
import { resolveProfileImageUrl } from "@/lib/user/profileImage";
import { getAgitAndMembers } from "@/services/agitService";
import type { UiAgit } from "@/types/agit/ui";

type PageProps = {
  params: Promise<{ agitId: string }>;
};

export default async function AgitProfileEditPage({ params }: PageProps) {
  const { agitId } = await params;
  let agit: UiAgit | null = null;
  let nickname = "";
  let profileImageUrl = resolveProfileImageUrl(null);

  try {
    const detail = await getAgitAndMembers(agitId);
    agit = detail.agit;
    const userUuid = await getServerUserUuid();
    const me = detail.members.find((member) => member.userUuid === userUuid);
    nickname = me?.nickname ?? "";
    profileImageUrl = resolveProfileImageUrl(me?.profileImagePath);
  } catch {
    agit = null;
  }

  return (
    <AgitProfileEditTemplate agit={agit} nickname={nickname} profileImageUrl={profileImageUrl} />
  );
}
