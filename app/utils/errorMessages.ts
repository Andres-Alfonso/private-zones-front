// app/utils/errorMessages.ts

interface ErrorResponse {
  message?: string;
  error?: string;
  statusCode?: number;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export const getErrorMessage = (error: any): string => {
  // Si no hay error
  if (!error) {
    return 'Ha ocurrido un error inesperado';
  }

  // Si es un error de red
  if (!error.response) {
    return 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
  }

  const status = error.response?.status;
  const data: ErrorResponse = error.response?.data;

  // Errores por código de estado
  switch (status) {
    case 400:
      return data?.message || 'Los datos proporcionados no son válidos';
    
    case 401:
      return 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
    
    case 403:
      return 'No tienes permisos para realizar esta acción';
    
    case 404:
      return 'El recurso solicitado no fue encontrado';
    
    case 409:
      return data?.message || 'Ya existe un registro con estos datos';
    
    case 422:
      return 'Los datos proporcionados contienen errores de validación';
    
    case 500:
      return 'Error del servidor. Por favor, intenta nuevamente más tarde.';
    
    case 503:
      return 'El servicio no está disponible temporalmente';
    
    default:
      return data?.message || 'Ha ocurrido un error. Por favor, intenta nuevamente.';
  }
};

// Mapeo de errores específicos del backend a mensajes amigables
const errorMessagesMap: Record<string, string> = {
  'Usuario no encontrado': 'No se encontró tu perfil de usuario',
  'Invalid credentials': 'Credenciales inválidas',
  'User account is inactive': 'Tu cuenta está inactiva',
  'Email already exists': 'Este correo electrónico ya está en uso',
  'Invalid token': 'Token inválido o expirado',
  // Agrega más mapeos según tus necesidades
};

export const getCustomErrorMessage = (backendMessage: string): string => {
  return errorMessagesMap[backendMessage] || backendMessage;
};

// Extraer errores de validación por campo
export const getFieldErrors = (error: any): Record<string, string> => {
  const fieldErrors: Record<string, string> = {};
  
  if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
    error.response.data.errors.forEach((err: any) => {
      if (err.field && err.message) {
        fieldErrors[err.field] = err.message;
      }
    });
  }
  
  return fieldErrors;
};