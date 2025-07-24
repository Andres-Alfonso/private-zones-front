// app/api/config.ts

export const API_CONFIG = {
    BASE_URL: process.env.NODE_ENV === 'production' 
      ? 'https://api.dominio.com'
      : 'http://192.168.2.21:3028',
    
    // Timeouts
    TIMEOUT: 10000, // 10 segundos
    
    // Endpoints principales
    ENDPOINTS: {
      AUTH: {
        LOGIN: '/v1/auth/login',
        REGISTER: '/v1/auth/register',
        REFRESH: '/v1/auth/refresh',
        LOGOUT: '/v1/auth/logout',
        LOGOUT_ALL: '/v1/auth/logout-all',
        ME: '/v1/auth/me',
      },
      USERS: {
        BASE: '/users',
        PROFILE: '/users/profile',
      },
      PAYMENTS: {
        STRIPE: {
          FIND_ALL: '/v1/gateway-payment/stripe/products',
          CREATE_CHECKOUT_SESSION: '/v1/gateway-payment/stripe/create-checkout-session'
        }
      },
      TENANTS: {
        BASE: '/v1/tenants',
        CREATE_TENANT: '/v1/tenants/create',
        TOGGLE_ACTIVE: '/tenants/toggle-active', // + /{id}
        GET_STATUS: '/tenants/status', // + /{id}
        VALIDATE_DOMAIN: '/v1/tenants/validate-domain',
        CHECK_STATUS: '/v1/tenants/check-status',
        BY_DOMAIN: '/v1/tenants/by-domain'
      },
      SECTIONS: {
        BASE: '/v1/sections',
        BY_ID: (id: string) => `/v1/sections/${id}`,
        CREATE: '/v1/sections/create',
        UPDATE: (id: string) => `/v1/sections/${id}/update`,
        TOGGLE_ACTIVE: (id: string) => `/v1/sections/${id}/toggle-active`,
        GET_STATUS: (id: string) => `/v1/sections/${id}/status`
      },
    },
  };