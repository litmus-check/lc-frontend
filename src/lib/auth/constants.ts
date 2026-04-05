/** Cookie name for the bearer token used across frontend auth/session. */
export const ACCESS_TOKEN_COOKIE = "qualium_access_token";

/** Default session length (seconds). Override with AUTH_SESSION_MAX_AGE. */
export const DEFAULT_SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
