import type { DefaultSession } from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    isLoggedIn: boolean;
    accessToken?: string;
    refreshToken?: string;
    userUuid?: string;
    user?: DefaultSession["user"];
  }

  interface User {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpiresAt?: number;
    userUuid?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpiresAt?: number;
    userUuid?: string;
  }
}
