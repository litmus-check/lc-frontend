"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Spin, message } from "antd";
import SuiteHeader from "@/components/SuiteHeader/SuiteHeader";
import { EnvironmentProvider } from "@/contexts/EnvironmentContext";
import { SuiteProvider } from "@/contexts/SuiteContext";
import { NavigationLoadingProvider } from "@/contexts/NavigationLoadingContext";
import type { Environment } from "@/lib/apis/testAI/environments";

type ServerError = {
  message: string;
  status?: number;
  payload?: any;
};

interface SuiteLayoutClientProps {
  suiteId: string;
  initialSuiteData: any | null;
  initialError: string | null;
  initialErrors?: {
    suite?: ServerError | null;
    environments?: ServerError | null;
  };
  initialEnvironments: Environment[];
  children: React.ReactNode;
}

function SuiteLayoutContent({
  suiteId,
  initialSuiteData,
  initialError,
  initialErrors,
  initialEnvironments,
  children,
}: SuiteLayoutClientProps) {
  const { isLoaded: isAuthReady } = useAuth();
  const [navigationLoading, setNavigationLoading] = useState(false);
  const pathname = usePathname();
  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  // Clear spinner only after a short delay so the new route has time to render.
  useEffect(() => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    const delay = 400;
    const t = setTimeout(() => {
      setNavigationLoading(false);
    }, delay);
    return () => clearTimeout(t);
  }, [pathname]);

  // When loading is set to true, start a fallback timeout so that clicking the
  // same route doesn't show the spinner forever (pathname won't change).
  useEffect(() => {
    if (!navigationLoading) return;
    if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    loadingTimeoutRef.current = setTimeout(() => {
      setNavigationLoading(false);
      loadingTimeoutRef.current = null;
    }, 25000);
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    };
  }, [navigationLoading]);

  useEffect(() => {
    if (initialErrors?.suite?.message) {
      messageApi.error(initialErrors.suite.message);
    }
    if (initialErrors?.environments?.message) {
      messageApi.error(`Environments: ${initialErrors.environments.message}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <NavigationLoadingProvider value={setNavigationLoading}>
      {contextHolder}
      {navigationLoading && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-white/80"
          aria-label="Loading"
        >
          <Spin />
        </div>
      )}
      {isAuthReady ? (
        <SuiteHeader
          suiteName={initialSuiteData?.name ?? "Loading..."}
          suiteId={suiteId}
        />
      ) : (
        <header
          style={{
            height: "60px",
            position: "sticky",
            top: "0px",
            zIndex: "20",
            backgroundColor: "#4542CC",
            borderBottom: "1px solid #E5E5E5",
          }}
        />
      )}
      {initialError && !initialSuiteData && (
        <div className="mx-6 mt-4">
          <div className="text-red-600 font-hanken">{initialError}</div>
        </div>
      )}
      {children}
    </NavigationLoadingProvider>
  );
}

export default function SuiteLayoutClient({
  suiteId,
  initialSuiteData,
  initialError,
  initialErrors,
  initialEnvironments,
  children,
}: SuiteLayoutClientProps) {
  return (
    <EnvironmentProvider
      initialSuiteId={suiteId}
      initialEnvironments={initialEnvironments}
    >
      <SuiteProvider initialSuite={initialSuiteData} initialError={initialError}>
        <SuiteLayoutContent
          suiteId={suiteId}
          initialSuiteData={initialSuiteData}
          initialError={initialError}
          initialErrors={initialErrors}
          initialEnvironments={initialEnvironments}
        >
          {children}
        </SuiteLayoutContent>
      </SuiteProvider>
    </EnvironmentProvider>
  );
}
