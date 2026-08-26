import { auth } from "@/auth";
import {
  FORWARDED_ACCESS_TOKEN_HEADER,
  FORWARDED_REFRESH_TOKEN_HEADER,
  FORWARDED_USER_UUID_HEADER,
} from "@/lib/auth/forwarded-auth-headers";
import { NextResponse } from "next/server";

export default auth((req) => {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.delete(FORWARDED_ACCESS_TOKEN_HEADER);
  requestHeaders.delete(FORWARDED_REFRESH_TOKEN_HEADER);
  requestHeaders.delete(FORWARDED_USER_UUID_HEADER);

  const accessToken = req.auth?.accessToken;
  const refreshToken = req.auth?.refreshToken;
  const userUuid = req.auth?.userUuid;

  if (typeof accessToken === "string" && accessToken.length > 0) {
    requestHeaders.set(FORWARDED_ACCESS_TOKEN_HEADER, accessToken);
  }
  if (typeof refreshToken === "string" && refreshToken.length > 0) {
    requestHeaders.set(FORWARDED_REFRESH_TOKEN_HEADER, refreshToken);
  }
  if (typeof userUuid === "string" && userUuid.length > 0) {
    requestHeaders.set(FORWARDED_USER_UUID_HEADER, userUuid);
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|plip).*)"],
};
