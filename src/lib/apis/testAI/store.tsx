const BACKEND_URL = `${process.env.NEXT_PUBLIC_LITMUSCHECK_URL}`;
import axios from "axios";
import { z } from "zod";
import { TestAIEndpoints } from "@/lib/endpoints/testAI/endpoints";
import {
  CreateStoreRequest,
  CreateStoreResponse,
  GetStoresResponse,
  UpdateStoreRequest,
  UpdateStoreResponse,
  DeleteStoreResponse,
} from "@/types/store";

const {
  GET_STORES,
  CREATE_STORE,
  UPDATE_STORE,
  DELETE_STORE,
} = TestAIEndpoints;

// Get all stores for a suite
export const getStoresAPI = async (
  token: string | null,
  suiteId: string
): Promise<GetStoresResponse> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + GET_STORES(suiteId));
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.get(requestUrl, headers);
    return { stores: data.stores || [] };
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

// Create a store for a suite
export const createStoreAPI = async (
  token: string | null,
  suiteId: string,
  payload: CreateStoreRequest
): Promise<CreateStoreResponse> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + CREATE_STORE(suiteId));
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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

// Update a store
export const updateStoreAPI = async (
  token: string | null,
  suiteId: string,
  storeId: string,
  payload: UpdateStoreRequest
): Promise<UpdateStoreResponse> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + UPDATE_STORE(suiteId, storeId));
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.put(requestUrl, payload, headers);
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

// Delete a store
export const deleteStoreAPI = async (
  token: string | null,
  suiteId: string,
  storeId: string
): Promise<DeleteStoreResponse> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + DELETE_STORE(suiteId, storeId));
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.delete(requestUrl, headers);
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
