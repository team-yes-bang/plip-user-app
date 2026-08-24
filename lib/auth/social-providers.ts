import type { SocialProvider } from "@/types/auth/ui";

const SOCIAL_PROVIDERS = new Set<SocialProvider>(["google", "kakao", "naver"]);

export function isSocialProvider(value: string | null | undefined): value is SocialProvider {
  return typeof value === "string" && SOCIAL_PROVIDERS.has(value as SocialProvider);
}
