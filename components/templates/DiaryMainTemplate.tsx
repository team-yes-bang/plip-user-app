import { DiaryMainSection } from "@/components/organisms";
import { DiaryTemplate } from "@/components/templates/DiaryTemplate";
import type { UiDiaryDateEntry, UiDiaryMenuNav, UiDiaryTheme } from "@/types/diary/ui";

type DiaryMainTemplateProps = {
  entries: UiDiaryDateEntry[];
  themes: UiDiaryTheme[];
  menuNav?: UiDiaryMenuNav | null;
  error?: string;
};

export function DiaryMainTemplate({ entries, themes, menuNav, error }: DiaryMainTemplateProps) {
  return (
    <DiaryTemplate fixedMain>
      <DiaryMainSection entries={entries} themes={themes} menuNav={menuNav} error={error} />
    </DiaryTemplate>
  );
}
