/** 401 reissue 후 동일 요청 체인에서 Bearer·refresh 재시도용 (세션 쿠키 갱신 전) */
export type RequestAuthTokens = {
  accessToken: string;
  refreshToken: string;
};

let requestAuthTokenOverride: RequestAuthTokens | undefined;
let reissueInFlight: Promise<RequestAuthTokens> | undefined;

export function setRequestAuthTokenOverride(tokens: RequestAuthTokens): void {
  requestAuthTokenOverride = tokens;
}

export function getRequestAuthTokenOverride(): RequestAuthTokens | undefined {
  return requestAuthTokenOverride;
}

export function withReissueSingleFlight(
  reissue: () => Promise<RequestAuthTokens>,
): Promise<RequestAuthTokens> {
  if (requestAuthTokenOverride) {
    return Promise.resolve(requestAuthTokenOverride);
  }

  if (!reissueInFlight) {
    reissueInFlight = reissue()
      .then((tokens) => {
        requestAuthTokenOverride = tokens;
        return tokens;
      })
      .finally(() => {
        reissueInFlight = undefined;
      });
  }

  return reissueInFlight;
}
