import { AuthTopBar } from "@/components/molecules";
import { ChangePasswordForm } from "@/components/organisms";
import { DailyLoopAuthTemplate } from "@/components/templates/DailyLoopAuthTemplate";
import { ROUTES } from "@/config/routes";

type ChangePasswordTemplateProps = {
  email: string;
};

export function ChangePasswordTemplate({ email }: ChangePasswordTemplateProps) {
  return (
    <DailyLoopAuthTemplate>
      <AuthTopBar title="비밀번호 변경" backHref={ROUTES.mypage.root} />
      <ChangePasswordForm email={email} />
    </DailyLoopAuthTemplate>
  );
}
