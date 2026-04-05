const BACKEND_URL = `${process.env.NEXT_PUBLIC_LITMUSCHECK_URL}`;
// const BACKEND_URL = `https://0c03bb8e-375a-4e38-b6b6-5abfd9fc893d.mock.pstmn.io`;
import axios from "axios";
import { z } from "zod";
import { TestAIEndpoints } from "@/lib/endpoints/testAI/endpoints";
import {
  CreateElementsRequest,
  CreateElementsResponse,
  CreateElementRequest,
  CreateElementResponse,
  UpdateElementRequest,
  UpdateElementResponse,
  GetElementsResponse,
  DeleteElementResponse,
  MergeElementsRequest,
  MergeElementsResponse,
} from "@/types/element";

const {
  GET_ELEMENTS,
  CREATE_ELEMENT,
  UPDATE_ELEMENT,
  DELETE_ELEMENT,
  MERGE_ELEMENTS,
} = TestAIEndpoints;

// Get all elements for a suite
export const getElementsAPI = async (
  token: string | null,
  suiteId: string
): Promise<GetElementsResponse> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + GET_ELEMENTS(suiteId));
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

// Create elements for a suite
export const createElementsAPI = async (
  token: string | null,
  suiteId: string,
  payload: CreateElementsRequest
): Promise<CreateElementsResponse> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + CREATE_ELEMENT(suiteId));
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

// Create a single element for a suite
export const createElementAPI = async (
  token: string | null,
  suiteId: string,
  payload: CreateElementRequest
): Promise<CreateElementResponse> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + CREATE_ELEMENT(suiteId));
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

// Update an element
export const updateElementAPI = async (
  token: string | null,
  suiteId: string,
  elementId: string,
  payload: UpdateElementRequest
): Promise<UpdateElementResponse> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + UPDATE_ELEMENT(suiteId, elementId));
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

// Delete an element
export const deleteElementAPI = async (
  token: string | null,
  suiteId: string,
  elementId: string
): Promise<DeleteElementResponse> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + DELETE_ELEMENT(suiteId, elementId));
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

// Merge elements
export const mergeElementsAPI = async (
  token: string | null,
  suiteId: string,
  payload: MergeElementsRequest
): Promise<MergeElementsResponse> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }

    const requestUrl = `${BACKEND_URL}${MERGE_ELEMENTS(suiteId)}`;
    const headers = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    const { data } = await axios.post(requestUrl, payload, headers);
    return data;
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
