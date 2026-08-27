import { PROFILE_IMAGE_MAX_BYTES, PROFILE_IMAGE_MAX_MB } from "@/lib/user/profileImage";

const MAX_EDGE = 720;
const JPEG_QUALITY = 0.86;

export async function prepareProfileImageFile(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) {
    throw new Error("이미지 파일만 올릴 수 있습니다.");
  }
  if (file.size > PROFILE_IMAGE_MAX_BYTES * 4) {
    throw new Error(`이미지는 ${PROFILE_IMAGE_MAX_MB}MB 이하여야 합니다.`);
  }

  if (typeof createImageBitmap !== "function" || typeof document === "undefined") {
    if (file.size > PROFILE_IMAGE_MAX_BYTES) {
      throw new Error(`이미지는 ${PROFILE_IMAGE_MAX_MB}MB 이하여야 합니다.`);
    }
    return file;
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    if (file.size > PROFILE_IMAGE_MAX_BYTES) {
      throw new Error(`이미지는 ${PROFILE_IMAGE_MAX_MB}MB 이하여야 합니다.`);
    }
    return file;
  }

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY);
  });
  if (!blob) {
    if (file.size > PROFILE_IMAGE_MAX_BYTES) {
      throw new Error(`이미지는 ${PROFILE_IMAGE_MAX_MB}MB 이하여야 합니다.`);
    }
    return file;
  }
  if (blob.size > PROFILE_IMAGE_MAX_BYTES) {
    throw new Error(`이미지는 ${PROFILE_IMAGE_MAX_MB}MB 이하여야 합니다.`);
  }

  return new File([blob], "profile.jpg", { type: "image/jpeg" });
}
