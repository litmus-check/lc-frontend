"use client";
import React, { FC, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import MaxWidthWrapper from "@/components/MaxWidthWrapper/MaxWidthWrapper";
import { useAuth } from "@/contexts/AuthContext";
import { AuthUserMenu } from "@/components/AuthUserMenu/AuthUserMenu";
import { Button, message, Spin, Select } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import { useUser as useAppUser } from "@/contexts/UserContext";
import { getCreditsAPI } from "@/lib/apis/documentAI/user";
import { Environment } from "@/lib/apis/testAI/environments";
import { extractErrorMessage } from "@/lib/utils";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { useNavigationLoading } from "@/contexts/NavigationLoadingContext";
import { getTestSuiteAPI } from "@/lib/apis/testAI/test";
import "@/styles/globals.css";

interface SuiteHeaderProps {
  suiteName?: string;
  suiteId: string;
}

const SuiteHeader: FC<SuiteHeaderProps> = ({ 
  suiteName: suiteNameProp, 
  suiteId
}) => {
  const { isSignedIn, getToken } = useAuth();
  const { currentUserDetails } = useAppUser();
  const setNavigationLoading = useNavigationLoading();
  const [fetchedSuiteName, setFetchedSuiteName] = useState<string | null>(null);
  const [suiteNameLoading, setSuiteNameLoading] = useState(false);
  const suiteName = suiteNameProp ?? fetchedSuiteName ?? "Loading...";
  const onNavClick = () => setNavigationLoading?.(true);

  const [creditsLoading, setCreditsLoading] = useState(false);
  const [creditsData, setCreditsData] = useState<any>(null);
  const [creditsOpen, setCreditsOpen] = useState(false);
  const { 
    selectedEnvironment, 
    setSelectedEnvironment,
    environments,
    environmentsLoading,
    triggerRefresh
  } = useEnvironment();
  // Fetch suite name when only suiteId is provided (e.g. test page, compose page)
  useEffect(() => {
    if (!suiteId || suiteNameProp != null) return;
    let cancelled = false;
    const fetchSuite = async () => {
      setSuiteNameLoading(true);
      try {
        const token = await getToken({ template: "basic" });
        if (!token || cancelled) return;
        const response = await getTestSuiteAPI(token, suiteId);
        if (response.status === 200 && response.data?.name && !cancelled) {
          setFetchedSuiteName(response.data.name);
        }
      } catch {
        if (!cancelled) setFetchedSuiteName("Suite");
      } finally {
        if (!cancelled) setSuiteNameLoading(false);
      }
    };
    fetchSuite();
    return () => { cancelled = true; };
  }, [suiteId, suiteNameProp, getToken]);

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

  const handleCreditsClicked = async () => {
    setCreditsOpen(!creditsOpen);
    if (!creditsData) {
      await getCredits();
    }
  };


  async function getCredits() {
    setCreditsLoading(true);
    const token = await getToken({ template: "basic" });
    if (!token) {
      setCreditsLoading(false);
      return;
    }
    try {
      const response = await getCreditsAPI(token);

      if (response.status === 200) {
        setCreditsData(response.data);
        setCreditsLoading(false);
      } else {
        setCreditsLoading(false);
        message.error("There was an error fetching credits");
      }
    } catch (error: any) {
      setCreditsLoading(false);
      message.error("Failed to fetch credits");
    }
  }

  const handleEnvironmentChange = (value: string) => {
    if (value === 'no-environment') {
      setSelectedEnvironment(null);
    } else {
      const environment = environments.find(env => env.environment_id === value);
      if (environment) {
        setSelectedEnvironment(environment);
      }
    }
  };

  // Prepare environment options
  const environmentOptions = [
    {
      value: 'no-environment',
      label: 'No environment',
      disabled: false,
    },
    ...environments.map(env => ({
      value: env.environment_id,
      label: env.environment_name,
      disabled: false,
    }))
  ];

  const currentEnvironmentValue = selectedEnvironment?.environment_id || 'no-environment';

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
    >
      <MaxWidthWrapper className="h-full px-10">
        <div className="flex justify-between items-center font-hanken w-full h-full">
          {/* Left side - Logo and Breadcrumb */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-shrink-0">
              {isSignedIn && (
                <Link
                  href="/dashboard/suite"
                  className="flex items-center gap-1 font-hanken text-white font-medium text-[17px] p-0 h-auto font-semibold"
                  data-testid="suite-header-logo-link"
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
            
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-white flex-1 min-w-0">
              <Link 
                href="/dashboard/suite"
                className="font-hanken text-white font-medium text-[17px] hover:text-gray-200 flex items-center"
                onClick={onNavClick}
              >
                <HomeOutlined className="text-white text-[17px]" />
              </Link>
              <span className="font-hanken text-white font-medium text-[17px]">&gt;</span>
              <Link 
                href={`/dashboard/suite/${suiteId}`}
                className="font-hanken text-white font-medium text-[17px] hover:text-gray-200"
                onClick={onNavClick}
              >
                {suiteName}
              </Link>
              
              {/* Environment Dropdown */}
              <Select
                value={currentEnvironmentValue}
                onChange={handleEnvironmentChange}
                loading={environmentsLoading}
                className="ml-4 min-w-[150px]"
                options={environmentOptions}
                placeholder="Select environment"
                style={{
                  width: 'auto',
                  minWidth: '150px'
                }}
                styles={{
                  popup: {
                    root: {
                      backgroundColor: 'white',
                      color: 'black'
                    }
                  }
                }}
              />
            </div>
          </div>
          
          {/* Right side - Navigation and User */}
          <div className="flex justify-end gap-5 font-hanken items-center flex-shrink-0">
            {isSignedIn && (
              <div className="hidden lg:flex gap-10 items-center">
                <div className="flex items-center gap-10 mr-5">
                  {currentUserDetails?.role === "admin" && (
                    <Link href="/organizations" onClick={onNavClick}>
                      <span className="font-hanken text-white font-medium text-[17px]">
                        ADMIN
                      </span>
                    </Link>
                  )}
                  
                  <Link href="/settings" onClick={onNavClick}>
                    <span className="font-hanken text-white font-medium text-[17px]">
                      SETTINGS
                    </span>
                  </Link>
                  <button
                    onClick={handleCreditsClicked}
                    className="font-hanken text-white font-medium text-[17px] flex items-center gap-2"
                    data-credits-button
                  >
                    <Image
                      src="/assets/credits-icon.svg"
                      alt="Credits icon"
                      height={16}
                      width={16}
                    />
                    CREDITS
                  </button>
                </div>
              </div>
            )}

            <AuthUserMenu />
          </div>
        </div>
      </MaxWidthWrapper>
      
      {/* Credits Drawer */}
      {creditsOpen && (
        <div
          data-credits-drawer
          style={{
            position: "absolute",
            backgroundColor: "white",
            borderRadius: "6px",
            top: "60px",
            width: "520px",
            right: "20px",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            padding: "10px",
            zIndex: 1000,
          }}
        >
          {creditsLoading ? (
            <div className="flex justify-center items-center p-4">
              <Spin />
            </div>
          ) : creditsData ? (
            <div>
              <div className="space-y-2">
                <p className="flex gap-1 font-hanken font-medium">
                  <span>AI Credits: {creditsData?.ai_credits || 0}</span>
                </p>
                <p className="flex gap-1 font-hanken font-medium">
                  <span>Browser Minutes: {creditsData?.browser_minutes || 0}</span>
                </p>
              </div>
              <p className="font-hanken font-medium mt-3">
                Your usage limit resets every month. To get more,{" "}
                <span
                  className="text-[#4542CC] cursor-pointer"
                  onClick={() => {
                    navigator.clipboard.writeText("contact@litmuscheck.com");
                    message.success("Contact email copied to clipboard!");
                  }}
                >
                  contact us
                </span>
                .{" "}
              </p>
            </div>
          ) : (
            <div className="p-4">
              <p className="font-hanken font-medium text-gray-500">
                Failed to load credits
              </p>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default SuiteHeader;
