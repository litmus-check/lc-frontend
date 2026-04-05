export const BillingEndpoints = {
    GET_PLANS: `/plans`,
    CREATE_CHECKOUT: `/create_checkout`,
    GET_ORG_SUBSCRIPTION: (orgId: string) => `/org/${orgId}/subscriptions`,
    GET_CUSTOMER_PORTAL: (subscriptionId: string) => `/subscription/${subscriptionId}/customer_portal`,
};


