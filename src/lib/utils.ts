import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extract error message from API error response
 * @param error - The error object from API calls
 * @returns The error message string
 */
export const extractErrorMessage = (error: any): string => {
  console.log("Extracting error message from:", error);
  
  // If error has a response with data.detail (FastAPI error format)
  if (error?.response?.data?.detail) {
    return typeof error.response.data.detail === 'string' 
      ? error.response.data.detail 
      : JSON.stringify(error.response.data.detail);
  }
  
  // If error has a response with data.error (backend error format)
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  
  // If error has a response with data.message (alternative backend error format)
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  // If error has a response with data (direct error object)
  if (error?.response?.data && typeof error.response.data === 'string') {
    return error.response.data;
  }
  
  // If error has a response with data (object with error property)
  if (error?.response?.data && typeof error.response.data === 'object') {
    if (error.response.data.error) {
      return error.response.data.error;
    }
    if (error.response.data.message) {
      return error.response.data.message;
    }
  }
  
  // If error has a response with error property (some API functions return this)
  if (error?.error) {
    return error.error;
  }
  
  // If error has a message property
  if (error?.message) {
    return error.message;
  }
  
  // If error is a string
  if (typeof error === 'string') {
    return error;
  }
  
  // If error has data property directly
  if (error?.data?.error) {
    return error.data.error;
  }
  
  // If error has data.detail directly
  if (error?.data?.detail) {
    return typeof error.data.detail === 'string' 
      ? error.data.detail 
      : JSON.stringify(error.data.detail);
  }
  
  if (error?.data?.message) {
    return error.data.message;
  }
  
  // Fallback to generic message
  return "An error occurred";
};

// Project ID storage utilities (client: localStorage + cookie for RSC)
const SELECTED_PROJECT_ID_KEY = 'selectedGeologyProjectId';
export const GEOLOGY_PROJECT_ID_COOKIE = 'geology_project_id';

export const getSelectedProjectId = (): string | null => {
  if (typeof window === 'undefined') return null;

  try {
    return localStorage.getItem(SELECTED_PROJECT_ID_KEY);
  } catch (error) {
    console.error('Error reading selected project ID from localStorage:', error);
  }
  return null;
};

export const setSelectedProjectId = (projectId: string | null): void => {
  if (typeof window === 'undefined') return;

  try {
    if (projectId) {
      localStorage.setItem(SELECTED_PROJECT_ID_KEY, projectId);
      document.cookie = `${GEOLOGY_PROJECT_ID_COOKIE}=${encodeURIComponent(projectId)}; path=/; max-age=31536000; SameSite=Lax`;
    } else {
      localStorage.removeItem(SELECTED_PROJECT_ID_KEY);
      document.cookie = `${GEOLOGY_PROJECT_ID_COOKIE}=; path=/; max-age=0`;
    }
  } catch (error) {
    console.error('Error saving selected project ID:', error);
  }
};

// Environment storage utilities
const ENVIRONMENT_STORAGE_KEY = 'selectedEnvironments';

export const getStoredEnvironment = (suiteId: string): string | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(ENVIRONMENT_STORAGE_KEY);
    if (stored) {
      const environments = JSON.parse(stored);
      return environments[suiteId] || null;
    }
  } catch (error) {
    console.error('Error reading environment from localStorage:', error);
  }
  return null;
};

export const setStoredEnvironment = (suiteId: string, environmentId: string | null): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const stored = localStorage.getItem(ENVIRONMENT_STORAGE_KEY);
    const environments = stored ? JSON.parse(stored) : {};
    
    if (environmentId) {
      environments[suiteId] = environmentId;
    } else {
      delete environments[suiteId];
    }
    
    localStorage.setItem(ENVIRONMENT_STORAGE_KEY, JSON.stringify(environments));
  } catch (error) {
    console.error('Error saving environment to localStorage:', error);
  }
};

/**
 * Format timestamp to show only date and time (removes day and year)
 * @param timestamp - The timestamp string to format
 * @returns Formatted timestamp string (e.g., "Dec 15, 2:30 PM")
 */
export const formatTimestamp = (timestamp: string): string => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });
};

/**
 * Validates if a string is valid JSON
 * @param value - The string value to validate
 * @param fieldName - The name of the field for error messages
 * @returns Error message string or null if valid
 */
export const validateJSON = (value: string, fieldName: string): string | null => {
  if (!value || value.trim() === '') {
    return null; // Empty is allowed, will be validated as required separately
  }
  try {
    JSON.parse(value);
    return null; // Valid JSON
  } catch (e) {
    return `${fieldName} must be valid JSON format`;
  }
};

/**
 * Format location value to display as "city, region, Country"
 * Handles arrays, single objects, and stringified JSON
 * @param value - The location value (array, object, or string)
 * @returns Array of formatted location strings, or null if empty/invalid
 */
export const formatLocation = (value: any): string[] | string | null => {
  if (value === null || value === undefined) {
    return null;
  }

  // Helper function to format a single location object
  // Only includes non-empty values and joins with commas
  const formatLocationObject = (loc: any): string => {
    const parts = [];
    // Only add non-empty, non-null values
    if (loc.city && loc.city.trim() !== "") parts.push(loc.city);
    if (loc.region && loc.region.trim() !== "") parts.push(loc.region);
    if (loc.country && loc.country.trim() !== "") parts.push(loc.country);
    // Join with commas - if a part is missing, no comma will appear before the next part
    return parts.length > 0 ? parts.join(", ") : JSON.stringify(loc);
  };

  // Handle arrays
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return null;
    }
    return value.map((loc: any) => formatLocationObject(loc));
  }

  // Handle single object
  if (typeof value === "object" && value !== null) {
    return formatLocationObject(value);
  }

  // Handle stringified JSON
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        if (parsed.length === 0) {
          return null;
        }
        return parsed.map((loc: any) => formatLocationObject(loc));
      }
      if (typeof parsed === "object" && parsed !== null) {
        return formatLocationObject(parsed);
      }
    } catch (e) {
      // Not valid JSON, return as-is
      return value;
    }
  }

  // Fallback: return as string
  return String(value);
}

/**
 * Check if an array contains only strings or numbers (primitive types that can be displayed as tags)
 * @param arr - The array to check
 * @returns true if array contains only strings/numbers, false otherwise
 */
export const isStringArray = (arr: any[]): boolean => {
  if (!Array.isArray(arr) || arr.length === 0) {
    return false;
  }
  return arr.every((item: any) => typeof item === 'string' || typeof item === 'number');
};;

