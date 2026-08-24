/** Gateway `/api/{serviceId}/**` + StripPrefix=2 — Gateway 경유 시 auth/users에 적용 */
function gatewayPath(serviceId: string, servicePath: string): string {
  const normalized = servicePath.startsWith("/") ? servicePath : `/${servicePath}`;
  return `/api/${serviceId}${normalized}`;
}

export const API_ENDPOINTS = {
  auth: {
    otpRequest: gatewayPath("user", "/api/v1/auth/email/otp-request"),
    otpVerify: gatewayPath("user", "/api/v1/auth/email/otp-verify"),
    terms: gatewayPath("user", "/api/v1/auth/terms"),
    signupLocal: gatewayPath("user", "/api/v1/auth/signup/local"),
    loginLocal: gatewayPath("user", "/api/v1/auth/login/local"),
    loginSocial: (provider: string) =>
      gatewayPath("user", `/api/v1/auth/login/social/${provider}`),
    reissue: gatewayPath("user", "/api/v1/auth/reissue"),
    logout: gatewayPath("user", "/api/v1/auth/logout"),
    passwordReset: gatewayPath("user", "/api/v1/auth/password-reset"),
  },
  users: {
    me: gatewayPath("user", "/api/v1/users/me"),
    profile: gatewayPath("user", "/api/v1/users/me/profile"),
    password: gatewayPath("user", "/api/v1/users/me/password"),
    notificationSettings: gatewayPath("user", "/api/v1/users/me/notification-settings"),
    restore: gatewayPath("user", "/api/v1/users/me/restore"),
  },
  agit: {
    create: gatewayPath("agit", "/api/v1/agits"),
    me: gatewayPath("agit", "/api/v1/agits/me"),
    detail: (agitUuid: string) => gatewayPath("agit", `/api/v1/agits/${agitUuid}`),
    memberMe: (agitUuid: string) => gatewayPath("agit", `/api/v1/agits/${agitUuid}/members/me`),
    leave: (agitUuid: string) => gatewayPath("agit", `/api/v1/agits/${agitUuid}/leave`),
    ban: (agitUuid: string, ampId: number) =>
      gatewayPath("agit", `/api/v1/agits/${agitUuid}/members/${ampId}/ban`),
    transferHost: (agitUuid: string, ampId: number) =>
      gatewayPath("agit", `/api/v1/agits/${agitUuid}/members/${ampId}/transfer-host`),
    inviteCode: (agitUuid: string) =>
      gatewayPath("agit", `/api/v1/agits/${agitUuid}/invite-code`),
    landing: (code: string) =>
      gatewayPath("agit", `/api/v1/agits/${encodeURIComponent(code)}/landing`),
    join: (code: string) =>
      gatewayPath("agit", `/api/v1/agits/${encodeURIComponent(code)}/join`),
  },
  topic: {
    list: gatewayPath("topic", "/api/v1/topics"),
    listByStatus: gatewayPath("topic", "/api/v1/topics/list"),
    feed: gatewayPath("topic", "/api/v1/topics/feed"),
    detail: (topicUuid: string) => gatewayPath("topic", `/api/v1/topics/${topicUuid}`),
    videos: (topicUuid: string) =>
      gatewayPath("topic", `/api/v1/topics/${topicUuid}/videos`),
  },
  diary: {
    themes: gatewayPath("diary", "/api/v1/diaries/themes"),
    themeDetail: (themeId: string) => gatewayPath("diary", `/api/v1/diaries/themes/${themeId}`),
    home: gatewayPath("diary", "/api/v1/diaries/home"),
    calendar: gatewayPath("diary", "/api/v1/diaries/calendar"),
    dateDetail: (date: string) => gatewayPath("diary", `/api/v1/diaries/dates/${date}`),
    themeTimeline: (themeId: string) =>
      gatewayPath("diary", `/api/v1/diaries/themes/${themeId}/timeline`),
    videoTopicTransfer: (diaryVideoId: string) =>
      gatewayPath("diary", `/api/v1/diaries/videos/${diaryVideoId}/topic-transfer`),
    videoUnbind: (diaryVideoId: string) =>
      gatewayPath("diary", `/api/v1/diaries/videos/${diaryVideoId}`),
  },
  video: {
    uploadUrl: "/api/videos/upload-url",
    complete: (videoUuid: string) => `/api/videos/${videoUuid}/complete` as const,
    detail: (videoUuid: string) => `/api/videos/${videoUuid}` as const,
    downloadUrl: (videoUuid: string) => `/api/videos/${videoUuid}/download-url` as const,
    /** Kafka produce는 video-service. 토픽명은 백엔드 env로 나중에 채움 */
    destination: (videoUuid: string) => `/api/videos/${videoUuid}/destination` as const,
  },
} as const;
