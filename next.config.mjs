import {withSentryConfig} from '@sentry/nextjs';
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    // Acknowledge Turbopack (Next.js 16 default); webpack config comes from Sentry plugin
    turbopack: {},
    env: {
        NEXT_PUBLIC_PROD_URL: process.env.NEXT_PUBLIC_PROD_URL
    },
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'finigami-core-uat.s3.ap-south-1.amazonaws.com', pathname: '/**' },
            { protocol: 'https', hostname: 'testaifinigami.blob.core.windows.net', pathname: '/**' },
            { protocol: 'https', hostname: 'testaifinigamiprod.blob.core.windows.net', pathname: '/**' },
            { protocol: 'https', hostname: 'litmuscheckprod.blob.core.windows.net', pathname: '/**' },
            { protocol: 'https', hostname: 'finigami-core-uat.s3.amazonaws.com', pathname: '/**' },
            { protocol: 'https', hostname: 'finigami-core.s3.amazonaws.com', pathname: '/**' },
            { protocol: 'https', hostname: 'finigami-core.s3.ap-south-1.amazonaws.com', pathname: '/**' },
        ],
    },
};

export default withSentryConfig(nextConfig, {
// For all available options, see:
// https://github.com/getsentry/sentry-webpack-plugin#options

org: "finigami",
project: "qualium",

// Only print logs for uploading source maps in CI
silent: !process.env.CI,

// For all available options, see:
// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

// Upload a larger set of source maps for prettier stack traces (increases build time)
widenClientFileUpload: true,

// Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
// This can increase your server load as well as your hosting bill.
// Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
// side errors will fail.
tunnelRoute: "/monitoring",

// Hides source maps from generated client bundles
hideSourceMaps: true,

// Automatically tree-shake Sentry logger statements to reduce bundle size
disableLogger: true,
});