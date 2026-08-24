/** 촬영 버튼 위 타이머 — 남은 시간 `00:05` */
export function formatRecordCountdown(elapsedMs: number, maxMs: number): string {
  const remainingMs = Math.max(0, maxMs - elapsedMs);
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/** 랩용 타이머 — `00.02.50/00.05.00` (분.초.1/100초) */
export function formatRecordTimer(elapsedMs: number, maxMs: number): string {
  const formatParts = (totalMs: number) => {
    const clamped = Math.max(0, Math.min(totalMs, maxMs));
    const totalCentis = Math.floor(clamped / 10);
    const centis = totalCentis % 100;
    const totalSeconds = Math.floor(totalCentis / 100);
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60);

    const pad = (value: number) => String(value).padStart(2, "0");
    return `${pad(minutes)}.${pad(seconds)}.${pad(centis)}`;
  };

  return `${formatParts(elapsedMs)}/${formatParts(maxMs)}`;
}
