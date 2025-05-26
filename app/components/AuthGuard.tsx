// app/components/AuthGuard.tsx

import React, { useEffect } from 'react';
import { useNavigate, useLocation } from '@remix-run/react';
import { useAuth } from '~/context/AuthContext';
import LoadingSpinner from './ui/LoadingSpinner';
import { ProtectedRouteProps } from '~/api/types/auth.types';

export default function AuthGuard({ 
  children, 
  fallback, 
  redirectTo = '/auth/login' 
}: ProtectedRouteProps) {
  const { state } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Si no está cargando y no está autenticado, redirigir a login
    if (!state.isLoading && !state.isAuthenticated) {
      // Guardar la URL actual para redirigir después del login
      const returnUrl = location.pathname + location.search;
      const loginUrl = `${redirectTo}?returnUrl=${encodeURIComponent(returnUrl)}`;
      navigate(loginUrl, { replace: true });
    }
  }, [state.isLoading, state.isAuthenticated, navigate, redirectTo, location]);

  // Mostrar loading mientras se verifica la autenticación
  if (state.isLoading) {
    return fallback || <AuthLoadingPage />;
  }

  // Si no está autenticado, no mostrar nada (se está redirigiendo)
  if (!state.isAuthenticated) {
    return null;
  }

  // Si está autenticado, mostrar el contenido protegido
  return <>{children}</>;
}

// Componente de loading específico para autenticación
function AuthLoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="large" />
        <div className="mt-4 space-y-2">
          <h2 className="text-xl font-semibold text-gray-800">
            Verificando autenticación...
          </h2>
          <p className="text-gray-600">
            Por favor espera un momento
          </p>
        </div>
      </div>
    </div>
  );
}

// Componente para proteger contenido basado en roles
interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredRoles?: string[];
  requireAll?: boolean; // Si es true, requiere todos los roles; si es false, requiere cualquiera
  fallback?: React.ReactNode;
}

export function RoleGuard({ 
  children, 
  requiredRole,
  requiredRoles = [],
  requireAll = false,
  fallback = null 
}: RoleGuardProps) {
  const { state } = useAuth();
  
  // Si no está autenticado, no mostrar nada
  if (!state.isAuthenticated || !state.user) {
    return <>{fallback}</>;
  }
  
  const userRoles = state.user.roles || [];
  
  // Verificar rol único
  if (requiredRole && !userRoles.includes(requiredRole)) {
    return <>{fallback}</>;
  }
  
  // Verificar múltiples roles
  if (requiredRoles.length > 0) {
    const hasAccess = requireAll 
      ? requiredRoles.every(role => userRoles.includes(role))
      : requiredRoles.some(role => userRoles.includes(role));
    
    if (!hasAccess) {
      return <>{fallback}</>;
    }
  }
  
  return <>{children}</>;
}

// Hook para manejar redirección después del login
export function useAuthRedirect() {
  const navigate = useNavigate();
  
  const redirectAfterLogin = (defaultPath: string = '/') => {
    if (typeof window === 'undefined') return;
    
    // Obtener la URL de retorno de los parámetros de consulta
    const urlParams = new URLSearchParams(window.location.search);
    const returnUrl = urlParams.get('returnUrl');
    
    if (returnUrl) {
      // Decodificar y navegar a la URL de retorno
       window.location.assign(decodeURIComponent(returnUrl));
    } else {
      // Navegar a la ruta por defecto
      window.location.assign(defaultPath);
    }
  };
  
  return { redirectAfterLogin };
}