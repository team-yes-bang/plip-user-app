import { DiaryDateDetailSection } from "@/components/organisms";
import { DiaryTemplate } from "@/components/templates/DiaryTemplate";
import type { UiDiaryDateWindow, UiDiaryMenuNav } from "@/types/diary/ui";

type DiaryDateTemplateProps = {
  initialWindow: UiDiaryDateWindow;
  menuNav?: UiDiaryMenuNav | null;
  error?: string;
};

export function DiaryDateTemplate({ initialWindow, menuNav, error }: DiaryDateTemplateProps) {
  return (
    <DiaryTemplate fixedMain>
      <DiaryDateDetailSection initialWindow={initialWindow} menuNav={menuNav} error={error} />
    </DiaryTemplate>
  );
}
