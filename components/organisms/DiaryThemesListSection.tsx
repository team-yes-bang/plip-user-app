"use client";

import { deleteThemeAction } from "@/actions/diaryActions";
import { TextLink } from "@/components/atoms";
import { PageContainer, ScreenHeader } from "@/components/molecules";
import { AnimatedDropdown } from "@/components/molecules/AnimatedOverlays";
import { CreateThemeDialog } from "@/components/organisms/CreateThemeDialog";
import { ROUTES } from "@/config/routes";
import type { UiDiaryTheme } from "@/types/diary/ui";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type DiaryThemesListSectionProps = {
  themes: UiDiaryTheme[];
  error?: string;
};

type ThemeCardMenuProps = {
  theme: UiDiaryTheme;
  open: boolean;
  pending: boolean;
  onToggle: () => void;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

function ThemeCardMenu({
  theme,
  open,
  pending,
  onToggle,
  onClose,
  onEdit,
  onDelete,
}: ThemeCardMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        onClose();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return (
    <div ref={rootRef} className="absolute top-[0.35rem] right-[0.35rem] z-20">
      <button
        type="button"
        className="grid place-items-center w-[1.5rem] h-[1.5rem] border-0 rounded-[999px] bg-[rgba(0,_0,_0,_0.45)] text-[#fff] text-[0.85rem] font-extrabold leading-none cursor-pointer disabled:opacity-50"
        aria-label={`${theme.name} 테마 메뉴`}
        aria-expanded={open}
        disabled={pending}
        onClick={onToggle}
      >
        ···
      </button>

      <AnimatedDropdown
        open={open}
        role="menu"
        aria-label={`${theme.name} 테마 옵션`}
        className="absolute top-[calc(100%+0.25rem)] right-0 min-w-[5.5rem] rounded-md border border-black/10 bg-white p-1 shadow-md"
      >
        <button
          type="button"
          role="menuitem"
          className="block w-full rounded px-3 py-2 text-left text-sm font-semibold text-[#111]"
          onClick={onEdit}
        >
          수정
        </button>
        <button
          type="button"
          role="menuitem"
          className="block w-full rounded px-3 py-2 text-left text-sm font-semibold text-red-600"
          onClick={onDelete}
        >
          삭제
        </button>
      </AnimatedDropdown>
    </div>
  );
}

export function DiaryThemesListSection({ themes, error: fetchError }: DiaryThemesListSectionProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<UiDiaryTheme | null>(null);
  const [openMenuThemeId, setOpenMenuThemeId] = useState<string | null>(null);
  const [pendingThemeId, setPendingThemeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function openCreateDialog() {
    setEditingTheme(null);
    setDialogOpen(true);
  }

  function openEditDialog(theme: UiDiaryTheme) {
    setOpenMenuThemeId(null);
    setEditingTheme(theme);
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingTheme(null);
  }

  async function handleDelete(theme: UiDiaryTheme) {
    if (pendingThemeId) {
      return;
    }

    setOpenMenuThemeId(null);

    if (!window.confirm(`"${theme.name}" 테마를 삭제할까요?`)) {
      return;
    }

    setError(null);
    setPendingThemeId(theme.id);

    const result = await deleteThemeAction(theme.id);
    setPendingThemeId(null);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    router.refresh();
  }

  return (
    <>
      <PageContainer aria-label="테마 목록">
        <ScreenHeader
          titleAlign="center"
          backHref={ROUTES.diary.root}
          title="테마"
          trailing={
            <button
              type="button"
              className="cursor-pointer rounded-[var(--dc-btn-radius)] border border-[var(--dc-glass-border)] bg-[linear-gradient(180deg,_var(--dc-glass-from),_var(--dc-glass-to))] p-[0.4rem_0.85rem] text-[0.8rem] font-medium text-[var(--dc-fg-primary)] shadow-[var(--dc-shadow)] backdrop-blur-[20px]"
              onClick={openCreateDialog}
            >
              생성
            </button>
          }
        />

        {fetchError || error ? (
          <p className="m-0 px-1 text-sm text-red-600">{fetchError ?? error}</p>
        ) : null}

        <div className="grid grid-cols-[repeat(3,_minmax(0,_1fr))] gap-[0.85rem_0.35rem] bg-[transparent]">
          {themes.map((theme, index) => (
            <div key={theme.id} className="relative m-0">
              <TextLink
                href={ROUTES.diary.themes.detail(theme.id)}
                className="!flex flex-col gap-[0.4rem] !text-[#111] !no-underline"
              >
                <span
                  className={`block aspect-[1_/_1] rounded-[0] bg-[linear-gradient(145deg,_#666,_#222)] [&.is-1]:bg-[linear-gradient(160deg,_rgba(91,_61,_255,_0.35),_transparent_55%),_linear-gradient(145deg,_#555,_#1c1c1c)] [&.is-2]:bg-[linear-gradient(160deg,_rgba(37,_244,_238,_0.35),_transparent_55%),_linear-gradient(145deg,_#555,_#1c1c1c)] [&.is-3]:bg-[linear-gradient(145deg,_#6a6a6a,_#222)] is-${(index % 3) + 1}`}
                  aria-hidden
                />
                <span className="text-[0.78rem] font-bold">{theme.name}</span>
              </TextLink>
              <ThemeCardMenu
                theme={theme}
                open={openMenuThemeId === theme.id}
                pending={pendingThemeId === theme.id}
                onToggle={() =>
                  setOpenMenuThemeId((current) => (current === theme.id ? null : theme.id))
                }
                onClose={() => setOpenMenuThemeId(null)}
                onEdit={() => openEditDialog(theme)}
                onDelete={() => handleDelete(theme)}
              />
            </div>
          ))}
        </div>
      </PageContainer>

      <CreateThemeDialog open={dialogOpen} onClose={closeDialog} theme={editingTheme} />
    </>
  );
}
