import { TermsAgreementsTemplate } from "@/components/templates/TermsAgreementsTemplate";
import * as userService from "@/services/userService";
import type { UiTermsAgreementItem } from "@/types/user/ui";

export default async function TermsAgreementsPage() {
  let agreements: UiTermsAgreementItem[] = [];

  try {
    agreements = await userService.getOptionalTermsAgreements();
  } catch {
    agreements = [];
  }

  return <TermsAgreementsTemplate agreements={agreements} />;
}
