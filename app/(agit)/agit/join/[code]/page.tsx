import { InviteJoinLandingTemplate } from "@/components/templates";
import { ApiError } from "@/lib/api/apiFetch";
import { getAgitLanding } from "@/services/agitService";
import type { UiAgit } from "@/types/agit/ui";

type PageProps = {
  params: Promise<{ code: string }>;
};

export default async function AgitInviteJoinPage({ params }: PageProps) {
  const { code } = await params;
  const inviteCode = decodeURIComponent(code).trim();
  let agit: UiAgit | null = null;
  let error: string | undefined;

  try {
    agit = await getAgitLanding(inviteCode);
  } catch (caught) {
    if (caught instanceof ApiError && (caught.status === 400 || caught.status === 404)) {
      agit = null;
    } else {
      error = caught instanceof Error ? caught.message : "아지트를 불러오지 못했습니다.";
    }
  }

  return <InviteJoinLandingTemplate agit={agit} error={error} />;
}
