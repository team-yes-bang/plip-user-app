import {
  CAPTURE_FRAME_RATE,
  CAPTURE_HEIGHT,
  CAPTURE_WIDTH,
  DEFAULT_UPLOAD_CONTENT_TYPE,
  MAX_RECORD_MS,
  MAX_UPLOAD_BYTES,
  MIN_PLAYBACK_DURATION_MS,
  PLAYBACK_SKIP_REENCODE_BYTES,
  RECORD_VIDEO_BITS_PER_SECOND,
} from "@/lib/video/constants";
import { drawCoverCrop } from "@/lib/video/coverCrop";
import { assertUploadSize } from "@/lib/video/uploadLimits";

export const PLAYBACK_CONVERT_FAILED = "이 파일은 변환할 수 없습니다.";

const AVC_CODEC_CANDIDATES = ["avc1.4d0028", "avc1.420028", "avc1.4d001f", "avc1.42001f"] as const;
const CONVERT_TIMEOUT_MS = 20_000;
const PLAYBACK_RATE = 4;

export function needsPlaybackReencode(blob: Blob): boolean {
  const type = blob.type.toLowerCase();
  const isMp4 = type.startsWith("video/mp4");
  return !(isMp4 && blob.size > 0 && blob.size <= PLAYBACK_SKIP_REENCODE_BYTES);
}

function conversionError(): Error {
  return new Error(PLAYBACK_CONVERT_FAILED);
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }
}

async function pickAvcCodec(): Promise<string | null> {
  if (typeof VideoEncoder === "undefined" || typeof VideoEncoder.isConfigSupported !== "function") {
    return null;
  }

  for (const codec of AVC_CODEC_CANDIDATES) {
    try {
      const support = await VideoEncoder.isConfigSupported({
        codec,
        width: CAPTURE_WIDTH,
        height: CAPTURE_HEIGHT,
        bitrate: RECORD_VIDEO_BITS_PER_SECOND,
        framerate: CAPTURE_FRAME_RATE,
        avc: { format: "avc" },
      });
      if (support.supported) {
        return codec;
      }
    } catch {
      /* try next */
    }
  }

  return null;
}

function waitLoadedMetadata(video: HTMLVideoElement, signal?: AbortSignal): Promise<void> {
  if (video.readyState >= HTMLMediaElement.HAVE_METADATA && Number.isFinite(video.duration)) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const finish = (error?: Error) => {
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("error", onError);
      signal?.removeEventListener("abort", onAbort);
      if (error) {
        reject(error);
        return;
      }
      resolve();
    };
    const onMeta = () => finish();
    const onError = () => finish(conversionError());
    const onAbort = () => finish(new DOMException("Aborted", "AbortError"));
    video.addEventListener("loadedmetadata", onMeta, { once: true });
    video.addEventListener("error", onError, { once: true });
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

/**
 * Decode any playable blob, trim to 5s, cover-crop to 720×1280, drop audio, encode H.264 mp4.
 */
export async function preparePlaybackMp4(source: Blob, signal?: AbortSignal): Promise<Blob> {
  throwIfAborted(signal);

  if (typeof VideoEncoder === "undefined" || typeof VideoFrame === "undefined") {
    throw conversionError();
  }

  const codec = await pickAvcCodec();
  throwIfAborted(signal);
  if (!codec) {
    throw conversionError();
  }

  const objectUrl = URL.createObjectURL(source);
  const video = document.createElement("video");
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  video.preload = "auto";
  video.src = objectUrl;

  let encoder: VideoEncoder | null = null;

  try {
    await waitLoadedMetadata(video, signal);
    throwIfAborted(signal);

    const duration = video.duration;
    if (!Number.isFinite(duration) || duration * 1000 < MIN_PLAYBACK_DURATION_MS) {
      throw new Error("영상이 너무 짧습니다.");
    }

    if (video.videoWidth < 2 || video.videoHeight < 2) {
      throw conversionError();
    }

    const canvas = document.createElement("canvas");
    canvas.width = CAPTURE_WIDTH;
    canvas.height = CAPTURE_HEIGHT;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) {
      throw conversionError();
    }

    const { Muxer, ArrayBufferTarget } = await import("mp4-muxer");
    throwIfAborted(signal);

    const target = new ArrayBufferTarget();
    const muxer = new Muxer({
      target,
      video: {
        codec: "avc",
        width: CAPTURE_WIDTH,
        height: CAPTURE_HEIGHT,
        frameRate: CAPTURE_FRAME_RATE,
      },
      fastStart: "in-memory",
      firstTimestampBehavior: "offset",
    });

    let encoderError: Error | null = null;
    encoder = new VideoEncoder({
      output: (chunk, meta) => {
        muxer.addVideoChunk(chunk, meta);
      },
      error: (cause) => {
        encoderError = cause instanceof Error ? cause : conversionError();
      },
    });
    encoder.configure({
      codec,
      width: CAPTURE_WIDTH,
      height: CAPTURE_HEIGHT,
      bitrate: RECORD_VIDEO_BITS_PER_SECOND,
      framerate: CAPTURE_FRAME_RATE,
      avc: { format: "avc" },
      hardwareAcceleration: "prefer-hardware",
    });

    const endTime = Math.min(duration, MAX_RECORD_MS / 1000);
    video.playbackRate = PLAYBACK_RATE;
    await video.play();
    throwIfAborted(signal);

    await collectFrames(video, context, encoder, endTime, signal, () => encoderError);

    video.pause();
    await encoder.flush();
    encoder.close();
    encoder = null;
    muxer.finalize();

    if (!target.buffer || target.buffer.byteLength === 0) {
      throw conversionError();
    }

    return new Blob([target.buffer], { type: DEFAULT_UPLOAD_CONTENT_TYPE });
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }
    if (error instanceof Error && error.message === "영상이 너무 짧습니다.") {
      throw error;
    }
    throw conversionError();
  } finally {
    video.pause();
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(objectUrl);
    if (encoder && encoder.state !== "closed") {
      encoder.close();
    }
  }
}

function collectFrames(
  video: HTMLVideoElement,
  context: CanvasRenderingContext2D,
  encoder: VideoEncoder,
  endTime: number,
  signal: AbortSignal | undefined,
  getEncoderError: () => Error | null,
): Promise<void> {
  if (typeof video.requestVideoFrameCallback !== "function") {
    return Promise.reject(conversionError());
  }

  return new Promise((resolve, reject) => {
    let frameIndex = 0;
    let settled = false;
    const timeoutId = window.setTimeout(() => {
      finish(conversionError());
    }, CONVERT_TIMEOUT_MS);

    const finish = (error?: Error) => {
      if (settled) {
        return;
      }
      settled = true;
      window.clearTimeout(timeoutId);
      signal?.removeEventListener("abort", onAbort);
      if (error) {
        reject(error);
        return;
      }
      if (frameIndex === 0) {
        reject(conversionError());
        return;
      }
      resolve();
    };

    const onAbort = () => finish(new DOMException("Aborted", "AbortError"));
    signal?.addEventListener("abort", onAbort, { once: true });

    const onFrame: VideoFrameRequestCallback = (_now, metadata) => {
      if (settled) {
        return;
      }

      const encoderError = getEncoderError();
      if (encoderError) {
        finish(encoderError);
        return;
      }

      const mediaTime = metadata.mediaTime;
      if (mediaTime >= endTime || video.ended) {
        finish();
        return;
      }

      try {
        drawCoverCrop(
          context,
          video,
          video.videoWidth,
          video.videoHeight,
          CAPTURE_WIDTH,
          CAPTURE_HEIGHT,
        );
        const frame = new VideoFrame(canvasFromContext(context), {
          timestamp: Math.round(mediaTime * 1_000_000),
        });
        encoder.encode(frame, { keyFrame: frameIndex % CAPTURE_FRAME_RATE === 0 });
        frame.close();
        frameIndex += 1;
        video.requestVideoFrameCallback(onFrame);
      } catch {
        finish(conversionError());
      }
    };

    video.requestVideoFrameCallback(onFrame);
  });
}

function canvasFromContext(context: CanvasRenderingContext2D): HTMLCanvasElement {
  return context.canvas as HTMLCanvasElement;
}

export async function preparePlaybackMp4IfNeeded(blob: Blob, signal?: AbortSignal): Promise<Blob> {
  if (blob.size === 0) {
    throw new Error("녹화 데이터가 비어 있습니다.");
  }

  if (!needsPlaybackReencode(blob)) {
    return blob;
  }

  try {
    return await preparePlaybackMp4(blob, signal);
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }
    if (blob.size > MAX_UPLOAD_BYTES) {
      assertUploadSize(blob);
    }
    throw error;
  }
}
