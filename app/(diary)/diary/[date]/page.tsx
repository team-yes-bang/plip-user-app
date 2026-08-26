import { DiaryDateTemplate } from "@/components/templates";
import { getDiaryDateWindow, getDiaryMenuNavTargets } from "@/services/diaryService";
import type { UiDiaryDateWindow, UiDiaryMenuNav } from "@/types/diary/ui";
import {
  isFutureDiaryDate,
  parseDiaryDateParam,
} from "@/types/diary/schema";
import { notFound } from "next/navigation";

type DiaryDatePageProps = {
  params: Promise<{ date: string }>;
};

export default async function DiaryDatePage({ params }: DiaryDatePageProps) {
  const { date } = await params;
  const parsedDate = parseDiaryDateParam(date);

  if (!parsedDate || isFutureDiaryDate(parsedDate)) {
    notFound();
  }

  let initialWindow: UiDiaryDateWindow = {
    focusDate: parsedDate,
    days: { [parsedDate]: [] },
  };
  let menuNav: UiDiaryMenuNav | null = null;
  let error: string | undefined;

  try {
    [initialWindow, menuNav] = await Promise.all([
      getDiaryDateWindow(parsedDate, 1),
      getDiaryMenuNavTargets(),
    ]);
  } catch (caught) {
    initialWindow = {
      focusDate: parsedDate,
      days: { [parsedDate]: [] },
    };
    menuNav = null;
    error = caught instanceof Error ? caught.message : "날짜 상세를 불러오지 못했습니다.";
  }

  return <DiaryDateTemplate initialWindow={initialWindow} menuNav={menuNav} error={error} />;
}
