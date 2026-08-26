import { DiaryThemesTemplate } from "@/components/templates";
import { getDiaryMenuNavTargets, listDiaryThemes } from "@/services/diaryService";
import type { UiDiaryMenuNav, UiDiaryTheme } from "@/types/diary/ui";

export default async function DiaryThemesPage() {
  let themes: UiDiaryTheme[] = [];
  let menuNav: UiDiaryMenuNav | null = null;
  let error: string | undefined;

  try {
    [themes, menuNav] = await Promise.all([listDiaryThemes(), getDiaryMenuNavTargets()]);
  } catch (caught) {
    themes = [];
    menuNav = null;
    error = caught instanceof Error ? caught.message : "테마 목록을 불러오지 못했습니다.";
  }

  return <DiaryThemesTemplate themes={themes} menuNav={menuNav} error={error} />;
}
