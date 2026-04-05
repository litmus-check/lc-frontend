"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Spin } from "antd";
import { NavigationLoadingProvider } from "@/contexts/NavigationLoadingContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [navigationLoading, setNavigationLoading] = useState(false);
  const pathname = usePathname();
  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  return (
    <NavigationLoadingProvider value={setNavigationLoading}>
      {navigationLoading && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-white/80"
          aria-label="Loading"
        >
          <Spin />
        </div>
      )}
      {children}
    </NavigationLoadingProvider>
  );
}
