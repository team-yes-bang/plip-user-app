import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  PROFILE_IMAGE_MAX_BYTES,
  PROFILE_IMAGE_MAX_MB,
  profileImageExtension,
  toStoredProfileImagePath,
} from "@/lib/user/profileImage";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function saveProfileImageFile(userUuid: string, file: File): Promise<string> {
  if (!UUID_RE.test(userUuid)) {
    throw new Error("사용자 정보를 확인할 수 없습니다.");
  }

  const ext = profileImageExtension(file.type);
  if (!ext) {
    throw new Error("JPG, PNG, WEBP 이미지만 올릴 수 있습니다.");
  }
  if (file.size > PROFILE_IMAGE_MAX_BYTES) {
    throw new Error(`이미지는 ${PROFILE_IMAGE_MAX_MB}MB 이하여야 합니다.`);
  }

  const dir = path.join(process.cwd(), "public", "images", "profile");
  await mkdir(dir, { recursive: true });
  const storedPath = toStoredProfileImagePath(userUuid, ext);
  const filename = storedPath.slice(storedPath.lastIndexOf("/") + 1);
  await writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));
  return storedPath;
}
