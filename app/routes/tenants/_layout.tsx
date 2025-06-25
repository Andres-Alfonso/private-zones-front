// app/routes/tenants/_layout.tsx

import type { MetaFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, NavLink, useLocation, useLoaderData } from "@remix-run/react";
import { Building2, Plus, Search, Filter, Grid, List, BarChart3, Settings } from "lucide-react";
import { RoleGuard } from '~/components/AuthGuard';
import { useCurrentUser } from '~/context/AuthContext';

export const meta: MetaFunction = () => {
  return [
    { title: "Gestión de Tenants - Admin Panel" },
    { name: "description", content: "Administración y gestión de tenants" },
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
  // Aquí podrías cargar datos compartidos para todas las rutas de tenants
  return json({
    timestamp: new Date().toISOString()
  });
};

export default function TenantsLayout() {
  return (
    <RoleGuard requiredRole="admin">
      <TenantsLayoutContent />
    </RoleGuard>
  );
}

function TenantsLayoutContent() {
  const location = useLocation();
  const { user } = useCurrentUser();
  const data = useLoaderData<{ timestamp: string }>();
  
  const isCreatePage = location.pathname.includes('/create');
  const isEditPage = location.pathname.includes('/edit');
  const isDetailPage = location.pathname.match(/\/tenants\/[^\/]+$/) && !isCreatePage;
  const isIndexPage = location.pathname === '/tenants';
  const isStatsPage = location.pathname === '/tenants/stats';

  // Navegación principal
  const navigation = [
    {
      name: 'Todos los Tenants',
      href: '/tenants',
      icon: Grid,
      active: isIndexPage
    },
    {
      name: 'Estadísticas',
      href: '/tenants/stats',
      icon: BarChart3,
      active: isStatsPage
    }
  ];

  // Navegación administrativa
  const adminNavigation = [
    {
      name: 'Crear Tenant',
      href: '/tenants/create',
      icon: Plus,
      active: isCreatePage
    },
    {
      name: 'Configuración',
      href: '/tenants/settings',
      icon: Settings,
      active: location.pathname === '/tenants/settings'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Header del módulo de tenants */}
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
                  <span className="text-gray-900 font-medium">Tenants</span>
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
                  <Building2 className="h-8 w-8 text-blue-600" />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {isCreatePage ? 'Crear Nuevo Tenant' : 
                       isEditPage ? 'Editar Tenant' :
                       isDetailPage ? 'Detalle del Tenant' :
                       isStatsPage ? 'Estadísticas de Tenants' :
                       'Gestión de Tenants'}
                    </h1>
                    <p className="text-gray-600">
                      {isCreatePage ? 'Complete la información para crear un nuevo tenant' :
                       isEditPage ? 'Modifique la información del tenant' :
                       isStatsPage ? 'Analiza el rendimiento y uso de los tenants' :
                       'Administra y supervisa todos los tenants de la plataforma'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Información del usuario administrador */}
              <div className="hidden lg:block text-right">
                <div className="text-sm text-gray-600">Panel de Administración</div>
                <div className="font-medium text-gray-900">{user?.name}</div>
                <div className="flex space-x-1 mt-1">
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                    Admin
                  </span>
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
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </NavLink>
                    );
                  })}
                </nav>

                {/* Navegación administrativa */}
                <div className="flex items-center space-x-4">
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
                  to="/tenants"
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
        </div>
      </div>

      {/* Contenido principal */}
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* Footer del módulo */}
      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              © {new Date().getFullYear()} Sistema de Gestión Multi-Tenant
            </div>
            <div className="flex space-x-4">
              <a href="/help/tenants" className="hover:text-gray-900">Ayuda</a>
              <a href="/admin/logs" className="hover:text-gray-900">Logs</a>
              <a href="/admin/system" className="hover:text-gray-900">Sistema</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}