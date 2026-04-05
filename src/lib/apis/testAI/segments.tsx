const BACKEND_URL = `${process.env.NEXT_PUBLIC_LITMUSCHECK_URL}`;
import { TestAIEndpoints } from "@/lib/endpoints/testAI/endpoints";
import axios from "axios";
import { z } from "zod";
import {
  CreateSegmentRequest,
  CreateSegmentResponse,
  GetSegmentResponse,
  GetSegmentsBySuiteResponse,
  UpdateSegmentRequest,
  UpdateSegmentResponse,
  DeleteSegmentResponse,
} from "../../../../types/segment";

const {
  GET_SEGMENT,
  CREATE_SEGMENT,
  GET_SEGMENTS_BY_SUITE,
  UPDATE_SEGMENT,
  DELETE_SEGMENT,
} = TestAIEndpoints;

export const getSegmentAPI = async (
  token: string | null,
  segmentId: string
): Promise<{ data: GetSegmentResponse; status: number }> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + GET_SEGMENT(segmentId));
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.get(requestUrl, headers);
    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.issues));
    }
    
    // Handle axios error responses
    if (error.response) {
      const errorMessage = error.response.data?.error || error.response.data?.message || error.response.data || 'An error occurred';
      throw new Error(errorMessage);
    }
    
    // Handle network errors or other issues
    const errorMessage = error.message || 'An error occurred';
    throw new Error(errorMessage);
  }
};

export const createSegmentAPI = async (
  token: string | null,
  payload: CreateSegmentRequest
): Promise<{ data: CreateSegmentResponse; status: number }> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + CREATE_SEGMENT);
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.post(requestUrl, payload, headers);
    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.issues));
    }
    
    // Handle axios error responses
    if (error.response) {
      const errorMessage = error.response.data?.error || error.response.data?.message || error.response.data || 'An error occurred';
      throw new Error(errorMessage);
    }
    
    // Handle network errors or other issues
    const errorMessage = error.message || 'An error occurred';
    throw new Error(errorMessage);
  }
};

export const getSegmentsBySuiteAPI = async (
  token: string | null,
  suiteId: string
): Promise<{ data: GetSegmentsBySuiteResponse; status: number }> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + GET_SEGMENTS_BY_SUITE(suiteId));
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.get(requestUrl, headers);
    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.issues));
    }
    
    // Handle axios error responses
    if (error.response) {
      const errorMessage = error.response.data?.error || error.response.data?.message || error.response.data || 'An error occurred';
      throw new Error(errorMessage);
    }
    
    // Handle network errors or other issues
    const errorMessage = error.message || 'An error occurred';
    throw new Error(errorMessage);
  }
};

export const updateSegmentAPI = async (
  token: string | null,
  segmentId: string,
  payload: UpdateSegmentRequest
): Promise<{ data: UpdateSegmentResponse; status: number }> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + UPDATE_SEGMENT(segmentId));
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.put(requestUrl, payload, headers);
    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.issues));
    }
    
    // Handle axios error responses
    if (error.response) {
      const errorMessage = error.response.data?.error || error.response.data?.message || error.response.data || 'An error occurred';
      throw new Error(errorMessage);
    }
    
    // Handle network errors or other issues
    const errorMessage = error.message || 'An error occurred';
    throw new Error(errorMessage);
  }
};

export const deleteSegmentAPI = async (
  token: string | null,
  segmentId: string
): Promise<{ data: DeleteSegmentResponse; status: number }> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + DELETE_SEGMENT(segmentId));
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.delete(requestUrl, headers);
    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.issues));
    }
    
    // Handle axios error responses
    if (error.response) {
      const errorMessage = error.response.data?.error || error.response.data?.message || error.response.data || 'An error occurred';
      throw new Error(errorMessage);
    }
    
    // Handle network errors or other issues
    const errorMessage = error.message || 'An error occurred';
    throw new Error(errorMessage);
  }
};
