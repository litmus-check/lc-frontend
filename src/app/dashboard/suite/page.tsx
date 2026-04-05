import { redirect } from "next/navigation";
import { TestAIEndpoints } from "@/lib/endpoints/testAI/endpoints";
import SuitesClient from "@/app/dashboard/suite/SuitesClient";
import { extractErrorMessage } from "@/lib/utils";
import { getServerAccessToken } from "@/lib/auth/server-session";

export const dynamic = "force-dynamic";

export default async function Page() {
  const token = await getServerAccessToken();
  if (!token) {
    redirect("/sign-in");
  }

  const baseUrl = process.env.NEXT_PUBLIC_LITMUSCHECK_URL ?? "";
  const path = TestAIEndpoints.GET_ALL_TEST_SUITES(1, 10000);
  const url = `${baseUrl}${path}`;

  // RSC: fetch suites on the server (runs only on server, not in browser)
  if (process.env.NODE_ENV === "development") {
    console.log("[Suites RSC] Fetching suites from", url.replace(/\?.*/, "?..."));
  }

  let initialSuites = null;
  let initialError: string | null = null;

  try {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error("Suites fetch failed:", res.status, errorBody);
      initialError = "Failed to load suites. Please refresh the page.";
    } else {
      initialSuites = await res.json();
    }
  } catch (e) {
    initialError = extractErrorMessage(e)
      
  }

  return <SuitesClient initialSuites={initialSuites} initialError={initialError} />;
}
