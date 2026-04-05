/**
 * Picks a JWT/access token from common API response shapes.
 * Adjust if your backend uses a different field name.
 */
export function extractAccessToken(data: unknown): string | null {
  if (data == null) return null;
  if (typeof data === "string" && data.length > 0) return data;
  if (typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  const keys = ["access_token", "accessToken", "token", "jwt", "id_token", "idToken"];
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string" && v.length > 0) return v;
  }
  if (o.data !== undefined) {
    return extractAccessToken(o.data);
  }
  return null;
}
