import { waitForVideoFrame } from "@/lib/video/captureCanvas";
import {
  CAPTURE_HEIGHT,
  CAPTURE_WIDTH,
  THUMBNAIL_CONTENT_TYPE,
  THUMBNAIL_JPEG_QUALITY,
  THUMBNAIL_MAX_BYTES,
  THUMBNAIL_MAX_MB,
} from "@/lib/video/constants";
import { drawCoverCrop } from "@/lib/video/coverCrop";

function canvasToJpegFile(canvas: HTMLCanvasElement, name: string): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("썸네일 이미지를 만들지 못했습니다."));
          return;
        }
        if (blob.size > THUMBNAIL_MAX_BYTES) {
          reject(new Error(`썸네일은 ${THUMBNAIL_MAX_MB}MB 이하여야 합니다.`));
          return;
        }
        resolve(new File([blob], name, { type: THUMBNAIL_CONTENT_TYPE }));
      },
      THUMBNAIL_CONTENT_TYPE,
      THUMBNAIL_JPEG_QUALITY,
    );
  });
}

export async function prepareThumbnailImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) {
    throw new Error("이미지 파일만 올릴 수 있습니다.");
  }

  if (typeof createImageBitmap !== "function" || typeof document === "undefined") {
    if (file.size > THUMBNAIL_MAX_BYTES) {
      throw new Error(`썸네일은 ${THUMBNAIL_MAX_MB}MB 이하여야 합니다.`);
    }
    return new File([file], "thumbnail.jpg", { type: file.type || THUMBNAIL_CONTENT_TYPE });
  }

  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = CAPTURE_WIDTH;
  canvas.height = CAPTURE_HEIGHT;
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) {
    bitmap.close();
    throw new Error("썸네일 이미지를 만들지 못했습니다.");
  }

  drawCoverCrop(context, bitmap, bitmap.width, bitmap.height, CAPTURE_WIDTH, CAPTURE_HEIGHT);
  bitmap.close();
  return canvasToJpegFile(canvas, "thumbnail.jpg");
}

export async function captureVideoFrame(video: HTMLVideoElement): Promise<File> {
  await waitForVideoFrame(video);
  if (video.videoWidth < 2 || video.videoHeight < 2) {
    throw new Error("영상 장면을 담을 수 없습니다. 영상이 준비된 뒤 다시 시도해 주세요.");
  }

  const canvas = document.createElement("canvas");
  canvas.width = CAPTURE_WIDTH;
  canvas.height = CAPTURE_HEIGHT;
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) {
    throw new Error("썸네일 이미지를 만들지 못했습니다.");
  }

  drawCoverCrop(context, video, video.videoWidth, video.videoHeight, CAPTURE_WIDTH, CAPTURE_HEIGHT);
  return canvasToJpegFile(canvas, "thumbnail.jpg");
}
