"use client";

import { useVideoRecorder } from "@/hooks/useVideoRecorder";
import { DEFAULT_CAPTURE_CAPTION } from "@/lib/video/constants";
import { createOversizeUploadBlob } from "@/lib/video/uploadLimits";
import { runPhase0FUpload, type Phase0FUploadResult } from "@/lib/video/uploadPipeline";
import type { CaptureFlowPhase } from "@/types/video/ui";
import { useCallback, useMemo, useState } from "react";

function mapRecorderStatusToFlowPhase(
  recorderStatus: ReturnType<typeof useVideoRecorder>["status"],
  uploading: boolean,
  uploadResult: Phase0FUploadResult | null,
  flowError: string | null,
): CaptureFlowPhase {
  if (flowError) {
    return "error";
  }

  if (uploadResult) {
    return "complete";
  }

  if (uploading) {
    return "uploading";
  }

  switch (recorderStatus) {
    case "requesting":
      return "initializing";
    case "ready":
      return "ready";
    case "recording":
      return "recording";
    case "preparing":
      return "initializing";
    case "preview":
      return "preview";
    case "error":
      return "error";
    default:
      return "initializing";
  }
}

export type VideoCaptureUploadOutcome =
  | { ok: true; result: Phase0FUploadResult }
  | { ok: false; error: string };

export function useVideoCaptureFlow() {
  const recorder = useVideoRecorder({ autoPrepare: true });
  const [uploading, setUploading] = useState(false);
  const [flowError, setFlowError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<Phase0FUploadResult | null>(null);

  const effectiveError = flowError ?? recorder.error;

  const flowPhase = useMemo(
    () =>
      mapRecorderStatusToFlowPhase(
        recorder.status,
        uploading,
        uploadResult,
        effectiveError,
      ),
    [recorder.status, uploading, uploadResult, effectiveError],
  );

  const resetFlow = useCallback(() => {
    setFlowError(null);
    setUploadResult(null);
    setUploading(false);
  }, []);

  const retake = useCallback(async () => {
    resetFlow();
    await recorder.discardRecording();
  }, [recorder, resetFlow]);

  const uploadBlob = useCallback(
    async (
      blob: Blob,
      options?: {
        caption?: string;
        recorderMimeType?: string;
        localPreviewUrl?: string | null;
        thumbnail?: Blob;
      },
    ): Promise<VideoCaptureUploadOutcome> => {
      setUploading(true);
      setFlowError(null);
      setUploadResult(null);

      try {
        const result = await runPhase0FUpload(blob, {
          caption: options?.caption ?? DEFAULT_CAPTURE_CAPTION,
          recorderMimeType: options?.recorderMimeType ?? blob.type,
          localPreviewUrl: options?.localPreviewUrl,
          thumbnail: options?.thumbnail,
        });

        setUploadResult(result);
        return { ok: true, result };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Upload failed";
        setFlowError(message);
        return { ok: false, error: message };
      } finally {
        setUploading(false);
      }
    },
    [],
  );

  const uploadCapture = useCallback(
    async (
      caption = DEFAULT_CAPTURE_CAPTION,
      thumbnail?: Blob,
    ): Promise<VideoCaptureUploadOutcome> => {
      if (!recorder.blob) {
        const message = "Recorded blob is missing";
        setFlowError(message);
        return { ok: false, error: message };
      }

      return uploadBlob(recorder.blob, {
        caption,
        recorderMimeType: recorder.mimeType,
        localPreviewUrl: recorder.previewUrl,
        thumbnail,
      });
    },
    [recorder.blob, recorder.mimeType, recorder.previewUrl, uploadBlob],
  );

  const uploadFile = useCallback(
    async (
      file: File,
      caption = DEFAULT_CAPTURE_CAPTION,
      thumbnail?: Blob,
    ): Promise<VideoCaptureUploadOutcome> => {
      return uploadBlob(file, {
        caption,
        recorderMimeType: file.type,
        localPreviewUrl: URL.createObjectURL(file),
        thumbnail,
      });
    },
    [uploadBlob],
  );

  const uploadOversizeTest = useCallback(async (): Promise<VideoCaptureUploadOutcome> => {
    return uploadBlob(createOversizeUploadBlob(), {
      caption: "oversize-limit-test",
      recorderMimeType: "video/mp4",
    });
  }, [uploadBlob]);

  return {
    ...recorder,
    flowPhase,
    flowError: effectiveError,
    uploadResult,
    uploading,
    retake,
    uploadCapture,
    uploadFile,
    uploadOversizeTest,
    resetFlow,
  };
}
