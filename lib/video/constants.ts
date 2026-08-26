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

/** Server/client reject line after 720p encode. */
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export const MAX_UPLOAD_MB = MAX_UPLOAD_BYTES / (1024 * 1024);

/** Camera mp4 at/under this size skips a second WebCodecs pass. */
export const PLAYBACK_SKIP_REENCODE_BYTES = 2 * 1024 * 1024;

export const MIN_PLAYBACK_DURATION_MS = 300;

export const CAPTURE_WIDTH = 720;
export const CAPTURE_HEIGHT = 1280;
export const CAPTURE_FRAME_RATE = 30;

/** MediaRecorder / WebCodecs target. 1.5 Mbps × 5s ≈ 0.9MB. */
export const RECORD_VIDEO_BITS_PER_SECOND = 1_500_000;

export const DEFAULT_CAPTURE_CAPTION = "";

export const CAPTION_MAX_LENGTH = 80;

/** Overlay sizes at capture/fullscreen scale. Preview shrinks these by frame/viewport. */
export const OVERLAY_TIME_PX = 32;
export const OVERLAY_CAPTION_PX = 20;
export const OVERLAY_CAPTION_GAP_PX = 8;
export const OVERLAY_DURATION_PX = 13;

/** Drop sample.mp3 at public/plip/video/sample.mp3. Missing file falls back to a click. */
export const SHUTTER_SOUND_SRC = "/plip/video/sample.mp3";

export { VIDEO_THUMBNAIL_NOT_LOADED } from "@/lib/video/thumbnail";

/**
 * download-url 202 probe count.
 * 로컬 NoOp에서는 PROCESSING만 반환하므로 1회로 endpoint 검증만 수행 (3회×3s 대기 제거).
 */
export const DOWNLOAD_URL_MAX_ATTEMPTS = 1;
