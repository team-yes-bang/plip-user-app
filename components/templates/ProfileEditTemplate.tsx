import { AuthTopBar } from "@/components/molecules";
import { ProfileEditForm } from "@/components/organisms";
import { DailyLoopAuthTemplate } from "@/components/templates/DailyLoopAuthTemplate";
import { ROUTES } from "@/config/routes";
import type { UiUserProfile } from "@/types/user/ui";

type ProfileEditTemplateProps = {
  profile: UiUserProfile;
};

export function ProfileEditTemplate({ profile }: ProfileEditTemplateProps) {
  return (
    <DailyLoopAuthTemplate>
      <AuthTopBar title="기본 프로필 수정" backHref={ROUTES.mypage.root} />
      <ProfileEditForm profile={profile} />
    </DailyLoopAuthTemplate>
  );
}
