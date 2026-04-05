import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/constants";

export async function getServerAccessToken(): Promise<string | null> {
  const jar = await cookies();
  const value = jar.get(ACCESS_TOKEN_COOKIE)?.value;
  return value && value.length > 0 ? value : null;
}
