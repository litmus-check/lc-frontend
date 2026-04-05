"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { Spin } from "antd";
import Header from "@/components/AgentHeader/Header";
import MaxWidthWrapper from "@/components/MaxWidthWrapper/MaxWidthWrapper";
import "@/styles/globals.css";

export default function DashboardPage() {
  const { getToken, isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    document.title = "Dashboard - Litmus Check";
  }, []);

  useEffect(() => {
    if (isAuthLoaded && isSignedIn) {
      const checkAuth = async () => {
        const token = await getToken({ template: "basic" });
        if (!token) {
          router.push('/sign-in');
        }
      };
      checkAuth();
    }
  }, [isAuthLoaded, isSignedIn, getToken, router]);

  const handleQualityClick = () => {
    router.push('/dashboard/suite');
  };

  // Show loading if auth is not ready
  const isLoading = !isAuthLoaded;

  return isLoading ? (
    <div className="flex justify-center items-center h-screen">
      <Spin />
    </div>
  ) : (
    <>
      <Header />
      <div className="flex w-full min-h-[calc(100vh-64px)] bg-[#F8F8FF]">
        <MaxWidthWrapper className="py-10 px-3.5 md:px-10 w-full">
          <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
            {/* Quality Block */}
            <div
              onClick={handleQualityClick}
              className="bg-white rounded-lg shadow-md p-8 cursor-pointer hover:shadow-lg transition-shadow duration-300 border border-gray-200"
            >
              <h2 className="text-2xl font-bold font-hanken text-[#4542CC] mb-4">
                Quality
              </h2>
              <p className="text-gray-600 font-hanken">
                Manage your test suites and quality assurance workflows
              </p>
            </div>
          </div>
        </MaxWidthWrapper>
      </div>
    </>
  );
}

