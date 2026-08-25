"use client";

import { PageContainer, ScreenHeader, DiaryDateScrollSection, ThemePreviewStrip } from "@/components/molecules";
import { DiarySideMenu } from "@/components/organisms/DiarySideMenu";
import type { UiDiaryDateEntry, UiDiaryTheme } from "@/types/diary/ui";
import { useState } from "react";

type DiaryMainSectionProps = {
  entries: UiDiaryDateEntry[];
  themes: UiDiaryTheme[];
  error?: string;
};

export function DiaryMainSection({ entries, themes, error }: DiaryMainSectionProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <ScreenHeader
        title="다이어리"
        onMenuOpen={() => setMenuOpen(true)}
        menuLabel="다이어리 메뉴"
      />

      <DiarySideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      <PageContainer as="div" aria-label="다이어리 컨텐츠" className="flex-1">
        <ThemePreviewStrip themes={themes} />

        {error ? (
          <p className="m-0 text-sm text-[var(--dl-color-text-danger)]" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-8 flex min-h-0 flex-1 flex-col gap-4">
          {entries.map((entry) => (
            <DiaryDateScrollSection key={entry.date} entry={entry} />
          ))}
        </div>
      </PageContainer>
    </div>
  );
}
