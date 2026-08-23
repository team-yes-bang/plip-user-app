import { DiaryDateTemplate } from "@/components/templates";
import { getDiaryDateWindow } from "@/services/diaryService";
import type { UiDiaryDateWindow } from "@/types/diary/ui";
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
  let error: string | undefined;

  try {
    initialWindow = await getDiaryDateWindow(parsedDate, 1);
  } catch (caught) {
    initialWindow = {
      focusDate: parsedDate,
      days: { [parsedDate]: [] },
    };
    error = caught instanceof Error ? caught.message : "날짜 상세를 불러오지 못했습니다.";
  }

  return <DiaryDateTemplate initialWindow={initialWindow} error={error} />;
}
