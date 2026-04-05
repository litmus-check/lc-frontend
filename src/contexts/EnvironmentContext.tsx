"use client";
import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Environment, getEnvironmentsBySuiteAPI } from '@/lib/apis/testAI/environments';
import { getStoredEnvironment, setStoredEnvironment, extractErrorMessage } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { message } from 'antd';

interface EnvironmentContextType {
  selectedEnvironment: Environment | null;
  setSelectedEnvironment: (environment: Environment | null) => void;
  environments: Environment[];
  setEnvironments: (environments: Environment[]) => void;
  environmentsLoading: boolean;
  setEnvironmentsLoading: (loading: boolean) => void;
  triggerRefresh: () => void;
  suiteId: string | null;
  setSuiteId: (suiteId: string | null) => void;
}

const EnvironmentContext = createContext<EnvironmentContextType | undefined>(undefined);

interface EnvironmentProviderProps {
  children: ReactNode;
  /** Initial environments from server (RSC fetch) - avoids client fetch on mount */
  initialEnvironments?: Environment[] | null;
  /** Initial suite id from server - avoids client having to set it */
  initialSuiteId?: string | null;
}

export const EnvironmentProvider: React.FC<EnvironmentProviderProps> = ({
  children,
  initialEnvironments = null,
  initialSuiteId = null,
}) => {
  const [selectedEnvironment, setSelectedEnvironmentState] = useState<Environment | null>(null);
  const [environments, setEnvironments] = useState<Environment[]>(initialEnvironments ?? []);
  const [environmentsLoading, setEnvironmentsLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [suiteId, setSuiteId] = useState<string | null>(initialSuiteId);
  const hasServerEnvironmentsRef = useRef(initialEnvironments != null);
  const { getToken } = useAuth();

  // Sync when server passes new data (e.g. navigation to another suite)
  useEffect(() => {
    if (initialSuiteId != null) setSuiteId(initialSuiteId);
  }, [initialSuiteId]);
  useEffect(() => {
    if (initialEnvironments != null) setEnvironments(initialEnvironments);
    hasServerEnvironmentsRef.current = initialEnvironments != null;
  }, [initialEnvironments]);

  // Fetch environments when suiteId changes (client-side refetch only when no server data or refresh)
  const fetchEnvironments = async () => {
    if (!suiteId) return;
    
    try {
      setEnvironmentsLoading(true);
      const token = await getToken({ template: "basic" });
      if (!token) {
        setEnvironmentsLoading(false);
        return;
      }

      const response = await getEnvironmentsBySuiteAPI(token, suiteId);
      if (response.status === 200) {
        const environments = response.data.environments || [];
        setEnvironments(environments);
      } else {
        message.error(extractErrorMessage(response));
      }
    } catch (error: any) {
      message.error(extractErrorMessage(error));
    } finally {
      setEnvironmentsLoading(false);
    }
  };

  // Fetch environments only when no server data or when refresh is triggered
  useEffect(() => {
    if (suiteId && (!hasServerEnvironmentsRef.current || refreshTrigger > 0)) {
      fetchEnvironments();
    }
  }, [suiteId, refreshTrigger]);

  // Load stored environment when environments are loaded
  useEffect(() => {
    if (suiteId && environments.length > 0) {
      const storedEnvId = getStoredEnvironment(suiteId);
      if (storedEnvId && storedEnvId !== 'no-environment') {
        const environment = environments.find(env => env.environment_id === storedEnvId);
        if (environment) {
          setSelectedEnvironmentState(environment);
        } else {
          // If stored environment is not found in current environments, clear it
          setStoredEnvironment(suiteId, null);
          setSelectedEnvironmentState(null);
        }
      } else {
        setSelectedEnvironmentState(null);
      }
    }
  }, [suiteId, environments]);

  const setSelectedEnvironment = (environment: Environment | null) => {
    setSelectedEnvironmentState(environment);
    if (suiteId) {
      setStoredEnvironment(suiteId, environment?.environment_id || null);
    }
  };

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <EnvironmentContext.Provider 
      value={{ 
        selectedEnvironment, 
        setSelectedEnvironment,
        environments,
        setEnvironments,
        environmentsLoading,
        setEnvironmentsLoading,
        triggerRefresh,
        suiteId,
        setSuiteId
      }}
    >
      {children}
    </EnvironmentContext.Provider>
  );
};

export const useEnvironment = () => {
  const context = useContext(EnvironmentContext);
  if (context === undefined) {
    throw new Error('useEnvironment must be used within an EnvironmentProvider');
  }
  return context;
};

