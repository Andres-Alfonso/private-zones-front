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
        VALIDATE_DOMAIN: '/v1/tenants/validate-domain',
        CHECK_STATUS: '/v1/tenants/check-status',
        BY_DOMAIN: '/v1/tenants/by-domain'
      }
    },
  };