import { redirect } from "next/navigation";
import { TestAIEndpoints } from "@/lib/endpoints/testAI/endpoints";
import type { Environment } from "@/lib/apis/testAI/environments";
import SuiteLayoutClient from "./SuiteLayoutClient";
import { serverFetch, ApiError } from "@/lib/serverFetch";
import { getServerAccessToken } from "@/lib/auth/server-session";

export default async function SuiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ suite_id: string }>;
}) {
  const { suite_id } = await params;
  const token = await getServerAccessToken();
  if (!token) {
    redirect("/sign-in");
  }

  const baseUrl = process.env.NEXT_PUBLIC_LITMUSCHECK_URL ?? "";
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const suiteUrl = `${baseUrl}${TestAIEndpoints.GET_TEST_SUITE(suite_id, 1, 50)}`;
  const envsUrl = `${baseUrl}${TestAIEndpoints.GET_ENVIRONMENTS_BY_SUITE(suite_id)}`;

  async function safeFetch<T>(url: string) {
    try {
      const data = await serverFetch<T>(url, { headers });
      return { data, error: null };
    } catch (err) {
      if (err instanceof ApiError) {
        return {
          data: null,
          error: {
            message: err.message,
            status: err.status,
            payload: err.payload,
          },
        };
      }
      return {
        data: null,
        error: { message: "Unknown server error" },
      };
    }
  }

  const [suiteResult, envsResult] = await Promise.all([
    safeFetch<any>(suiteUrl),
    safeFetch<{ environments?: Environment[] }>(envsUrl),
  ]);

  const initialSuiteData = suiteResult.data ?? null;
  const initialEnvironments = envsResult.data?.environments ?? [];

  return (
    <SuiteLayoutClient
      suiteId={suite_id}
      initialSuiteData={initialSuiteData}
      initialError={suiteResult.error?.message ?? null}
      initialErrors={{
        suite: suiteResult.error,
        environments: envsResult.error,
      }}
      initialEnvironments={initialEnvironments}
    >
      {children}
    </SuiteLayoutClient>
  );
}
