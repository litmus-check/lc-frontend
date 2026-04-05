const BACKEND_URL = `${process.env.NEXT_PUBLIC_LITMUSCHECK_URL}`;
// `${process.env.NEXT_PUBLIC_LITMUSCHECK_URL}`;
import { TestAIEndpoints } from "@/lib/endpoints/testAI/endpoints";
import axios from "axios";
import { z } from "zod";

const { CREATE_SCHEDULE, GET_SCHEDULES, UPDATE_SCHEDULE, DELETE_SCHEDULE } =
  TestAIEndpoints;

export const createScheduleAPI = async (
  token: string | null,
  suiteId: string,
  schedule: any,
  environment_id?: string | null
) => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }
    const BASE_URL = `${BACKEND_URL}`;

    const requestUrl = encodeURI(BASE_URL + CREATE_SCHEDULE(suiteId));
    const headers = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    // Add environment_id to schedule payload only if provided and not null
    const schedulePayload = {
      ...schedule,
      ...(environment_id && { environment_id })
    };

    const { data } = await axios.post(requestUrl, schedulePayload, headers);
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

export const getSchedulesAPI = async (
  token: string | null,
  suiteId: string
) => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }
    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + GET_SCHEDULES(suiteId));
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

export const updateScheduleAPI = async (
  token: string | null,
  suiteId: string,
  scheduleId: string,
  schedule: any,
  environment_id?: string | null
) => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }
    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + UPDATE_SCHEDULE(suiteId, scheduleId));
    const headers = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
    
    // Add environment_id to schedule payload only if provided and not null
    const schedulePayload = {
      ...schedule,
      ...(environment_id && { environment_id })
    };
    
    const { data } = await axios.put(requestUrl, schedulePayload, headers);
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

export const deleteScheduleAPI = async (
  token: string | null,
  suiteId: string,
  scheduleId: string
) => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }
    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + DELETE_SCHEDULE(suiteId, scheduleId));
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
}