import { getMyProfileWithAccessToken } from "@/lib/api/userApi";

export async function validateSessionTokens(
  userUuid: string,
  accessToken: string,
): Promise<boolean> {
  try {
    const profile = await getMyProfileWithAccessToken(accessToken);
    return profile.userUuid === userUuid;
  } catch {
    return false;
  }
}
