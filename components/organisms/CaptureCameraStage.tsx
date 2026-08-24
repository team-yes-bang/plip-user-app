"use client";

import { DailyIcon } from "@/components/atoms";
import type { RecorderStatus } from "@/hooks/useVideoRecorder";
import { formatRecordCountdown } from "@/lib/video/formatRecordTimer";
import { unlockShutterAudio } from "@/lib/video/playShutterSound";
import { useEffect } from "react";

type CaptureCameraStageProps = {
  status: RecorderStatus;
  error: string | null;
  elapsedMs: number;
  maxDurationMs: number;
  onBack: () => void;
  onStartRecording: () => void;
  onFlipCamera: () => void;
};

export function CaptureCameraStage({
  status,
  error,
  elapsedMs,
  maxDurationMs,
  onBack,
  onStartRecording,
  onFlipCamera,
}: CaptureCameraStageProps) {
  const isRecording = status === "recording";
  const isBusy = status === "requesting" || isRecording;

  useEffect(() => {
    unlockShutterAudio();
    const warm = () => unlockShutterAudio();
    window.addEventListener("pointerdown", warm);
    window.addEventListener("touchstart", warm);
    return () => {
      window.removeEventListener("pointerdown", warm);
      window.removeEventListener("touchstart", warm);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-10">
      <button
        type="button"
        className="absolute top-3 left-[15px] z-20 grid h-11 w-11 place-items-center rounded-full bg-[var(--dl-color-bg-surface)]"
        aria-label="닫기"
        onClick={onBack}
      >
        <DailyIcon name="x" size={20} />
      </button>

      {error ? (
        <p
          className="absolute inset-x-4 top-20 rounded bg-red-600/90 px-3 py-2 text-center text-xs text-white"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {!isRecording ? (
        <p className="absolute inset-x-6 bottom-[168px] m-0 text-center text-xs text-white">
          화면 중앙에 오늘의 장면을 맞춰주세요
        </p>
      ) : null}

      <div className="absolute inset-x-[23px] bottom-[36px] z-10 grid grid-cols-3 items-end">
        <span className="grid h-11 w-11" aria-hidden />
        <div className="flex flex-col items-center">
          {isRecording ? (
            <p className="mb-3 text-[34px] font-bold leading-none text-white" aria-live="polite">
              {formatRecordCountdown(elapsedMs, maxDurationMs)}
            </p>
          ) : null}
          <button
            type="button"
            className="relative grid h-[84px] w-[84px] place-items-center border-0 bg-transparent p-0"
            aria-label={isRecording ? "촬영 중" : "촬영"}
            disabled={status === "requesting"}
            onClick={() => {
              if (!isRecording) {
                onStartRecording();
              }
            }}
          >
            <span className="pointer-events-none absolute inset-0 rounded-full border-[3px] border-white" />
            <span
              className={`relative h-16 w-16 rounded-full ${
                isRecording ? "bg-[#ff3b5c]" : "bg-[var(--dl-color-bg-brand)]"
              }`}
            />
          </button>
        </div>
        <button
          type="button"
          className="justify-self-end grid h-11 w-11 shrink-0 place-items-center rounded-[var(--dl-radius-md)] bg-[var(--dl-color-bg-surface)]"
          aria-label="카메라 전환"
          disabled={isBusy}
          onClick={() => void onFlipCamera()}
        >
          <DailyIcon name="camera" size={20} />
        </button>
      </div>
    </div>
  );
}
