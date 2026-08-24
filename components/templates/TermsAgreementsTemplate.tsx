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
      <AuthTopBar title="선택 약관 동의" backHref={ROUTES.mypage.root} />
      <h2 className="m-0 text-[24px] font-bold leading-[35px] text-[var(--dl-color-text-primary)] m-dlTitleSection">
        선택 약관
      </h2>
      <p className="m-0 text-sm font-normal leading-5 text-[var(--dl-color-text-secondary)]">
        마케팅 등 선택 약관 동의 상태를 변경할 수 있습니다.
      </p>
      <TermsAgreementsForm initialAgreements={agreements} />
    </DailyLoopAuthTemplate>
  );
}
