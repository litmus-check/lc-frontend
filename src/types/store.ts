// Store-related types

export interface Store {
  store_id: string;
  store_name: string;
  store_description?: string; // Optional
  suite_id: string;
  created_at: string;
  modified_at: string;
}

// Request/Response interfaces for API calls
export interface CreateStoreRequest {
  store_name: string;
  store_description?: string; // Optional
  suite_id: string;
}

export interface CreateStoreResponse {
  store_id: string;
  store_name: string;
  store_description?: string; // Optional
  created_at: string;
  modified_at: string;
}

export interface GetStoresResponse {
  stores: Store[];
}

export interface UpdateStoreRequest {
  store_name: string;
  store_description?: string; // Optional
}

export interface UpdateStoreResponse {
  store_id: string;
  store_name: string;
  store_description?: string; // Optional
  suite_id: string;
  created_at: string;
  modified_at: string;
}

export interface DeleteStoreResponse {
  message: string;
}
