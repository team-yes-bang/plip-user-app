import { ui } from "@/components/atoms/styles";
import { AuthTopBar } from "@/components/molecules";
import { ProfileSetupForm } from "@/components/organisms";
import { DailyLoopAuthTemplate } from "@/components/templates/DailyLoopAuthTemplate";
import { ROUTES } from "@/config/routes";

export function ProfileSetupTemplate() {
  return (
    <DailyLoopAuthTemplate>
      <AuthTopBar title="프로필 설정" backHref={ROUTES.signup} />
      <p className={ui.subtitle}>가입 후 모든 아지트에서 선택할 기본 유저 프로필입니다.</p>
      <ProfileSetupForm />
    </DailyLoopAuthTemplate>
  );
}
