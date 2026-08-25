import { DiaryThemeDetailSection } from "@/components/organisms";
import { DiaryTemplate } from "@/components/templates/DiaryTemplate";
import type { UiDiaryThemeDateGroup } from "@/types/diary/ui";

type DiaryThemeDetailTemplateProps = {
  themeId: string;
  themeName: string;
  dateGroups: UiDiaryThemeDateGroup[];
  initialNextCursor: string | null;
  initialHasMore: boolean;
  error?: string;
};

export function DiaryThemeDetailTemplate({
  themeId,
  themeName,
  dateGroups,
  initialNextCursor,
  initialHasMore,
  error,
}: DiaryThemeDetailTemplateProps) {
  return (
    <DiaryTemplate fixedMain>
      <DiaryThemeDetailSection
        themeId={themeId}
        themeName={themeName}
        dateGroups={dateGroups}
        initialNextCursor={initialNextCursor}
        initialHasMore={initialHasMore}
        error={error}
      />
    </DiaryTemplate>
  );
}
