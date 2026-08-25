"use client";

import { deleteTopicAction, updateTopicAction } from "@/actions/topicActions";
import { SubmitButton } from "@/components/atoms";
import { AuthField, TopicDatePicker } from "@/components/molecules";
import { toast } from "@/components/ui/toast";
import { ROUTES } from "@/config/routes";
import { TOPIC_FORBIDDEN, TOPIC_LOGIN_REQUIRED } from "@/lib/topic/actionErrors";
import { TOPIC_TITLE_MAX_LENGTH } from "@/types/topic/schema";
import type { UiTopicDetail } from "@/types/topic/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";

type TopicEditFormProps = {
  agitId: string;
  topic: UiTopicDetail;
};

export function TopicEditForm({ agitId, topic }: TopicEditFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canDelete = topic.videoCount === 0;

  async function handleSubmit(formData: FormData) {
    if (pending) return;
    setError(null);
    setPending(true);

    const result = await updateTopicAction(topic.id, {
      title: formData.get("title"),
      startDate: formData.get("startDate"),
    });

    setPending(false);

    if (!result.ok) {
      if (result.error === TOPIC_FORBIDDEN || result.error === TOPIC_LOGIN_REQUIRED) {
        toast.add({ type: "error", title: result.error });
        return;
      }
      setError(result.error);
      return;
    }

    toast.add({ type: "success", title: "토픽을 저장했습니다" });
    router.push(ROUTES.agit.topics(agitId));
    router.refresh();
  }

  async function handleDelete() {
    if (deleting || !canDelete) return;
    setDeleting(true);
    const result = await deleteTopicAction(topic.id);
    if (!result.ok) {
      toast.add({
        type: "error",
        title:
          result.error === TOPIC_FORBIDDEN || result.error === TOPIC_LOGIN_REQUIRED
            ? result.error
            : "토픽을 삭제하지 못했습니다",
        description:
          result.error === TOPIC_FORBIDDEN || result.error === TOPIC_LOGIN_REQUIRED
            ? undefined
            : result.error,
      });
      setDeleting(false);
      setConfirmDelete(false);
      return;
    }
    toast.add({ type: "success", title: "토픽을 삭제했습니다" });
    router.push(ROUTES.agit.topics(agitId));
    router.refresh();
  }

  return (
    <div className="relative flex w-full flex-1 flex-col">
      <form className="flex w-full flex-col gap-3.5" action={handleSubmit}>
        <AuthField
          id="topic-edit-name"
          name="title"
          label="토픽 이름"
          hint={`최대 ${TOPIC_TITLE_MAX_LENGTH}자`}
          defaultValue={topic.title}
          maxLength={TOPIC_TITLE_MAX_LENGTH}
          required
        />
        <TopicDatePicker
          id="topic-edit-date"
          name="startDate"
          defaultValue={topic.startDate}
          required
        />

        {error ? <p className="m-0 text-[12px] text-red-600">{error}</p> : null}

        <div className="mt-auto flex w-full flex-col gap-[14px]">
          <SubmitButton variant="brand" disabled={pending}>
            {pending ? "저장 중..." : "저장"}
          </SubmitButton>
          <button
            type="button"
            className="inline-flex h-[44px] w-full items-center justify-center rounded-[var(--dl-radius-md)] text-sm font-medium text-[var(--dl-color-text-danger)] disabled:opacity-50"
            disabled={!canDelete}
            onClick={() => setConfirmDelete(true)}
          >
            {canDelete ? "토픽 삭제" : "영상이 있어 삭제할 수 없어요"}
          </button>
        </div>
      </form>

      {confirmDelete ? (
        <div className="absolute inset-0 z-[42] flex items-center justify-center p-6">
          <button
            type="button"
            className="absolute inset-0 border-0 bg-[rgba(0,0,0,0.32)]"
            aria-label="취소"
            onClick={() => setConfirmDelete(false)}
          />
          <div
            role="dialog"
            aria-modal
            aria-labelledby="topic-delete-title"
            className="relative z-[1] w-full max-w-[280px] rounded-[20px] border border-[#e3e0ed] bg-[#fbfaff] p-5 shadow-[0_8px_24px_rgba(31,28,41,0.12)]"
          >
            <p id="topic-delete-title" className="m-0 text-base font-semibold text-[#1f1c29]">
              토픽을 삭제하시겠어요?
            </p>
            <p className="m-[8px_0_0] text-xs text-[#756e8a]">삭제하면 목록에서 이 토픽이 사라집니다.</p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                className="flex h-11 flex-1 items-center justify-center rounded-[var(--dl-radius-md)] bg-[var(--dl-color-bg-surface)] text-sm font-medium text-[#262433]"
                onClick={() => setConfirmDelete(false)}
              >
                취소
              </button>
              <button
                type="button"
                className="flex h-11 flex-1 items-center justify-center rounded-[var(--dl-radius-md)] bg-[var(--dl-color-bg-danger)] text-sm font-medium text-[var(--dl-color-text-danger)] disabled:opacity-50"
                disabled={deleting}
                onClick={handleDelete}
              >
                {deleting ? "삭제 중..." : "삭제"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
