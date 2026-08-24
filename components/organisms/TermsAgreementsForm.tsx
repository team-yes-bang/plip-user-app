"use client";

import { patchTermsAgreementAction } from "@/actions/userActions";
import { DailyToggle, SettingsRow } from "@/components/molecules";
import { toast } from "@/components/ui/toast";
import { handleClientActionResult } from "@/lib/action/handleClientActionResult";
import { formatAgreementDateTime } from "@/lib/user/formatAgreementDateTime";
import type { UiTermsAgreementItem } from "@/types/user/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";

type TermsAgreementsFormProps = {
  initialAgreements: UiTermsAgreementItem[];
};

export function TermsAgreementsForm({ initialAgreements }: TermsAgreementsFormProps) {
  const router = useRouter();
  const [agreements, setAgreements] = useState(initialAgreements);
  const [pendingTermId, setPendingTermId] = useState<number | null>(null);

  async function handleToggle(termId: number, agreed: boolean) {
    if (pendingTermId !== null) return;

    setPendingTermId(termId);
    const result = await patchTermsAgreementAction(termId, agreed);
    setPendingTermId(null);

    if (!(await handleClientActionResult(result, router, { errorTitle: "약관 설정 저장 실패" }))) {
      return;
    }

    if (!result.ok) return;

    setAgreements((current) =>
      current.map((item) => (item.termId === termId ? result.data : item)),
    );

    if (agreed) {
      toast.add({
        type: "success",
        title: "약관에 동의했습니다",
        description: formatAgreementDateTime(result.data.agreedAt),
      });
      return;
    }

    toast.add({
      type: "success",
      title: "약관 동의를 철회했습니다",
      description: formatAgreementDateTime(result.data.revokedAt),
    });
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
