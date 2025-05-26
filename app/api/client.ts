import axios from 'axios';
// import { getAuthToken } from '~/utils/auth';
import { setupAuthInterceptors } from './interceptors/authInterceptor';

// Configura la URL base según el entorno
const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.tudominio.com' 
  : 'http://localhost:3020';

// Crea una instancia de axios con la URL base
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar automáticamente el header del tenant
apiClient.interceptors.request.use((config) => {
  // Obtener dominio actual
  const domain = window.location.hostname;
  
  // Agregar header del tenant
  config.headers['X-Tenant-Domain'] = domain;
  
  return config;
});

// Configurar interceptores de autenticación
setupAuthInterceptors(apiClient);

// Interceptor para añadir el token de autenticación a las solicitudes
// apiClient.interceptors.request.use(
//   (config) => {
//     const token = getAuthToken();
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// Interceptor para manejar errores de respuesta
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Manejar errores de red
    if (!error.response) {
      console.error('Network error:', error);
      // Podrías mostrar una notificación de error de red aquí
    }
    
    // Manejar errores del servidor
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response.data);
      // Podrías mostrar una notificación de error del servidor aquí
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;