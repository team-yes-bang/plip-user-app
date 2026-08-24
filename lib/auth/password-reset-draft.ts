import type { UiPasswordResetDraft } from "@/types/auth/ui";

export const PASSWORD_RESET_DRAFT_KEY = "plip-password-reset-draft";

export function savePasswordResetDraft(draft: UiPasswordResetDraft): void {
  sessionStorage.setItem(PASSWORD_RESET_DRAFT_KEY, JSON.stringify(draft));
}

export function readPasswordResetDraft(): UiPasswordResetDraft | null {
  const raw = sessionStorage.getItem(PASSWORD_RESET_DRAFT_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<UiPasswordResetDraft>;
    if (typeof parsed.email !== "string" || typeof parsed.verificationToken !== "string") {
      return null;
    }

    return {
      email: parsed.email,
      verificationToken: parsed.verificationToken,
    };
  } catch {
    return null;
  }
}

export function clearPasswordResetDraft(): void {
  sessionStorage.removeItem(PASSWORD_RESET_DRAFT_KEY);
}
