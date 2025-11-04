// app/routes/auth/_layout.tsx
import type { MetaFunction } from "@remix-run/node";
import { Outlet, NavLink, useLocation } from "@remix-run/react";
import { useState } from "react";
import { User, UserPlus, Shield, Lock } from "lucide-react";
import Modal from "~/components/ui/Modal";
import { useTenant } from "~/context/TenantContext";

export const meta: MetaFunction = () => {
  return [
    { title: "Autenticación" },
    { name: "description", content: "Portal de autenticación" },
  ];
};

// Función para codificar URL solo si es necesario
function safeEncodeURI(url: string): string {
  try {
    // Intentar decodificar la URL
    const decoded = decodeURI(url);
    // Si la URL decodificada es diferente a la original, ya estaba codificada
    if (decoded !== url) {
      return url; // Ya está codificada, devolverla tal cual
    }
    // Si no estaba codificada, codificarla
    return encodeURI(url);
  } catch (e) {
    // Si hay error al decodificar, asumir que necesita codificación
    return encodeURI(url);
  }
}

export default function AuthLayout() {
  const location = useLocation();
  const { state: tenantState } = useTenant();
  const { tenant } = tenantState;
  
  const isLoginPage = location.pathname.includes('login');
  const isRegisterPage = location.pathname.includes('register');
  const isForgotPasswordPage = location.pathname.includes('forgot-password');
  const isResetPasswordPage = location.pathname.includes('reset-password');

  const [showTerms, setShowTerms] = useState(false);

  // Obtener configuración de auto-registro del tenant
  const allowSelfRegistration = tenant?.config?.allowSelfRegistration ?? true;
  
  // Obtener la ruta de la imagen de fondo personalizada
  const rawLoginBackgroundPath = tenant?.config?.loginBackgroundPath;
  
  // Codificar correctamente la URL para manejar espacios y caracteres especiales
  const loginBackgroundPath = rawLoginBackgroundPath 
    ? safeEncodeURI(rawLoginBackgroundPath) 
    : undefined;

  // Debug: verificar si se está obteniendo la ruta
  console.log('Raw Login background path:', rawLoginBackgroundPath);
  console.log('Encoded Login background path:', loginBackgroundPath);

  // Determinar el ancho máximo basado en la página
  const getMaxWidth = () => {
    if (isRegisterPage) {
      return 'max-w-2xl'; // Más ancho para el formulario de registro
    }
    return 'max-w-md'; // Ancho normal para login y otras páginas
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* DEBUG: Visualización temporal */}
      {/* {loginBackgroundPath && (
        <div 
          className="fixed top-4 right-4 bg-yellow-400 text-black px-4 py-2 rounded shadow-lg text-xs"
          style={{ zIndex: 9999 }}
        >
          ✓ Background URL loaded
        </div>
      )} */}
      
      {/* Fondo personalizado o gradiente por defecto */}
      {loginBackgroundPath ? (
        <div 
          className="fixed inset-0 w-full h-full"
          style={{
            backgroundImage: `url("${loginBackgroundPath}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            zIndex: -1
          }}
        />
      ) : (
        <div 
          className="fixed inset-0 w-full h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
          style={{ zIndex: -1 }}
        />
      )}
      
      {/* Overlay muy sutil cuando hay imagen de fondo */}
      {loginBackgroundPath && (
        <div 
          className="fixed inset-0 w-full h-full bg-black/10"
          style={{ zIndex: 0 }}
        />
      )}
      
      <main className="flex-grow container mx-auto px-4 py-8 relative" style={{ zIndex: 1 }}>
        <div className="flex items-center justify-center min-h-[calc(100vh-160px)]">
          <div className={`w-full ${getMaxWidth()}`}>
            {/* Tarjeta principal del formulario */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden transform hover:scale-[1.01] transition-all duration-200">

              {/* Navegación de pestañas login/register dentro de la card */}
              {(isLoginPage || isRegisterPage) && (
                <div className="flex justify-center border-b border-gray-200/50 bg-white/60 backdrop-blur-sm">
                  <nav className="flex space-x-2 p-2">
                    <NavLink
                      to="/auth/login"
                      className={({ isActive }) =>
                        `flex items-center space-x-2 px-6 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md transform scale-105'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-white/80 hover:shadow-md hover:scale-105'
                        }`
                      }
                    >
                      <User className="h-4 w-4" />
                      <span>Iniciar Sesión</span>
                    </NavLink>
                    
                    {/* Solo mostrar pestaña de registro si está habilitado */}
                    {allowSelfRegistration && (
                      <NavLink
                        to="/auth/register"
                        className={({ isActive }) =>
                          `flex items-center space-x-2 px-6 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                            isActive
                              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md transform scale-105'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-white/80 hover:shadow-md hover:scale-105'
                          }`
                        }
                      >
                        <UserPlus className="h-4 w-4" />
                        <span>Registrarse</span>
                      </NavLink>
                    )}
                  </nav>
                </div>
              )}

              {/* Header de la tarjeta */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-4 border-b border-gray-200/50 text-center">
                <h2 className="text-xl font-bold text-gray-900">
                  {isLoginPage ? 'Iniciar Sesión' :
                    isRegisterPage ? 'Crear Cuenta' :
                    isForgotPasswordPage ? 'Recuperar Contraseña' :
                    isResetPasswordPage ? 'Nueva Contraseña' :
                    'Autenticación'}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {isLoginPage ? 'Ingresa tus credenciales' :
                    isRegisterPage ? 'Completa tu información' :
                    isForgotPasswordPage ? 'Ingresa tu correo electrónico' :
                    isResetPasswordPage ? 'Crea una contraseña segura' :
                    'Portal de acceso'}
                </p>
              </div>

              {/* Contenido del formulario */}
              <div className={`${isRegisterPage ? 'p-6' : 'p-8'} bg-white/60 backdrop-blur-sm`}>
                <Outlet />
              </div>
            </div>

            {/* Enlaces adicionales - Solo mostrar si NO es página de registro para evitar duplicación */}
            {!isRegisterPage && (
              <div className="mt-6 text-center">
                <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200/50">
                  {isLoginPage && (
                    <div className="space-y-2">
                      <NavLink
                        to="/auth/forgot-password"
                        className="block text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors hover:underline"
                      >
                        ¿Olvidaste tu contraseña?
                      </NavLink>
                      
                      {/* Solo mostrar enlace de registro si está habilitado */}
                      {allowSelfRegistration && (
                        <div className="text-sm text-gray-600">
                          ¿No tienes cuenta?{' '}
                          <NavLink
                            to="/auth/register"
                            className="font-medium text-green-600 hover:text-green-700 transition-colors hover:underline"
                          >
                            Regístrate aquí
                          </NavLink>
                        </div>
                      )}
                    </div>
                  )}

                  {(isForgotPasswordPage || isResetPasswordPage) && (
                    <div className="text-sm text-gray-600">
                      <NavLink
                        to="/auth/login"
                        className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors hover:underline"
                      >
                        <span className="text-lg">←</span>
                        <span>Volver al inicio de sesión</span>
                      </NavLink>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer del módulo */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50 shadow-lg relative" style={{ zIndex: 1 }}>
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
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setShowTerms(true);
                }}
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium hover:underline"
              >
                Términos
              </a>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Modal de términos del layout - con z-index alto para evitar conflictos */}
      <Modal
        title="Términos y condiciones"
        isOpen={showTerms}
        onClose={() => setShowTerms(false)}
      >
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Términos Generales</h4>
            <p className="text-gray-700">
              Estos son los términos y condiciones generales de uso de la plataforma Windows Channel.
              Al utilizar nuestros servicios, aceptas cumplir con estos términos.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Uso Responsable</h4>
            <p className="text-gray-700">
              Te comprometes a utilizar la plataforma de manera responsable y conforme a las leyes aplicables.
              No debes realizar actividades que puedan dañar el sistema o afectar a otros usuarios.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Protección de Datos</h4>
            <p className="text-gray-700">
              Nos comprometemos a proteger tu información personal según nuestra política de privacidad.
              Tus datos serán tratados con la máxima confidencialidad y seguridad.
            </p>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Para más información, consulta nuestra{' '}
              <a href="/privacy" className="text-blue-600 hover:underline">
                política de privacidad
              </a>
            </p>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setShowTerms(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cerrar
            </button>
            <button
              onClick={() => setShowTerms(false)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}