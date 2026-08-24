import type { ApiTopic } from "@/types/topic/api";

export function toKstDateString(value: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
}

export function formatKstDotDate(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }
  return toKstDateString(parsed).replaceAll("-", ".");
}

export function isSameKstDate(iso: string, today = new Date()): boolean {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }
  return toKstDateString(parsed) === toKstDateString(today);
}

/** startDate는 KST `YYYY-MM-DD`. 오늘이면 목록 상태 ONGOING과 같다. */
export function isOngoingStartDate(startDate: string, today = new Date()): boolean {
  return Boolean(startDate) && startDate === toKstDateString(today);
}

export function shouldShowTopicCaptureSlot(topic: {
  startDate: string;
  uploadedByMe: boolean | null;
}): boolean {
  return topic.uploadedByMe === false && isOngoingStartDate(topic.startDate);
}

/** 오늘(KST) startAt 토픽. 없으면 목록 첫 항목(최신). 0개면 null. */
export function selectAgitTopic(topics: ApiTopic[], today = new Date()): ApiTopic | null {
  if (topics.length === 0) {
    return null;
  }
  const todayTopic = topics.find((topic) => isSameKstDate(topic.startAt, today));
  return todayTopic ?? topics[0] ?? null;
}
