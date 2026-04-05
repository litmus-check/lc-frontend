"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface AnalyticsHeaderContextType {
    setHeaderAction: (action: ReactNode) => void;
    headerAction: ReactNode;
}

const AnalyticsHeaderContext = createContext<AnalyticsHeaderContextType | undefined>(undefined);

export function AnalyticsHeaderProvider({ children }: { children: ReactNode }) {
    const [headerAction, setHeaderAction] = useState<ReactNode>(null);

    return (
        <AnalyticsHeaderContext.Provider value={{ setHeaderAction, headerAction }}>
            {children}
        </AnalyticsHeaderContext.Provider>
    );
}

export function useAnalyticsHeader() {
    const context = useContext(AnalyticsHeaderContext);
    if (context === undefined) {
        throw new Error("useAnalyticsHeader must be used within an AnalyticsHeaderProvider");
    }
    return context;
}
