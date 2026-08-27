import { ApiError } from "@/lib/api/apiFetch";
import { getApiErrorCode } from "@/lib/auth/auth-errors";
import {
  actionFailure,
  actionSessionExpired,
  type ActionResult,
} from "@/types/action-result";

const USER_API_ERROR_MESSAGES: Record<string, string> = {
  AUTH_001: "비밀번호가 올바르지 않습니다.",
  AUTH_009: "비밀번호가 올바르지 않습니다.",
  PROFILE_002: "수정할 항목이 없습니다.",
  TERMS_001: "필수 약관은 철회할 수 없습니다.",
  TERMS_002: "변경할 약관 항목이 없습니다.",
  NOTIFY_001: "알림 설정을 찾을 수 없습니다.",
  NOTIFY_002: "변경할 알림 설정 항목이 없습니다.",
  NOTIFY_003: "알림을 찾을 수 없습니다.",
};

function mapUserApiErrorMessage(error: ApiError): string {
  const code = getApiErrorCode(error.body);
  if (code && USER_API_ERROR_MESSAGES[code]) {
    return USER_API_ERROR_MESSAGES[code];
  }

  if (error.message && !/^\[\d+\]/.test(error.message)) {
    return error.message;
  }

  return "요청에 실패했습니다.";
}

export function toUserActionError(error: unknown): ActionResult<never> {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return actionSessionExpired();
    }
    return actionFailure(mapUserApiErrorMessage(error));
  }

  if (error instanceof Error) {
    return actionFailure(error.message);
  }

  return actionFailure("일시적인 오류가 발생했습니다.");
}
