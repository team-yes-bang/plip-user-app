import { AuthTopBar } from "@/components/molecules";
import { TermsAgreementsForm } from "@/components/organisms";
import { DailyLoopAuthTemplate } from "@/components/templates/DailyLoopAuthTemplate";
import { ROUTES } from "@/config/routes";
import type { UiTermsAgreementItem } from "@/types/user/ui";

type TermsAgreementsTemplateProps = {
  agreements: UiTermsAgreementItem[];
};

export function TermsAgreementsTemplate({ agreements }: TermsAgreementsTemplateProps) {
  return (
    <DailyLoopAuthTemplate>
      <AuthTopBar title="선택 약관" backHref={ROUTES.mypage.root} />
      <TermsAgreementsForm initialAgreements={agreements} />
    </DailyLoopAuthTemplate>
  );
}
