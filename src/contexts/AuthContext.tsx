"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ACCESS_TOKEN_COOKIE, DEFAULT_SESSION_MAX_AGE } from "@/lib/auth/constants";

export type GetTokenOptions = { template?: string };

type AuthContextValue = {
  isLoaded: boolean;
  isSignedIn: boolean;
  getToken: (options?: GetTokenOptions) => Promise<string | null>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  setSessionToken: (token: string) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

  const getCookieToken = useCallback((): string | null => {
    if (typeof document === "undefined") return null;
    const cookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${ACCESS_TOKEN_COOKIE}=`));
    if (!cookie) return null;
    return decodeURIComponent(cookie.split("=")[1] ?? "");
  }, []);

  const setSessionToken = useCallback((token: string) => {
    const maxAge = Number(
      process.env.NEXT_PUBLIC_AUTH_SESSION_MAX_AGE ?? DEFAULT_SESSION_MAX_AGE
    );
    document.cookie = `${ACCESS_TOKEN_COOKIE}=${encodeURIComponent(
      token
    )}; path=/; max-age=${
      Number.isFinite(maxAge) ? maxAge : DEFAULT_SESSION_MAX_AGE
    }; samesite=lax`;
    setIsSignedIn(true);
  }, []);

  const refreshSession = useCallback(async () => {
    const token = getCookieToken();
    setIsSignedIn(Boolean(token));
    setIsLoaded(true);
  }, [getCookieToken]);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const getToken = useCallback(async (_options?: GetTokenOptions) => {
    return getCookieToken();
  }, [getCookieToken]);

  const signOut = useCallback(async () => {
    document.cookie = `${ACCESS_TOKEN_COOKIE}=; path=/; max-age=0; samesite=lax`;
    setIsSignedIn(false);
  }, []);

  const value = useMemo(
    () => ({
      isLoaded,
      isSignedIn,
      getToken,
      signOut,
      refreshSession,
      setSessionToken,
    }),
    [isLoaded, isSignedIn, getToken, signOut, refreshSession, setSessionToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
