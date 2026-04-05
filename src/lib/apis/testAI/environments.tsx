const BACKEND_URL = `${process.env.NEXT_PUBLIC_LITMUSCHECK_URL}`;
import { TestAIEndpoints } from "@/lib/endpoints/testAI/endpoints";
import axios from "axios";

// Types
export interface EnvironmentVariable {
  [key: string]: string;
}

export interface Environment {
  environment_id: string;
  environment_name: string;
  suite_id: string;
  variables: EnvironmentVariable;
  created_at?: string;
  modified_at?: string;
}

export interface CreateEnvironmentRequest {
  environment_name: string;
  suite_id: string;
  variables: EnvironmentVariable;
}

export interface UpdateEnvironmentRequest {
  environment_name: string;
  variables: EnvironmentVariable;
}

export interface EnvironmentsResponse {
  environments: Environment[];
}

// API Functions
export const createEnvironmentAPI = async (
  token: string,
  data: CreateEnvironmentRequest
) => {
  try {
    const response = await axios.post(
      `${BACKEND_URL}${TestAIEndpoints.CREATE_ENVIRONMENT}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response;
  } catch (error: any) {
    return error.response;
  }
};

export const getEnvironmentAPI = async (
  token: string,
  environmentId: string
) => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}${TestAIEndpoints.GET_ENVIRONMENT(environmentId)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response;
  } catch (error: any) {
    return error.response;
  }
};

export const updateEnvironmentAPI = async (
  token: string,
  environmentId: string,
  data: UpdateEnvironmentRequest
) => {
  try {
    const response = await axios.put(
      `${BACKEND_URL}${TestAIEndpoints.UPDATE_ENVIRONMENT(environmentId)}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response;
  } catch (error: any) {
    return error.response;
  }
};

export const deleteEnvironmentAPI = async (
  token: string,
  environmentId: string
) => {
  try {
    const response = await axios.delete(
      `${BACKEND_URL}${TestAIEndpoints.DELETE_ENVIRONMENT(environmentId)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response;
  } catch (error: any) {
    return error.response;
  }
};

export const getEnvironmentsBySuiteAPI = async (
  token: string,
  suiteId: string
) => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}${TestAIEndpoints.GET_ENVIRONMENTS_BY_SUITE(suiteId)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response;
  } catch (error: any) {
    return error.response;
  }
};
