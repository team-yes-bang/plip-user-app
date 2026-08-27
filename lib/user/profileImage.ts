import { DEFAULT_PROFILE_AVATAR } from "@/types/user/ui";

const PROFILE_IMAGE_DIR = "/images/profile";

export const PROFILE_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";
export const PROFILE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const PROFILE_IMAGE_MAX_MB = 5;

const EXT_BY_TYPE: Record<string, ".jpg" | ".png" | ".webp"> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export function resolveProfileImageUrl(profileImagePath?: string | null): string {
  if (!profileImagePath?.trim()) {
    return DEFAULT_PROFILE_AVATAR;
  }

  const trimmed = profileImagePath.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) {
    return trimmed;
  }

  const basename = trimmed.split("/").pop()?.trim();
  if (!basename) {
    return DEFAULT_PROFILE_AVATAR;
  }

  return `${PROFILE_IMAGE_DIR}/${basename}`;
}

export function profileImageExtension(contentType: string): ".jpg" | ".png" | ".webp" | null {
  return EXT_BY_TYPE[contentType] ?? null;
}

export function toStoredProfileImagePath(
  userUuid: string,
  ext: ".jpg" | ".png" | ".webp",
  stamp = Date.now(),
): string {
  return `${PROFILE_IMAGE_DIR}/${userUuid}_${stamp}${ext}`;
}
