export const ROUTES = {
  home: "/home",
  intro: "/",
  login: "/login",
  signup: "/signup",
  signupProfile: "/signup/profile",
  signupSocialTerms: "/signup/social-terms",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  create: "/create",
  topicPreview: "/topic-preview",
  diary: {
    root: "/diary",
    date: (date: string) => `/diary/${date}` as const,
    themes: {
      root: "/diary/themes",
      detail: (themeId: string) => `/diary/themes/${themeId}` as const,
    },
  },
  agit: {
    root: "/agit",
    create: "/agit/create",
    createSettings: "/agit/create/settings",
    detail: (agitId: string) => `/agit/${agitId}` as const,
    enter: (agitId: string) => `/agit/${agitId}/enter` as const,
    invite: (agitId: string) => `/agit/${agitId}/invite` as const,
    profile: (agitId: string) => `/agit/${agitId}/profile` as const,
    profileEdit: (agitId: string) => `/agit/${agitId}/profile/edit` as const,
    joined: (agitId: string) => `/agit/${agitId}/joined` as const,
    members: (agitId: string) => `/agit/${agitId}/members` as const,
    topics: (agitId: string) => `/agit/${agitId}/topics` as const,
    topicCreate: (agitId: string) => `/agit/${agitId}/topics/create` as const,
    topicFeed: (agitId: string, topicId?: string) =>
      (topicId
        ? `/agit/${agitId}/feed?topic=${encodeURIComponent(topicId)}`
        : `/agit/${agitId}/feed`) as const,
    topicDetail: (agitId: string, topicId: string) =>
      `/agit/${agitId}/topics/${topicId}` as const,
    topicEdit: (agitId: string, topicId: string) =>
      `/agit/${agitId}/topics/${topicId}/edit` as const,
    manage: (agitId: string) => `/agit/${agitId}/manage` as const,
    calendar: (agitId: string) => `/agit/${agitId}/calendar` as const,
    upload: (agitId: string) => `/agit/${agitId}/upload` as const,
    safety: (agitId: string) => `/agit/${agitId}/safety` as const,
    chat: (agitId: string) => `/agit/${agitId}/chat` as const,
    poll: (agitId: string) => `/agit/${agitId}/chat/poll` as const,
    pollEdit: (agitId: string) => `/agit/${agitId}/chat/poll/edit` as const,
    search: "/agit/search",
    join: (code: string) => `/agit/join/${encodeURIComponent(code)}` as const,
    joinProfile: (code: string) => `/agit/join/${encodeURIComponent(code)}/profile` as const,
  },
  viewer: {
    clip: (clipId: string) => `/viewer/${clipId}` as const,
    edit: (clipId: string) => `/viewer/${clipId}/edit` as const,
  },
  shop: {
    root: "/shop",
    item: (itemId: string) => `/shop/items/${itemId}` as const,
    purchase: (itemId: string) => `/shop/items/${itemId}/purchase` as const,
    charge: "/shop/charge",
    wishlist: "/shop/wishlist",
    myItems: "/shop/my-items",
    points: "/shop/points",
    refund: "/shop/refund",
    refundHistory: "/shop/refund/history",
  },
  mypage: {
    root: "/mypage",
    profile: "/mypage/profile",
    password: "/mypage/profile/password",
    notifications: "/mypage/notifications",
    settings: "/mypage/settings",
  },
  /** plip-video Phase 0-F — user-app 본 UI와 분리 (route group `(capture)`) */
  capture: {
    video: "/video",
    videoApi: "/video-api",
  },
} as const;
