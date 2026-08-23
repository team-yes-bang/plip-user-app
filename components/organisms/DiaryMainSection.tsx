"use client";

import { DiaryDateScrollSection, ThemePreviewStrip } from "@/components/molecules";
import { DiaryHeader, DiarySideMenu } from "@/components/organisms";
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
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <DiaryHeader onMenuOpen={() => setMenuOpen(true)} />
      <DiarySideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4 pt-3">
        <ThemePreviewStrip themes={themes} />
        {error ? <p className="m-0 mt-3 px-1 text-sm text-red-600">{error}</p> : null}
        <div className="mt-8 flex min-h-0 flex-1 flex-col gap-4">
          {entries.map((entry) => (
            <DiaryDateScrollSection key={entry.date} entry={entry} />
          ))}
        </div>
      </div>
    </div>
  );
}
