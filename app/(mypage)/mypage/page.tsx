import { MyPageTemplate } from "@/components/templates";
import { getInboxUnreadCount } from "@/services/notificationService";
import * as userService from "@/services/userService";

export default async function MyPage() {
  let profile = null;
  let inboxUnreadCount = 0;

  try {
    profile = await userService.getMyProfile();
    inboxUnreadCount = await getInboxUnreadCount(profile.userUuid);
  } catch {
    profile = null;
    inboxUnreadCount = 0;
  }

  return <MyPageTemplate profile={profile} inboxUnreadCount={inboxUnreadCount} />;
}
