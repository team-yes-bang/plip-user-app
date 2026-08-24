import { DEFAULT_PROFILE_AVATAR } from "@/types/user/ui";

export function resolveProfileImageUrl(profileImagePath?: string | null): string {
  if (!profileImagePath) {
    return DEFAULT_PROFILE_AVATAR;
  }
  if (profileImagePath.startsWith("http://") || profileImagePath.startsWith("https://")) {
    return profileImagePath;
  }
  if (profileImagePath.startsWith("/")) {
    return profileImagePath;
  }
  return DEFAULT_PROFILE_AVATAR;
}
