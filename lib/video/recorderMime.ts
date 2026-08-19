import { DEFAULT_UPLOAD_CONTENT_TYPE } from "@/lib/video/constants";

export async function requestCameraStream(
  facingMode: "user" | "environment" = "user",
): Promise<MediaStream> {
  const portraitVideo: MediaTrackConstraints = {
    facingMode,
    width: { ideal: 1080 },
    height: { ideal: 1920 },
    aspectRatio: { ideal: 9 / 16 },
  };

  const attempts: MediaStreamConstraints[] = [
    { video: portraitVideo, audio: false },
    { video: { facingMode, aspectRatio: { ideal: 9 / 16 } }, audio: false },
    { video: { facingMode }, audio: false },
    { video: true, audio: false },
  ];

  let lastError: unknown;

  for (const constraints of attempts) {
    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError instanceof DOMException) {
    if (lastError.name === "NotAllowedError") {
      throw new Error("카메라 권한이 거부되었습니다. 브라우저 설정에서 허용해 주세요.");
    }

    if (lastError.name === "NotFoundError") {
      throw new Error("카메라를 찾을 수 없습니다.");
    }

    throw new Error(lastError.message);
  }

  throw lastError instanceof Error ? lastError : new Error("Camera unavailable");
}

export function pickRecorderMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") {
    return undefined;
  }

  for (const mimeType of ["video/mp4", "video/webm;codecs=vp9", "video/webm"] as const) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType;
    }
  }

  return undefined;
}

/** Map recorder output to backend-allowed upload-url contentType */
export function resolveUploadContentType(recorderMimeType?: string): string {
  if (recorderMimeType?.toLowerCase().startsWith("video/quicktime")) {
    return "video/quicktime";
  }

  return DEFAULT_UPLOAD_CONTENT_TYPE;
}

export function formatBlobSummary(blob: Blob): string {
  const sizeKb = Math.round(blob.size / 1024);
  return `${blob.type || "application/octet-stream"} · ${sizeKb} KB`;
}
