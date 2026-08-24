import { ProfileEditTemplate } from "@/components/templates";
import * as userService from "@/services/userService";
import { DEFAULT_PROFILE_AVATAR } from "@/types/user/ui";

export default async function ProfileEditPage() {
  let profile = {
    userUuid: "",
    nickname: "사용자",
    profileImageUrl: DEFAULT_PROFILE_AVATAR,
    email: "",
    hasLocalAuth: false,
  };

  try {
    profile = await userService.getMyProfile();
  } catch {
    // API 실패 시 기본값 유지
  }

  return <ProfileEditTemplate profile={profile} />;
}
