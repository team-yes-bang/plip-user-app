import { cookies } from "next/headers";

export const SOCIAL_SIGNUP_PENDING_COOKIE = "plip-social-signup-pending";

const PENDING_MAX_AGE_SECONDS = 600;

export async function saveSocialSignupPendingToken(pendingToken: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SOCIAL_SIGNUP_PENDING_COOKIE, pendingToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: PENDING_MAX_AGE_SECONDS,
    path: "/",
  });
}

export async function readSocialSignupPendingToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const pendingToken = cookieStore.get(SOCIAL_SIGNUP_PENDING_COOKIE)?.value?.trim();
  return pendingToken || null;
}

export async function clearSocialSignupPendingToken(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SOCIAL_SIGNUP_PENDING_COOKIE);
}
