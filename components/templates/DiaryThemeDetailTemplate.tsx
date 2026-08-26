import { DiaryThemeDetailSection } from "@/components/organisms";
import { DiaryTemplate } from "@/components/templates/DiaryTemplate";
import type { UiDiaryMenuNav, UiDiaryThemeDateGroup } from "@/types/diary/ui";

type DiaryThemeDetailTemplateProps = {
  themeId: string;
  themeName: string;
  dateGroups: UiDiaryThemeDateGroup[];
  initialNextCursor: string | null;
  initialHasMore: boolean;
  menuNav?: UiDiaryMenuNav | null;
  error?: string;
};

export function DiaryThemeDetailTemplate({
  themeId,
  themeName,
  dateGroups,
  initialNextCursor,
  initialHasMore,
  menuNav,
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
        menuNav={menuNav}
        error={error}
      />
    </DiaryTemplate>
  );
}
