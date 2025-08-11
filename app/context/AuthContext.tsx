// app/context/AuthContext.tsx

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { AuthState, AuthAction, LoginRequest, RegisterRequest, AuthContextType } from '~/api/types/auth.types';
import { AuthAPI } from '~/api/endpoints/auth';
import { cookieHelpers } from '~/utils/cookieHelpers';

// Estado inicial
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  accessToken: null,
  refreshToken: null,
};

// Reducer para manejar los estados de autenticación
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'UPDATE_TOKENS':
      return {
        ...state,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        user: action.payload.user,
      };

    default:
      return state;
  }
}

// Utilidades para el manejo de tokens con cookies
const TOKEN_COOKIE_NAME = 'auth_tokens';
const USER_COOKIE_NAME = 'auth_user';

const storage = {
  getTokens: () => {
    if (typeof document === 'undefined') return null;
    try {
      return cookieHelpers.getJSON(TOKEN_COOKIE_NAME);
    } catch {
      return null;
    }
  },

  setTokens: (accessToken: string, refreshToken: string) => {
    if (typeof document === 'undefined') return;
    try {
      cookieHelpers.setJSON(TOKEN_COOKIE_NAME, {
        accessToken,
        refreshToken,
        timestamp: Date.now(),
      }, {
        maxAge: 30 * 24 * 60 * 60, // 30 días
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    } catch (error) {
      console.error('Error saving tokens:', error);
    }
  },

  getUser: () => {
    if (typeof document === 'undefined') return null;
    try {
      return cookieHelpers.getJSON(USER_COOKIE_NAME);
    } catch {
      return null;
    }
  },

  setUser: (user: any) => {
    if (typeof document === 'undefined') return;
    try {
      cookieHelpers.setJSON(USER_COOKIE_NAME, user, {
        maxAge: 30 * 24 * 60 * 60, // 30 días
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    } catch (error) {
      console.error('Error saving user:', error);
    }
  },

  clear: () => {
    if (typeof document === 'undefined') return;
    try {
      cookieHelpers.clearAuth();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
};


// Hook para verificar si el usuario tiene un rol específico
export function useHasRole(requiredRole: string): boolean {
  const { state } = useAuth();
  
  if (!state.user?.roles) {
    return false;
  }
  
  return state.user.roles.includes(requiredRole);
}

// Hook para verificar si el usuario tiene cualquiera de los roles especificados
export function useHasAnyRole(requiredRoles: string[]): boolean {
  const { state } = useAuth();
  
  if (!state.user?.roles) {
    return false;
  }
  
  return requiredRoles.some(role => state.user!.roles.includes(role));
}

// Hook para verificar si el usuario tiene todos los roles especificados
export function useHasAllRoles(requiredRoles: string[]): boolean {
  const { state } = useAuth();
  
  if (!state.user?.roles) {
    return false;
  }
  
  return requiredRoles.every(role => state.user!.roles.includes(role));
}

// Hook para obtener información específica del usuario autenticado
export function useCurrentUser() {
  const { state } = useAuth();
  
  return {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    hasRole: (role: string) => state.user?.roles?.includes(role) ?? false,
    hasAnyRole: (roles: string[]) => roles.some(role => state.user?.roles?.includes(role)) ?? false,
    hasAllRoles: (roles: string[]) => roles.every(role => state.user?.roles?.includes(role)) ?? false,
  };
}

// Context
const AuthContext = createContext<AuthContextType | null>(null);

// Hook para usar el contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
}

// Provider del contexto
interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Función para verificar y refrescar tokens
  const refreshTokens = useCallback(async (): Promise<boolean> => {
    const tokens = storage.getTokens();
    if (!tokens?.refreshToken) {
      return false;
    }

    try {
      const response = await AuthAPI.refreshToken(tokens.refreshToken);
      
      // Actualizar estado y storage
      storage.setTokens(response.accessToken, response.refreshToken);
      storage.setUser(response.user);
      
      dispatch({
        type: 'UPDATE_TOKENS',
        payload: {
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          user: response.user,
        },
      });

      return true;
    } catch (error) {
      console.error('Error refreshing tokens:', error);
      // Si falla el refresh, limpiar todo
      storage.clear();
      dispatch({ type: 'LOGOUT' });
      return false;
    }
  }, []);

  // Función para hacer login
  const login = useCallback(async (credentials: LoginRequest) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await AuthAPI.login(credentials);
      
      // Guardar en storage
      storage.setTokens(response.accessToken, response.refreshToken);
      storage.setUser(response.user);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: response,
      });
    } catch (error: any) {
      let errorMessage = 'Error al iniciar sesión';
      
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          errorMessage = 'Credenciales incorrectas';
        } else if (status === 403) {
          errorMessage = 'Cuenta inactiva';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      dispatch({
        type: 'AUTH_ERROR',
        payload: errorMessage,
      });
      
      throw error;
    }
  }, []);

  // Función para hacer register (opcional, ya lo tienes implementado)
  const register = useCallback(async (userData: RegisterRequest) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      await AuthAPI.register(userData);
      // No hacemos login automático, solo registro exitoso
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error: any) {
      let errorMessage = 'Error al registrarse';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      dispatch({
        type: 'AUTH_ERROR',
        payload: errorMessage,
      });
      
      throw error;
    }
  }, []);

  // Función para hacer logout
  const logout = useCallback(async () => {
    const tokens = storage.getTokens();
    
    // Intentar hacer logout en el servidor
    if (tokens?.refreshToken) {
      try {
        await AuthAPI.logout(tokens.refreshToken);
      } catch (error) {
        console.error('Error during server logout:', error);
        // Continuar con el logout local incluso si falla el servidor
      }
    }
    
    // Limpiar storage y estado
    storage.clear();
    dispatch({ type: 'LOGOUT' });
  }, []);

  // Función para limpiar errores
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Función para verificar si el usuario está autenticado
  const checkAuthStatus = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    const tokens = storage.getTokens();
    const user = storage.getUser();
    
    if (!tokens?.accessToken || !tokens?.refreshToken || !user) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    try {
      // Verificar si el token de acceso es válido haciendo una llamada a /me
      // Esto lo haremos más adelante con el interceptor
      
      // Por ahora, restaurar el estado desde storage
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          user: user,
        },
      });
    } catch (error) {
      // Si falla, intentar refrescar tokens
      const refreshSuccess = await refreshTokens();
      if (!refreshSuccess) {
        dispatch({ type: 'LOGOUT' });
      }
    }
  }, [refreshTokens]);

  // Auto-refresh de tokens (cada 50 minutos si el token expira en 1 hora)
  useEffect(() => {
    if (!state.isAuthenticated || !state.refreshToken) return;

    const interval = setInterval(async () => {
      await refreshTokens();
    }, 50 * 60 * 1000); // 50 minutos

    return () => clearInterval(interval);
  }, [state.isAuthenticated, state.refreshToken, refreshTokens]);

  // Verificar estado de autenticación al montar
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const contextValue: AuthContextType = {
    state,
    login,
    register,
    logout,
    clearError,
    refreshTokens,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}