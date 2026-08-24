"use client";

import { createContext, useContext, type ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";

type AuthStatus = {
  isLoggedIn: boolean;
};

const AuthStatusContext = createContext<AuthStatus>({ isLoggedIn: false });

type AuthSessionProviderProps = {
  isLoggedIn: boolean;
  session: Session | null;
  children: ReactNode;
};

export function AuthSessionProvider({ isLoggedIn, session, children }: AuthSessionProviderProps) {
  return (
    <SessionProvider session={session}>
      <AuthStatusContext.Provider value={{ isLoggedIn }}>{children}</AuthStatusContext.Provider>
    </SessionProvider>
  );
}

export function useAuthStatus(): AuthStatus {
  return useContext(AuthStatusContext);
}
