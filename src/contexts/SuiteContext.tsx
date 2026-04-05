"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface SuiteContextValue {
  suite: any | null;
  suiteLoading: boolean;
  suiteError: string | null;
  setSuite: (data: any | null) => void;
  setSuiteLoading: (loading: boolean) => void;
  setSuiteError: (error: string | null) => void;
}

const SuiteContext = createContext<SuiteContextValue | undefined>(undefined);

interface SuiteProviderProps {
  children: ReactNode;
  /** Initial suite from server (RSC fetch) - avoids client fetch */
  initialSuite?: any | null;
  initialError?: string | null;
}

export function SuiteProvider({ children, initialSuite = null, initialError = null }: SuiteProviderProps) {
  const [suite, setSuite] = useState<any | null>(initialSuite);
  const [suiteLoading, setSuiteLoading] = useState(false);
  const [suiteError, setSuiteError] = useState<string | null>(initialError);

  // Sync when server passes new data (e.g. navigation to another suite)
  useEffect(() => {
    setSuite(initialSuite);
    setSuiteError(initialError);
  }, [initialSuite, initialError]);

  return (
    <SuiteContext.Provider
      value={{
        suite,
        suiteLoading,
        suiteError,
        setSuite,
        setSuiteLoading,
        setSuiteError,
      }}
    >
      {children}
    </SuiteContext.Provider>
  );
}

export function useSuite() {
  const ctx = useContext(SuiteContext);
  if (ctx === undefined) {
    throw new Error("useSuite must be used within a SuiteProvider");
  }
  return ctx;
}
