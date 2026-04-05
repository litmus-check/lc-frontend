const BACKEND_URL = `${process.env.NEXT_PUBLIC_LITMUSCHECK_URL}`;
import { TestAIEndpoints } from "@/lib/endpoints/testAI/endpoints";
import axios from "axios";
import { z } from "zod";

const { GET_EMAIL_RECIPIENTS, CREATE_EMAIL_RECIPIENTS, UPDATE_EMAIL_RECIPIENTS } = TestAIEndpoints;

// Types for email recipients
export interface EmailRecipientsResponse {
  created_at: string;
  modified_at: string;
  recipients: string[];
  suite_id: string;
}

export interface EmailRecipientsRequest {
  recipients: string[];
}

// GET email recipients
export const getEmailRecipientsAPI = async (
  token: string | null,
  suiteId: string
): Promise<{ data?: EmailRecipientsResponse; error?: string; status: number }> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }
    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + GET_EMAIL_RECIPIENTS(suiteId));
    
    const headers = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    const { data } = await axios.get(requestUrl, headers);
    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { error: JSON.stringify(error.issues), status: 422 };
    }
    
    // Handle axios error responses
    if (error.response) {
      const errorMessage = error.response.data?.error || error.response.data?.message || error.response.data || 'An error occurred';
      return { error: errorMessage, status: error.response.status };
    }
    
    // Handle network errors or other issues
    const errorMessage = error.message || 'An error occurred';
    return { error: errorMessage, status: 500 };
  }
};

// CREATE email recipients
export const createEmailRecipientsAPI = async (
  token: string | null,
  suiteId: string,
  payload: EmailRecipientsRequest
): Promise<{ data?: EmailRecipientsResponse; error?: string; status: number }> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }
    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + CREATE_EMAIL_RECIPIENTS(suiteId));
    
    const headers = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    const { data } = await axios.post(requestUrl, payload, headers);
    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { error: JSON.stringify(error.issues), status: 422 };
    }
    
    // Handle axios error responses
    if (error.response) {
      const errorMessage = error.response.data?.error || error.response.data?.message || error.response.data || 'An error occurred';
      return { error: errorMessage, status: error.response.status };
    }
    
    // Handle network errors or other issues
    const errorMessage = error.message || 'An error occurred';
    return { error: errorMessage, status: 500 };
  }
};

// UPDATE email recipients
export const updateEmailRecipientsAPI = async (
  token: string | null,
  suiteId: string,
  payload: EmailRecipientsRequest
): Promise<{ data?: EmailRecipientsResponse; error?: string; status: number }> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }
    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + UPDATE_EMAIL_RECIPIENTS(suiteId));
    
    const headers = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    const { data } = await axios.put(requestUrl, payload, headers);
    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { error: JSON.stringify(error.issues), status: 422 };
    }
    
    // Handle axios error responses
    if (error.response) {
      const errorMessage = error.response.data?.error || error.response.data?.message || error.response.data || 'An error occurred';
      return { error: errorMessage, status: error.response.status };
    }
    
    // Handle network errors or other issues
    const errorMessage = error.message || 'An error occurred';
    return { error: errorMessage, status: 500 };
  }
};
