const BACKEND_URL= `${process.env.NEXT_PUBLIC_LITMUSCHECK_URL}`;
//const BACKEND_URL = `https://uatocrdemo.finigami.com/v1`
// const BACKEND_URL = `http://127.0.0.1:5050/v1`
import axios from "axios";
import { z } from "zod";
import { DocumentAIEndpoints } from "@/lib/endpoints/documentAI/endpoints";

const { CREATE_API_KEY, GET_ALL_API_KEYS, DELETE_API_KEY } = DocumentAIEndpoints;

export const createKeyAPI = async (token:string|null, payload: any): Promise<any> => {
  try {
    if (token === null) {
      throw new Error(`No token provided`);
    }
    // make a call to localhost:8000/upload/
    const BASE_URL = `${BACKEND_URL}`;
   
    const requestUrl = encodeURI(BASE_URL + CREATE_API_KEY);
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

export const getKeysAPI = async (token:string|null): Promise<any> => {
  try {
    if (token === null) {
      throw new Error(`No token provided`);
    }
    // make a call to localhost:8000/upload/
    const BASE_URL = `${BACKEND_URL}`;
    
    const requestUrl = encodeURI(BASE_URL + GET_ALL_API_KEYS);
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

export const deleteKeyAPI = async (token:string|null, apikeyKey: string): Promise<any> => {
  try {
    if (token === null) {
      throw new Error(`No token provided`);
    }
    // make a call to localhost:8000/upload/
    const BASE_URL = `${BACKEND_URL}`;
   
    const requestUrl = encodeURI(BASE_URL + DELETE_API_KEY(apikeyKey));
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