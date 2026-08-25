"use client";

import { DiaryThemeAddCard, DiaryThemeCard, PageContainer, ScreenHeader } from "@/components/molecules";
import { DiarySideMenu } from "@/components/organisms/DiarySideMenu";
import { ThemeBottomSheet } from "@/components/organisms/ThemeBottomSheet";
import { ROUTES } from "@/config/routes";
import type { UiDiaryTheme } from "@/types/diary/ui";
import { useState } from "react";

type DiaryThemesListSectionProps = {
  themes: UiDiaryTheme[];
  error?: string;
};

export function DiaryThemesListSection({ themes, error: fetchError }: DiaryThemesListSectionProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<UiDiaryTheme | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  function openCreateSheet() {
    setEditingTheme(null);
    setSheetOpen(true);
  }

  function openEditSheet(theme: UiDiaryTheme) {
    setEditingTheme(theme);
    setSheetOpen(true);
  }

  function closeSheet() {
    setSheetOpen(false);
    setEditingTheme(null);
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <ScreenHeader
        backHref={ROUTES.diary.root}
        title="테마"
        onMenuOpen={() => setMenuOpen(true)}
        menuLabel="다이어리 메뉴"
      />

      <DiarySideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      <PageContainer aria-label="테마 목록" className="flex-1">
        {fetchError ? (
          <p className="m-0 text-sm text-[var(--dl-color-text-danger)]" role="alert">
            {fetchError}
          </p>
        ) : null}

        <div className="grid grid-cols-2 gap-3 pt-1">
          {themes.map((theme, index) => (
            <DiaryThemeCard
              key={theme.id}
              theme={theme}
              index={index}
              onEdit={openEditSheet}
            />
          ))}

          {themes.length < 5 && (
            <DiaryThemeAddCard onClick={openCreateSheet} />
          )}
        </div>
      </PageContainer>

      <ThemeBottomSheet
        open={sheetOpen}
        onClose={closeSheet}
        theme={editingTheme}
      />
    </div>
  );
}
