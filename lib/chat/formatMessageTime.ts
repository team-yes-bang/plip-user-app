export function formatChatMessageTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleTimeString("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatChatDateLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const today = new Date();
  if (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  ) {
    return "오늘";
  }
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function isSameChatDay(left: string, right: string): boolean {
  const leftDate = new Date(left);
  const rightDate = new Date(right);
  if (Number.isNaN(leftDate.getTime()) || Number.isNaN(rightDate.getTime())) {
    return false;
  }
  return (
    leftDate.getFullYear() === rightDate.getFullYear() &&
    leftDate.getMonth() === rightDate.getMonth() &&
    leftDate.getDate() === rightDate.getDate()
  );
}

export function isSameChatMinute(left: string, right: string): boolean {
  const leftDate = new Date(left);
  const rightDate = new Date(right);
  if (Number.isNaN(leftDate.getTime()) || Number.isNaN(rightDate.getTime())) {
    return false;
  }
  return (
    leftDate.getFullYear() === rightDate.getFullYear() &&
    leftDate.getMonth() === rightDate.getMonth() &&
    leftDate.getDate() === rightDate.getDate() &&
    leftDate.getHours() === rightDate.getHours() &&
    leftDate.getMinutes() === rightDate.getMinutes()
  );
}

export function shouldShowChatMessageTime(
  current: { type: string; senderUuid: string | null; createdAt: string },
  next: { type: string; senderUuid: string | null; createdAt: string } | null,
): boolean {
  if (current.type === "SYSTEM") {
    return false;
  }
  if (!next || next.type === "SYSTEM") {
    return true;
  }
  if (current.senderUuid !== next.senderUuid) {
    return true;
  }
  return !isSameChatMinute(current.createdAt, next.createdAt);
}

export function isSameChatMessageGroup(
  current: { type: string; senderUuid: string | null; createdAt: string },
  other: { type: string; senderUuid: string | null; createdAt: string },
): boolean {
  if (current.type !== "TALK" || other.type !== "TALK") {
    return false;
  }
  if (current.senderUuid !== other.senderUuid) {
    return false;
  }
  return isSameChatMinute(current.createdAt, other.createdAt);
}
