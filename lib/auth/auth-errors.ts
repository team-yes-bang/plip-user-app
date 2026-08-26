export const AUTH_ERROR_CODES = {
  PENDING_RESTORE: "AUTH_010",
  SOCIAL_SIGNUP_REQUIRED: "SOCIAL_003",
  REFRESH_TOKEN_INVALID: "AUTH_003",
} as const;

export function getApiErrorCode(body: unknown): string | undefined {
  if (typeof body === "object" && body !== null && "code" in body) {
    const code = (body as { code?: unknown }).code;
    return typeof code === "string" ? code : undefined;
  }
  return undefined;
}

export function parseActionErrorCode(error: string): string | undefined {
  const separatorIndex = error.indexOf(":");
  if (separatorIndex <= 0) {
    return undefined;
  }

  const code = error.slice(0, separatorIndex);
  return /^[A-Z0-9_]+$/.test(code) ? code : undefined;
}

export function formatActionErrorMessage(error: string): string {
  const code = parseActionErrorCode(error);
  if (!code) {
    return error;
  }

  return error.slice(code.length + 1);
}
