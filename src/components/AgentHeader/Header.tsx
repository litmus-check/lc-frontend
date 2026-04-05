"use client";
import React, { FC, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import MaxWidthWrapper from "@/components/MaxWidthWrapper/MaxWidthWrapper";
import { EditTwoTone } from "@ant-design/icons";
import { useAuth } from "@/contexts/AuthContext";
import { AuthUserMenu } from "@/components/AuthUserMenu/AuthUserMenu";
import { Input, Button, Segmented, message, Spin } from "antd";
import { useUser as useUserContext } from "@/contexts/UserContext";
import { useNavigationLoading } from "@/contexts/NavigationLoadingContext";
import { getCreditsAPI } from "@/lib/apis/documentAI/user";
import { getOrgSubscriptionAPI } from "@/lib/apis/billing/billing";
import { HomeOutlined } from "@ant-design/icons";
import "@/styles/globals.css";
interface HeaderProps {
  title?: string;
  setTitle?: any;
  handleSave?: any;
  handleRunAgent?: any;
  currentUserDetails?: any;
  setCurrentUserDetails?: any;
  currTab?: string;
  setCurrTab?: any;
  type?: string
}

const Header: FC<HeaderProps> = ({currTab, setCurrTab, title, setTitle, handleSave, type }) => {
  const { isSignedIn, isLoaded } = useAuth();
  const { currentUserDetails } = useUserContext();
  const setNavigationLoading = useNavigationLoading();
  const onNavClick = () => setNavigationLoading?.(true);
  const [isFocus, setIsFocus] = useState(false);
  const [didUpdate, setDidUpdate] = useState(false);
  const [creditsLoading, setCreditsLoading] = useState(false);
  const [creditsData, setCreditsData] = useState<any>(null);
  const [creditsOpen, setCreditsOpen] = useState(false);
  const [showPlans, setShowPlans] = useState(false);
  const { getToken } = useAuth();

  // Close credits drawer when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (creditsOpen && !target.closest('[data-credits-drawer]') && !target.closest('[data-credits-button]')) {
        setCreditsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [creditsOpen]);

  // Fetch subscriptions to determine if Plans link should be shown
  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!isSignedIn || !isLoaded || !currentUserDetails?.org_id) {
        setShowPlans(false);
        return;
      }

      try {
        const token = await getToken({ template: "basic" });
        if (!token) {
          setShowPlans(false);
          return;
        }

        const res = await getOrgSubscriptionAPI(token, currentUserDetails.org_id);
        const subscriptions = Array.isArray(res?.data?.subscriptions) ? res.data.subscriptions : [];
        
        if (subscriptions.length === 0 || !subscriptions[0] || subscriptions[0].status === 'inactive') {
          setShowPlans(true);
        } else {
          setShowPlans(false);
        }
      } catch (error) {
        // On error, default to showing Plans
        setShowPlans(true);
      }
    };

    fetchSubscriptions();
  }, [isSignedIn, isLoaded, currentUserDetails?.org_id, getToken]);


  useEffect(() => {
    const timer = setTimeout(() => {
      if(type==='update' && didUpdate)
        handleSave();
    }, 500);

    return () => clearTimeout(timer);
  }, [title]);


  return (
    <header
      style={{
        position: "sticky",
        top: "0px",
        height: "60px",
        zIndex: "20",
        backgroundColor: "#4542CC",
        borderBottom: "1px solid #E5E5E5",
      }}
      data-testid="agent-header"
    >
      <MaxWidthWrapper className="h-full px-10">
        <div className="flex justify-between items-center font-hanken w-full h-full">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {isSignedIn && (
                <Link
                  href="/dashboard/suite"
                  className="flex items-center gap-1 font-hanken text-white font-medium text-[17px] p-0 h-auto font-semibold"
                  data-testid="agent-header-logo-link"
                  onClick={onNavClick}
                >
                  <Image
                    src="/assets/signedin-litmus.svg"
                    alt="LitmusCheck"
                    height={20}
                    width={20}
                    style={{ minWidth: "25px", minHeight: "25px", objectFit: "contain" }}
                    className="flex-shrink-0"
                  />
                  <span>LitmusCheck</span>
                </Link>
              )}
            </div>
            {isSignedIn && (
              <Link 
                href="/dashboard/suite"
                data-testid="agent-header-home-link"
                onClick={onNavClick}
              >
                <HomeOutlined className="text-white text-[17px]" />
              </Link>
            )}
          </div>
          
          <div className="flex justify-end gap-5 font-hanken w-full items-center" data-testid="agent-header-nav">
           

            <AuthUserMenu />
          </div>
        </div>
      </MaxWidthWrapper>
      
     
    </header>
  );
};

export default Header;
