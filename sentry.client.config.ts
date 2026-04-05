// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

// Prevent multiple initializations
if (!(window as any).__SENTRY_INITIALIZED__) {
  (window as any).__SENTRY_INITIALIZED__ = true;
  
  Sentry.init({
    dsn: "https://3eb8144a7dae085249f1049fc32f6ae2@o4505197823787008.ingest.us.sentry.io/4509044164395008",

    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: 1,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,

    // Disable Session Replay to prevent multiple instances
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    
    integrations: [
      // Remove the replay integration to prevent multiple instances
      // Sentry.replayIntegration({
      //   maskAllText: true,
      //   blockAllMedia: true,
      // }),
    ],
  });
}
