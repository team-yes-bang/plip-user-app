/** plip-video backend contract: max 5 seconds (saved / displayed) */
export const MAX_RECORD_MS = 5_000;

/** MediaRecorder stop — 0.2s buffer so last frame isn't cut */
export const RECORD_STOP_MS = 5_200;

export const RECORD_TIMESLICE_MS = 250;

export const RECORDER_MIME_CANDIDATES = [
  "video/mp4",
  "video/webm;codecs=vp9",
  "video/webm",
] as const;

/** Presigned PUT Content-Type must match upload-url query param */
export const DEFAULT_UPLOAD_CONTENT_TYPE = "video/mp4";

/** Server/client reject line. 5s 720p H.264 ~2.5 Mbps is ~1.6–2MB; iOS mp4/hevc can be larger. */
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export const MAX_UPLOAD_MB = MAX_UPLOAD_BYTES / (1024 * 1024);

export const CAPTURE_WIDTH = 720;
export const CAPTURE_HEIGHT = 1280;
export const CAPTURE_FRAME_RATE = 30;

/** MediaRecorder target. 2.5 Mbps × 5s ≈ 1.6MB so typical captures stay under 8MB. */
export const RECORD_VIDEO_BITS_PER_SECOND = 2_500_000;

export const DEFAULT_CAPTURE_CAPTION = "";

export const CAPTION_MAX_LENGTH = 80;

/** Drop sample.mp3 at public/plip/video/sample.mp3. Missing file falls back to a click. */
export const SHUTTER_SOUND_SRC = "/plip/video/sample.mp3";

export { VIDEO_THUMBNAIL_NOT_LOADED } from "@/lib/video/thumbnail";

/**
 * download-url 202 probe count.
 * 로컬 NoOp에서는 PROCESSING만 반환하므로 1회로 endpoint 검증만 수행 (3회×3s 대기 제거).
 */
export const DOWNLOAD_URL_MAX_ATTEMPTS = 1;
