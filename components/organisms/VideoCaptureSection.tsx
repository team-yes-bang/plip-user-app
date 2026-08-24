"use client";

import { CaptureVideoFrame } from "@/components/molecules/CaptureVideoFrame";
import { ROUTES } from "@/config/routes";
import { useVideoCaptureFlow } from "@/hooks/useVideoCaptureFlow";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_MB } from "@/lib/video/constants";
import { formatBlobSummary } from "@/lib/video/recorderMime";
import { isWithinUploadLimit } from "@/lib/video/uploadLimits";
import Link from "next/link";
import { useRef } from "react";

export function VideoCaptureSection() {
  const {
    videoRef,
    status,
    elapsedMs,
    maxDurationMs,
    blob,
    mimeType,
    facingMode,
    flowPhase,
    flowError,
    uploadResult,
    uploading,
    prepareCamera,
    startRecording,
    stopRecording,
    flipCamera,
    retake,
    uploadCapture,
    uploadFile,
    uploadOversizeTest,
  } = useVideoCaptureFlow();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressPct = Math.min(100, Math.round((elapsedMs / maxDurationMs) * 100));
  const canUploadBlob = blob !== null && isWithinUploadLimit(blob.size);
  const blobOverLimit = blob !== null && blob.size > MAX_UPLOAD_BYTES;
  const isLivePreview =
    status === "requesting" || status === "ready" || status === "recording";
  const mirrorFrontCamera = facingMode === "user" && isLivePreview;

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-6 font-mono text-sm">
      <header className="space-y-2">
        <p className="text-xs text-black/50">
          <Link href={ROUTES.capture.videoApi} className="underline">
            {ROUTES.capture.videoApi}
          </Link>{" "}
          · Actions lab
        </p>
        <h1 className="text-lg font-semibold">Video Capture (Day 1)</h1>
        <p className="text-black/60">
          로그인 필수 · 5초 · 720×1280 · 최대 {MAX_UPLOAD_MB}MB → upload-url → PUT → complete
        </p>
        <p className="text-xs text-amber-700">
          세션 JWT의 userUuid만 사용합니다. stub URL이면 put이 skipped-stub입니다.
        </p>
      </header>

      <CaptureVideoFrame variant="lab">
        <video
          ref={videoRef}
          className={`h-full w-full object-contain ${mirrorFrontCamera ? "-scale-x-100" : ""}`}
          autoPlay
          playsInline
          muted={flowPhase !== "complete"}
          controls={flowPhase === "preview" || flowPhase === "complete"}
        />
      </CaptureVideoFrame>

      <div className="space-y-1 text-xs text-black/60">
        <p>phase: {flowPhase}</p>
        <p>recorder: {status}</p>
        <p>
          elapsed: {Math.min(elapsedMs, maxDurationMs)}ms / {maxDurationMs}ms ({progressPct}
          %)
        </p>
        <p>camera: {facingMode}</p>
        {mimeType ? <p>mime: {mimeType}</p> : null}
        {blob ? <p>blob: {formatBlobSummary(blob)}</p> : null}
        {blobOverLimit ? (
          <p className="text-red-700">최대 {MAX_UPLOAD_MB}MB를 초과해 업로드할 수 없습니다.</p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded border px-3 py-2 disabled:opacity-50"
          disabled={uploading || status === "recording"}
          onClick={() => void prepareCamera()}
        >
          카메라 재시작
        </button>
        <button
          type="button"
          className="rounded border px-3 py-2 disabled:opacity-50"
          disabled={uploading || status === "recording"}
          onClick={() => void flipCamera()}
        >
          카메라 전환
        </button>
        <button
          type="button"
          className="rounded bg-black px-3 py-2 text-white disabled:opacity-50"
          disabled={
            uploading ||
            status === "recording" ||
            status === "requesting" ||
            flowPhase === "complete"
          }
          onClick={() => void startRecording()}
        >
          {status === "recording" ? "촬영 중…" : "5초 촬영"}
        </button>
        <button
          type="button"
          className="rounded border px-3 py-2 disabled:opacity-50"
          disabled={uploading || status !== "recording"}
          onClick={stopRecording}
        >
          조기 종료
        </button>
        <button
          type="button"
          className="rounded border px-3 py-2 disabled:opacity-50"
          disabled={uploading || flowPhase !== "preview" || !canUploadBlob}
          onClick={() => void uploadCapture()}
        >
          {uploading ? "업로드 중…" : "업로드 · complete"}
        </button>
        <button
          type="button"
          className="rounded border px-3 py-2 disabled:opacity-50"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          mp4/mov로 테스트
        </button>
        <button
          type="button"
          className="rounded border px-3 py-2 disabled:opacity-50"
          disabled={uploading}
          onClick={() => void uploadOversizeTest()}
        >
          8MB 초과 테스트
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/quicktime,.mp4,.mov"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) {
              void uploadFile(file);
            }
          }}
        />
        <button
          type="button"
          className="rounded border px-3 py-2 disabled:opacity-50"
          disabled={uploading}
          onClick={() => void retake()}
        >
          다시 촬영
        </button>
      </div>

      {flowError ? (
        <p className="rounded bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
          {flowError}
        </p>
      ) : null}

      {uploadResult ? (
        <div className="space-y-2 rounded bg-green-50 px-3 py-2 text-xs text-green-900">
          <p>videoUuid: {uploadResult.videoUuid}</p>
          <p>overlayTime: {uploadResult.complete.overlayTime}</p>
          <p>
            put: {uploadResult.putResult}
            {uploadResult.putResult === "skipped-stub"
              ? " · S3에 파일이 올라가지 않았습니다. 백엔드 실 presign을 확인하세요."
              : " · S3 PUT 완료"}
          </p>
          <p>downloadReady (GET): {String(uploadResult.detail.downloadReady)}</p>
          <p>
            download-url: {uploadResult.download.status}
            {uploadResult.download.status === "processing"
              ? ` · ${uploadResult.download.message}`
              : ""}
          </p>
          <p>download poll attempts: {uploadResult.downloadPollAttempts}</p>
          <p>playback: {uploadResult.playback.kind}</p>
          {mimeType && !mimeType.toLowerCase().includes("mp4") ? (
            <p className="text-green-800">
              녹화 MIME은 {mimeType}입니다. raw 버킷 파일이 webm인 것은 정상입니다. mp4
              변환은 Day 2 FFmpeg에서 합니다.
            </p>
          ) : null}
          {uploadResult.playback.note ? (
            <p className="text-green-800">{uploadResult.playback.note}</p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
