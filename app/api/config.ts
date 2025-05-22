// app/api/config.ts

export const API_CONFIG = {
    BASE_URL: process.env.NODE_ENV === 'production' 
      ? 'https://api.dominio.com'
      : 'http://localhost:3020',
    
    // Timeouts
    TIMEOUT: 10000, // 10 segundos
    
    // Endpoints principales
    ENDPOINTS: {
      AUTH: {
        LOGIN: '/v1/auth/login',
        REGISTER: '/v1/auth/register',
        REFRESH: '/v1/auth/refresh',
        LOGOUT: '/v1/auth/logout',
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
        VALIDATE_DOMAIN: '/v1/tenants/validate-domain',
        CHECK_STATUS: '/v1/tenants/check-status',
        BY_DOMAIN: '/v1/tenants/by-domain'
      }
    },
  };