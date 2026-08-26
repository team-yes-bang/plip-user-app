import { CAPTURE_FRAME_RATE, CAPTURE_HEIGHT, CAPTURE_WIDTH } from "@/lib/video/constants";
import { drawCoverCrop } from "@/lib/video/coverCrop";

export type CaptureCanvas = {
  stream: MediaStream;
  stop: () => void;
};

export async function waitForVideoFrame(sourceVideo: HTMLVideoElement, timeoutMs = 400): Promise<void> {
  if (sourceVideo.videoWidth > 0) {
    return;
  }

  await new Promise<void>((resolve) => {
    const finish = () => resolve();
    sourceVideo.addEventListener("loadeddata", finish, { once: true });
    window.setTimeout(finish, timeoutMs);
  });
}

/** Fixed 720×1280 cover-crop canvas. Front and rear cameras are treated the same (no flip). */
export function startCaptureCanvas(sourceVideo: HTMLVideoElement): CaptureCanvas | null {
  if (sourceVideo.videoWidth < 2 || sourceVideo.videoHeight < 2) {
    return null;
  }

  const canvas = document.createElement("canvas");
  canvas.width = CAPTURE_WIDTH;
  canvas.height = CAPTURE_HEIGHT;
  const context = canvas.getContext("2d", { alpha: false });
  if (!context || typeof canvas.captureStream !== "function") {
    return null;
  }

  let frameId = 0;
  let active = true;

  const draw = () => {
    if (!active) {
      return;
    }

    drawCoverCrop(
      context,
      sourceVideo,
      sourceVideo.videoWidth,
      sourceVideo.videoHeight,
      CAPTURE_WIDTH,
      CAPTURE_HEIGHT,
    );
    frameId = window.requestAnimationFrame(draw);
  };

  draw();

  const stream = canvas.captureStream(CAPTURE_FRAME_RATE);

  return {
    stream,
    stop() {
      active = false;
      window.cancelAnimationFrame(frameId);
      stream.getTracks().forEach((track) => track.stop());
    },
  };
}
