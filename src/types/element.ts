// Element selector interface
export interface ElementSelector {
  display: string;
  method: string;
  selector: string;
  script?: string; // Optional, added by backend
}

// Element interface for requests
export interface ElementRequest {
  element_description: string;
  element_prompt: string;
  store_name?: string; // Optional
  selectors: ElementSelector[];
}

// Element interface for responses (includes additional fields from backend)
export interface ElementResponse {
  element_id: string;
  suite_id: string;
  element_description: string;
  element_prompt: string;
  store_name?: string; // Optional
  selectors: ElementSelector[];
  created_at: string;
  modified_at: string;
}

// Request/Response interfaces for API calls
export interface CreateElementsRequest {
  elements: ElementRequest[];
}

export interface CreateElementRequest {
  element_description: string;
  element_prompt: string;
  store_name?: string; // Optional
  selectors: ElementSelector[];
}

export interface CreateElementsResponse {
  data: {
    elements: ElementResponse[];
  };
  status: number;
}

export interface CreateElementResponse {
  data: ElementResponse;
  status: number;
}

export interface UpdateElementRequest {
  element_description: string;
  element_prompt: string;
  store_name?: string; // Optional
  selectors: ElementSelector[];
}

export interface UpdateElementResponse {
  data: {
    elements: ElementResponse[];
  };
  status: number;
}

export interface GetElementsResponse {
  data: {
    elements: ElementResponse[];
  };
  status: number;
}

export interface DeleteElementResponse {
  data: {
    message: string;
  };
  status: number;
}

export interface MergeElementsRequest {
  primary_element_id: string;
  secondary_element_ids: string[];
}

export interface MergeElementsResponse {
  message: string;
}
