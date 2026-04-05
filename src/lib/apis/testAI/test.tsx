const BACKEND_URL = `${process.env.NEXT_PUBLIC_LITMUSCHECK_URL}`;
import { TestAIEndpoints } from "@/lib/endpoints/testAI/endpoints";
import axios from "axios";
import { z } from "zod";
const {
  CREATE_TEST,
  CREATE_TEST_SUITE,
  GET_ALL_TESTS,
  GET_TEST,
  RUN_TEST,
  RUN_SUITE,
  GET_TEST_SUITE,
  UPDATE_TEST,
  GET_ALL_TEST_SUITES,
  DELETE_TEST,
  GET_TEST_RUNS_BULK,
  GET_TEST_RUN,
  UPDATE_TEST_SUITE,
  DELETE_TEST_SUITE,
  GET_SUITE_RUNS,
  GET_TEST_RUNS_FOR_SUITE_RUN,
  GET_HEALING_SUGGESTIONS,
  UPDATE_HEALING_SUGGESTION,
  LIVE_TEST_RUN,
  EXPORT_SCRIPT,
  CREATE_WEBHOOK,
  GET_WEBHOOK,
  GET_ALL_WEBHOOKS,
  UPDATE_WEBHOOK,
  DELETE_WEBHOOK,
  GET_LOG_STREAM,
  GENERATE_INSTRUCTIONS_FROM_GOAL,
  RUN_TEST_WITH_AI,
  UPLOAD_FILE,
  GET_FILE,
  GET_FILES,
  UPDATE_FILE,
  DELETE_FILE,
  DOWNLOAD_FILE,
  GENERATE_TEST_PLANS,
  BULK_CREATE_TESTS,
  GET_TAGS
} = TestAIEndpoints;

export const generateTestPlansAPI = async (
  token: string | null,
  suite_id: string,
  plan_description: string
): Promise<any> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = BASE_URL + GENERATE_TEST_PLANS(suite_id);

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await axios.post(requestUrl, {
      plan_description: plan_description
    }, { headers });

    return response;
  } catch (error: any) {
    console.error("Error generating test plans:", error);
    throw error;
  }
};

export const bulkCreateTestsAPI = async (
  token: string | null,
  suite_id: string,
  tests: Array<{ name: string; description: string }>
): Promise<any> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = BASE_URL + BULK_CREATE_TESTS(suite_id);

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await axios.post(requestUrl, {
      tests: tests
    }, { headers });

    return response;
  } catch (error: any) {
    console.error("Error creating bulk tests:", error);
    throw error;
  }
};
export const createTestAPI = async (
  token: string | null,
  payload: any
): Promise<any> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }
    // make a call to localhost:8000/upload/
    const BASE_URL = `${BACKEND_URL}`;

    const requestUrl = encodeURI(BASE_URL + CREATE_TEST);
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
export const createTestSuiteAPI = async (
  token: string | null,
  payload: any
): Promise<any> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }
    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + CREATE_TEST_SUITE);
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

export const liveTestRunAPI = async (
  token: string | null,
  testRunId: string
): Promise<any> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }
    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + LIVE_TEST_RUN(testRunId));
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




export const createWebhookAPI = async (
  token: string | null,
  webhookUrl: string
): Promise<any> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }
    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + CREATE_WEBHOOK);
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    const { data } = await axios.post(
      requestUrl,
      {
        webhook_url: webhookUrl,
      },
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
      return { error: errorMessage, status: error.response.status };
    }

    // Handle network errors or other issues
    const errorMessage = error.message || 'An error occurred';
    return { error: errorMessage, status: 500 };
  }
};

export const getWebhookAPI = async (
  token: string | null,
  webhookId: string
): Promise<any> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }
    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + GET_WEBHOOK(webhookId));
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

export const exportScriptAPI = async (
  token: string | null,
  testId: string
): Promise<any> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }
    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + EXPORT_SCRIPT(testId));
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

export const updateWebhookAPI = async (
  token: string | null,
  webhookId: string,
  webhookUrl: string
): Promise<any> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }
    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + UPDATE_WEBHOOK);
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    const { data } = await axios.put(
      requestUrl,
      {
        id: webhookId,
        webhook_url: webhookUrl,
      },
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

export const getAllWebhooksAPI = async (token: string | null): Promise<any> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }
    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + GET_ALL_WEBHOOKS);
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

export const deleteWebhookAPI = async (
  token: string | null,
  webhookId: string
): Promise<any> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }
    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + DELETE_WEBHOOK(webhookId));
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

export const getLogStreamAPI = async (
  token: string | null,
  testRunId: string
): Promise<any> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }
    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + GET_LOG_STREAM(token, testRunId));
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




export const getTestSuiteAPI = async (
  token: string | null,
  suiteId: string,
  page?: number,
  limit?: number,
  query?: string,
  status?: string,
  last_run?: string | null
): Promise<any> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }
    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + GET_TEST_SUITE(suiteId, page, limit, query, status, last_run));
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


export const getTestSuitesAPI = async (
  token: string | null,
  page: number,
  limit: number
): Promise<any> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }
    // make a call to localhost:8000/upload/
    const BASE_URL = `${BACKEND_URL}`;

    const requestUrl = encodeURI(BASE_URL + GET_ALL_TEST_SUITES(page, limit));
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

export const getTestsAPI = async (
  token: string | null,
  page: number,
  limit: number
): Promise<any> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }
    // make a call to localhost:8000/upload/
    const BASE_URL = `${BACKEND_URL}`;

    const requestUrl = encodeURI(BASE_URL + GET_ALL_TESTS(page, limit));
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

export const getTestRunsBulkAPI = async (
  token: string | null,
  page: number,
  limit: number,
  test_id: string
): Promise<any> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }
    // make a call to localhost:8000/upload/
    const BASE_URL = `${BACKEND_URL}`;

    const requestUrl = encodeURI(
      BASE_URL + GET_TEST_RUNS_BULK(page, limit, test_id)
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
    if (error instanceof z.ZodError) {
      return JSON.stringify(error.issues), { status: 422 };
    }
  }
}
export const generateInstructionsFromGoalAPI = async (token: string | null, testId: string): Promise<any> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }
    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + GENERATE_INSTRUCTIONS_FROM_GOAL(testId));
    const headers = {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    };
    const { data } = await axios.post(requestUrl, {}, headers);
    return ({ data: data, status: 200 });
  }
  catch (error: any) {
    if (error instanceof z.ZodError) {
      return (JSON.stringify(error.issues), { status: 422 });
    }
    return (JSON.stringify(error), { status: 500 });
  }
}



export const getTestRunsAPI = async (
  token: string | null,
  test_id: string
): Promise<any> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }
    // make a call to localhost:8000/upload/
    const BASE_URL = `${BACKEND_URL}`;

    const requestUrl = encodeURI(BASE_URL + GET_TEST_RUN(test_id));
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

export const getTestAPI = async (
  token: string | null,
  testId: string
): Promise<any> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }
    // make a call to localhost:8000/upload/
    const BASE_URL = `${BACKEND_URL}`;

    const requestUrl = encodeURI(BASE_URL + GET_TEST(testId));
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

export const runTestAPI = async (
  token: string | null,
  testId: string,
  browser?: string,
  payload?: any,
  environment_id?: string | null
): Promise<any> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }
    // make a call to localhost:8000/upload/
    const BASE_URL = `${BACKEND_URL}`;

    const requestUrl = browser ? encodeURI(BASE_URL + RUN_TEST(testId) + `?browser=${browser}`) : encodeURI(BASE_URL + RUN_TEST(testId));
    const headers = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    // Add environment_id to payload only if provided
    const requestPayload = {
      ...(payload || {}),
      ...(environment_id && { environment_id })
    };

    const { data } = await axios.post(requestUrl, requestPayload, headers);

    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.issues));
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

export const runTestWithAIAPI = async (
  token: string | null,
  testId: string,
  browser?: string
): Promise<any> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }
    // make a call to localhost:8000/upload/
    const BASE_URL = `${BACKEND_URL}`;

    const requestUrl = browser ? encodeURI(BASE_URL + RUN_TEST_WITH_AI(testId) + `?browser=${browser}`) : encodeURI(BASE_URL + RUN_TEST_WITH_AI(testId));
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

export const runSuiteAPI = async (
  token: string | null,
  suiteId: string,
  payload?: any,
  environment_id?: string | null
): Promise<any> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }
    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + RUN_SUITE(suiteId));
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    // Add environment_id to payload only if provided
    const requestPayload = {
      ...(payload || {}),
      ...(environment_id && { environment_id })
    };

    const { data } = await axios.post(requestUrl, requestPayload, headers);
    return { data: data, status: 200 };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new Error(JSON.stringify(error.issues));
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

export const updateTestAPI = async (
  token: string | null,
  testId: string,
  payload: any
): Promise<any> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }
    // make a call to localhost:8000/upload/
    const BASE_URL = `${BACKEND_URL}`;

    const requestUrl = encodeURI(BASE_URL + UPDATE_TEST(testId));
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

export const updateTestSuiteAPI = async (
  token: string | null,
  suiteId: string,
  payload: any
): Promise<any> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }
    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + UPDATE_TEST_SUITE(suiteId));
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    const { data } = await axios.patch(requestUrl, payload, headers);

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

export const deleteTestAPI = async (
  token: string | null,
  testId: string
): Promise<any> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }
    // make a call to localhost:8000/upload/
    const BASE_URL = `${BACKEND_URL}`;

    const requestUrl = encodeURI(BASE_URL + DELETE_TEST(testId));
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

export const deleteTestSuiteAPI = async (
  token: string | null,
  suiteId: string
): Promise<any> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }
    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + DELETE_TEST_SUITE(suiteId));
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

export const getSuiteRunsAPI = async (
  token: string | null,
  page: number,
  limit: number,
  suiteId: string
): Promise<any> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }
    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + GET_SUITE_RUNS(page, limit, suiteId));
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

export const getTestRunsForSuiteRunAPI = async (
  token: string | null,
  page: number,
  limit: number,
  suiteId: string,
  suiteRunId: string
): Promise<any> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }
    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(
      BASE_URL + GET_TEST_RUNS_FOR_SUITE_RUN(page, limit, suiteId, suiteRunId)
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

export const getHealingSuggestionsAPI = async (
  token: string | null,
  suiteId: string,
  suiteRunId: string
): Promise<any> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }
    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(
      BASE_URL + GET_HEALING_SUGGESTIONS(suiteId, suiteRunId)
    );

    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await axios.get(requestUrl, headers);
    return { data: response.data, status: response.status };
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

export const updateHealingSuggestionAPI = async (
  token: string | null,
  suiteId: string,
  healingSuggestionId: string,
  payload: {
    status: string;
    updated_test: {
      instructions: any[];
    };
  }
): Promise<any> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }
    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(
      BASE_URL + UPDATE_HEALING_SUGGESTION(suiteId, healingSuggestionId)
    );
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

// File Management APIs
export const uploadFileAPI = async (
  token: string | null,
  suiteId: string,
  file: File,
  type?: string
): Promise<any> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }
    const BASE_URL = `${BACKEND_URL}`;
    let requestUrl = encodeURI(BASE_URL + UPLOAD_FILE(suiteId));

    // Add type query parameter if provided
    if (type) {
      requestUrl += `?type=${type}`;
    }

    const formData = new FormData();
    formData.append('file', file);

    const headers = {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.post(requestUrl, formData, headers);
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

export const getFileAPI = async (
  token: string | null,
  suiteId: string,
  fileId: string
): Promise<any> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }
    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + GET_FILE(suiteId, fileId));
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

export const getFilesAPI = async (
  token: string | null,
  suiteId: string,
  type?: string
): Promise<any> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }
    const BASE_URL = `${BACKEND_URL}`;
    let requestUrl = encodeURI(BASE_URL + GET_FILES(suiteId));

    // Add type query parameter if provided
    if (type) {
      requestUrl += `?type=${type}`;
    }

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

export const updateFileAPI = async (
  token: string | null,
  suiteId: string,
  fileId: string,
  file: File
): Promise<any> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }
    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + UPDATE_FILE(suiteId, fileId));

    const formData = new FormData();
    formData.append('file', file);

    const headers = {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.put(requestUrl, formData, headers);
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

export const deleteFileAPI = async (
  token: string | null,
  suiteId: string,
  fileId: string
): Promise<any> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }
    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + DELETE_FILE(suiteId, fileId));
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

export const downloadFileAPI = async (
  token: string | null,
  suiteId: string,
  fileId: string,
  fallbackFilename?: string
): Promise<any> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }
    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = encodeURI(BASE_URL + DOWNLOAD_FILE(suiteId, fileId));
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    const response = await axios.get(requestUrl, config);

    // Extract file data from JSON response
    const { file_content, filename, mimetype } = response.data;

    if (!file_content) {
      throw new Error('File content not found in response');
    }

    // Use filename from response or fallback
    const downloadFilename = filename || fallbackFilename || 'file';

    // Decode base64 file content
    const binaryString = atob(file_content);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Create blob with the decoded content and mimetype
    const blob = new Blob([bytes], { type: mimetype || 'application/octet-stream' });

    // Trigger browser download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = downloadFilename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return { data: { message: 'File downloaded successfully' }, status: 200 };
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

export const getTagsAPI = async (
  token: string | null,
  suite_id: string
): Promise<any> => {
  try {
    if (!token) {
      throw new Error(`Invalid token`);
    }

    const BASE_URL = `${BACKEND_URL}`;
    const requestUrl = BASE_URL + GET_TAGS(suite_id);

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await axios.get(requestUrl, { headers });

    return response;
  } catch (error: any) {
    console.error("Error fetching tags:", error);
    throw error;
  }
};