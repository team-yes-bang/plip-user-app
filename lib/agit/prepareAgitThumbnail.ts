import { drawCoverCrop } from "@/lib/video/coverCrop";
import { THUMBNAIL_CONTENT_TYPE } from "@/lib/video/constants";

const THUMBNAIL_WIDTH = 1280;
const THUMBNAIL_HEIGHT = 720;
const JPEG_QUALITY = 0.86;
const AGIT_THUMBNAIL_MAX_BYTES = 2 * 1024 * 1024;
const AGIT_THUMBNAIL_MAX_MB = AGIT_THUMBNAIL_MAX_BYTES / (1024 * 1024);

function canvasToJpegFile(canvas: HTMLCanvasElement, name: string): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("썸네일 이미지를 만들지 못했습니다."));
          return;
        }
        if (blob.size > AGIT_THUMBNAIL_MAX_BYTES) {
          reject(new Error(`썸네일은 ${AGIT_THUMBNAIL_MAX_MB}MB 이하여야 합니다.`));
          return;
        }
        resolve(new File([blob], name, { type: THUMBNAIL_CONTENT_TYPE }));
      },
      THUMBNAIL_CONTENT_TYPE,
      JPEG_QUALITY,
    );
  });
}

export async function prepareAgitThumbnailFile(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) {
    throw new Error("이미지 파일만 올릴 수 있습니다.");
  }

  if (typeof createImageBitmap !== "function" || typeof document === "undefined") {
    if (file.size > AGIT_THUMBNAIL_MAX_BYTES) {
      throw new Error(`썸네일은 ${AGIT_THUMBNAIL_MAX_MB}MB 이하여야 합니다.`);
    }
    return new File([file], "agit-thumbnail.jpg", { type: THUMBNAIL_CONTENT_TYPE });
  }

  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = THUMBNAIL_WIDTH;
  canvas.height = THUMBNAIL_HEIGHT;
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) {
    bitmap.close();
    throw new Error("썸네일 이미지를 만들지 못했습니다.");
  }

  drawCoverCrop(context, bitmap, bitmap.width, bitmap.height, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT);
  bitmap.close();
  return canvasToJpegFile(canvas, "agit-thumbnail.jpg");
}
