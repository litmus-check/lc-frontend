const BACKEND_URL = `${process.env.NEXT_PUBLIC_LITMUSCHECK_URL}`;
import axios from "axios";
import { z } from "zod";
import { BillingEndpoints } from "@/lib/endpoints/billing/endpoints";

const { GET_PLANS, CREATE_CHECKOUT, GET_ORG_SUBSCRIPTION, GET_CUSTOMER_PORTAL } = BillingEndpoints;

export const getPlansAPI = async (
  token: string | null
): Promise<any> => {
  try {
    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + GET_PLANS);
    const headers = {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };

    const { data } = await axios.get(requestUrl, headers);
    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.issues));
    }
    if (error.response) {
      const errorMessage =
        error.response.data?.error ||
        error.response.data?.message ||
        error.response.data ||
        "An error occurred";
      throw new Error(errorMessage);
    }
    const errorMessage = error.message || "An error occurred";
    throw new Error(errorMessage);
  }
};

export const createCheckoutAPI = async (
  token: string | null,
  payload: { org_id: string; plan_id: string }
): Promise<any> => {
  try {
    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + CREATE_CHECKOUT);
    const headers = {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };

    const { data } = await axios.post(requestUrl, payload, headers);
    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.issues));
    }
    if (error.response) {
      const errorMessage =
        error.response.data?.error ||
        error.response.data?.message ||
        error.response.data ||
        "An error occurred";
      throw new Error(errorMessage);
    }
    const errorMessage = error.message || "An error occurred";
    throw new Error(errorMessage);
  }
};

export const getOrgSubscriptionAPI = async (
  token: string | null,
  orgId: string
): Promise<any> => {
  try {
    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + GET_ORG_SUBSCRIPTION(orgId));
    const headers = {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };

    const { data } = await axios.get(requestUrl, headers);
    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.issues));
    }
    if (error.response) {
      const errorMessage =
        error.response.data?.error ||
        error.response.data?.message ||
        error.response.data ||
        "An error occurred";
      throw new Error(errorMessage);
    }
    const errorMessage = error.message || "An error occurred";
    throw new Error(errorMessage);
  }
};

export const getCustomerPortalAPI = async (
  token: string | null,
  subscriptionId: string
): Promise<any> => {
  try {
    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + GET_CUSTOMER_PORTAL(subscriptionId));
    const headers = {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };

    const { data } = await axios.get(requestUrl, headers);
    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.issues));
    }
    if (error.response) {
      const errorMessage =
        error.response.data?.error ||
        error.response.data?.message ||
        error.response.data ||
        "An error occurred";
      throw new Error(errorMessage);
    }
    const errorMessage = error.message || "An error occurred";
    throw new Error(errorMessage);
  }
};


