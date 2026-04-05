const BACKEND_URL = `${process.env.NEXT_PUBLIC_GEOLOGY_URL}`;
import { GeologyEndpoints } from "@/lib/endpoints/geology/endpoints";
import axios from "axios";
import { z } from "zod";
import { extractErrorMessage } from "@/lib/utils";

const {
  GET_PROJECTS,
  CREATE_PROJECT,
  GET_PROJECT,
  UPDATE_PROJECT,
  DELETE_PROJECT,
  CREATE_TRACKER,
  GET_TRACKER,
  UPDATE_TRACKER,
  GET_TRACKERS_BY_PROJECT,
  GET_TRACKERS,
  DELETE_TRACKER,
  RUN_TRACKER,
  RUN_PROJECT,
  BULK_CREATE_TRACKERS,
  CREATE_PERSONA,
  GET_PERSONA,
  UPDATE_PERSONA,
  DELETE_PERSONA,
  GET_PERSONAS_BY_PROJECT,
  CREATE_LOCATION,
  GET_LOCATION,
  UPDATE_LOCATION,
  DELETE_LOCATION,
  GET_LOCATIONS_BY_PROJECT,
  CREATE_BRAND,
  GET_BRAND,
  UPDATE_BRAND,
  DELETE_BRAND,
  GET_BRANDS_BY_PROJECT,
  GET_SEARCHES_BY_TRACKER,
  GET_SEARCH_DETAIL,
  GET_SEARCH_PRODUCTS,
  GET_PRODUCT,
  GET_REPORT,
  GET_TAGS_BY_PROJECT,
  DELETE_TAG,
  GET_CITATION_DOMAINS,
  GET_SEARCHLINK_DOMAINS,
  GET_PERSONAS_REPORT,
  GET_LOCATION_REPORT,
  GENERATE_KEYWORDS,
  GENERATE_PROMPTS,
  PAGE_AUDIT,
  GET_AUDITS,
  GET_AUDIT_DETAIL,
  WEB_INDEXING,
  WEB_INDEXING_AUDIT,
  GET_INSIGHTS,
  GENERATE_INSIGHTS,
  UPDATE_INSIGHT,
  GET_ORG_PLAN,
  GET_LLM_MODELS,
  CREATE_BLOG_OUTLINE,
  GET_BLOG_OUTLINES,
  GET_BLOG_OUTLINE,
  UPDATE_BLOG_OUTLINE,
  DELETE_BLOG_OUTLINE,
  GET_TASKS,
  DELETE_TASKS,
} = GeologyEndpoints;

export interface Project {
  id: string;
  name: string;
  base_brand_name: string;
  base_brand_url: string;
  created_at: string;
  updated_at: string;
  schedule_status?: string;
}

export interface ProjectsMetadata {
  page_number: number;
  page_size: number;
  total_pages: number;
  total_records: number;
}

export interface ProjectsResponse {
  projects: Project[];
  metadata: ProjectsMetadata;
}

export interface CreateProjectRequest {
  name: string;
  base_brand_name: string;
  base_brand_url: string;
}

export interface CreateProjectResponse extends Project { }

export interface UpdateProjectRequest {
  name: string;
  base_brand_name: string;
  base_brand_url: string;
  schedule_status?: string;
}

export interface UpdateProjectResponse extends Project { }

export const getProjectsAPI = async (
  token: string | null,
  page: number = 1,
  pageSize: number = 10
): Promise<{ data: ProjectsResponse; status: number }> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(`${BASE_URL}${GET_PROJECTS}?page=${page}&limit=${pageSize}`);
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.get(requestUrl, headers);

    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.issues));
    }

    // Use extractErrorMessage utility to handle all error formats
    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

export const createProjectAPI = async (
  token: string | null,
  payload: CreateProjectRequest
): Promise<{ data: CreateProjectResponse; status: number }> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + CREATE_PROJECT);
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.post(requestUrl, payload, headers);

    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.issues));
    }

    // Use extractErrorMessage utility to handle all error formats
    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

export interface UpdateProjectResponse extends Project {}

export const getProjectAPI = async (
  token: string | null,
  projectId: string
): Promise<{ data: Project; status: number }> => {
  try {
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(`${BASE_URL}${GET_PROJECT(projectId)}`);

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
      throw new Error(JSON.stringify(error.issues));
    }

    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

export const updateProjectAPI = async (
  token: string | null,
  projectId: string,
  payload: UpdateProjectRequest
): Promise<{ data: UpdateProjectResponse; status: number }> => {
  try {
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(`${BASE_URL}${UPDATE_PROJECT(projectId)}`);

    const headers = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    const { data } = await axios.put(requestUrl, payload, headers);

    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.issues));
    }

    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

export const deleteProjectAPI = async (
  token: string | null,
  projectId: string
): Promise<{ data: any; status: number }> => {
  try {
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(`${BASE_URL}${DELETE_PROJECT(projectId)}`);

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
      throw new Error(JSON.stringify(error.issues));
    }

    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

// Persona interface
export interface Persona {
  id: string;
  project_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

// Location interface
export interface Location {
  id: string;
  project_id: string;
  city: string;
  region: string | null;
  country: string;
  created_at: string;
  updated_at: string;
}

// Tracker interface - can have locations, personas, tags as arrays or null/string
export interface Tracker {
  id: string;
  project_id: string;
  prompt: string;
  llm_models: string;
  locations: Location[] | string | null;
  personas: Persona[] | string | null;
  tags: string[] | string | null;
  created_at: string;
  updated_at: string;
  schedule_status?: string;
}

// Tracker detail interface (for GET tracker response with full objects)
export interface TrackerDetail {
  id: string;
  project_id: string;
  prompt: string;
  type?: string; // "manual" | "automated"
  llm_models: string;
  locations: Location[] | null;
  personas: Persona[] | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

// Create/Update Tracker Request
export interface CreateTrackerRequest {
  prompt: string;
  type: string;
  llm_models: string[];
  location_ids?: string[];
  persona_ids?: string[];
  tag_names?: string[];
}

export interface UpdateTrackerRequest extends CreateTrackerRequest {
  schedule_status?: string;
}

// Create/Update Tracker Response
export interface CreateTrackerResponse extends Tracker { }
export interface UpdateTrackerResponse extends Tracker { }

// Get Trackers by Project Response
export interface TrackersByProjectResponse {
  trackers: Tracker[];
}

// Get Trackers for User Response
export interface TrackersResponse {
  trackers: Tracker[];
}

// Run Tracker Response
export interface RunTrackerResponse {
  message: string;
  tracker_id: string;
  prompt: string;
  llm_models: string[];
  persona_count: number;
  location_count: number;
  expected_combinations: number;
  status: string;
}

// Org Plan Response
export interface OrgPlanResponse {
  org_id: string;
  plan_name: string;
  max_tracker: number;
  max_searches_per_month: number;
  searches_usage: number;
  created_at: string;
  updated_at: string;
}
// Run Project Response
export interface RunProjectResponse {
  message: string;
  tracker_ids: string[];
  expected_combinations: number;
  status: string;
}

// Persona CRUD interfaces (Persona interface already defined above for tracker responses)
export interface CreatePersonaRequest {
  name: string;
  description: string;
}

export interface UpdatePersonaRequest extends CreatePersonaRequest { }

export interface CreatePersonaResponse extends Persona { }
export interface UpdatePersonaResponse extends Persona { }

export interface PersonasByProjectResponse {
  personas: Persona[];
}

// Location CRUD interfaces (Location interface already defined above for tracker responses)
export interface CreateLocationRequest {
  city: string | null;
  region: string | null;
  country: string;
}

export interface UpdateLocationRequest extends CreateLocationRequest { }

export interface CreateLocationResponse extends Location { }
export interface UpdateLocationResponse extends Location { }

export interface LocationsByProjectResponse {
  locations: Location[];
}

// Brand CRUD interfaces
export interface Brand {
  id: string;
  project_id: string;
  brand_name: string;
  brand_url: string;
  brand_type: "own" | "competition";
  brand_description?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBrandRequest {
  brand_name: string;
  brand_url: string;
  brand_type: "own" | "competition";
  brand_description?: string;
}

export interface UpdateBrandRequest extends CreateBrandRequest { }

export interface CreateBrandResponse extends Brand { }
export interface UpdateBrandResponse extends Brand { }

export interface BrandsByProjectResponse {
  brands: Brand[];
}

// Search interfaces
export interface Search {
  id: string;
  tracker_id: string;
  llm_model: string;
  location_id: string | null;
  location: string | null;
  persona_id: string | null;
  persona_name: string | null;
  response_time_ms: number;
  token_count: number | null;
  created_at: string;
}

export interface SearchesByTrackerResponse {
  searches: Search[];
  metadata: {
    page_number: number;
    page_size: number;
    total_pages: number;
    total_records: number;
  };
}

export interface Citation {
  id: string;
  search_id: string;
  llm_model: string;
  domain: string;
  url: string;
  created_at: string;
}

export interface BrandMention {
  id: string;
  search_id: string;
  brand_name: string;
  position: number;
  sentiment: number;
  mention: boolean;
  summary: string;
  url: string;
  llm_model: string;
  created_at: string;
}

export interface SearchLink {
  id: string;
  search_id: string;
  llm_model: string;
  url: string;
  domain: string;
  created_at: string;
}

export interface SearchDetail extends Search {
  prompt?: string;
  raw_response?: string;
  html_result?: string;
  citations: Citation[];
  brand_mentions: BrandMention[];
  search_links: SearchLink[];
  products?: Product[];
  search_queries?: string[];
}

export interface Product {
  id: string;
  project_id: string;
  search_id: string;
  llm_model: string;
  title: string;
  source_product_id: string;
  url: string | null;
  price: string | null;
  rating: number | null;
  num_reviews: number | null;
  merchants: string | null;
  rating_grouped_citation_title: string | null;
  rating_grouped_citation_url: string | null;
}

export interface ProductDetail extends Product {
  query?: string;
  provider?: string;
  providers?: string;
  metadata_sources?: string;
  product_lookup_data?: string;
  product_lookup_key?: string;
  description?: string | null;
  featured_tag?: string | null;
  image_urls?: string;
  cite?: string | null;
  rating_grouped_citation?: string | null;
  offers?: string;
  variants?: string | null;
  variants_error_state_message?: string | null;
  offers_see_more_boundary?: number;
  show_price_disclosure?: boolean;
  created_at?: string;
}

// Task interfaces
export interface Task {
  task_id: string;
  task_name: string | null;
  task_description: string | null;
  prompt: string;
  location_id: string | null;
  persona_id: string | null;
  created_at: string;
  updated_at: string;
  project_id: string;
  conversation_id: string | null;
  status: "created" | "running" | "completed" | "failed";
  tracker_id: string | null;
}

export interface TasksMetadata {
  page_number: number;
  page_size: number;
  total_pages: number;
  total_records: number;
}

export interface TasksByProjectResponse {
  tasks: Task[];
  metadata: TasksMetadata;
}

export const createTrackerAPI = async (
  token: string | null,
  projectId: string,
  payload: CreateTrackerRequest
): Promise<{ data: CreateTrackerResponse; status: number }> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + CREATE_TRACKER(projectId));
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.post(requestUrl, payload, headers);

    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.issues));
    }

    // Use extractErrorMessage utility to handle all error formats
    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

// Get Tracker by ID
export const getTrackerAPI = async (
  token: string | null,
  projectId: string,
  trackerId: string
): Promise<{ data: TrackerDetail; status: number }> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + GET_TRACKER(projectId, trackerId));
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.get(requestUrl, headers);

    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.issues));
    }

    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

// Update Tracker
export const updateTrackerAPI = async (
  token: string | null,
  projectId: string,
  trackerId: string,
  payload: UpdateTrackerRequest
): Promise<{ data: UpdateTrackerResponse; status: number }> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + UPDATE_TRACKER(projectId, trackerId));
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.put(requestUrl, payload, headers);

    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.issues));
    }

    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

// Get Trackers by Project ID
export const getTrackersByProjectAPI = async (
  token: string | null,
  projectId: string
): Promise<{ data: TrackersByProjectResponse; status: number }> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + GET_TRACKERS_BY_PROJECT(projectId));
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.get(requestUrl, headers);

    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.issues));
    }

    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

// Get Trackers for User
export const getTrackersAPI = async (
  token: string | null
): Promise<{ data: TrackersResponse; status: number }> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + GET_TRACKERS);
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.get(requestUrl, headers);

    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.issues));
    }

    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

// Delete Tracker
export const deleteTrackerAPI = async (
  token: string | null,
  projectId: string,
  trackerId: string
): Promise<{ status: number }> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + DELETE_TRACKER(projectId, trackerId));
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.delete(requestUrl, headers);

    return { status: response.status };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.issues));
    }

    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

// Run Tracker
export const runTrackerAPI = async (
  token: string | null,
  projectId: string,
  trackerId: string
): Promise<{ data: RunTrackerResponse; status: number }> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + RUN_TRACKER(projectId, trackerId));
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.post(requestUrl, {}, headers);

    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.issues));
    }

    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

// Run Project
export const runProjectAPI = async (
  token: string | null,
  projectId: string
): Promise<{ data: RunProjectResponse; status: number }> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + RUN_PROJECT(projectId));
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.post(requestUrl, {}, headers);

    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.issues));
    }

    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

// Create Persona
export const createPersonaAPI = async (
  token: string | null,
  projectId: string,
  payload: CreatePersonaRequest
): Promise<{ data: CreatePersonaResponse; status: number }> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + CREATE_PERSONA(projectId));
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.post(requestUrl, payload, headers);

    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.issues));
    }

    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

// Get Persona by ID
export const getPersonaAPI = async (
  token: string | null,
  projectId: string,
  personaId: string
): Promise<{ data: Persona; status: number }> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + GET_PERSONA(projectId, personaId));
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.get(requestUrl, headers);

    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.issues));
    }

    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

// Update Persona
export const updatePersonaAPI = async (
  token: string | null,
  projectId: string,
  personaId: string,
  payload: UpdatePersonaRequest
): Promise<{ data: UpdatePersonaResponse; status: number }> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + UPDATE_PERSONA(projectId, personaId));
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.put(requestUrl, payload, headers);

    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.issues));
    }

    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

// Delete Persona
export const deletePersonaAPI = async (
  token: string | null,
  projectId: string,
  personaId: string
): Promise<{ status: number }> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + DELETE_PERSONA(projectId, personaId));
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.delete(requestUrl, headers);

    return { status: response.status };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.issues));
    }

    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

// Get Personas by Project ID
export const getPersonasByProjectAPI = async (
  token: string | null,
  projectId: string
): Promise<{ data: PersonasByProjectResponse; status: number }> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + GET_PERSONAS_BY_PROJECT(projectId));
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.get(requestUrl, headers);

    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.issues));
    }

    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

// Create Location
export const createLocationAPI = async (
  token: string | null,
  projectId: string,
  payload: CreateLocationRequest
): Promise<{ data: CreateLocationResponse; status: number }> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + CREATE_LOCATION(projectId));
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.post(requestUrl, payload, headers);

    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.issues));
    }

    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

// Get Location by ID
export const getLocationAPI = async (
  token: string | null,
  projectId: string,
  locationId: string
): Promise<{ data: Location; status: number }> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + GET_LOCATION(projectId, locationId));
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.get(requestUrl, headers);

    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.issues));
    }

    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

// Update Location
export const updateLocationAPI = async (
  token: string | null,
  projectId: string,
  locationId: string,
  payload: UpdateLocationRequest
): Promise<{ data: UpdateLocationResponse; status: number }> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + UPDATE_LOCATION(projectId, locationId));
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.put(requestUrl, payload, headers);

    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.issues));
    }

    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

// Delete Location
export const deleteLocationAPI = async (
  token: string | null,
  projectId: string,
  locationId: string
): Promise<{ status: number }> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + DELETE_LOCATION(projectId, locationId));
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.delete(requestUrl, headers);

    return { status: response.status };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.issues));
    }

    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

// Get Locations by Project ID
export const getLocationsByProjectAPI = async (
  token: string | null,
  projectId: string
): Promise<{ data: LocationsByProjectResponse; status: number }> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + GET_LOCATIONS_BY_PROJECT(projectId));
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.get(requestUrl, headers);

    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.issues));
    }

    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

// Create Brand
export const createBrandAPI = async (
  token: string | null,
  projectId: string,
  payload: CreateBrandRequest
): Promise<{ data: CreateBrandResponse; status: number }> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + CREATE_BRAND(projectId));
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.post(requestUrl, payload, headers);

    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.issues));
    }

    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

// Get Brand by ID
export const getBrandAPI = async (
  token: string | null,
  projectId: string,
  brandId: string
): Promise<{ data: Brand; status: number }> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + GET_BRAND(projectId, brandId));
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.get(requestUrl, headers);

    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.issues));
    }

    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

// Update Brand
export const updateBrandAPI = async (
  token: string | null,
  projectId: string,
  brandId: string,
  payload: UpdateBrandRequest
): Promise<{ data: UpdateBrandResponse; status: number }> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + UPDATE_BRAND(projectId, brandId));
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.put(requestUrl, payload, headers);

    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.issues));
    }

    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

// Delete Brand
export const deleteBrandAPI = async (
  token: string | null,
  projectId: string,
  brandId: string
): Promise<{ status: number }> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + DELETE_BRAND(projectId, brandId));
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.delete(requestUrl, headers);

    return { status: response.status };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.issues));
    }

    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

// Get Brands by Project ID
export const getBrandsByProjectAPI = async (
  token: string | null,
  projectId: string
): Promise<{ data: BrandsByProjectResponse; status: number }> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + GET_BRANDS_BY_PROJECT(projectId));
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.get(requestUrl, headers);

    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.issues));
    }

    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

// Get Searches by Tracker ID
export const getSearchesByTrackerAPI = async (
  token: string | null,
  projectId: string,
  trackerId: string,
  page: number = 1,
  limit: number = 10
): Promise<{ data: SearchesByTrackerResponse; status: number }> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(`${BASE_URL}${GET_SEARCHES_BY_TRACKER(projectId, trackerId)}?page=${page}&limit=${limit}`);
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.get(requestUrl, headers);

    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.issues));
    }

    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

// Get Tasks by Project ID
export const getTasksByProjectAPI = async (
  token: string | null,
  projectId: string,
  params: { status?: "created" | "running" | "completed" | "failed"; page?: number; limit?: number } = {}
): Promise<{ data: TasksByProjectResponse; status: number }> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }

    const BASE_URL = `${BACKEND_URL}`;
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append("status", params.status);
    if (params.page != null) queryParams.append("page", String(params.page));
    if (params.limit != null) queryParams.append("limit", String(params.limit));
    const queryString = queryParams.toString();
    const requestUrl = encodeURI(`${BASE_URL}${GET_TASKS(projectId)}${queryString ? `?${queryString}` : ""}`);
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.get(requestUrl, headers);

    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.issues));
    }

    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

export interface DeleteTasksRequest {
  task_ids: string[];
}

export interface DeleteTasksResponse {
  message: string;
}

export const deleteTasksAPI = async (
  token: string | null,
  projectId: string,
  payload: DeleteTasksRequest
): Promise<{ data: DeleteTasksResponse; status: number }> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(`${BASE_URL}${DELETE_TASKS(projectId)}`);
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.delete(requestUrl, { ...headers, data: payload });

    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.issues));
    }

    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

// Get Search Products
export interface SearchProductsResponse {
  products: Product[];
}

export const getSearchProductsAPI = async (
  token: string | null,
  projectId: string,
  searchId: string
): Promise<{ data: SearchProductsResponse; status: number }> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + GET_SEARCH_PRODUCTS(projectId, searchId));
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.get(requestUrl, headers);

    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.issues));
    }

    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

// Get Product Detail
export const getProductAPI = async (
  token: string | null,
  projectId: string,
  productId: string
): Promise<{ data: ProductDetail; status: number }> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + GET_PRODUCT(projectId, productId));
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.get(requestUrl, headers);

    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.issues));
    }

    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

// Get Search Detail
export const getSearchDetailAPI = async (
  token: string | null,
  projectId: string,
  trackerId: string,
  searchId: string
): Promise<{ data: SearchDetail; status: number }> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(`${BASE_URL}${GET_SEARCH_DETAIL(projectId, trackerId, searchId)}?all_details=True`);
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.get(requestUrl, headers);

    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.issues));
    }

    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};


// Report API Types
export interface DailyDataPoint {
  date: string;
  [brandId: string]: string | number | null;
}

export interface SentimentDetail {
  date: string;
  brand_id: string | null;
  brand_name: string;
  sentiment_snippet: string;
  sentiment_score: number;
  search_id: string;
  tracker_id: string;
}

export interface DailyData {
  visibility: DailyDataPoint[];
  sentiment: DailyDataPoint[];
  position: DailyDataPoint[];
  sentiment_details?: SentimentDetail[];
}

export interface Averages {
  visibility: { [brandId: string]: number };
  sentiment: { [brandId: string]: number };
  position: { [brandId: string]: number };
}

export interface BrandMapping {
  [brandId: string]: {
    id: string | null;
    brand_name: string;
    brand_url: string | null;
    brand_type: "own" | "competition" | null;
    tracked?: boolean;
  };
}

export interface ReportMetadata {
  base_brand_id: string;
  competitor_brand_ids: string[];
  date_range: {
    start: string;
    end: string;
  };
  total_days: number;
}

export interface ReportResponse {
  daily_data: DailyData;
  averages: Averages;
  brand_mapping: BrandMapping;
  metadata: ReportMetadata;
}

export interface GetReportParams {
  start_date?: string;
  end_date?: string;
  tag?: string;
  persona_id?: string;
  location_id?: string;
  platform?: string;
}

export const getReportAPI = async (
  token: string | null,
  projectId: string,
  params: GetReportParams = {}
): Promise<{ data: ReportResponse; status: number }> => {
  try {
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const BASE_URL = `${BACKEND_URL}`;
    const endpoint = GET_REPORT(projectId);

    // Build query string from params
    const queryParams = new URLSearchParams();
    if (params.start_date) queryParams.append("start_date", params.start_date);
    if (params.end_date) queryParams.append("end_date", params.end_date);
    if (params.tag) queryParams.append("tag", params.tag);
    if (params.persona_id) queryParams.append("persona_id", params.persona_id);
    if (params.location_id) queryParams.append("location_id", params.location_id);
    if (params.platform) queryParams.append("platform", params.platform);

    const queryString = queryParams.toString();
    const requestUrl = encodeURI(`${BASE_URL}${endpoint}${queryString ? `?${queryString}` : ""}`);

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
      throw new Error(JSON.stringify(error.issues));
    }

    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

// LLM Models API Types
export interface LLMModelsResponse {
  models: {
    [key: string]: string; // key is backend value, value is display label
  };
}

export const getLLMModelsAPI = async (
  token: string | null
): Promise<{ data: LLMModelsResponse; status: number }> => {
  try {
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(`${BASE_URL}${GET_LLM_MODELS}`);

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
      throw new Error(JSON.stringify(error.issues));
    }

    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

// Tag API Types
export interface Tag {
  id: string;
  project_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface TagsByProjectResponse {
  tags: Tag[];
}

export const getTagsByProjectAPI = async (
  token: string | null,
  projectId: string
): Promise<{ data: TagsByProjectResponse; status: number }> => {
  try {
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(`${BASE_URL}${GET_TAGS_BY_PROJECT(projectId)}`);

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
      throw new Error(JSON.stringify(error.issues));
    }

    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

export const deleteTagAPI = async (
  token: string | null,
  projectId: string,
  tagId: string
): Promise<{ data: any; status: number }> => {
  try {
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(`${BASE_URL}${DELETE_TAG(projectId, tagId)}`);

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
      throw new Error(JSON.stringify(error.issues));
    }

    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

// Citation and Search Link Domains APIs

export interface DomainData {
  domain: string;
  count: number;
  urls: string[];
  category?: string;
}

export interface CitationDomainsResponse {
  domains: DomainData[];
  total_domains: number;
}

export interface SearchLinkDomainsResponse {
  domains: DomainData[];
  total_domains: number;
}

export const getCitationDomainsAPI = async (
  token: string | null,
  projectId: string,
  params?: {
    start_date?: string;
    end_date?: string;
    location_id?: string;
    persona_id?: string;
    platform?: string;
    tag?: string;
  }
): Promise<{ data: CitationDomainsResponse; status: number }> => {
  try {
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const BASE_URL = `${BACKEND_URL}`;
    let requestUrl = `${BASE_URL}${GET_CITATION_DOMAINS(projectId)}`;

    // Add query parameters
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.start_date) queryParams.append("start_date", params.start_date);
      if (params.end_date) queryParams.append("end_date", params.end_date);
      if (params.location_id) queryParams.append("location_id", params.location_id);
      if (params.persona_id) queryParams.append("persona_id", params.persona_id);
      if (params.platform) queryParams.append("platform", params.platform);
      if (params.tag) queryParams.append("tag", params.tag);

      const queryString = queryParams.toString();
      if (queryString) {
        requestUrl += `?${queryString}`;
      }
    }

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
      throw new Error(JSON.stringify(error.issues));
    }

    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

export const getSearchLinkDomainsAPI = async (
  token: string | null,
  projectId: string,
  params?: {
    start_date?: string;
    end_date?: string;
    location_id?: string;
    persona_id?: string;
    platform?: string;
    tag?: string;
  }
): Promise<{ data: SearchLinkDomainsResponse; status: number }> => {
  try {
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const BASE_URL = `${BACKEND_URL}`;
    let requestUrl = `${BASE_URL}${GET_SEARCHLINK_DOMAINS(projectId)}`;

    // Add query parameters
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.start_date) queryParams.append("start_date", params.start_date);
      if (params.end_date) queryParams.append("end_date", params.end_date);
      if (params.location_id) queryParams.append("location_id", params.location_id);
      if (params.persona_id) queryParams.append("persona_id", params.persona_id);
      if (params.platform) queryParams.append("platform", params.platform);
      if (params.tag) queryParams.append("tag", params.tag);

      const queryString = queryParams.toString();
      if (queryString) {
        requestUrl += `?${queryString}`;
      }
    }

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
      throw new Error(JSON.stringify(error.issues));
    }

    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

// Onboarding APIs

export interface GenerateKeywordsRequest {
  brand_name: string;
  url: string;
  description: string;
}

export interface GenerateKeywordsLocation {
  city: string;
  region: string;
  country: string;
}

export interface GenerateKeywordsPersona {
  name: string;
  description: string;
}

export interface GenerateKeywordsCompetitorBrand {
  brand_name: string;
  brand_url: string;
  brand_type: "competition";
}

export interface GenerateKeywordsResponse {
  brand_name: string;
  url: string;
  keywords: string[];
  locations: GenerateKeywordsLocation[];
  personas: GenerateKeywordsPersona[];
  competitor_brands: GenerateKeywordsCompetitorBrand[];
  generated_at: string;
}

export const generateKeywordsAPI = async (
  token: string | null,
  payload: GenerateKeywordsRequest
): Promise<{ data: GenerateKeywordsResponse; status: number }> => {
  try {
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(`${BASE_URL}${GENERATE_KEYWORDS}`);

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
      throw new Error(JSON.stringify(error.issues));
    }

    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

export interface GeneratePromptsRequest {
  keywords: string[];
  max_prompts?: number;
}

export interface GeneratedPrompt {
  prompt: string;
  tag: string;
}

export interface GeneratePromptsResponse {
  prompts: GeneratedPrompt[];
  generated_at: string;
}

export const generatePromptsAPI = async (
  token: string | null,
  payload: GeneratePromptsRequest
): Promise<{ data: GeneratePromptsResponse; status: number }> => {
  try {
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(`${BASE_URL}${GENERATE_PROMPTS}`);

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
      throw new Error(JSON.stringify(error.issues));
    }

    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

// Get Org Plan
export const getOrgPlanAPI = async (
  token: string | null,
  orgId: string
): Promise<{ data: OrgPlanResponse; status: number }> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + GET_ORG_PLAN(orgId));
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.get(requestUrl, headers);

    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.issues));
    }

    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

export interface BulkTrackerRequest {
  prompt: string;
  llm_models: string[];
  location_ids?: string[];
  persona_ids?: string[];
  tag_names?: string[];
}

export interface BulkTrackersRequest {
  trackers: BulkTrackerRequest[];
}

export interface BulkTrackersResponse {
  trackers: Tracker[];
  created_count: number;
  created_at: string;
}

export const bulkCreateTrackersAPI = async (
  token: string | null,
  projectId: string,
  payload: BulkTrackersRequest
): Promise<{ data: BulkTrackersResponse; status: number }> => {
  try {
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(`${BASE_URL}${BULK_CREATE_TRACKERS(projectId)}`);

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
      throw new Error(JSON.stringify(error.issues));
    }

    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

// Personas Report Interfaces
export interface BrandMetric {
  id: string;
  brand_name: string;
  visibility: string;
  sentiment: string;
  position: string;
}

export interface PersonaMetric {
  visibility: string;
  sentiment: string;
  position: string;
}

export interface PersonaReportItem {
  id: string;
  name: string;
  description: string;
  persona_metrics: PersonaMetric;
  brand_metrics: BrandMetric[];
}

export interface PersonasReportResponse {
  personas: PersonaReportItem[];
}

// Location Report Interfaces
export interface LocationMetric {
  visibility: string;
  sentiment: string;
  position: string;
}

export interface LocationReportItem {
  id: string;
  city: string;
  region: string;
  country: string;
  description: string;
  location_metrics: LocationMetric;
  brand_metrics: BrandMetric[];
}

export interface LocationReportResponse {
  locations: LocationReportItem[];
}

// Get Personas Report API
export const getPersonasReportAPI = async (
  token: string | null,
  projectId: string,
  params: any
): Promise<{ data: PersonasReportResponse; status: number }> => {
  try {
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(`${BASE_URL}${GET_PERSONAS_REPORT(projectId)}`);

    const headers = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      params: params,
    };

    const { data } = await axios.get(requestUrl, headers);

    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.issues));
    }

    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

// Get Location Report API
export const getLocationReportAPI = async (
  token: string | null,
  projectId: string,
  params: any
): Promise<{ data: LocationReportResponse; status: number }> => {
  try {
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(`${BASE_URL}${GET_LOCATION_REPORT(projectId)}`);

    const headers = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      params: params,
    };

    const { data } = await axios.get(requestUrl, headers);

    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.issues));
    }

    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};


// Page Audit interfaces
export interface PageAuditRequest {
  product_page_url: string;
}

export interface AuditIssue {
  severity: string;
  message: string;
}

export interface AuditRecommendation {
  impact: string;
  message: string;
}

export interface AuditSubSection {
  description: string;
  section_name: string;
  available?: string;
  score: number;
  issues?: AuditIssue[];
  recommendations?: AuditRecommendation[];
}

export interface AuditSection {
  section_name: string;
  score: number;
  description?: string;
  sub_sections?: {
    [key: string]: AuditSubSection;
  };
}

export interface PageAuditResponse {
  project_id: string;
  url: string;
  audit_results: {
    key_metrics: {
      crawl_readiness: AuditSection;
      product_page: AuditSection;
      landing_page: AuditSection;
    };
    crawl_readiness: AuditSection;
    product_page: AuditSection;
    landing_page?: AuditSection;
  };
}

export const pageAuditAPI = async (
  token: string | null,
  projectId: string,
  payload: PageAuditRequest
): Promise<{ data: PageAuditResponse; status: number }> => {
  try {
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(`${BASE_URL}${PAGE_AUDIT(projectId)}`);

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
      throw new Error(JSON.stringify(error.issues));
    }

    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

// Audit API Types
export interface AuditMetadata {
  page_number: number;
  page_size: number;
  total_pages: number;
  total_records: number;
}

export interface KeyMetric {
  score: number;
  section_name: string;
  description: string;
}

export interface KeyMetrics {
  crawl_readiness: KeyMetric;
  product_page: KeyMetric;
  landing_page: KeyMetric;
}

export interface AuditResult {
  audit_id: string;
  page_url: string;
  created_at: string;
  key_metrics: KeyMetrics;
}

export interface AuditsResponse {
  project_id: string;
  audit_results: AuditResult[];
  metadata: AuditMetadata;
}

export interface Issue {
  severity: "low" | "moderate" | "high";
  message: string;
}

export interface Recommendation {
  impact: "low" | "moderate" | "high";
  message: string;
}

export interface SubSection {
  section_name: string;
  available?: string;
  score: number;
  issues?: Issue[];
  recommendations?: Recommendation[];
  description: string;
}

export interface Section {
  section_name: string;
  score: number;
  sub_sections?: {
    [key: string]: SubSection;
  };
  description?: string;
  issues?: Issue[];
  recommendations?: Recommendation[];
}

export interface AuditDetailResponse {
  project_id: string;
  run_id: string;
  url: string;
  created_at: string;
  key_metrics: KeyMetrics;
  crawl_readiness: Section;
  product_page: Section;
  landing_page?: Section;
}

// Get Audits API
export const getAuditsAPI = async (
  token: string | null,
  projectId: string,
  page: number = 1,
  limit: number = 10
): Promise<{ data: AuditsResponse; status: number }> => {
  try {
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(`${BASE_URL}${GET_AUDITS(projectId)}?page_num=${page}&limit=${limit}`);

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
      throw new Error(JSON.stringify(error.issues));
    }

    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

// Get Audit Detail API
export const getAuditDetailAPI = async (
  token: string | null,
  projectId: string,
  auditId: string
): Promise<{ data: AuditDetailResponse; status: number }> => {
  try {
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(`${BASE_URL}${GET_AUDIT_DETAIL(projectId, auditId)}`);

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
      throw new Error(JSON.stringify(error.issues));
    }

    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

// Web Indexing API Types
export interface WebIndexingStartRequest {
  base_url: string;
  urls_count: number;
}

export interface WebIndexingStartResponse {
  audit_id: string;
  status: string;
  message: string;
}

export interface WebIndexingItem {
  audit_id: string;
  base_url: string;
  indexed_urls_count: number;
  non_indexed_urls_count: number;
  total_urls_count: number;
  created_at: string;
  status: string;
}

export interface WebIndexingListResponse {
  web_indexing: WebIndexingItem[];
}

export interface WebIndexingDetailResponse {
  urls_checked: string[];
  indexed_urls: string[];
  non_indexed_urls: string[];
  non_indexed_urls_count: number;
  indexed_urls_count: number;
  total_urls_count: number;
  audit_id: string;
  project_id: string;
  base_url: string;
  created_at: string;
  status: string;
}

export const startWebIndexingAPI = async (
  token: string | null,
  projectId: string,
  payload: WebIndexingStartRequest
): Promise<{ data: WebIndexingStartResponse; status: number }> => {
  try {
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(`${BASE_URL}${WEB_INDEXING(projectId)}`);

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
      throw new Error(JSON.stringify(error.issues));
    }

    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

export const getWebIndexingListAPI = async (
  token: string | null,
  projectId: string
): Promise<{ data: WebIndexingListResponse; status: number }> => {
  try {
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(`${BASE_URL}${WEB_INDEXING(projectId)}`);

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
      throw new Error(JSON.stringify(error.issues));
    }

    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

export const getWebIndexingDetailAPI = async (
  token: string | null,
  projectId: string,
  auditId: string
): Promise<{ data: WebIndexingDetailResponse; status: number }> => {
  try {
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(`${BASE_URL}${WEB_INDEXING_AUDIT(projectId, auditId)}`);

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
      throw new Error(JSON.stringify(error.issues));
    }

    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

// Insights API Types
export interface Insight {
  id: string;
  project_id: string;
  type: string;
  domain: string;
  summary: string;
  details: string;
  status: "unread" | "read" | "done" | "ignored";
  action?: "done" | "ignore";
  created_at: string;
}

export interface InsightsMetadata {
  page_number: number;
  page_size: number;
  total_pages: number;
  total_records: number;
}

export interface InsightsResponse {
  insights: Insight[];
  metadata: InsightsMetadata;
}

export const getInsightsAPI = async (
  token: string | null,
  projectId: string,
  page: number = 1,
  limit: number = 100
): Promise<{ data: InsightsResponse; status: number }> => {
  try {
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(`${BASE_URL}${GET_INSIGHTS(projectId)}?page=${page}&limit=${limit}`);

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
      throw new Error(JSON.stringify(error.issues));
    }

    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

export interface GenerateInsightsResponse {
  message: string;
  project_id: string;
  status: string;
}

export const generateInsightsAPI = async (
  token: string | null,
  projectId: string
): Promise<{ data: GenerateInsightsResponse; status: number }> => {
  try {
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(`${BASE_URL}${GENERATE_INSIGHTS(projectId)}`);
    const headers = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    const { data } = await axios.post(requestUrl, {}, headers);

    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.issues));
    }

    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

// Update Insight API Types
export interface UpdateInsightRequest {
  action: "done" | "ignore";
}

export interface UpdateInsightResponse {
  id: string;
  project_id: string;
  type: string;
  domain: string;
  summary: string;
  details: string;
  status: "unread" | "read" | "done" | "ignored";
  action?: "done" | "ignore";
  created_at: string;
}

export const updateInsightAPI = async (
  token: string | null,
  projectId: string,
  insightId: string,
  request: UpdateInsightRequest
): Promise<{ data: UpdateInsightResponse; status: number }> => {
  try {
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(`${BASE_URL}${UPDATE_INSIGHT(projectId, insightId)}`);

    const headers = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    const { data } = await axios.put(requestUrl, request, headers);

    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.issues));
    }

    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

// Blog outline types and APIs
export interface BlogOutlineItem {
  topic_id: string;
  topic: string;
  title: string;
  outline: string;
  status: "draft" | "created";
  created_at?: string;
  updated_at?: string;
}

/** Single outline detail (get one / update response) */
export interface BlogOutlineRun {
  topic_id: string;
  topic: string;
  title: string;
  outline: string;
  status: "draft" | "created";
  created_at: string;
  updated_at: string;
  brand_url: string;
  description: string;
  project_id?: string;
}

export interface CreateBlogOutlineRequest {
  topics: string[];
  brand_url: string;
  description: string;
}

export interface CreateBlogOutlineResponse {
  status: string;
  brand_url: string;
  description: string;
  outlines: BlogOutlineItem[];
  created_at: string;
  updated_at: string;
}

export interface BlogOutlinesMetadata {
  page_number: number;
  page_size: number;
  total_pages: number;
  total_records: number;
}

export interface GetBlogOutlinesResponse {
  blog_outlines: BlogOutlineItem[];
  metadata: BlogOutlinesMetadata;
}

export interface UpdateBlogOutlineRequest {
  status: "draft" | "created";
}

export const createBlogOutlineAPI = async (
  token: string | null,
  projectId: string,
  payload: CreateBlogOutlineRequest
): Promise<{ data: CreateBlogOutlineResponse; status: number }> => {
  try {
    if (!token) throw new Error("Authentication token is required");

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(`${BASE_URL}${CREATE_BLOG_OUTLINE(projectId)}`);
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.post(requestUrl, payload, headers);
    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) throw new Error(JSON.stringify(error.issues));
    throw new Error(extractErrorMessage(error));
  }
};

export interface GetBlogOutlinesParams {
  page?: number;
  limit?: number;
  status?: "draft" | "created";
}

export const getBlogOutlinesAPI = async (
  token: string | null,
  projectId: string,
  params?: GetBlogOutlinesParams
): Promise<{ data: GetBlogOutlinesResponse; status: number }> => {
  try {
    if (!token) throw new Error("Authentication token is required");

    const BASE_URL = `${BACKEND_URL}`;
    const query = new URLSearchParams();
    if (params?.page != null) query.set("page", String(params.page));
    if (params?.limit != null) query.set("limit", String(params.limit));
    if (params?.status != null) query.set("status", params.status);
    const queryString = query.toString();
    const requestUrl = encodeURI(
      `${BASE_URL}${GET_BLOG_OUTLINES(projectId)}${queryString ? `?${queryString}` : ""}`
    );
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.get(requestUrl, headers);
    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) throw new Error(JSON.stringify(error.issues));
    throw new Error(extractErrorMessage(error));
  }
};

export const getBlogOutlineAPI = async (
  token: string | null,
  projectId: string,
  topicId: string
): Promise<{ data: BlogOutlineRun; status: number }> => {
  try {
    if (!token) throw new Error("Authentication token is required");

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(`${BASE_URL}${GET_BLOG_OUTLINE(projectId, topicId)}`);
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.get(requestUrl, headers);
    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) throw new Error(JSON.stringify(error.issues));
    throw new Error(extractErrorMessage(error));
  }
};

export const updateBlogOutlineAPI = async (
  token: string | null,
  projectId: string,
  topicId: string,
  payload: UpdateBlogOutlineRequest
): Promise<{ data: BlogOutlineRun; status: number }> => {
  try {
    if (!token) throw new Error("Authentication token is required");

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(`${BASE_URL}${UPDATE_BLOG_OUTLINE(projectId, topicId)}`);
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.put(requestUrl, payload, headers);
    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) throw new Error(JSON.stringify(error.issues));
    throw new Error(extractErrorMessage(error));
  }
};

export const deleteBlogOutlineAPI = async (
  token: string | null,
  projectId: string,
  topicId: string
): Promise<{ status: number }> => {
  try {
    if (!token) throw new Error("Authentication token is required");

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(`${BASE_URL}${DELETE_BLOG_OUTLINE(projectId, topicId)}`);
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    await axios.delete(requestUrl, headers);
    return { status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) throw new Error(JSON.stringify(error.issues));
    throw new Error(extractErrorMessage(error));
  }
};
