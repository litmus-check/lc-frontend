const BACKEND_URL = `${process.env.NEXT_PUBLIC_BASE_API_URL}`;
import axios from "axios";
import { z } from "zod";
import { DocumentAIEndpoints } from "@/lib/endpoints/documentAI/endpoints";

const {
  RUN_WORKFLOW,
  DETECT_FEATURES,
  REMOVE_BACKGROUND,
  GET_SIMILARITY,
  DETECT_OBJECTS,
  DELETE_WORKFLOW,
  GET_WORKFLOW,
  GET_ALL_WORKFLOWS,
  UPDATE_WORKFLOW,
  CREATE_WORKFLOW,
  MAKE_WORKFLOW_PUBLIC,
} = DocumentAIEndpoints;

export const runWorkflowAPI = async (
  token: string | null,
  form: any,
  workflowId = "",
  type = ""
): Promise<any> => {
  try {
    if (token === null) {
      throw new Error(`No token provided`);
    }
    // make a call to localhost:8000/upload/
    const BASE_URL = `${BACKEND_URL}`;
    let URL_PATH =
      workflowId === "face" || workflowId === "signature"
        ? DETECT_FEATURES
        : workflowId === "removal"
        ? REMOVE_BACKGROUND
        : workflowId === "similarity"
        ? GET_SIMILARITY
        : workflowId === "object-detection"
        ? DETECT_OBJECTS
        : RUN_WORKFLOW;

    const requestUrl = encodeURI(BASE_URL + URL_PATH);
    const headers = {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.post(requestUrl, form, headers);
    return { data: data, status: 200 };
  } catch (error: any) {
    // if (error instanceof z.ZodError) {
    //   console.log(error, 'zod')
    //   return (JSON.stringify({error:error.issues, status: 422 }));
    // }
    // console.error(error?.code, error?.response?.statusText);
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

export const deleteWorkflowAPI = async (
  token: string | null,
  workflowId: string
): Promise<any> => {
  try {
    if (token === null) {
      throw new Error(`No token provided`);
    }
    // make a call to localhost:8000/upload/
    const BASE_URL = `${BACKEND_URL}`;

    const requestUrl = encodeURI(BASE_URL + DELETE_WORKFLOW(workflowId));
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
      return JSON.stringify(error.issues), { status: 422 };
    }
    console.log(error, "err");
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

export const getWorkflowAPI = async (
  token: string | null,
  workflowId: string
): Promise<any> => {
  try {
    if (token === null) {
      throw new Error(`No token provided`);
    }
    // make a call to localhost:8000/upload/
    const baseUrl = `${BACKEND_URL}${GET_WORKFLOW(workflowId)}`;
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.get(baseUrl, headers);

    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return JSON.stringify(error.issues), { status: 422 };
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

export const getAllWorkflowsAPI = async (
  token: string | null
): Promise<any> => {
  try {
    if (token === null) {
      throw new Error(`No token provided`);
    }
    // make a call to localhost:8000/upload/
    const baseUrl = `${BACKEND_URL}${GET_ALL_WORKFLOWS}`;
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.get(baseUrl, headers);

    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return JSON.stringify(error.issues), { status: 422 };
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

export const getAllPublicWorkflowsAPI = async (): Promise<any> => {
  try {
    // make a call to localhost:8000/upload/
    const baseUrl = `${BACKEND_URL}${GET_ALL_WORKFLOWS}?public=true`;
    const headers = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const { data } = await axios.get(baseUrl, headers);
    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return JSON.stringify(error.issues), { status: 422 };
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

export const updateWorkflowAPI = async (
  token: string | null,
  workflowId: string,
  jsonData: any
): Promise<any> => {
  try {
    if (token === null) {
      throw new Error(`No token provided`);
    }
    // make a call to localhost:8000/upload/
    const baseUrl = `${BACKEND_URL}${UPDATE_WORKFLOW(workflowId)}`;
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.put(
      baseUrl,
      JSON.stringify(jsonData),
      headers
    );

    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return JSON.stringify(error.issues), { status: 422 };
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

export const createWorkflowAPI = async (
  token: string | null,
  jsonData: any
): Promise<any> => {
  try {
    if (token === null) {
      throw new Error(`No token provided`);
    }
    // make a call to localhost:8000/upload/
    const baseUrl = `${BACKEND_URL}${CREATE_WORKFLOW}`;
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.post(
      baseUrl,
      JSON.stringify(jsonData),
      headers
    );

    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return JSON.stringify(error.issues), { status: 422 };
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

export const makeWorkflowPublicAPI = async (
  token: string | null,
  workflowId: string,
  isPublic: boolean
): Promise<any> => {
  try {
    if (token === null) {
      throw new Error(`No token provided`);
    }
    // make a call to localhost:8000/upload/
    const baseUrl = `${process.env.NEXT_PUBLIC_BASE_API_URL}${MAKE_WORKFLOW_PUBLIC(workflowId, isPublic)}`;
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.post(baseUrl, {}, headers);

    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return JSON.stringify(error.issues), { status: 422 };
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
