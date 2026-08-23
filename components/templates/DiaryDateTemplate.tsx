import { DiaryDateDetailSection } from "@/components/organisms";
import { DiaryTemplate } from "@/components/templates/DiaryTemplate";
import type { UiDiaryDateWindow } from "@/types/diary/ui";

type DiaryDateTemplateProps = {
  initialWindow: UiDiaryDateWindow;
  error?: string;
};

export function DiaryDateTemplate({ initialWindow, error }: DiaryDateTemplateProps) {
  return (
    <DiaryTemplate fixedMain>
      <DiaryDateDetailSection initialWindow={initialWindow} error={error} />
    </DiaryTemplate>
  );
}
