// app/api/types/auth.types.ts

// Interfaces para requests
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

// Interfaces para responses
export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt?: string;
    updatedAt?: string;
  };
}

export interface AuthState {
  user: LoginResponse['user'] | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Interfaces para errores de API
export interface AuthError {
  message: string;
  field?: string;
  code?: string;
}

export interface AuthApiResponse<T> {
  data?: T;
  error?: AuthError;
  errors?: AuthError[];
  message?: string;
  success: boolean;
}

// Tipos para validación del lado del cliente
export interface FormField {
  value: string;
  error: string | null;
  touched: boolean;
}

export interface LoginFormState {
  email: FormField;
  password: FormField;
  rememberMe: boolean;
}

export interface RegisterFormState {
  firstName: FormField;
  lastName: FormField;
  email: FormField;
  password: FormField;
  confirmPassword: FormField;
  agreeTerms: boolean;
}

// Constantes para validación
export const AUTH_VALIDATION_RULES = {
  EMAIL: {
    REQUIRED: 'El correo electrónico es obligatorio',
    INVALID_FORMAT: 'El formato del correo electrónico no es válido',
    MAX_LENGTH: 254
  },
  PASSWORD: {
    REQUIRED: 'La contraseña es obligatoria',
    MIN_LENGTH: 8,
    MIN_LENGTH_MESSAGE: 'La contraseña debe tener al menos 8 caracteres',
    PATTERN_MESSAGE: 'La contraseña debe contener al menos una mayúscula, una minúscula y un número',
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/
  },
  NAME: {
    REQUIRED: 'El nombre es obligatorio',
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    MIN_LENGTH_MESSAGE: 'El nombre debe tener al menos 2 caracteres',
    MAX_LENGTH_MESSAGE: 'El nombre no puede tener más de 50 caracteres'
  },
  TERMS: {
    REQUIRED: 'Debes aceptar los términos y condiciones'
  }
} as const;

// Tipos para estados de carga
export type AuthLoadingState = 'idle' | 'loading' | 'success' | 'error';

// Tipos para diferentes acciones de autenticación
export type AuthAction = 
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: LoginResponse }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' };

// Interface para el contexto de autenticación
export interface AuthContextType {
  state: AuthState;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}