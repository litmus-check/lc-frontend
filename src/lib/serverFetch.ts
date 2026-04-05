import "server-only";
import { extractErrorMessage } from "@/lib/utils";

export type ApiErrorPayload = {
  message?: string;
  detail?: string;
  error?: string;
};

export class ApiError extends Error {
  status: number;
  payload?: any;

  constructor(message: string, status: number, payload?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

export async function serverFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    cache: "no-store",
  });

  let data: any = null;

  try {
    data = await res.json();
  } catch {
    // ignore JSON parse errors
  }

  if (!res.ok) {
    const message =
      extractErrorMessage({ response: { data } }) ||
      `Request failed with status ${res.status}`;

    throw new ApiError(message, res.status, data);
  }

  return data as T;
}
