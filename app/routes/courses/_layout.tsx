// app/routes/courses/_layout.tsx

import type { MetaFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, NavLink, useLocation, useLoaderData } from "@remix-run/react";
import { BookOpen, Plus, Search, Filter, Grid, List, BarChart3, Settings } from "lucide-react";
import AuthGuard, { RoleGuard } from '~/components/AuthGuard';
import NavTabs from "~/components/tenant/button-header";
import { useCurrentUser } from '~/context/AuthContext';

export const meta: MetaFunction = () => {
  return [
    { title: "Gestión de cursos - Admin Panel" },
    { name: "description", content: "Gestión y catálogo de cursos" },
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
  return json({
    timestamp: new Date().toISOString()
  });
};

export default function CoursesLayout() {
  return (
    <AuthGuard>
      <RoleGuard requiredRoles={['superadmin', 'admin']}>
        <CoursesLayoutContent />
      </RoleGuard>
    </AuthGuard>
  );
}

function CoursesLayoutContent() {
  const location = useLocation();
  const { user, hasRole } = useCurrentUser();
  const data = useLoaderData<{ timestamp: string }>();
  
  const isCreatePage = location.pathname.includes('/create');
  const isEditPage = location.pathname.includes('/edit');
  const isDetailPage = location.pathname.match(/\/courses\/[^\/]+$/) && !isCreatePage;
  const isIndexPage = location.pathname === '/courses';
  const isMyCoursesPage = location.pathname === '/courses/my-courses';
  const isManagePage = location.pathname === '/courses/manage';

  // Navegación principal
  const navigation = [
    {
      name: 'Todos los Cursos',
      href: '/courses',
      icon: Grid,
      active: isIndexPage
    },
    {
      name: 'Mis Cursos',
      href: '/courses/my-courses',
      icon: BookOpen,
      active: isMyCoursesPage
    }
  ];

  // Navegación para administradores/instructores
  const adminNavigation = [
    {
      name: 'Crear Curso',
      href: '/courses/create',
      icon: Plus,
      active: isCreatePage
    },
    {
      name: 'Gestionar Cursos',
      href: '/courses/manage',
      icon: List,
      active: isManagePage
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header del módulo de cursos */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200/50">
        <div className="container mx-auto px-4">
          {/* Breadcrumb y título */}
          <div className="py-6 border-b border-gray-200/50">
            <div className="flex items-center justify-between">
              <div>
                <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                  <a href="/" className="hover:text-blue-600 transition-colors font-medium">Inicio</a>
                  <span className="text-gray-300">/</span>
                  <span className="text-gray-900 font-semibold">Cursos</span>
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
                    <BookOpen className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                      {isCreatePage ? 'Crear Nuevo Curso' : 
                       isEditPage ? 'Editar Curso' :
                       isDetailPage ? 'Detalle del Curso' : 
                       isMyCoursesPage ? 'Mis Cursos' :
                       isManagePage ? 'Gestionar Cursos' :
                       'Catálogo de Cursos'}
                    </h1>
                    <p className="text-gray-600 mt-1 text-lg">
                      {isCreatePage ? 'Complete la información para crear un nuevo curso' :
                       isEditPage ? 'Modifique la información del curso' :
                       isMyCoursesPage ? 'Cursos en los que estás inscrito o creaste' :
                       isManagePage ? 'Administra y supervisa todos los cursos' :
                       'Explora y gestiona los cursos disponibles'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Información del usuario */}
              {/* <div className="hidden lg:block">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
                  <div className="text-right">
                    <div className="text-sm text-gray-500 font-medium">Conectado como</div>
                    <div className="font-bold text-gray-900 text-lg mt-1">{user?.name}</div>
                    <div className="flex justify-end mt-3 space-x-1">
                      {user?.roles.map((role) => (
                        <span 
                          key={role}
                          className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-semibold rounded-full shadow-sm"
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
                <RoleGuard requiredRoles={['superadmin', 'admin', 'instructor']} requireAll={false}>
                  <NavTabs items={adminNavigation} />
                </RoleGuard>
              </div>
            </div>
          )}

          {/* Acciones para páginas específicas */}
          {isDetailPage && (
            <div className="py-6">
              <div className="flex items-center justify-between">
                <NavLink
                  to="/courses"
                  className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 transition-colors font-medium bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200/50 hover:bg-white/80 hover:shadow-md"
                >
                  <span className="text-lg">←</span>
                  <span>Volver al catálogo</span>
                </NavLink>

                <RoleGuard requiredRoles={['superadmin', 'admin', 'instructor']} requireAll={false}>
                  <div className="flex space-x-3">
                    <button className="px-6 py-3 text-sm border border-gray-300 rounded-xl hover:bg-white/80 hover:shadow-md transition-all duration-200 font-medium bg-white/60 backdrop-blur-sm">
                      Editar
                    </button>
                    <button className="px-6 py-3 text-sm bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium">
                      Eliminar
                    </button>
                  </div>
                </RoleGuard>
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
              © {new Date().getFullYear()} Plataforma de Cursos
            </div>
            <div className="flex space-x-6">
              <a 
                href="/help/courses" 
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium hover:underline"
              >
                Ayuda
              </a>
              <a 
                href="/support" 
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium hover:underline"
              >
                Soporte
              </a>
              <a 
                href="/courses/analytics" 
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium hover:underline"
              >
                Analíticas
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}