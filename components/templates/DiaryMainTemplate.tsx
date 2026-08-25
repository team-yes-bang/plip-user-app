import { DiaryMainSection } from "@/components/organisms";
import { DiaryTemplate } from "@/components/templates/DiaryTemplate";
import type { UiDiaryDateEntry, UiDiaryTheme } from "@/types/diary/ui";

type DiaryMainTemplateProps = {
  entries: UiDiaryDateEntry[];
  themes: UiDiaryTheme[];
  error?: string;
};

export function DiaryMainTemplate({ entries, themes, error }: DiaryMainTemplateProps) {
  return (
    <DiaryTemplate fixedMain>
      <DiaryMainSection entries={entries} themes={themes} error={error} />
    </DiaryTemplate>
  );
}
