
const BACKEND_URL= `${process.env.NEXT_PUBLIC_BASE_API_URL}`;
const LITMUS_URL= `${process.env.NEXT_PUBLIC_LITMUSCHECK_URL}`;
import axios from "axios";
import { z } from "zod";
import { DocumentAIEndpoints } from "@/lib/endpoints/documentAI/endpoints";
import { GET } from "@/app/api/slack/route";

const { CREATE_ORG, GET_ORG, ADD_CREDITS, GET_CREDITS, UPDATE_CREDITS, GET_ALL_ORGS, UPDATE_ORG, TRANSFER_WORKFLOW, GET_PARALLEL_EXECUTIONS, UPDATE_PARALLEL_EXECUTIONS, GET_ORG_USERS, INVITE_USER_TO_ORG, DELETE_INVITE } = DocumentAIEndpoints;

export const createOrgAPI = async (token:string|null, payload: any): Promise<any> => {
 
  try {
    if (token === null) {
      throw new Error(`No token provided`);
    }
    // make a call to localhost:8000/upload/
    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + CREATE_ORG);
    const headers = {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    };

    const { data } = await axios.post(requestUrl, payload, headers); 
    
    return ({ data: data, status: 200 });
  } catch (error: any) {

    if (error instanceof z.ZodError) {
      return (JSON.stringify(error.issues), { status: 422 });
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

export const fetchOrgAPI = async (token:string|null, orgId: string): Promise<any> => {
 
  try {
    if (token === null) {
      throw new Error(`No token provided`);
    }
    // make a call to localhost:8000/upload/
    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + GET_ORG(orgId));
    const headers = {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    };

    const { data } = await axios.get(requestUrl, headers); 
    
    return ({ data: data, status: 200 });
  } catch (error: any) {

    if (error instanceof z.ZodError) {
      return (JSON.stringify(error.issues), { status: 422 });
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


export const addCreditsAPI = async (token:string|null, orgId: string, payload: any): Promise<any> => {
 
    try {
      if (token === null) {
        throw new Error(`No token provided`);
      }
      // make a call to localhost:8000/upload/
      const BASE_URL = `${BACKEND_URL}`;

      const requestUrl = encodeURI(BASE_URL + ADD_CREDITS(orgId));
      const headers = {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      };
  
      const { data } = await axios.post(requestUrl, payload, headers); 
      
      return ({ data: data, status: 200 });
    } catch (error: any) {

      if (error instanceof z.ZodError) {
        return (JSON.stringify(error.issues), { status: 422 });
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


export const fetchAllOrgsAPI = async (token:string|null): Promise<any> => { 
    try {
      if (token === null) {
        throw new Error(`No token provided`);
      }
      // make a call to localhost:8000/upload/
      const BASE_URL = `${BACKEND_URL}`;
      
      const requestUrl = encodeURI(BASE_URL + GET_ALL_ORGS);
      const headers = {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      };
  
      const { data } = await axios.get(requestUrl, headers); 
      
      return ({ data: data, status: 200 });
    } catch (error: any) {

      if (error instanceof z.ZodError) {
        return (JSON.stringify(error.issues), { status: 422 });
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

export const updateOrgAPI = async (token:string|null, orgId: string, payload: any): Promise<any> => {
 
    try {
      if (token === null) {
        throw new Error(`No token provided`);
      }
      // make a call to localhost:8000/upload/
      const BASE_URL = `${BACKEND_URL}`;

      const requestUrl = encodeURI(BASE_URL + UPDATE_ORG(orgId));
      const headers = {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      };
  
      const { data } = await axios.put(requestUrl, payload, headers); 
      
      return ({ data: data, status: 200 });
    } catch (error: any) {

      if (error instanceof z.ZodError) {
        return (JSON.stringify(error.issues), { status: 422 });
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

export const getCreditsAPI = async (token:string|null, orgId: string): Promise<any> => {
 
    try {
      if (token === null) {
        throw new Error(`No token provided`);
      }
      // make a call to localhost:8000/upload/
      const BASE_URL = `${LITMUS_URL}`;

      const requestUrl = encodeURI(BASE_URL + GET_CREDITS(orgId));
      const headers = {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      };
  
      const { data } = await axios.get(requestUrl, headers); 
      
      return ({ data: data, status: 200 });
    } catch (error: any) {

      if (error instanceof z.ZodError) {
        return (JSON.stringify(error.issues), { status: 422 });
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

export const updateCreditsAPI = async (token:string|null, orgId: string, payload: any): Promise<any> => {
 
    try {
      if (token === null) {
        throw new Error(`No token provided`);
      }
      // make a call to localhost:8000/upload/
      const BASE_URL = `${LITMUS_URL}`;

      const requestUrl = encodeURI(BASE_URL + UPDATE_CREDITS(orgId));
      const headers = {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      };
  
      const { data } = await axios.put(requestUrl, payload, headers); 
      
      return ({ data: data, status: 200 });
    } catch (error: any) {

      if (error instanceof z.ZodError) {
        return (JSON.stringify(error.issues), { status: 422 });
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

export const transferOrgAPI = async (token:string|null, payload: any): Promise<any> => {
 
    try {
      if (token === null) {
        throw new Error(`No token provided`);
      }
      // make a call to localhost:8000/upload/
      const BASE_URL = `${BACKEND_URL}`;

      const requestUrl = encodeURI(BASE_URL + TRANSFER_WORKFLOW);
      const headers = {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      };
  
      const { data } = await axios.put(requestUrl, payload, headers); 
      
      return ({ data: data, status: 200 });
    } catch (error: any) {
      console.log(error, 'err')
      if (error instanceof z.ZodError) {
        return (JSON.stringify(error.issues), { status: 422 });
      }
      console.error(error?.code, error?.response?.statusText);
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

export const getParallelExecutionsAPI = async (token:string|null, orgId: string): Promise<any> => {
 
    try {
      if (token === null) {
        throw new Error(`No token provided`);
      }
      // make a call to localhost:8000/upload/
      const BASE_URL = `${LITMUS_URL}`;

      const requestUrl = encodeURI(BASE_URL + GET_PARALLEL_EXECUTIONS(orgId));
      const headers = {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      };
  
      const { data } = await axios.get(requestUrl, headers); 
      
      return ({ data: data, status: 200 });
    } catch (error: any) {

      if (error instanceof z.ZodError) {
        return (JSON.stringify(error.issues), { status: 422 });
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

export const updateParallelExecutionsAPI = async (token:string|null, orgId: string, payload: any): Promise<any> => {
 
    try {
      if (token === null) {
        throw new Error(`No token provided`);
      }
      // make a call to localhost:8000/upload/
      const BASE_URL = `${LITMUS_URL}`;

      const requestUrl = encodeURI(BASE_URL + UPDATE_PARALLEL_EXECUTIONS(orgId));
      const headers = {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      };
  
      const { data } = await axios.put(requestUrl, payload, headers); 
      
      return ({ data: data, status: 200 });
    } catch (error: any) {

      if (error instanceof z.ZodError) {
        return (JSON.stringify(error.issues), { status: 422 });
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

export const getOrgUsersAPI = async (token:string|null, orgId: string): Promise<any> => {
 
    try {
      if (token === null) {
        throw new Error(`No token provided`);
      }
      const BASE_URL = `${BACKEND_URL}`;
      const requestUrl = encodeURI(BASE_URL + GET_ORG_USERS(orgId));
      const headers = {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      };
  
      const { data } = await axios.get(requestUrl, headers); 
      
      return ({ data: data, status: 200 });
    } catch (error: any) {

      if (error instanceof z.ZodError) {
        return (JSON.stringify(error.issues), { status: 422 });
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

export const inviteUserToOrgAPI = async (token:string|null, orgId: string, payload: {
  invitee_email: string;
  resource_type: string | null;
  resource_id: string | null;
  resource_url: string | null;
  invitee_role: string;
}): Promise<any> => {
 
    try {
      if (token === null) {
        throw new Error(`No token provided`);
      }
      const BASE_URL = `${BACKEND_URL}`;
      const requestUrl = encodeURI(BASE_URL + INVITE_USER_TO_ORG(orgId));
      const headers = {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      };
  
      const { data } = await axios.post(requestUrl, payload, headers); 
      
      return ({ data: data, status: 200 });
    } catch (error: any) {

      if (error instanceof z.ZodError) {
        return (JSON.stringify(error.issues), { status: 422 });
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

export const deleteInviteAPI = async (token:string|null, orgId: string, inviteId: string): Promise<any> => {
 
    try {
      if (token === null) {
        throw new Error(`No token provided`);
      }
      const BASE_URL = `${BACKEND_URL}`;
      const requestUrl = encodeURI(BASE_URL + DELETE_INVITE(orgId, inviteId));
      const headers = {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      };
  
      const { data } = await axios.delete(requestUrl, headers); 
      
      return ({ data: data, status: 200 });
    } catch (error: any) {

      if (error instanceof z.ZodError) {
        return (JSON.stringify(error.issues), { status: 422 });
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