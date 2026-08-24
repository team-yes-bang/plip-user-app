import { CAPTURE_FRAME_RATE, CAPTURE_HEIGHT, CAPTURE_WIDTH } from "@/lib/video/constants";

export type MirroredCapture = {
  stream: MediaStream;
  stop: () => void;
};

/**
 * Front-camera pixels are opposite of the mirrored live view.
 * Draw a flipped canvas so the recorded blob matches what the user saw.
 */
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

export function startMirroredCapture(sourceVideo: HTMLVideoElement): MirroredCapture | null {
  const width = sourceVideo.videoWidth || CAPTURE_WIDTH;
  const height = sourceVideo.videoHeight || CAPTURE_HEIGHT;
  if (width < 2 || height < 2) {
    return null;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context || typeof canvas.captureStream !== "function") {
    return null;
  }

  let frameId = 0;
  let active = true;

  const draw = () => {
    if (!active) {
      return;
    }

    context.save();
    context.translate(width, 0);
    context.scale(-1, 1);
    context.drawImage(sourceVideo, 0, 0, width, height);
    context.restore();
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
