// app/components/Header.tsx
// Header actualizado con integración de autenticación

import { Link } from "@remix-run/react";
import { useAuth, useCurrentUser } from '~/context/AuthContext';
import { UserMenu } from './UserMenu';
import { RoleGuard } from './AuthGuard';

export default function Header() {
  const { state } = useAuth();
  const { isAuthenticated, user } = useCurrentUser();

  return (
    <header className="fixed top-0 left-0 right-0 bg-blue-600 text-white z-10 shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo y nombre de la app */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-sm">MA</span>
            </div>
            <span className="text-xl font-bold hidden sm:block">Mi Aplicación</span>
          </Link>
          
          {/* Navegación principal */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className="hover:text-blue-200 transition-colors font-medium"
            >
              Inicio
            </Link>
            
            {isAuthenticated && (
              <>
                <Link 
                  to="/products" 
                  className="hover:text-blue-200 transition-colors font-medium"
                >
                  Productos
                </Link>
                
                <Link 
                  to="/dashboard" 
                  className="hover:text-blue-200 transition-colors font-medium"
                >
                  Dashboard
                </Link>
                
                <RoleGuard requiredRole="admin">
                  <Link 
                    to="/admin" 
                    className="hover:text-blue-200 transition-colors font-medium bg-blue-700 px-3 py-1 rounded-md"
                  >
                    Admin
                  </Link>
                </RoleGuard>
              </>
            )}
          </nav>
          
          {/* Sección de autenticación */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                {/* Indicador de estado de carga */}
                {state.isLoading && (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm hidden sm:block">Cargando...</span>
                  </div>
                )}
                
                {/* Información rápida del usuario */}
                <div className="hidden lg:block text-right">
                  <div className="text-sm font-medium">{user?.name}</div>
                  <div className="text-xs text-blue-200">
                    {user?.roles.map(role => role.charAt(0).toUpperCase() + role.slice(1)).join(', ')}
                  </div>
                </div>
                
                {/* Menú de usuario */}
                <UserMenu />
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  to="/auth/login" 
                  className="text-blue-200 hover:text-white transition-colors font-medium"
                >
                  Iniciar Sesión
                </Link>
                <Link 
                  to="/auth/register" 
                  className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md transition-colors font-medium"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Navegación móvil */}
        {isAuthenticated && (
          <div className="md:hidden mt-3 pt-3 border-t border-blue-500">
            <div className="flex space-x-4">
              <Link 
                to="/products" 
                className="text-blue-200 hover:text-white transition-colors text-sm"
              >
                Productos
              </Link>
              <Link 
                to="/dashboard" 
                className="text-blue-200 hover:text-white transition-colors text-sm"
              >
                Dashboard
              </Link>
              <RoleGuard requiredRole="admin">
                <Link 
                  to="/admin" 
                  className="text-blue-200 hover:text-white transition-colors text-sm"
                >
                  Admin
                </Link>
              </RoleGuard>
            </div>
          </div>
        )}
      </div>
      
      {/* Indicador de estado de la aplicación */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-500 text-black text-xs text-center py-1">
          🚧 Modo Desarrollo - {isAuthenticated ? `Autenticado como: ${user?.email}` : 'No autenticado'}
        </div>
      )}
    </header>
  );
}