"use client";

import { DailyIcon } from "@/components/atoms";
import { AuthTopBar } from "@/components/molecules/AuthTopBar";
import type { RecorderStatus } from "@/hooks/useVideoRecorder";
import { formatRecordTimer } from "@/lib/video/formatRecordTimer";
import { playShutterSound } from "@/lib/video/playShutterSound";
import type { RefCallback } from "react";

type CaptureCameraStageProps = {
  videoRef: RefCallback<HTMLVideoElement>;
  status: RecorderStatus;
  error: string | null;
  elapsedMs: number;
  maxDurationMs: number;
  onBack: () => void;
  onStartRecording: () => void;
  onCancelRecording: () => void;
  onFlipCamera: () => void;
};

export function CaptureCameraStage({
  videoRef,
  status,
  error,
  elapsedMs,
  maxDurationMs,
  onBack,
  onStartRecording,
  onCancelRecording,
  onFlipCamera,
}: CaptureCameraStageProps) {
  const isRecording = status === "recording";
  const isBusy = status === "requesting" || isRecording;
  const showTimer = isRecording;

  const handleShutter = () => {
    if (status === "requesting") {
      return;
    }
    if (isRecording) {
      onCancelRecording();
      return;
    }
    playShutterSound();
    onStartRecording();
  };

  return (
    <section className="dl-camera" aria-label="카메라">
      <video
        ref={videoRef}
        className="dl-camera__video"
        autoPlay
        playsInline
        muted
      />

      <div className="absolute inset-x-0 top-0 z-10">
        <AuthTopBar title="" onBack={onBack} />
      </div>

      {error ? (
        <p
          className="absolute inset-x-4 top-[calc(5rem+env(safe-area-inset-top,0px))] z-10 rounded bg-red-600/90 px-3 py-2 text-center text-xs text-white"
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

      <button
        type="button"
        className={`dl-camera__shutter${isRecording ? " is-recording" : ""}`}
        aria-label={isRecording ? "촬영 취소" : "촬영"}
        disabled={status === "requesting"}
        onClick={handleShutter}
      >
        <span className="dl-camera__shutter-inner" />
      </button>

      <button
        type="button"
        className="dl-icon-sq dl-camera__flip"
        aria-label="전환"
        disabled={isBusy}
        onClick={() => void onFlipCamera()}
      >
        <DailyIcon name="camera" size={20} />
      </button>
    </section>
  );
}
