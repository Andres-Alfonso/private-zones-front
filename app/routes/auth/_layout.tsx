// app/routes/auth/_layout.tsx
import type { MetaFunction } from "@remix-run/node";
import { Outlet, NavLink, useLocation } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Autenticación" },
    { name: "description", content: "Portal de autenticación" },
  ];
};

export default function AuthLayout() {
  const location = useLocation();
  const isLoginPage = location.pathname.includes('login');
  
  return (
    <div className="flex h-screen items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-blue-600 p-6 text-white">
          <h2 className="text-2xl font-bold text-center">
            {isLoginPage ? 'Iniciar sesión' : 'Crear cuenta'}
          </h2>
        </div>
        
        {/* Pestañas de navegación */}
        <div className="flex border-b">
          <NavLink 
            to="/auth/login"
            className={({ isActive }) => 
              `w-1/2 py-4 text-center font-medium transition-colors ${
                isActive 
                  ? "text-blue-600 border-b-2 border-blue-600" 
                  : "text-gray-600 hover:text-blue-500"
              }`
            }
          >
            Iniciar sesión
          </NavLink>
          <NavLink 
            to="/auth/register"
            className={({ isActive }) => 
              `w-1/2 py-4 text-center font-medium transition-colors ${
                isActive 
                  ? "text-blue-600 border-b-2 border-blue-600" 
                  : "text-gray-600 hover:text-blue-500"
              }`
            }
          >
            Registrarse
          </NavLink>
        </div>
        
        <div className="p-6">
          {/* Outlet para las rutas hijas */}
          <Outlet />
        </div>
        
        {/* Pie de página para ambas vistas */}
        <div className="border-t p-4 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} Windows Channel
        </div>
      </div>
    </div>
  );
}