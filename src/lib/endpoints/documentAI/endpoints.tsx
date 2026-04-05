
export const DocumentAIEndpoints = {
    //user
    GET_CURRENT_ACTIVE_USER: `/user`,
    GET_ALL_USERS: (page: number, limit: number)=> `/users?page=${page}&limit=${limit}`,
    ADD_USER_TO_ORG: (userId: string, orgId: string) => `/user/${userId}/org/${orgId}`,

    //org
    CREATE_ORG: `/org`,
    GET_ORG: (orgId: string) => `/org/${orgId}`,
    ADD_CREDITS: (orgId: string) => `/org/${orgId}/credits`,
    GET_CREDITS: (orgId: string) => `/org/${orgId}/credits`,
    UPDATE_CREDITS: (orgId: string) => `/org/${orgId}/credits`,
    GET_ALL_ORGS: `/orgs`,
    GET_ALL_ORGS_SUMMARY: `/orgs/summary`,
    UPDATE_ORG: (orgId: string)=> `/org/${orgId}`,
    GET_PARALLEL_EXECUTIONS: (orgId: string) => `/org/${orgId}/rate_limit`,
    UPDATE_PARALLEL_EXECUTIONS: (orgId: string) => `/org/${orgId}/rate_limit`,
    GET_ORG_USERS: (orgId: string) => `/org/${orgId}/users`,
    INVITE_USER_TO_ORG: (orgId: string) => `/org/${orgId}/invite`,
    DELETE_INVITE: (orgId: string, inviteId: string) => `/org/${orgId}/invites/${inviteId}`,

    //api-key
    CREATE_API_KEY: `/apikey`,
    GET_ALL_API_KEYS: `/apikeys`,
    DELETE_API_KEY: (apikeyKey: string) => `/apikey/${apikeyKey}`,

    //workflow
    GET_ALL_WORKFLOWS: `/workflows`,
    GET_WORKFLOW: (workflowId: string)=> `/workflow?workflow_id=${workflowId}`,
    CREATE_WORKFLOW: `/workflow`,
    UPDATE_WORKFLOW: (workflowId: string)=> `/workflow?workflow_id=${workflowId}`,
    DELETE_WORKFLOW: (workflowId: string) => `/workflow?workflow_id=${workflowId}`,
    MAKE_WORKFLOW_PUBLIC: (workflowId: string, isPublic: boolean) => `/workflow/public?workflow_id=${workflowId}&public=${isPublic}`,
    TRANSFER_WORKFLOW: `/transfer`,

    //run workflow
    RUN_WORKFLOW: `/run`,
    BULK_RUN_WORKFLOW: `/extract/bulk`,

    //others
    MASK_FIELDS: `/detect/mask`,
    CREATE_AZURE_USER: `/azureuser`,
    BATCH_ANALYZE_DOCUMENTS: `/analyze/document/batch`,
    ANALYZE_DOCUMENT: `/analyze/document`,
    ANALYZE_SCENE: `/analyze/scene`,
    REMOVE_BACKGROUND: `/image/background_removal/`,
    GET_SIMILARITY: `/image/similarity/`,
    DETECT_OBJECTS: `/image/object_detection/`,
    DETECT_FEATURES: `/detect`,
    DOCUMENT_QUALITY: `/analyze/document/quality`,
    SCENE_QUALITY: `/analyze/scene/quality`,
}