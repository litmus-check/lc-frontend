"use client";
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getCurrentActiveUserAPI } from '@/lib/apis/documentAI/user';
import { message } from 'antd';

interface UserContextType {
  currentUserDetails: any;
  setCurrentUserDetails: (user: any) => void;
  userLoading: boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUserDetails, setCurrentUserDetails] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(true);
  const { getToken, isLoaded: isAuthLoaded, isSignedIn } = useAuth();

  const fetchUserDetails = useCallback(async () => {
    try {
      setUserLoading(true);
      const token = await getToken({ template: "basic" });
      if (!token) {
        setCurrentUserDetails(null);
        setUserLoading(false);
        return;
      }

      const response = await getCurrentActiveUserAPI(token);
      if (response.status === 200) {
        setCurrentUserDetails(response.data);
      } else {
        message.error("Could not fetch user details");
        setCurrentUserDetails(null);
      }
    } catch (error: any) {
      message.error('Something went wrong when fetching user details');
      setCurrentUserDetails(null);
    } finally {
      setUserLoading(false);
    }
  }, [getToken]);

  const refreshUser = useCallback(async () => {
    await fetchUserDetails();
  }, [fetchUserDetails]);

  useEffect(() => {
    // Wait for auth to be ready before fetching user details
    if (!isAuthLoaded) {
      return;
    }

    // Only fetch if user is authenticated
    if (isSignedIn) {
      fetchUserDetails();
    } else {
      // User is not authenticated, stop loading and clear user details
      setUserLoading(false);
      setCurrentUserDetails(null);
    }
  }, [isAuthLoaded, isSignedIn, fetchUserDetails]);

  return (
    <UserContext.Provider 
      value={{ 
        currentUserDetails, 
        setCurrentUserDetails,
        userLoading,
        refreshUser
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
