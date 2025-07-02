// app/routes/users/_layout.tsx

import type { MetaFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, NavLink, useLocation, useLoaderData } from "@remix-run/react";
import { Users, Plus, Search, Filter, Grid, List, BarChart3, Settings, UserCheck, UserX } from "lucide-react";
import { RoleGuard } from '~/components/AuthGuard';
import { useCurrentUser } from '~/context/AuthContext';

export const meta: MetaFunction = () => {
  return [
    { title: "Gestión de Usuarios - Admin Panel" },
    { name: "description", content: "Administración y gestión de usuarios" },
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
  // Aquí podrías cargar datos compartidos para todas las rutas de usuarios
  return json({
    timestamp: new Date().toISOString()
  });
};

export default function UsersLayout() {
  return (
    <RoleGuard requiredRoles={['admin', 'moderator']} requireAll={false}>
      <UsersLayoutContent />
    </RoleGuard>
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
      icon: Grid,
      active: isIndexPage,
      description: 'Lista completa de usuarios'
    },
    {
      name: 'Estadísticas',
      href: '/users/stats',
      icon: BarChart3,
      active: isStatsPage,
      description: 'Métricas y reportes'
    }
  ];

  // Navegación administrativa
  const adminNavigation = [
    {
      name: 'Crear Usuario',
      href: '/users/create',
      icon: Plus,
      active: isCreatePage,
      description: 'Agregar nuevo usuario'
    },
    {
      name: 'Configuración',
      href: '/users/settings',
      icon: Settings,
      active: location.pathname === '/users/settings',
      description: 'Configurar roles y permisos'
    }
  ];

  // Navegación de filtros rápidos
  const quickFilters = [
    {
      name: 'Usuarios Activos',
      href: '/users?active=true',
      icon: UserCheck,
      color: 'text-green-600'
    },
    {
      name: 'Usuarios Inactivos',
      href: '/users?active=false',
      icon: UserX,
      color: 'text-red-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Header del módulo de usuarios */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          {/* Breadcrumb y título */}
          <div className="py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                  <a href="/" className="hover:text-gray-700">Inicio</a>
                  <span>/</span>
                  <span className="text-gray-900 font-medium">Administración</span>
                  <span>/</span>
                  <span className="text-gray-900 font-medium">Usuarios</span>
                  {isCreatePage && (
                    <>
                      <span>/</span>
                      <span className="text-gray-900 font-medium">Crear</span>
                    </>
                  )}
                  {isEditPage && (
                    <>
                      <span>/</span>
                      <span className="text-gray-900 font-medium">Editar</span>
                    </>
                  )}
                </nav>
                
                <div className="flex items-center space-x-3">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {isCreatePage ? 'Crear Nuevo Usuario' : 
                       isEditPage ? 'Editar Usuario' :
                       isDetailPage ? 'Detalle del Usuario' :
                       isStatsPage ? 'Estadísticas de Usuarios' :
                       'Gestión de Usuarios'}
                    </h1>
                    <p className="text-gray-600">
                      {isCreatePage ? 'Complete la información para crear un nuevo usuario' :
                       isEditPage ? 'Modifique la información del usuario' :
                       isStatsPage ? 'Analiza el comportamiento y métricas de usuarios' :
                       'Administra y supervisa todos los usuarios de la plataforma'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Información del usuario administrador */}
              <div className="hidden lg:block text-right">
                <div className="text-sm text-gray-600">Panel de Administración</div>
                <div className="font-medium text-gray-900">{user?.name}</div>
                <div className="flex space-x-1 mt-1">
                  {user?.roles.map((role) => (
                    <span 
                      key={role}
                      className={`px-2 py-1 text-xs rounded-full ${
                        role === 'admin' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Navegación del módulo */}
          {!isCreatePage && !isEditPage && !isDetailPage && (
            <div className="py-4">
              <div className="flex items-center justify-between">
                {/* Navegación principal */}
                <nav className="flex space-x-6">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.name}
                        to={item.href}
                        className={({ isActive }) =>
                          `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            isActive
                              ? 'bg-blue-100 text-blue-700'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                          }`
                        }
                        title={item.description}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </NavLink>
                    );
                  })}
                </nav>

                {/* Navegación administrativa */}
                <div className="flex items-center space-x-4">
                  {/* Filtros rápidos */}
                  <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500 font-medium">Filtros rápidos:</span>
                    {quickFilters.map((filter) => {
                      const Icon = filter.icon;
                      return (
                        <NavLink
                          key={filter.name}
                          to={filter.href}
                          className={`flex items-center space-x-1 px-2 py-1 rounded text-xs hover:bg-white transition-colors ${filter.color}`}
                          title={filter.name}
                        >
                          <Icon className="h-3 w-3" />
                          <span className="hidden lg:block">{filter.name.split(' ')[1]}</span>
                        </NavLink>
                      );
                    })}
                  </div>

                  {/* Navegación administrativa */}
                  <div className="flex space-x-2">
                    {adminNavigation.map((item) => {
                      const Icon = item.icon;
                      return (
                        <NavLink
                          key={item.name}
                          to={item.href}
                          className={({ isActive }) =>
                            `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                              isActive
                                ? 'bg-green-100 text-green-700'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`
                          }
                          title={item.description}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="hidden sm:block">{item.name}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Acciones para páginas específicas */}
          {isDetailPage && (
            <div className="py-4">
              <div className="flex items-center justify-between">
                <NavLink
                  to="/users"
                  className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  <span>←</span>
                  <span>Volver a la lista</span>
                </NavLink>

                <div className="flex space-x-2">
                  <button className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                    Editar
                  </button>
                  <button className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700">
                    Desactivar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Acciones para crear/editar */}
          {(isCreatePage || isEditPage) && (
            <div className="py-4">
              <div className="flex items-center justify-between">
                <NavLink
                  to="/users"
                  className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  <span>←</span>
                  <span>Volver a la lista</span>
                </NavLink>

                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <span>Los campos marcados con * son obligatorios</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Barra de estado (solo en índice) */}
      {isIndexPage && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-700">Sistema operativo</span>
                </div>
                <div className="text-gray-600">
                  Última sincronización: hace 2 minutos
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">
                  Total de usuarios registrados
                </span>
                <span className="font-medium text-blue-700">
                  Cargando...
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* Footer del módulo */}
      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>© {new Date().getFullYear()} Sistema de Gestión de Usuarios</span>
              <span>•</span>
              <span>Usuarios activos en tiempo real</span>
            </div>
            <div className="flex space-x-4">
              <a href="/help/users" className="hover:text-gray-900">Ayuda</a>
              <a href="/admin/user-logs" className="hover:text-gray-900">Logs de Usuario</a>
              <a href="/admin/permissions" className="hover:text-gray-900">Permisos</a>
              <a href="/admin/roles" className="hover:text-gray-900">Roles</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}