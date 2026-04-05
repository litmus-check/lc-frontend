const BACKEND_URL= `${process.env.NEXT_PUBLIC_BASE_API_URL}`;
const LITMUS_URL= `${process.env.NEXT_PUBLIC_LITMUS_URL}`;
//const BACKEND_URL = `https://uatocrdemo.finigami.com/v1`
// const BACKEND_URL = `http://127.0.0.1:5050/v1`
import axios from "axios";
import { z } from "zod";
import { DocumentAIEndpoints } from "@/lib/endpoints/documentAI/endpoints";

const { GET_CURRENT_ACTIVE_USER, ADD_USER_TO_ORG } = DocumentAIEndpoints;

export const addUserToOrgAPI = async (token:string|null, userId: string, orgId: string): Promise<any> => {
 
    try {
      if (token === null) {
        throw new Error(`No token provided`);
      }
      // make a call to localhost:8000/upload/
      const BASE_URL = `${BACKEND_URL}`;

      const requestUrl = encodeURI(BASE_URL + ADD_USER_TO_ORG(userId, orgId));
      const headers = {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      };
  
      const { data } = await axios.post(requestUrl, {}, headers); 
      
      return ({ data: data, status: 200 });
    } catch (error: any) {
      console.log(error, 'err')
      if (error instanceof z.ZodError) {
        throw new Error(JSON.stringify(error.issues));
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

export const getCurrentActiveUserAPI = async (token:string|null): Promise<any> => {
 
  try {
    if (token === null) {
      throw new Error(`No token provided`);
    }
    // make a call to localhost:8000/upload/
    const BASE_URL = `${BACKEND_URL}`;
    
    const requestUrl = encodeURI(BASE_URL + GET_CURRENT_ACTIVE_USER);
    const headers = {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    };

    const { data } = await axios.get(requestUrl, headers); 
    return ({ data: data, status: 200 });
  } catch (error: any) {
    console.log(error, 'err')
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.issues));
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

export const getCreditsAPI = async (token:string|null): Promise<any> => {
 
  try {
    if (token === null) {
      throw new Error(`No token provided`);
    }
    // make a call to localhost:8000/upload/
    const BASE_URL = `${process.env.NEXT_PUBLIC_LITMUSCHECK_URL}`;
    
    const requestUrl = encodeURI(BASE_URL + '/credits');
    const headers = {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    };

    const { data } = await axios.get(requestUrl, headers); 
    return ({ data: data, status: 200 });
  } catch (error: any) {
    console.log(error, 'err')
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.issues));
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
