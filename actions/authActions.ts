"use server";

import { signOut } from "@/auth";
import { ApiError } from "@/lib/api/apiFetch";
import { getApiErrorCode } from "@/lib/auth/auth-errors";
import * as authService from "@/services/authService";
import { getServerRefreshToken } from "@/lib/auth/server-token";
import {
  clearSocialSignupPendingToken,
  readSocialSignupPendingToken,
} from "@/lib/auth/social-signup-pending";
import { actionFailure, actionSuccess, type ActionResult } from "@/types/action-result";
import type { ApiLocalSignupRequest, ApiOtpPurpose, ApiTermAgreement } from "@/types/auth/api";
import type { UiAuthTokens, UiRestorePayload, UiTerm } from "@/types/auth/ui";

function toActionError(error: unknown): ActionResult<never> {
  if (error instanceof ApiError) {
    const code = getApiErrorCode(error.body);
    const message = error.message;
    return actionFailure(code ? `${code}:${message}` : `[${error.status}] ${message}`);
  }
  if (error instanceof Error) {
    return actionFailure(error.message);
  }
  return actionFailure("Unknown error");
}

export async function logoutAction(): Promise<ActionResult<void>> {
  try {
    const refreshToken = await getServerRefreshToken();
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
    await signOut({ redirect: false });
    return actionSuccess(undefined);
  } catch (error) {
    return toActionError(error);
  }
}

export async function requestEmailOtpAction(
  email: string,
  purpose: ApiOtpPurpose = "SIGNUP",
): Promise<ActionResult<void>> {
  try {
    await authService.requestEmailOtp(email, purpose);
    return actionSuccess(undefined);
  } catch (error) {
    return toActionError(error);
  }
}

export async function verifyEmailOtpAction(
  email: string,
  otpCode: string,
  purpose: ApiOtpPurpose = "SIGNUP",
): Promise<ActionResult<{ verificationToken: string }>> {
  try {
    const verificationToken = await authService.verifyEmailOtp(email, otpCode, purpose);
    return actionSuccess({ verificationToken });
  } catch (error) {
    return toActionError(error);
  }
}

export async function listActiveTermsAction(): Promise<ActionResult<UiTerm[]>> {
  try {
    const terms = await authService.listActiveTerms();
    return actionSuccess(terms);
  } catch (error) {
    return toActionError(error);
  }
}

export async function signupLocalAction(
  payload: ApiLocalSignupRequest,
): Promise<ActionResult<{ userUuid: string }>> {
  try {
    const tokens = await authService.signupLocal(payload);
    return actionSuccess({ userUuid: tokens.userUuid });
  } catch (error) {
    return toActionError(error);
  }
}

export async function restoreAccountAction(
  payload: UiRestorePayload,
): Promise<ActionResult<UiAuthTokens>> {
  try {
    if (payload.type === "social-pending") {
      const pendingToken = await readSocialSignupPendingToken();
      if (!pendingToken) {
        return actionFailure("소셜 복구 정보가 없습니다. 다시 로그인해 주세요.");
      }

      const tokens = await authService.restoreSocialPending(pendingToken);
      await clearSocialSignupPendingToken();
      return actionSuccess(tokens);
    }

    const tokens = await authService.restoreAccount(payload);
    return actionSuccess(tokens);
  } catch (error) {
    return toActionError(error);
  }
}

export async function completeSocialSignupAction(
  termsAgreements: ApiTermAgreement[],
): Promise<ActionResult<UiAuthTokens>> {
  const pendingToken = await readSocialSignupPendingToken();
  if (!pendingToken) {
    return actionFailure("소셜 가입 정보가 없습니다. 다시 로그인해 주세요.");
  }

  try {
    const tokens = await authService.completeSocialSignup(pendingToken, termsAgreements);
    await clearSocialSignupPendingToken();
    return actionSuccess(tokens);
  } catch (error) {
    return toActionError(error);
  }
}

export async function resetPasswordAction(payload: {
  email: string;
  verificationToken: string;
  newPassword: string;
}): Promise<ActionResult<void>> {
  if (!payload.email || !payload.verificationToken) {
    return actionFailure("인증 정보가 없습니다. 처음부터 다시 시도해 주세요.");
  }
  if (!payload.newPassword || payload.newPassword.length < 8) {
    return actionFailure("새 비밀번호는 8자 이상이어야 합니다.");
  }

  try {
    await authService.resetPassword({
      email: payload.email,
      verificationToken: payload.verificationToken,
      newPassword: payload.newPassword,
    });
    return actionSuccess(undefined);
  } catch (error) {
    return toActionError(error);
  }
}
