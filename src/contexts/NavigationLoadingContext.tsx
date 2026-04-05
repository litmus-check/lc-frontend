"use client";

import React, { createContext, useContext, ReactNode } from "react";

type SetNavigationLoading = (loading: boolean) => void;

const NavigationLoadingContext = createContext<SetNavigationLoading | undefined>(undefined);

export function NavigationLoadingProvider({
  value,
  children,
}: {
  value: SetNavigationLoading;
  children: ReactNode;
}) {
  return (
    <NavigationLoadingContext.Provider value={value}>
      {children}
    </NavigationLoadingContext.Provider>
  );
}

export function useNavigationLoading(): SetNavigationLoading | undefined {
  return useContext(NavigationLoadingContext);
}
