"use client";

import { banAgitMemberAction, transferAgitHostAction } from "@/actions/agitActions";
import { SubmitButton } from "@/components/atoms";
import { MemberManageRow } from "@/components/molecules/MemberManageRow";
import { toast } from "@/components/ui/toast";
import type { ApiAgitDetailMember, ApiAgitMemberRole } from "@/types/agit/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

type MembersPermissionsSectionProps = {
  agitId: string;
  members: ApiAgitDetailMember[];
  myRole?: ApiAgitMemberRole;
  currentUserUuid?: string;
};

type ConfirmAction = "ban" | "transfer";

type ConfirmTarget = {
  action: ConfirmAction;
  member: ApiAgitDetailMember;
};



function canShowActions(
  myRole: ApiAgitMemberRole | undefined,
  member: ApiAgitDetailMember,
  currentUserUuid?: string,
): boolean {
  if (myRole !== "HOST" || member.role !== "GUEST") {
    return false;
  }
  if (currentUserUuid && member.userUuid === currentUserUuid) {
    return false;
  }
  return true;
}

export function MembersPermissionsSection({
  agitId,
  members,
  myRole,
  currentUserUuid,
}: MembersPermissionsSectionProps) {
  const router = useRouter();
  const [confirm, setConfirm] = useState<ConfirmTarget | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function closeConfirm() {
    if (submitting) return;
    setConfirm(null);
  }

  async function handleConfirm() {
    if (!confirm || submitting) return;
    const ampId = confirm.member.ampId;
    if (ampId == null) return;

    setSubmitting(true);
    const result =
      confirm.action === "ban"
        ? await banAgitMemberAction(agitId, ampId)
        : await transferAgitHostAction(agitId, ampId);

    if (!result.ok) {
      toast.add({
        type: "error",
        title: confirm.action === "ban" ? "멤버를 추방하지 못했습니다" : "방장을 위임하지 못했습니다",
        description: result.error,
      });
      setSubmitting(false);
      return;
    }

    setConfirm(null);
    setSubmitting(false);
    toast.add({
      type: "success",
      title: confirm.action === "ban" ? "멤버를 추방했습니다" : "방장 권한을 위임했습니다",
    });
    router.refresh();
  }

  const confirmTitleId = "agit-member-action-title";

  return (
    <section className="relative flex w-full flex-col gap-3.5">
      {members.map((member) => {
        const showActions = canShowActions(myRole, member, currentUserUuid);
        return (
          <MemberManageRow
            key={member.userUuid}
            name={member.nickname}
            meta={member.role === "HOST" ? "방장" : "멤버"}
            host={member.role === "HOST"}
            showActions={showActions}
            actionsDisabled={member.ampId == null}
            onTransfer={
              showActions ? () => setConfirm({ action: "transfer", member }) : undefined
            }
            onBan={showActions ? () => setConfirm({ action: "ban", member }) : undefined}
          />
        );
      })}

      {confirm ? (
        <div className="fixed inset-0 z-[42] flex items-center justify-center p-6">
          <button
            type="button"
            className="absolute inset-0 border-0 bg-[rgba(0,0,0,0.32)]"
            aria-label="취소"
            disabled={submitting}
            onClick={closeConfirm}
          />
          <div
            role="dialog"
            aria-modal
            aria-labelledby={confirmTitleId}
            className="relative z-[1] w-full max-w-[280px] rounded-[20px] border border-[#e3e0ed] bg-[#fbfaff] p-5 shadow-[0_8px_24px_rgba(31,28,41,0.12)]"
          >
            <p id={confirmTitleId} className="m-0 text-base font-semibold text-[#1f1c29]">
              {confirm.action === "ban"
                ? `${confirm.member.nickname} 님을 추방할까요?`
                : `${confirm.member.nickname} 님에게 방장을 위임할까요?`}
            </p>
            <p className="m-[8px_0_0] text-xs text-[#756e8a]">
              {confirm.action === "ban"
                ? "추방하면 이 아지트에 다시 들어올 수 없습니다."
                : "방장 권한이 넘어가고 본인은 멤버가 됩니다."}
            </p>
            <div className="mt-4 flex gap-2">
              <SubmitButton
                type="button"
                variant="outline"
                className="flex-1"
                disabled={submitting}
                onClick={closeConfirm}
              >
                취소
              </SubmitButton>
              <SubmitButton
                type="button"
                variant={confirm.action === "ban" ? "danger" : "brand"}
                className="flex-1"
                disabled={submitting}
                onClick={handleConfirm}
              >
                {submitting
                  ? confirm.action === "ban"
                    ? "추방 중..."
                    : "위임 중..."
                  : confirm.action === "ban"
                    ? "추방"
                    : "위임"}
              </SubmitButton>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
