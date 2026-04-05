const BACKEND_URL = `${process.env.NEXT_PUBLIC_LITMUSCHECK_URL}`;
// `${process.env.NEXT_PUBLIC_LITMUSCHECK_URL}`;
import { TestAIEndpoints } from "@/lib/endpoints/testAI/endpoints";
import axios from "axios";
import { z } from "zod";

const { CREATE_COMPOSE, CREATE_TEST_COMPOSE, GET_COMPOSE, UPDATE_TEST_COMPOSE, RUN_COMPOSE, DELETE_COMPOSE, CREATE_GOAL, GET_GOAL_STATUS, GET_LIVE_URLS } =
  TestAIEndpoints;

export const createComposeAPI = async (
  token: string | null,
  environment?: 'browserbase' | 'litmus_cloud',
  config?: any,
  suite_id?: string | null,
  testId?: string | null,
  has_test_data?: boolean,
  environment_id?: string | null
) => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }
    const BASE_URL = `${BACKEND_URL}`;

    let requestUrl = encodeURI(BASE_URL + CREATE_COMPOSE);
    
    // Add environment as query parameter if provided
    if (environment) {
      requestUrl += `?environment=${environment}`;
    }
    
    const headers = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    // Create payload combining all possible data
    let payload: any = config || {};
    
    // Add suite_id if available
    if (suite_id) {
      payload.suite_id = suite_id;
    }
    
    // Add environment_id only if provided
    if (environment_id) {
      payload.environment_id = environment_id;
    }
    
    // Add test data information if available
    if (testId && has_test_data === true) {
      payload.has_test_data = true;
      payload.test_id = testId;
    }

    const { data } = await axios.post(requestUrl, payload, headers);
    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return JSON.stringify(error.issues), { status: 422 };
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

export const createTestComposeAPI = async (
  token: string | null,
  composeId: string,
  payload: any
) => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }
    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + CREATE_TEST_COMPOSE(composeId));
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
      return JSON.stringify(error.issues), { status: 422 };
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
}

export const updateTestComposeAPI = async (
  token: string | null,
  testId: string,
  composeId: string,
  payload?: any
) => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }
    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + UPDATE_TEST_COMPOSE(testId, composeId));
    const headers = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
    const { data } = await axios.put(requestUrl, payload || {}, headers);
    return { data: data, status: 200 };


  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return JSON.stringify(error.issues), { status: 422 };
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
}

export const runComposeAPI = async (
  token: string | null,
  composeId: string,
  payload: any
) => {
  try {
    if (!token) { 
      throw new Error(`Invalid token`);
    }
    const BASE_URL = `${BACKEND_URL}`;
    let requestUrl = encodeURI(BASE_URL + RUN_COMPOSE(composeId));
    
    const headers = {
      headers: {  
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
    
    // Use the payload as-is
    const requestPayload = payload;
    
    const { data } = await axios.post(requestUrl, requestPayload, headers);
    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return JSON.stringify(error.issues), { status: 422 };
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
}

export const getComposeAPI = async (
  token: string | null,
  composeId: string,
  instructionId?: string
) => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }
    const BASE_URL = `${BACKEND_URL}`;
    let requestUrl = encodeURI(BASE_URL + GET_COMPOSE(composeId));
    
    // Add instruction ID as query parameter if provided
    
      requestUrl += `?id=${instructionId}`;
    
    
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
      return JSON.stringify(error.issues), { status: 422 };
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

export const deleteComposeAPI = async (
  token: string | null,
  composeId: string
) => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }
    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + DELETE_COMPOSE(composeId));
    const headers = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
    const { data } = await axios.delete(requestUrl, headers);
    return { data: data, status: 200 };
  } catch (error: any) {  
    if (error instanceof z.ZodError) {
      return JSON.stringify(error.issues), { status: 422 };
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

export const createGoalAPI = async (
  token: string | null,
  composeId: string,
  prompt: string
) => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }
    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + CREATE_GOAL(composeId));
    const headers = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
    const payload = {
      prompt: prompt
    };
    const { data } = await axios.post(requestUrl, payload, headers);
    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return JSON.stringify(error.issues), { status: 422 };
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

export const getGoalStatusAPI = async (
  token: string | null,
  composeId: string,
  goalId: string
) => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }
    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + GET_GOAL_STATUS(composeId, goalId));
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
      return JSON.stringify(error.issues), { status: 422 };
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

export const getLiveUrlsAPI = async (
  token: string | null,
  composeId: string
) => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }
    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + GET_LIVE_URLS(composeId));
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
      return JSON.stringify(error.issues), { status: 422 };
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


