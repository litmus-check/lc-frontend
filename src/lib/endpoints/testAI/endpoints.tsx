export const TestAIEndpoints = {
  GET_ALL_TESTS: (page: number, limit: number) => `/tests?page=${page}&limit=${limit}`,
  GET_TEST: (testId: string) => `/test/${testId}`,
  CREATE_TEST: `/test`,
  RUN_TEST: (testId: string) => `/test/${testId}/run`,
  RUN_TEST_WITH_AI: (testId: string) => `/test/${testId}/run/ai`,
  RUN_SUITE: (suiteId: string) => `/suite/${suiteId}/run`,
  UPDATE_TEST: (testId: string) => `/test/${testId}`,
  DELETE_TEST: (testId: string) => `/test/${testId}`,
  GET_TEST_RUNS_BULK: (page: number, limit: number, test_id: string) => `/testruns?page=${page}&limit=${limit}&test_id=${test_id}`,
  GET_TEST_RUN: (testRunId: string) => `/testrun/${testRunId}`,
  GET_SUITE_RUNS: (page: number, limit: number, suiteId: string) => `/suite/${suiteId}/runs?page=${page}&limit=${limit}`,
  GET_TEST_RUNS_FOR_SUITE_RUN: (page: number, limit: number, suiteId: string, suiteRunId: string) => `/suite/${suiteId}/run/${suiteRunId}?page=${page}&limit=${limit}`,
  GET_HEALING_SUGGESTIONS: (suiteId: string, suiteRunId: string) => `/suite/${suiteId}/run/${suiteRunId}/healing_suggestions`,
  UPDATE_HEALING_SUGGESTION: (suiteId: string, healingSuggestionId: string) => `/suite/${suiteId}/healing_suggestions/${healingSuggestionId}`,
  GET_ALL_TEST_SUITES: (page: number, limit: number) => `/suites?page=${page}&limit=${limit}`,
  GET_TEST_SUITE: (suiteId: string, page?: number, limit?: number, query?: string, status?: string, last_run?: string | null) => {
    const params = new URLSearchParams();
    if (page !== undefined) params.append('page', page.toString());
    if (limit !== undefined) params.append('limit', limit.toString());
    if (query) params.append('query', query);
    if (status) params.append('status', status);
    if (last_run !== undefined) {
      // Explicitly handle null to send it as 'null' string in query params
      params.append('last_run', last_run === null ? 'null' : last_run);
    }
    const queryString = params.toString();
    return `/suite/${suiteId}${queryString ? `?${queryString}` : ''}`;
  },
  CREATE_TEST_SUITE: `/suite`,
  UPDATE_TEST_SUITE: (suiteId: string) => `/suite/${suiteId}`,
  DELETE_TEST_SUITE: (suiteId: string) => `/suite/${suiteId}`,
  GENERATE_INSTRUCTIONS_FROM_GOAL: (testId: string) => `/test/${testId}/goal`,
  LIVE_TEST_RUN: (testRunId: string) => `/live/${testRunId}`,
  EXPORT_SCRIPT: (testId: string) => `/test/${testId}/script`,
  // WEBHOOKS
  CREATE_WEBHOOK: `/webhook`,
  GET_WEBHOOK: (webhookId: string) => `/webhook/${webhookId}`,
  UPDATE_WEBHOOK: `/webhook`,
  GET_ALL_WEBHOOKS: `/webhooks`,
  DELETE_WEBHOOK: (webhookId: string) => `/webhook/${webhookId}`,
  GET_LOG_STREAM: (token: string, testRunId: string) => `/log_stream/${token}?testrun_id=${testRunId}`,

  // SCHEDULES
  CREATE_SCHEDULE: (suiteId: string) => `/suite/${suiteId}/schedule`,
  GET_SCHEDULES: (suiteId: string) => `/suite/${suiteId}/schedules`,
  UPDATE_SCHEDULE: (suiteId: string, scheduleId: string) => `/suite/${suiteId}/schedule/${scheduleId}`,
  DELETE_SCHEDULE: (suiteId: string, scheduleId: string) => `/suite/${suiteId}/schedule/${scheduleId}`,

  // FILES
  UPLOAD_FILE: (suiteId: string) => `/suite/${suiteId}/file`,
  GET_FILE: (suiteId: string, fileId: string) => `/suite/${suiteId}/file/${fileId}`,
  GET_FILES: (suiteId: string) => `/suite/${suiteId}/files`,
  UPDATE_FILE: (suiteId: string, fileId: string) => `/suite/${suiteId}/file/${fileId}`,
  DELETE_FILE: (suiteId: string, fileId: string) => `/suite/${suiteId}/file/${fileId}`,
  DOWNLOAD_FILE: (suiteId: string, fileId: string) => `/suite/${suiteId}/file/${fileId}/download`,

  // COMPOSE
  CREATE_COMPOSE: `/compose`,
  CREATE_TEST_COMPOSE: (composeId: string) => `${composeId ? `/test/compose?compose_id=${composeId}` : `/test/compose`}`,
  UPDATE_TEST_COMPOSE: (testId: string, composeId: string) => `${composeId ? `/test/${testId}/compose?compose_id=${composeId}` : `/test/${testId}/compose`}`,
  RUN_COMPOSE: (composeId: string) => `/compose/${composeId}/run`,
  GET_COMPOSE: (composeId: string) => `/compose/${composeId}`,
  DELETE_COMPOSE: (composeId: string) => `/compose/${composeId}`,
  CREATE_GOAL: (composeId: string) => `/compose/${composeId}/goal`,

  // ENVIRONMENTS
  CREATE_ENVIRONMENT: `/environment`,
  GET_ENVIRONMENT: (environmentId: string) => `/environment/${environmentId}`,
  UPDATE_ENVIRONMENT: (environmentId: string) => `/environment/${environmentId}`,
  DELETE_ENVIRONMENT: (environmentId: string) => `/environment/${environmentId}`,
  GET_ENVIRONMENTS_BY_SUITE: (suiteId: string) => `/environment/suite/${suiteId}`,
  GET_GOAL_STATUS: (composeId: string, goalId: string) => `/compose/${composeId}/goal/${goalId}`,
  GET_LIVE_URLS: (composeId: string) => `/compose/${composeId}/live_urls`,

  // EMAIL RECIPIENTS
  GET_EMAIL_RECIPIENTS: (suiteId: string) => `/suite/${suiteId}/recipients`,
  CREATE_EMAIL_RECIPIENTS: (suiteId: string) => `/suite/${suiteId}/recipients`,
  UPDATE_EMAIL_RECIPIENTS: (suiteId: string) => `/suite/${suiteId}/recipients`,

  // TEST SEGMENTS
  GET_SEGMENT: (segmentId: string) => `/test_segment/${segmentId}`,
  CREATE_SEGMENT: `/test_segment`,
  GET_SEGMENTS_BY_SUITE: (suiteId: string) => `/test_segment/suite/${suiteId}`,
  UPDATE_SEGMENT: (segmentId: string) => `/test_segment/${segmentId}`,
  DELETE_SEGMENT: (segmentId: string) => `/test_segment/${segmentId}`,
  // TEST PLANS
  GENERATE_TEST_PLANS: (suiteId: string) => `/suite/${suiteId}/test_plan`,
  BULK_CREATE_TESTS: (suiteId: string) => `/suite/${suiteId}/bulk_tests`,

  // ELEMENTS
  GET_ELEMENTS: (suiteId: string) => `/suite/${suiteId}/elements`,
  CREATE_ELEMENT: (suiteId: string) => `/suite/${suiteId}/element`,
  UPDATE_ELEMENT: (suiteId: string, elementId: string) => `/suite/${suiteId}/element/${elementId}`,
  DELETE_ELEMENT: (suiteId: string, elementId: string) => `/suite/${suiteId}/element/${elementId}`,
  MERGE_ELEMENTS: (suiteId: string) => `/suite/${suiteId}/elements/merge`,

  // STORES
  GET_STORES: (suiteId: string) => `/suite/${suiteId}/store`,
  CREATE_STORE: (suiteId: string) => `/suite/${suiteId}/store`,
  UPDATE_STORE: (suiteId: string, storeId: string) => `/suite/${suiteId}/store/${storeId}`,
  DELETE_STORE: (suiteId: string, storeId: string) => `/suite/${suiteId}/store/${storeId}`,

  // TAGS
  GET_TAGS: (suiteId: string) => `/suite/${suiteId}/tags`
}