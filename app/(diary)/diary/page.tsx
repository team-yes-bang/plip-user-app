import { DiaryMainTemplate } from "@/components/templates";
import { getDiaryHomePageData } from "@/services/diaryService";
import type { UiDiaryDateEntry, UiDiaryTheme } from "@/types/diary/ui";

export default async function DiaryPage() {
  let entries: UiDiaryDateEntry[] = [];
  let themes: UiDiaryTheme[] = [];
  let error: string | undefined;

  try {
    ({ entries, themes } = await getDiaryHomePageData());
  } catch (caught) {
    entries = [];
    themes = [];
    error = caught instanceof Error ? caught.message : "다이어리 홈을 불러오지 못했습니다.";
  }

  return <DiaryMainTemplate entries={entries} themes={themes} error={error} />;
}
