"use client";

import { createThemeAction, deleteThemeAction, updateThemeNameAction } from "@/actions/diaryActions";
import { DailyIcon, IconButton, Input, Label, SubmitButton } from "@/components/atoms";
import { AnimatedBottomSheet, ConfirmModal } from "@/components/molecules";
import { toast } from "@/components/ui/toast";
import type { UiDiaryTheme } from "@/types/diary/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ThemeBottomSheetProps = {
  open: boolean;
  onClose: () => void;
  theme?: UiDiaryTheme | null;
};

export function ThemeBottomSheet({ open, onClose, theme = null }: ThemeBottomSheetProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = theme !== null;
  const titleId = isEdit ? "edit-theme-title" : "create-theme-title";

  function handleClose() {
    if (pending || deleting) return;
    setError(null);
    setConfirmDeleteOpen(false);
    onClose();
  }

  async function handleSubmit(formData: FormData) {
    if (pending || deleting) return;

    setError(null);
    setPending(true);

    const themeName = formData.get("themeName");
    const result = isEdit
      ? await updateThemeNameAction(theme.id, themeName)
      : await createThemeAction(themeName);

    setPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    toast.add({
      type: "success",
      title: isEdit ? "테마를 수정했습니다" : "새 테마를 만들었습니다",
    });
    router.refresh();
    handleClose();
  }

  async function handleDelete() {
    if (!theme || deleting) return;

    setDeleting(true);
    const result = await deleteThemeAction(theme.id);
    setDeleting(false);

    if (!result.ok) {
      toast.add({
        type: "error",
        title: "테마를 삭제하지 못했습니다",
        description: result.error,
      });
      return;
    }

    toast.add({
      type: "success",
      title: "테마를 삭제했습니다",
    });
    setConfirmDeleteOpen(false);
    router.refresh();
    handleClose();
  }

  return (
    <>
      <AnimatedBottomSheet
        open={open}
        onClose={handleClose}
        labelledBy={titleId}
        aria-label={isEdit ? "테마 수정" : "테마 생성"}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id={titleId} className="m-0 text-lg font-bold text-[#1f1c29]">
            {isEdit ? "테마 수정" : "테마 생성"}
          </h2>
          <IconButton variant="surface" label="닫기" onClick={handleClose}>
            <DailyIcon name="x" size={18} />
          </IconButton>
        </div>

        <form key={theme?.id ?? "create"} className="flex flex-col gap-4" action={handleSubmit}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="theme-bottomsheet-name">테마 이름</Label>
            <Input
              id="theme-bottomsheet-name"
              name="themeName"
              placeholder="예: 맛집 탐방, 운동 기록"
              defaultValue={theme?.name ?? ""}
              required
              maxLength={20}
              disabled={pending || deleting}
            />
          </div>

          {error ? <p className="m-0 text-xs font-semibold text-[var(--dl-color-text-danger)]">{error}</p> : null}

          <div className="mt-2 flex flex-col gap-3">
            <SubmitButton variant="brand" disabled={pending || deleting}>
              {pending ? "저장 중..." : isEdit ? "수정 완료" : "테마 만들기"}
            </SubmitButton>

            {isEdit ? (
              <button
                type="button"
                className="mt-1 self-center cursor-pointer text-xs font-semibold text-[var(--dl-color-text-danger)] transition-opacity hover:opacity-75 disabled:opacity-50"
                disabled={pending || deleting}
                onClick={() => setConfirmDeleteOpen(true)}
              >
                테마 삭제
              </button>
            ) : null}
          </div>
        </form>
      </AnimatedBottomSheet>

      {isEdit && (
        <ConfirmModal
          open={confirmDeleteOpen}
          onClose={() => setConfirmDeleteOpen(false)}
          onConfirm={handleDelete}
          title={`"${theme.name}" 테마를 삭제하시겠어요?`}
          description="테마를 삭제해도 날짜별 다이어리에 기록된 영상은 안전하게 유지됩니다."
          confirmLabel="삭제"
          cancelLabel="취소"
          tone="danger"
          loading={deleting}
        />
      )}
    </>
  );
}
