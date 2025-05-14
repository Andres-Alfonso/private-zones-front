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
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        REFRESH: '/auth/refresh',
        LOGOUT: '/auth/logout',
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
      }
    },
  };