import axios from "axios";
import { z } from "zod";

const BACKEND_URL = `${process.env.NEXT_PUBLIC_LITMUSCHECK_URL}`;

type AuthResponse = {
  accessToken: string;
};

export const loginAPI = async (
  email: string,
  password: string
): Promise<{ data: AuthResponse; status: number }> => {
  try {
    const requestUrl = encodeURI(`${BACKEND_URL}/login`);
    const { data, status } = await axios.post<AuthResponse>(
      requestUrl,
      { email, password },
      { headers: { "Content-Type": "application/json" } }
    );
    return { data, status };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.issues));
    }
    if (error.response) {
      const errorMessage =
        error.response.data?.error ||
        error.response.data?.message ||
        error.response.data ||
        "Login failed";
      throw new Error(errorMessage);
    }
    throw new Error(error.message || "Login failed");
  }
};

export const signupAPI = async (
  email: string,
  password: string
): Promise<{ data: AuthResponse; status: number }> => {
  try {
    const requestUrl = encodeURI(`${BACKEND_URL}/signup`);
    const { data, status } = await axios.post<AuthResponse>(
      requestUrl,
      { email, password },
      { headers: { "Content-Type": "application/json" } }
    );
    return { data, status };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.issues));
    }
    if (error.response) {
      const errorMessage =
        error.response.data?.error ||
        error.response.data?.message ||
        error.response.data ||
        "Sign up failed";
      throw new Error(errorMessage);
    }
    throw new Error(error.message || "Sign up failed");
  }
};
