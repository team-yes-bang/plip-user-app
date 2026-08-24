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
      <h2 className="m-0 text-[24px] font-bold leading-[35px] text-[var(--dl-color-text-primary)] m-dlTitleSection">
        비밀번호를 변경하세요
      </h2>
      <ChangePasswordForm email={email} />
    </DailyLoopAuthTemplate>
  );
}
