"use client";
import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { getPlansAPI } from "@/lib/apis/billing/billing";
import { Spin, message } from "antd";
import { createCheckoutAPI } from "@/lib/apis/billing/billing";
import { useAuth } from "@/contexts/AuthContext";
import { getCurrentActiveUserAPI } from "@/lib/apis/documentAI/user";
import { useRouter } from "next/navigation";

function formatCurrency(currency: string | undefined, amount: number | undefined, frequency: string | undefined): { price: string; period: string } | null {
  if (amount === null || amount === undefined) return null;
  if (amount === 0) return null;
  const symbol = currency === "USD" ? "$" : "";
  const per = frequency === "monthly" ? "/month" : frequency ? ` / ${frequency}` : "";
  return { price: `${symbol}${amount}`, period: per };
}

type Plan = {
  ai_credits?: number;
  browser_minutes?: number;
  currency?: string;
  extra_ai_credit_price?: number;
  extra_browser_price?: number;
  features?: string[];
  frequency?: string;
  plan_id?: string;
  plan_name?: string;
  price?: number;
  team_size?: number;
  parallel_execution?: number;
};

// Helper to format browser minutes for display
function formatBrowserMinutesDisplay(minutes: number | undefined): string {
  if (minutes === undefined || minutes === null) return "N/A";
  return `${minutes} browser mins/month`;
}

export default function PricingPlans() {
  const [plans, setPlans] = React.useState<Plan[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string>("");
  const [currentUserDetails, setCurrentUserDetails] = React.useState<any>(null);
  const [userLoading, setUserLoading] = React.useState<boolean>(true);
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    let isMounted = true;
    async function fetchAll() {
      try {
        setUserLoading(true);
        setLoading(true);
        let token: string|null = null;
        if (isLoaded && isSignedIn) {
          token = await getToken({ template: "basic" });
        }
        // Fetch user (if signed in)
        if (token) {
          try {
            const userRes = await getCurrentActiveUserAPI(token);
            if (isMounted) setCurrentUserDetails(userRes?.status === 200 ? userRes.data : null);
          } catch (err) {
            if (isMounted) setCurrentUserDetails(null);
          }
        } else {
          if (isMounted) setCurrentUserDetails(null);
        }
        if (isMounted) setUserLoading(false);

        // Fetch plans
        try {
          const plansRes = await getPlansAPI(null);
          if (isMounted) setPlans(plansRes?.data?.plans || []);
        } catch (e: any) {
          if (isMounted) setError(e?.message || "Failed to load plans");
        }
        if (isMounted) setLoading(false);
      } catch {
        if (isMounted) { setLoading(false); setUserLoading(false); }
      }
    }
    fetchAll();
    return () => { isMounted = false; };
  }, [getToken, isLoaded, isSignedIn]);

  if (loading || userLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Spin />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="text-sm text-red-600">{error}</div>
      </div>
    );
  }

  const handleGetStarted = async (planId?: string) => {
    try {
      if (!planId) return;
      const token = await getToken({ template: "basic" });
      if (!token) {
        router.push("/sign-up?redirect=/dashboard/suite");
        return;
      }
      const orgId = currentUserDetails?.org_id;
      if (!orgId) {
        message.error("Organization not found. Please try again.");
        return;
      }
      const res = await createCheckoutAPI(token, { org_id: orgId, plan_id: planId });
      const url = res?.data?.checkout_url;
      if (url) {
        window.open(url, "_blank");
        router.push("/checkout");
      } else {
        message.error("Checkout URL not received");
      }
    } catch (e: any) {
      message.error(e?.message || "Failed to initiate checkout");
    }
  };

  const handleContactUs = () => {
    window.location.href = "mailto:contact@litmuscheck.com";
  };

  // Display all plans from API
  const mainPlans = plans;

  return (
    <div className="w-full">
      {/* Main Pricing Cards */}
      <div className="flex flex-col lg:flex-row gap-6 justify-center items-stretch mb-12">
        {mainPlans.map((plan) => {
          const isFree = !plan.price || plan.price === 0;
          const title = plan.plan_name || "";
          
          const priceData = isFree ? null : formatCurrency(plan.currency, plan.price as number | undefined, plan.frequency);
          const features: string[] = Array.isArray(plan.features) ? plan.features as string[] : [];

          return (
            <div 
              key={plan.plan_id || title} 
              className="bg-[#F8F9FD] rounded-lg font-hanken p-6 w-full lg:w-[350px] flex flex-col shadow-sm"
            >
              {/* Title and Price */}
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold mb-4">{title}</h2>
                {isFree ? (
                  <div className="text-2xl font-medium mb-6">Free forever</div>
                ) : priceData ? (
                  <div className="text-2xl font-medium mb-6">
                    {priceData.price}
                    <span className="text-base font-normal">{priceData.period}</span>
                  </div>
                ) : (
                  <div className="text-2xl font-medium mb-6">N/A</div>
                )}
                {/* CTA Button at Top */}
                {isFree ? (
                  <Link 
                    href="/sign-up" 
                    className="w-[184px] bg-[#2B2B2B] text-white mb-6 text-center py-2 px-6 rounded-lg text-base font-medium hover:bg-gray-800 transition-colors inline-block"
                  >
                    Sign up for free
                  </Link>
                ) : (
                  <button 
                    onClick={() => handleGetStarted(plan.plan_id)} 
                    className="w-[184px] bg-[#2B2B2B] text-white py-2 px-6 mb-6 rounded-lg text-base font-medium hover:bg-gray-800 transition-colors"
                  >
                    Get started
                  </button>
                )}
              </div>

              {/* Included Items */}
              <div className="mb-6 space-y-3">
                {plan?.team_size !== null && plan?.team_size !== undefined && (
                  <div className="flex items-center gap-2">
                    <Image src="/assets/tick.svg" alt="check" width={20} height={20} className="flex-shrink-0" />
                    <span className="text-sm">
                      {plan.team_size} users
                    </span>
                  </div>
                )}
                {plan?.parallel_execution !== null && plan?.parallel_execution !== undefined && (
                  <div className="flex items-center gap-2">
                    <Image src="/assets/tick.svg" alt="check" width={20} height={20} className="flex-shrink-0" />
                    <span className="text-sm">
                      {plan.parallel_execution} parallel execution
                    </span>
                  </div>
                )}
                {plan?.ai_credits !== null && plan?.ai_credits !== undefined && (
                  <div className="flex items-center gap-2">
                    <Image src="/assets/tick.svg" alt="check" width={20} height={20} className="flex-shrink-0" />
                    <span className="text-sm">
                      {plan.ai_credits} AI credits/month
                    </span>
                  </div>
                )}
                {plan?.browser_minutes !== null && plan?.browser_minutes !== undefined && (
                  <div className="flex items-center gap-2">
                    <Image src="/assets/tick.svg" alt="check" width={20} height={20} className="flex-shrink-0" />
                    <span className="text-sm">
                      {formatBrowserMinutesDisplay(plan.browser_minutes)}
                    </span>
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="mb-6 flex-grow">
                <h3 className="text-lg font-semibold mb-3">Features</h3>
                <ul className="space-y-2 text-sm">
                  {features.length > 0 ? (
                    features.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Image src="/assets/tick.svg" alt="check" width={16} height={16} className="flex-shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))
                  ) : (
                    <li>NA</li>
                  )}
                </ul>
              </div>

              {/* CTA Button at Bottom */}
              {isFree ? (
                <Link 
                  href="/sign-up" 
                  className="w-full bg-[#2B2B2B] text-white text-center py-2 px-6 rounded-lg text-base font-medium hover:bg-gray-800 transition-colors mt-auto"
                >
                  Sign up for free
                </Link>
              ) : (
                <button 
                  onClick={() => handleGetStarted(plan.plan_id)} 
                  className="w-full bg-[#2B2B2B] text-white py-2 px-6 rounded-lg text-base font-medium hover:bg-gray-800 transition-colors mt-auto"
                >
                  Get started
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Enterprise Plan Section */}
      <div className="bg-white border-2 border-[#E5E5E5] rounded-lg p-6 mb-12 max-w-3xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* First Column: Title, Description, Certifications, Button */}
          <div className="flex flex-col">
            <h2 className="text-2xl font-medium mb-2">Enterprise Plan</h2>
            <p className="text-base text-[#A6A6A6] mb-4">For teams with strict security and compliance requirements</p>
            
            {/* Certifications */}
            <div className="flex gap-4 mb-4">
              <Image 
                src="/assets/SOC.svg" 
                alt="AICPA SOC 2" 
                width={60} 
                height={60} 
                className="w-20 h-20"
              />
              <Image 
                src="/assets/ISO2.svg" 
                alt="ISO 27001" 
                width={60} 
                height={60} 
                className="w-20 h-20"
              />
            </div>

            {/* Contact Button */}
            <Link 
              href="https://calendly.com/litmuscheck/litmus-demo"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#2B2B2B] text-white py-2 px-6 rounded-lg text-center text-base font-medium hover:bg-gray-800 transition-colors w-[220px]"
            >
              Contact us
            </Link>
          </div>

          {/* Second and Third Columns: Features - start below heading */}
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            {[
              "Higher user limit",
              "Bring-your-own-llm",
              "Bring-your-own-infra",
              "On-premise deployment",
              "Custom integrations",
              "Priority support",
              "Payment options",
              "Account manager",
              "SLA",
              "Custom roles"
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-1">
                <Image src="/assets/tick.svg" alt="check" width={20} height={20} className="flex-shrink-0" />
                <span className="text-sm text-gray-800">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
