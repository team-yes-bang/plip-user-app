import { DiaryThemesListSection } from "@/components/organisms";
import { DiaryTemplate } from "@/components/templates/DiaryTemplate";
import type { UiDiaryMenuNav, UiDiaryTheme } from "@/types/diary/ui";

type DiaryThemesTemplateProps = {
  themes: UiDiaryTheme[];
  menuNav?: UiDiaryMenuNav | null;
  error?: string;
};

export function DiaryThemesTemplate({ themes, menuNav, error }: DiaryThemesTemplateProps) {
  return (
    <DiaryTemplate>
      <DiaryThemesListSection themes={themes} menuNav={menuNav} error={error} />
    </DiaryTemplate>
  );
}
