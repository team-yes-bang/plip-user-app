import { MyPageTemplate } from "@/components/templates";
import * as userService from "@/services/userService";

export default async function MyPage() {
  let profile = null;

  try {
    profile = await userService.getMyProfile();
  } catch {
    profile = null;
  }

  return <MyPageTemplate profile={profile} />;
}
