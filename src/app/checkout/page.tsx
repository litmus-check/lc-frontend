"use client";
import * as React from "react";
import Link from "next/link";
import { Button, Spin, message } from "antd";
import Header from "@/components/Header/Header";
import FooterWebsite from "@/components/Footer/Footer";
import MaxWidthWrapper from "@/components/MaxWidthWrapper/MaxWidthWrapper";
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/contexts/UserContext";
import { getOrgSubscriptionAPI } from "@/lib/apis/billing/billing";
import { getCurrentActiveUserAPI } from "@/lib/apis/documentAI/user";

export default function CheckoutPage() {
  const [checking, setChecking] = React.useState(false);
  const [active, setActive] = React.useState(false);
  const [loadingUser, setLoadingUser] = React.useState(false);
  const [userDetails, setUserDetails] = React.useState<any>(null);
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { currentUserDetails } = useUser();

  // Fetch user details if not available from context
  React.useEffect(() => {
    let isMounted = true;
    const fetchUser = async () => {
      if (currentUserDetails) {
        setUserDetails(currentUserDetails);
        return;
      }
      if (!isLoaded || !isSignedIn) return;
      
      try {
        setLoadingUser(true);
        const token = await getToken({ template: "basic" });
        if (!token) {
          setUserDetails(null);
          return;
        }
        const res = await getCurrentActiveUserAPI(token);
        if (!isMounted) return;
        if (res?.status === 200) {
          setUserDetails(res.data);
        } else {
          setUserDetails(null);
        }
      } catch (e) {
        if (!isMounted) return;
        setUserDetails(null);
      } finally {
        if (isMounted) setLoadingUser(false);
      }
    };
    fetchUser();
    return () => { isMounted = false; };
  }, [currentUserDetails]);

  const handleRefresh = async () => {
    try {
      setChecking(true);
      const finalUserDetails = userDetails || currentUserDetails;
      const orgId = finalUserDetails?.org_id;
      const token = await getToken({ template: "basic" });
      if (!orgId || !token) {
        setChecking(false);
        return;
      }
      const res = await getOrgSubscriptionAPI(token, orgId);
      const firstSub = Array.isArray(res?.data?.subscriptions) ? res.data.subscriptions[0] : null;
      if (res?.status === 200 && firstSub?.subscription_id) {
        setActive(true);
      }
    } catch (e: any) {
      // As requested, do not handle failure; silently ignore
    } finally {
      setChecking(false);
    }
  };

  // Show spinner while loading user details
  if (loadingUser || (!currentUserDetails && !userDetails && isLoaded && isSignedIn)) {
    return (
      <>
        <Header />
        <MaxWidthWrapper className="py-12 px-4 md:px-10 font-hanken">
          <div className="max-w-3xl mx-auto flex justify-center items-center py-10">
            <Spin />
          </div>
        </MaxWidthWrapper>
        <FooterWebsite />
      </>
    );
  }

  return (
    <>
      <Header />
      <MaxWidthWrapper className="py-12 px-4 md:px-10 font-hanken">
        <div className="max-w-3xl mx-auto">
          {!active ? (
            <div className="flex flex-col items-center text-center gap-6">
              <p className="text-gray-800">
                Please complete the payment on the new page. It might take a few minutes for the subscription to activate. If you do not see it after making the payment, contact us at contact@litmuscheck.com
              </p>
              <div className="flex items-center gap-4">
                <Button type="primary" className="text-white py-2 px-6 rounded-md" onClick={handleRefresh} >
                  Refresh
                </Button>
                <Link href="/dashboard/suite" className="bg-[#4542CC] text-white py-1 px-6 rounded-md">
                  Go to dashboard
                </Link>
              </div>
              {checking && (
                <div className="pt-4"><Spin /></div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center text-center gap-6">
              <div className="text-green-700 text-base">Subscription active!</div>
              <Link href="/dashboard/suite" className="bg-[#4542CC] text-white py-2 px-6 rounded-md">
                Go to dashboard
              </Link>
            </div>
          )}
        </div>
      </MaxWidthWrapper>
      <FooterWebsite />
    </>
  );
}


