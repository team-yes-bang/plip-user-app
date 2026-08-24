"use client";

import { DailyIcon } from "@/components/atoms";
import { HeaderBackButton, ScreenHeader } from "@/components/molecules";
import type { RecorderStatus } from "@/hooks/useVideoRecorder";
import { formatRecordTimer } from "@/lib/video/formatRecordTimer";
import type { RefCallback } from "react";

type CaptureCameraStageProps = {
  videoRef: RefCallback<HTMLVideoElement>;
  status: RecorderStatus;
  facingMode?: "user" | "environment";
  error: string | null;
  elapsedMs: number;
  maxDurationMs: number;
  onBack: () => void;
  onStartRecording: () => void;
  onFlipCamera: () => void;
};

export function CaptureCameraStage({
  videoRef,
  status,
  facingMode = "user",
  error,
  elapsedMs,
  maxDurationMs,
  onBack,
  onStartRecording,
  onFlipCamera,
}: CaptureCameraStageProps) {
  const isRecording = status === "recording";
  const isBusy = status === "requesting" || isRecording;
  const showTimer = isRecording;
  const mirrorFrontCamera = facingMode === "user";

  return (
    <section className="relative min-h-[calc(100dvh_-_80px)] overflow-hidden bg-[#111] -mx-5 -mt-6" aria-label="카메라">
      <video
        ref={videoRef}
        className={`absolute inset-0 h-full w-full object-contain ${mirrorFrontCamera ? "-scale-x-100" : ""}`}
        autoPlay
        playsInline
        muted
      />

      <div className="absolute inset-x-0 top-0 z-10">
        <ScreenHeader tone="overlay" leading={<HeaderBackButton onClick={onBack} />} />
      </div>

      {error ? (
        <p
          className="absolute inset-x-4 top-20 z-10 rounded bg-red-600/90 px-3 py-2 text-center text-xs text-white"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {showTimer ? (
        <p className="dl-camera__timer" aria-live="polite">
          {formatRecordTimer(elapsedMs, maxDurationMs)}
        </p>
      ) : null}

      <div className="absolute inset-x-6 bottom-8 z-10 flex items-center justify-between">
        <button type="button" className="grid w-[44px] h-[44px] shrink-0 place-items-center rounded-[var(--dl-radius-md)] bg-[var(--dl-color-bg-surface)]" aria-label="플래시" disabled={isBusy}>
          <DailyIcon name="alert" size={20} />
        </button>
        <button
          type="button"
          className={`absolute bottom-[36px] left-[50%] w-[84px] h-[84px] [transform:translateX(-50%)] border-0 rounded-[999px] bg-[rgba(255,_255,_255,_0.28)]${isRecording ? " is-recording" : ""}`}
          aria-label={isRecording ? "촬영 중" : "촬영"}
          disabled={status === "requesting"}
          onClick={() => {
            if (!isRecording) {
              onStartRecording();
            }
          }}
        >
          <span className="absolute inset-[10px] rounded-[999px] bg-[#fff]" />
        </button>
        <button
          type="button"
          className="grid w-[44px] h-[44px] shrink-0 place-items-center rounded-[var(--dl-radius-md)] bg-[var(--dl-color-bg-surface)]"
          aria-label="전환"
          disabled={isBusy}
          onClick={() => void onFlipCamera()}
        >
          <DailyIcon name="camera" size={20} />
        </button>
      </div>
    </section>
  );
}
