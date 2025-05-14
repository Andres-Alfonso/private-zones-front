import axios from 'axios';
// import { getAuthToken } from '~/utils/auth';

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
    // Aquí puedes manejar errores comunes como 401 (no autorizado)
    if (error.response && error.response.status === 401) {
      // Redireccionar a login o refrescar token
    }
    return Promise.reject(error);
  }
);

export default apiClient;