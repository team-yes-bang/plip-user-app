"use client";

import {
  DEFAULT_UPLOAD_CONTENT_TYPE,
  MAX_RECORD_MS,
  RECORD_STOP_MS,
  RECORD_TIMESLICE_MS,
  RECORD_VIDEO_BITS_PER_SECOND,
} from "@/lib/video/constants";
import {
  startCaptureCanvas,
  waitForVideoFrame,
  type CaptureCanvas,
} from "@/lib/video/captureCanvas";
import { needsPlaybackReencode, preparePlaybackMp4 } from "@/lib/video/preparePlaybackMp4";
import { pickRecorderMimeType, requestCameraStream } from "@/lib/video/recorderMime";
import { isIgnorablePlayError, safeVideoPlay } from "@/lib/video/safeVideoPlay";
import { useCallback, useEffect, useRef, useState, type RefCallback } from "react";

export type RecorderStatus =
  | "idle"
  | "requesting"
  | "ready"
  | "recording"
  | "preparing"
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
  if (node.srcObject === stream && !node.paused && !node.ended) {
    return;
  }

  node.pause();
  node.removeAttribute("src");
  node.srcObject = stream;
  node.muted = true;
  node.loop = false;
  safeVideoPlay(node);
}

function attachPreviewUrl(node: HTMLVideoElement, previewUrl: string) {
  if (node.src === previewUrl && node.srcObject === null && !node.paused) {
    return;
  }

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
  const [capturedAt, setCapturedAt] = useState<Date | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const captureRef = useRef<CaptureCanvas | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const stopTimerRef = useRef<number | null>(null);
  const tickTimerRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const autoPrepareStartedRef = useRef(false);
  const prepareGenerationRef = useRef(0);
  const prepareAbortRef = useRef<AbortController | null>(null);

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

  const stopCapture = useCallback(() => {
    captureRef.current?.stop();
    captureRef.current = null;
  }, []);

  const abortPrepare = useCallback(() => {
    prepareGenerationRef.current += 1;
    prepareAbortRef.current?.abort();
    prepareAbortRef.current = null;
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
    setCapturedAt(null);
  }, []);

  const applyPreviewBlob = useCallback(
    (nextBlob: Blob, nextMimeType: string) => {
      const nextPreviewUrl = URL.createObjectURL(nextBlob);
      setError(null);
      setBlob(nextBlob);
      setPreviewUrl(nextPreviewUrl);
      setMimeType(nextMimeType);
      setCapturedAt(new Date());
      setStatus("preview");
      onRecordingComplete?.();
    },
    [onRecordingComplete],
  );

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

  const restoreLiveCamera = useCallback(async () => {
    try {
      stopStream();
      const stream = await requestCameraStream(facingMode);
      streamRef.current = stream;
      setLiveStream(stream);
    } catch {
      /* keep conversion error */
    }
  }, [facingMode, stopStream]);

  const convertThenPreview = useCallback(
    async (source: Blob, generation: number, signal: AbortSignal) => {
      try {
        const prepared = await preparePlaybackMp4(source, signal);
        if (generation !== prepareGenerationRef.current) {
          return;
        }
        applyPreviewBlob(prepared, DEFAULT_UPLOAD_CONTENT_TYPE);
      } catch (cause) {
        if (generation !== prepareGenerationRef.current) {
          return;
        }
        if (cause instanceof DOMException && cause.name === "AbortError") {
          return;
        }
        setError(cause instanceof Error ? cause.message : "이 파일은 변환할 수 없습니다.");
        setStatus("error");
        await restoreLiveCamera();
      }
    },
    [applyPreviewBlob, restoreLiveCamera],
  );

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

    const previewNode = videoRef.current;
    if (!previewNode) {
      setError("미리보기가 아직 준비되지 않았습니다.");
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
    stopCapture();
    abortPrepare();

    await waitForVideoFrame(previewNode);
    const capture = startCaptureCanvas(previewNode);
    if (!capture) {
      setError("영상을 720p로 녹화할 수 없습니다.");
      setStatus("error");
      return;
    }

    captureRef.current = capture;

    const recorder = new MediaRecorder(capture.stream, {
      mimeType: selectedMimeType,
      videoBitsPerSecond: RECORD_VIDEO_BITS_PER_SECOND,
      bitsPerSecond: RECORD_VIDEO_BITS_PER_SECOND,
    });
    recorderRef.current = recorder;
    setMimeType(selectedMimeType);

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      clearTimers();
      stopCapture();

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

      stopStream();

      if (!needsPlaybackReencode(recordedBlob)) {
        applyPreviewBlob(recordedBlob, selectedMimeType);
        return;
      }

      abortPrepare();
      const generation = prepareGenerationRef.current;
      const controller = new AbortController();
      prepareAbortRef.current = controller;
      setStatus("preparing");
      void convertThenPreview(recordedBlob, generation, controller.signal);
    };

    recorder.onerror = () => {
      stopCapture();
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
    prepareCamera,
    recordStopMs,
    resetPreview,
    stopRecording,
    stopStream,
    stopCapture,
    convertThenPreview,
    applyPreviewBlob,
    abortPrepare,
  ]);

  const discardRecording = useCallback(async () => {
    abortPrepare();
    clearTimers();
    stopCapture();
    recorderRef.current = null;
    resetPreview();
    stopStream();
    setError(null);
    setStatus("idle");
    await prepareCamera();
  }, [abortPrepare, clearTimers, prepareCamera, resetPreview, stopCapture, stopStream]);

  const loadFromFile = useCallback(
    (file: File) => {
      abortPrepare();
      clearTimers();
      stopCapture();
      recorderRef.current = null;
      stopStream();
      resetPreview();
      setError(null);

      const generation = prepareGenerationRef.current;
      const controller = new AbortController();
      prepareAbortRef.current = controller;
      setStatus("preparing");
      void convertThenPreview(file, generation, controller.signal);
    },
    [abortPrepare, clearTimers, convertThenPreview, resetPreview, stopCapture, stopStream],
  );

  const flipCamera = useCallback(async () => {
    if (status === "recording" || status === "preparing") {
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
      stopCapture();
      abortPrepare();
      stopStream();
      setPreviewUrl((current) => {
        if (current) {
          URL.revokeObjectURL(current);
        }
        return null;
      });
    };
  }, [abortPrepare, clearTimers, stopCapture, stopStream]);

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
    capturedAt,
    prepareCamera,
    startRecording,
    stopRecording,
    discardRecording,
    loadFromFile,
    flipCamera,
  };
}
