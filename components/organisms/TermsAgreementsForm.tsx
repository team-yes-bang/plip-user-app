"use client";

import { patchTermsAgreementAction } from "@/actions/userActions";
import { DailyToggle, SettingsRow } from "@/components/molecules";
import { toast } from "@/components/ui/toast";
import type { UiTermsAgreementItem } from "@/types/user/ui";
import { useState } from "react";

type TermsAgreementsFormProps = {
  initialAgreements: UiTermsAgreementItem[];
};

export function TermsAgreementsForm({ initialAgreements }: TermsAgreementsFormProps) {
  const [agreements, setAgreements] = useState(initialAgreements);
  const [pendingTermId, setPendingTermId] = useState<number | null>(null);

  async function handleToggle(termId: number, agreed: boolean) {
    if (pendingTermId !== null) return;

    setPendingTermId(termId);
    const result = await patchTermsAgreementAction(termId, agreed);
    setPendingTermId(null);

    if (!result.ok) {
      toast.add({ type: "error", title: "약관 설정 저장 실패", description: result.error });
      return;
    }

    setAgreements((current) =>
      current.map((item) => (item.termId === termId ? { ...item, agreed } : item)),
    );
    toast.add({ type: "success", title: "약관 설정을 저장했습니다" });
  }

  if (agreements.length === 0) {
    return (
      <p className="m-0 text-sm text-[var(--dl-color-text-secondary)]">
        변경 가능한 선택 약관이 없습니다.
      </p>
    );
  }

  return (
    <section className="flex w-full flex-col gap-3.5">
      {agreements.map((item) => (
        <SettingsRow
          key={item.termId}
          title={item.title}
          description={item.agreed ? "동의함" : "동의하지 않음"}
          trailing={
            <DailyToggle
              checked={item.agreed}
              label={item.title}
              onChange={(checked) => handleToggle(item.termId, checked)}
            />
          }
          showChevron={false}
        />
      ))}
    </section>
  );
}
