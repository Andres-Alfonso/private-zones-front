// app/routes/users/_layout.tsx

import type { MetaFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, NavLink, useLocation, useLoaderData } from "@remix-run/react";
import { Users, Plus, BarChart3, Settings } from "lucide-react";
import AuthGuard, { RoleGuard } from '~/components/AuthGuard';
import NavTabs from "~/components/tenant/button-header";
import { useCurrentUser } from '~/context/AuthContext';

export const meta: MetaFunction = () => {
  return [
    { title: "Gestión de Usuarios - Admin Panel" },
    { name: "description", content: "Administración y gestión de usuarios" },
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
  
  return json({
    timestamp: new Date().toISOString()
  });
};

export default function UsersLayout() {
  return (
    <AuthGuard>
      <RoleGuard requiredRoles={['admin', 'moderator']} requireAll={false}>
        <UsersLayoutContent />
      </RoleGuard>
    </AuthGuard>
  );
}

function UsersLayoutContent() {
  const location = useLocation();
  const { user } = useCurrentUser();
  const data = useLoaderData<{ timestamp: string }>();
  
  const isCreatePage = location.pathname.includes('/create');
  const isEditPage = location.pathname.includes('/edit');
  const isDetailPage = location.pathname.match(/\/users\/[^\/]+$/) && !isCreatePage;
  const isIndexPage = location.pathname === '/users';
  const isStatsPage = location.pathname === '/users/stats';

  // Navegación principal
  const navigation = [
    {
      name: 'Todos los Usuarios',
      href: '/users',
      icon: Users,
      active: isIndexPage
    },
    {
      name: 'Estadísticas',
      href: '/users/stats',
      icon: BarChart3,
      active: isStatsPage
    }
  ];

  // Navegación administrativa
  const adminNavigation = [
    {
      name: 'Crear Usuario',
      href: '/users/create',
      icon: Plus,
      active: isCreatePage
    },
    {
      name: 'Configuración',
      href: '/users/settings',
      icon: Settings,
      active: location.pathname === '/users/settings'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header del módulo de usuarios */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200/50">
        <div className="container mx-auto px-4">
          {/* Breadcrumb y título */}
          <div className="py-6 border-b border-gray-200/50">
            <div className="flex items-center justify-between">
              <div>
                <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                  <a href="/" className="hover:text-blue-600 transition-colors font-medium">Inicio</a>
                  <span className="text-gray-300">/</span>
                  <span className="text-gray-700 font-medium">Administración</span>
                  <span className="text-gray-300">/</span>
                  <span className="text-gray-900 font-semibold">Usuarios</span>
                  {isCreatePage && (
                    <>
                      <span className="text-gray-300">/</span>
                      <span className="text-blue-600 font-semibold">Crear</span>
                    </>
                  )}
                  {isEditPage && (
                    <>
                      <span className="text-gray-300">/</span>
                      <span className="text-purple-600 font-semibold">Editar</span>
                    </>
                  )}
                </nav>
                
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                      {isCreatePage ? 'Crear Nuevo Usuario' : 
                       isEditPage ? 'Editar Usuario' :
                       isDetailPage ? 'Detalle del Usuario' :
                       isStatsPage ? 'Estadísticas de Usuarios' :
                       'Gestión de Usuarios'}
                    </h1>
                    <p className="text-gray-600 mt-1 text-lg">
                      {isCreatePage ? 'Complete la información para crear un nuevo usuario' :
                       isEditPage ? 'Modifique la información del usuario' :
                       isStatsPage ? 'Analiza el comportamiento y métricas de usuarios' :
                       'Administra y supervisa todos los usuarios de la plataforma'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Información del usuario administrador */}
              {/* <div className="hidden lg:block">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
                  <div className="text-right">
                    <div className="text-sm text-gray-500 font-medium">Panel de Administración</div>
                    <div className="font-bold text-gray-900 text-lg mt-1">{user?.name}</div>
                    <div className="flex justify-end mt-3">
                      {user?.roles.map((role) => (
                        <span 
                          key={role}
                          className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full shadow-sm ml-1 ${
                            role === 'admin' 
                              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' 
                              : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                          }`}
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div> */}
            </div>
          </div>

          {/* Navegación del módulo */}
          {!isCreatePage && !isEditPage && !isDetailPage && (
            <div className="py-6">
              <div className="flex items-center justify-between">
                {/* Navegación principal */}
                <nav className="flex space-x-2">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.name}
                        to={item.href}
                        className={({ isActive }) =>
                          `flex items-center space-x-3 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                            isActive
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-white/80 hover:shadow-md hover:scale-105 backdrop-blur-sm border border-gray-200/50'
                          }`
                        }
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </NavLink>
                    );
                  })}
                </nav>

                {/* Navegación administrativa */}
                <NavTabs items={adminNavigation} />
              </div>
            </div>
          )}

          {/* Acciones para páginas específicas */}
          {isDetailPage && (
            <div className="py-6">
              <div className="flex items-center justify-between">
                <NavLink
                  to="/users"
                  className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 transition-colors font-medium bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200/50 hover:bg-white/80 hover:shadow-md"
                >
                  <span className="text-lg">←</span>
                  <span>Volver a la lista</span>
                </NavLink>

                <div className="flex space-x-3">
                  <button className="px-6 py-3 text-sm border border-gray-300 rounded-xl hover:bg-white/80 hover:shadow-md transition-all duration-200 font-medium bg-white/60 backdrop-blur-sm">
                    Editar
                  </button>
                  <button className="px-6 py-3 text-sm bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium">
                    Desactivar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Acciones para crear/editar */}
          {(isCreatePage || isEditPage) && (
            <div className="py-6">
              <div className="flex items-center justify-between">
                <NavLink
                  to="/users"
                  className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 transition-colors font-medium bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200/50 hover:bg-white/80 hover:shadow-md"
                >
                  <span className="text-lg">←</span>
                  <span>Volver a la lista</span>
                </NavLink>

                <div className="flex items-center space-x-3 text-sm text-gray-600 font-medium">
                  <span>Los campos marcados con * son obligatorios</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contenido principal */}
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* Footer del módulo */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50 mt-16 shadow-lg">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between text-sm">
            <div className="font-medium text-gray-700">
              © {new Date().getFullYear()} Sistema de Gestión de Usuarios
            </div>
            <div className="flex space-x-6">
              <a 
                href="/help/users" 
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium hover:underline"
              >
                Ayuda
              </a>
              <a 
                href="/admin/user-logs" 
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium hover:underline"
              >
                Logs de Usuario
              </a>
              <a 
                href="/admin/permissions" 
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium hover:underline"
              >
                Permisos
              </a>
              <a 
                href="/admin/roles" 
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium hover:underline"
              >
                Roles
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}