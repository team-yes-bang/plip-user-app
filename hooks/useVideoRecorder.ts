"use client";

import {
  MAX_RECORD_MS,
  RECORD_STOP_MS,
  RECORD_TIMESLICE_MS,
  RECORD_VIDEO_BITS_PER_SECOND,
} from "@/lib/video/constants";
import {
  startMirroredCapture,
  waitForVideoFrame,
  type MirroredCapture,
} from "@/lib/video/mirroredCapture";
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
  node.loop = false;
  safeVideoPlay(node);
}

function attachPreviewUrl(node: HTMLVideoElement, previewUrl: string) {
  node.pause();
  node.srcObject = null;
  if (node.src !== previewUrl) {
    node.src = previewUrl;
  }
  node.muted = false;
  node.loop = true;
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
  const [pixelsMirrored, setPixelsMirrored] = useState(false);
  const [capturedAt, setCapturedAt] = useState<Date | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const mirrorRef = useRef<MirroredCapture | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const stopTimerRef = useRef<number | null>(null);
  const tickTimerRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const autoPrepareStartedRef = useRef(false);

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

  const stopMirror = useCallback(() => {
    mirrorRef.current?.stop();
    mirrorRef.current = null;
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
    setPixelsMirrored(false);
    setCapturedAt(null);
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
    stopMirror();

    let recordStream = stream;
    let recordedMirrored = false;
    if (facingMode === "user" && videoRef.current) {
      await waitForVideoFrame(videoRef.current);
      const mirrored = startMirroredCapture(videoRef.current);
      if (mirrored) {
        mirrorRef.current = mirrored;
        recordStream = mirrored.stream;
        recordedMirrored = true;
      }
    }

    const recorder = new MediaRecorder(recordStream, {
      mimeType: selectedMimeType,
      videoBitsPerSecond: RECORD_VIDEO_BITS_PER_SECOND,
    });
    recorderRef.current = recorder;
    setMimeType(selectedMimeType);
    setPixelsMirrored(recordedMirrored);

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      clearTimers();
      stopMirror();

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
      setCapturedAt(new Date());
      setStatus("preview");
      onRecordingComplete?.();
    };

    recorder.onerror = () => {
      stopMirror();
      setError("Recording failed");
      setStatus("error");
    };

    startedAtRef.current = Date.now();
    setElapsedMs(0);
    setStatus("recording");

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
    stopMirror,
    facingMode,
  ]);

  const discardRecording = useCallback(async () => {
    clearTimers();
    stopMirror();
    recorderRef.current = null;
    resetPreview();
    stopStream();
    setError(null);
    setStatus("idle");
    await prepareCamera();
  }, [clearTimers, prepareCamera, resetPreview, stopMirror, stopStream]);

  const loadFromFile = useCallback(
    (file: File) => {
      clearTimers();
      stopMirror();
      recorderRef.current = null;
      stopStream();
      resetPreview();

      const nextPreviewUrl = URL.createObjectURL(file);
      setError(null);
      setBlob(file);
      setPreviewUrl(nextPreviewUrl);
      setMimeType(file.type || "video/mp4");
      setPixelsMirrored(false);
      setCapturedAt(new Date());
      setStatus("preview");
    },
    [clearTimers, resetPreview, stopMirror, stopStream],
  );

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
      stopMirror();
      stopStream();
      setPreviewUrl((current) => {
        if (current) {
          URL.revokeObjectURL(current);
        }
        return null;
      });
    };
  }, [clearTimers, stopMirror, stopStream]);

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
    pixelsMirrored,
    capturedAt,
    prepareCamera,
    startRecording,
    stopRecording,
    discardRecording,
    loadFromFile,
    flipCamera,
  };
}
