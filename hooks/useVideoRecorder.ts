"use client";

import { MAX_RECORD_MS, RECORD_STOP_MS, RECORD_TIMESLICE_MS } from "@/lib/video/constants";
import { pickRecorderMimeType, requestCameraStream } from "@/lib/video/recorderMime";
import { isIgnorablePlayError, safeVideoPlay } from "@/lib/video/safeVideoPlay";
import { useCallback, useEffect, useRef, useState, type RefCallback } from "react";

export type RecorderStatus =
  | "idle"
  | "requesting"
  | "ready"
  | "recording"
  | "preview"
  | "error";

export type UseVideoRecorderOptions = {
  maxDurationMs?: number;
  facingMode?: "user" | "environment";
  /** Mount 시 카메라 권한 요청 (default: true) */
  autoPrepare?: boolean;
  /** MediaRecorder stop 후 preview blob 준비 시 */
  onRecordingComplete?: () => void;
};

function attachLiveStream(node: HTMLVideoElement, stream: MediaStream) {
  node.pause();
  node.removeAttribute("src");
  node.srcObject = stream;
  node.muted = true;
  safeVideoPlay(node);
}

function attachPreviewUrl(node: HTMLVideoElement, previewUrl: string) {
  node.pause();
  node.srcObject = null;
  if (node.src !== previewUrl) {
    node.src = previewUrl;
  }
  node.muted = false;
  node.load();
  safeVideoPlay(node);
}

export function useVideoRecorder(options: UseVideoRecorderOptions = {}) {
  const maxDurationMs = options.maxDurationMs ?? MAX_RECORD_MS;
  const recordStopMs = RECORD_STOP_MS;
  const autoPrepare = options.autoPrepare ?? true;
  const onRecordingComplete = options.onRecordingComplete;

  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    options.facingMode ?? "user",
  );

  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | undefined>();
  const [liveStream, setLiveStream] = useState<MediaStream | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const stopTimerRef = useRef<number | null>(null);
  const tickTimerRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const autoPrepareStartedRef = useRef(false);
  const recordingIntentRef = useRef<"complete" | "cancel">("complete");

  const syncVideoElement = useCallback(
    (node: HTMLVideoElement | null) => {
      videoRef.current = node;
      if (!node) {
        return;
      }

      if (
        liveStream &&
        (status === "requesting" || status === "ready" || status === "recording")
      ) {
        attachLiveStream(node, liveStream);
        return;
      }

      if (status === "preview" && previewUrl) {
        attachPreviewUrl(node, previewUrl);
      }
    },
    [liveStream, previewUrl, status],
  );

  const bindVideoElement = useCallback<RefCallback<HTMLVideoElement>>(
    (node) => {
      syncVideoElement(node);
    },
    [syncVideoElement],
  );

  const clearTimers = useCallback(() => {
    if (stopTimerRef.current !== null) {
      window.clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }

    if (tickTimerRef.current !== null) {
      window.clearInterval(tickTimerRef.current);
      tickTimerRef.current = null;
    }
  }, []);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setLiveStream(null);
  }, []);

  const resetPreview = useCallback(() => {
    setPreviewUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }
      return null;
    });
    setBlob(null);
    setElapsedMs(0);
  }, []);

  const prepareCamera = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError("카메라는 HTTPS 또는 localhost에서만 사용할 수 있습니다.");
      setStatus("error");
      return;
    }

    setError(null);
    setStatus("requesting");

    try {
      stopStream();
      resetPreview();

      const stream = await requestCameraStream(facingMode);
      streamRef.current = stream;
      setLiveStream(stream);
      setStatus("ready");
    } catch (cause) {
      stopStream();
      const message =
        cause instanceof Error
          ? cause.message
          : "Camera permission denied or unavailable";
      setError(message);
      setStatus("error");
    }
  }, [facingMode, resetPreview, stopStream]);

  const stopRecording = useCallback(() => {
    clearTimers();

    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
  }, [clearTimers]);

  const startRecording = useCallback(async () => {
    setError(null);

    if (!streamRef.current) {
      await prepareCamera();
    }

    const stream = streamRef.current;
    if (!stream) {
      setError("Camera stream is not ready");
      setStatus("error");
      return;
    }

    const selectedMimeType = pickRecorderMimeType();
    if (!selectedMimeType) {
      setError("MediaRecorder is not supported in this browser");
      setStatus("error");
      return;
    }

    resetPreview();
    chunksRef.current = [];

    const recorder = new MediaRecorder(stream, { mimeType: selectedMimeType });
    recorderRef.current = recorder;
    setMimeType(selectedMimeType);

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      clearTimers();

      if (recordingIntentRef.current === "cancel") {
        chunksRef.current = [];
        recorderRef.current = null;
        setElapsedMs(0);
        setError(null);
        setStatus("ready");
        return;
      }

      const maxChunks = Math.ceil(maxDurationMs / RECORD_TIMESLICE_MS);
      const trimmedChunks = chunksRef.current.slice(0, maxChunks);
      const recordedBlob = new Blob(trimmedChunks, { type: selectedMimeType });

      if (recordedBlob.size === 0) {
        stopStream();
        setError("녹화 데이터가 비어 있습니다. 다시 촬영해 주세요.");
        setStatus("error");
        void prepareCamera();
        return;
      }

      const nextPreviewUrl = URL.createObjectURL(recordedBlob);

      stopStream();
      setError(null);
      setBlob(recordedBlob);
      setPreviewUrl(nextPreviewUrl);
      setStatus("preview");
      onRecordingComplete?.();
    };

    recorder.onerror = () => {
      setError("Recording failed");
      setStatus("error");
    };

    startedAtRef.current = Date.now();
    setElapsedMs(0);
    setStatus("recording");
    recordingIntentRef.current = "complete";

    recorder.start(RECORD_TIMESLICE_MS);

    tickTimerRef.current = window.setInterval(() => {
      setElapsedMs(Math.min(Date.now() - startedAtRef.current, maxDurationMs));
    }, 50);

    stopTimerRef.current = window.setTimeout(() => {
      const activeRecorder = recorderRef.current;
      if (activeRecorder && activeRecorder.state === "recording") {
        activeRecorder.requestData();
      }
      stopRecording();
    }, recordStopMs);
  }, [
    clearTimers,
    maxDurationMs,
    onRecordingComplete,
    prepareCamera,
    recordStopMs,
    resetPreview,
    stopRecording,
    stopStream,
  ]);

  const cancelRecording = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state !== "recording") {
      return;
    }

    clearTimers();
    recordingIntentRef.current = "cancel";
    recorder.requestData();
    recorder.stop();
  }, [clearTimers]);

  const discardRecording = useCallback(async () => {
    clearTimers();
    recorderRef.current = null;
    resetPreview();
    stopStream();
    setError(null);
    setStatus("idle");
    await prepareCamera();
  }, [clearTimers, prepareCamera, resetPreview, stopStream]);

  const flipCamera = useCallback(async () => {
    if (status === "recording") {
      return;
    }

    const nextFacing = facingMode === "user" ? "environment" : "user";
    setFacingMode(nextFacing);
    setError(null);
    setStatus("requesting");

    try {
      stopStream();
      resetPreview();

      const stream = await requestCameraStream(nextFacing);
      streamRef.current = stream;
      setLiveStream(stream);
      setStatus("ready");
    } catch (cause) {
      stopStream();
      const message =
        cause instanceof Error ? cause.message : "Camera flip failed";
      if (!isIgnorablePlayError(cause)) {
        setError(message);
      }
      setStatus("error");
    }
  }, [facingMode, resetPreview, status, stopStream]);

  useEffect(() => {
    syncVideoElement(videoRef.current);
  }, [syncVideoElement]);

  useEffect(() => {
    if (!autoPrepare || autoPrepareStartedRef.current) {
      return;
    }

    autoPrepareStartedRef.current = true;
    void prepareCamera();
  }, [autoPrepare, prepareCamera]);

  useEffect(() => {
    return () => {
      clearTimers();
      stopStream();
      setPreviewUrl((current) => {
        if (current) {
          URL.revokeObjectURL(current);
        }
        return null;
      });
    };
  }, [clearTimers, stopStream]);

  return {
    videoRef: bindVideoElement,
    status,
    error,
    elapsedMs,
    maxDurationMs,
    blob,
    previewUrl,
    mimeType,
    facingMode,
    prepareCamera,
    startRecording,
    stopRecording,
    cancelRecording,
    discardRecording,
    flipCamera,
  };
}
