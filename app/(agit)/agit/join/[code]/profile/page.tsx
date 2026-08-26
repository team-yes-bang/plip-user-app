import { InviteJoinProfileTemplate } from "@/components/templates";
import { ROUTES } from "@/config/routes";
import { getServerUserUuid } from "@/lib/auth/server-token";
import * as userService from "@/services/userService";
import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ code: string }>;
};

export default async function AgitInviteJoinProfilePage({ params }: PageProps) {
  const { code } = await params;
  const inviteCode = decodeURIComponent(code).trim();

  if (!(await getServerUserUuid())) {
    redirect(`${ROUTES.login}?callbackUrl=${encodeURIComponent(ROUTES.agit.joinProfile(inviteCode))}`);
  }

  let defaultNickname = "";
  try {
    const profile = await userService.getMyProfile();
    defaultNickname = profile.nickname || "";
  } catch {
    defaultNickname = "";
  }

  return <InviteJoinProfileTemplate code={inviteCode} defaultNickname={defaultNickname} />;
}
