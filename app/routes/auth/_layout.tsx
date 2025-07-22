// app/routes/auth/_layout.tsx
import type { MetaFunction } from "@remix-run/node";
import { Outlet, NavLink, useLocation } from "@remix-run/react";
import { User, UserPlus, Shield, Lock } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Autenticación" },
    { name: "description", content: "Portal de autenticación" },
  ];
};

export default function AuthLayout() {
  const location = useLocation();
  const isLoginPage = location.pathname.includes('login');
  const isRegisterPage = location.pathname.includes('register');
  const isForgotPasswordPage = location.pathname.includes('forgot-password');
  const isResetPasswordPage = location.pathname.includes('reset-password');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header del módulo de autenticación */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200/50">
        <div className="container mx-auto px-4">
          {/* Breadcrumb y título */}
          <div className="py-6 border-b border-gray-200/50">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <nav className="flex items-center justify-center space-x-2 text-sm text-gray-500 mb-3">
                  <a href="/" className="hover:text-blue-600 transition-colors font-medium">Inicio</a>
                  <span className="text-gray-300">/</span>
                  <span className="text-gray-900 font-semibold">Autenticación</span>
                  {isLoginPage && (
                    <>
                      <span className="text-gray-300">/</span>
                      <span className="text-blue-600 font-semibold">Iniciar Sesión</span>
                    </>
                  )}
                  {isRegisterPage && (
                    <>
                      <span className="text-gray-300">/</span>
                      <span className="text-green-600 font-semibold">Registro</span>
                    </>
                  )}
                  {isForgotPasswordPage && (
                    <>
                      <span className="text-gray-300">/</span>
                      <span className="text-purple-600 font-semibold">Recuperar Contraseña</span>
                    </>
                  )}
                </nav>
                
                <div className="flex items-center justify-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                    {isLoginPage && <User className="h-8 w-8 text-white" />}
                    {isRegisterPage && <UserPlus className="h-8 w-8 text-white" />}
                    {(isForgotPasswordPage || isResetPasswordPage) && <Lock className="h-8 w-8 text-white" />}
                    {!isLoginPage && !isRegisterPage && !isForgotPasswordPage && !isResetPasswordPage && <Shield className="h-8 w-8 text-white" />}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                      {isLoginPage ? 'Iniciar Sesión' : 
                       isRegisterPage ? 'Crear Cuenta' :
                       isForgotPasswordPage ? 'Recuperar Contraseña' :
                       isResetPasswordPage ? 'Restablecer Contraseña' :
                       'Portal de Autenticación'}
                    </h1>
                    <p className="text-gray-600 mt-1 text-lg">
                      {isLoginPage ? 'Accede a tu cuenta para continuar' :
                       isRegisterPage ? 'Únete a nuestra plataforma' :
                       isForgotPasswordPage ? 'Te enviaremos un enlace para restablecer tu contraseña' :
                       isResetPasswordPage ? 'Crea una nueva contraseña segura' :
                       'Gestiona el acceso a tu cuenta'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navegación del módulo - Solo mostrar en login y register */}
          {(isLoginPage || isRegisterPage) && (
            <div className="py-6">
              <div className="flex items-center justify-center">
                <nav className="flex space-x-2 bg-white/60 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-gray-200/50">
                  <NavLink
                    to="/auth/login"
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-8 py-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white/80 hover:shadow-md hover:scale-105'
                      }`
                    }
                  >
                    <User className="h-5 w-5" />
                    <span>Iniciar Sesión</span>
                  </NavLink>
                  <NavLink
                    to="/auth/register"
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-8 py-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg transform scale-105'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white/80 hover:shadow-md hover:scale-105'
                      }`
                    }
                  >
                    <UserPlus className="h-5 w-5" />
                    <span>Registrarse</span>
                  </NavLink>
                </nav>
              </div>
            </div>
          )}

          {/* Navegación para páginas de contraseña */}
          {(isForgotPasswordPage || isResetPasswordPage) && (
            <div className="py-6">
              <div className="flex items-center justify-center">
                <NavLink
                  to="/auth/login"
                  className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 transition-colors font-medium bg-white/60 backdrop-blur-sm px-6 py-3 rounded-xl border border-gray-200/50 hover:bg-white/80 hover:shadow-md transform hover:scale-105"
                >
                  <span className="text-lg">←</span>
                  <span>Volver al inicio de sesión</span>
                </NavLink>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contenido principal */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[calc(100vh-320px)]">
          <div className="w-full max-w-md">
            {/* Tarjeta principal del formulario */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden transform hover:scale-[1.02] transition-all duration-200">
              {/* Header de la tarjeta */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200/50">
                <div className="flex items-center justify-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
                    {isLoginPage && <User className="h-6 w-6 text-white" />}
                    {isRegisterPage && <UserPlus className="h-6 w-6 text-white" />}
                    {(isForgotPasswordPage || isResetPasswordPage) && <Lock className="h-6 w-6 text-white" />}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {isLoginPage ? 'Iniciar Sesión' : 
                     isRegisterPage ? 'Crear Cuenta' :
                     isForgotPasswordPage ? 'Recuperar Contraseña' :
                     isResetPasswordPage ? 'Nueva Contraseña' :
                     'Autenticación'}
                  </h2>
                </div>
                <p className="text-center text-sm text-gray-600 mt-2">
                  {isLoginPage ? 'Ingresa tus credenciales' :
                   isRegisterPage ? 'Completa tu información' :
                   isForgotPasswordPage ? 'Ingresa tu correo electrónico' :
                   isResetPasswordPage ? 'Crea una contraseña segura' :
                   'Portal de acceso'}
                </p>
              </div>
              
              {/* Contenido del formulario */}
              <div className="p-8">
                <Outlet />
              </div>
            </div>

            {/* Enlaces adicionales */}
            <div className="mt-6 text-center">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-md border border-gray-200/50">
                {isLoginPage && (
                  <div className="space-y-2">
                    <NavLink
                      to="/auth/forgot-password"
                      className="block text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </NavLink>
                    <div className="text-sm text-gray-600">
                      ¿No tienes cuenta?{' '}
                      <NavLink
                        to="/auth/register"
                        className="font-medium text-green-600 hover:text-green-700 transition-colors hover:underline"
                      >
                        Regístrate aquí
                      </NavLink>
                    </div>
                  </div>
                )}
                
                {isRegisterPage && (
                  <div className="text-sm text-gray-600">
                    ¿Ya tienes cuenta?{' '}
                    <NavLink
                      to="/auth/login"
                      className="font-medium text-blue-600 hover:text-blue-700 transition-colors hover:underline"
                    >
                      Inicia sesión aquí
                    </NavLink>
                  </div>
                )}

                {(isForgotPasswordPage || isResetPasswordPage) && (
                  <div className="text-sm text-gray-600">
                    ¿Recordaste tu contraseña?{' '}
                    <NavLink
                      to="/auth/login"
                      className="font-medium text-blue-600 hover:text-blue-700 transition-colors hover:underline"
                    >
                      Inicia sesión
                    </NavLink>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer del módulo */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="font-medium text-gray-700">
                © {new Date().getFullYear()} Windows Channel - Portal Seguro
              </span>
            </div>
            <div className="flex space-x-6">
              <a 
                href="/help/auth" 
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium hover:underline"
              >
                Ayuda
              </a>
              <a 
                href="/privacy" 
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium hover:underline"
              >
                Privacidad
              </a>
              <a 
                href="/terms" 
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium hover:underline"
              >
                Términos
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}