// app/routes/courses/_layout.tsx

import type { MetaFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, NavLink, useLocation, useLoaderData } from "@remix-run/react";
import { BookOpen, Plus, Search, Filter, Grid, List } from "lucide-react";
import AuthGuard, { RoleGuard } from '~/components/AuthGuard';
import { useCurrentUser } from '~/context/AuthContext';

export const meta: MetaFunction = () => {
  return [
    { title: "Cursos - Mi Plataforma" },
    { name: "description", content: "Gestión y catálogo de cursos" },
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
  // Aquí podrías cargar datos compartidos para todas las rutas de courses
  // como categorías, estadísticas, etc.
  return json({
    timestamp: new Date().toISOString()
  });
};

export default function CoursesLayout() {
  return (
    // <AuthGuard>
      <CoursesLayoutContent />
    // </AuthGuard>
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
      active: location.pathname === '/courses/my-courses'
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
      active: location.pathname === '/courses/manage'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Header del módulo de cursos */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          {/* Breadcrumb y título */}
          <div className="py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                  <a href="/" className="hover:text-gray-700">Inicio</a>
                  <span>/</span>
                  <span className="text-gray-900 font-medium">Cursos</span>
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
                  <BookOpen className="h-8 w-8 text-blue-600" />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {isCreatePage ? 'Crear Nuevo Curso' : 
                       isEditPage ? 'Editar Curso' :
                       isDetailPage ? 'Detalle del Curso' : 'Catálogo de Cursos'}
                    </h1>
                    <p className="text-gray-600">
                      {isCreatePage ? 'Complete la información para crear un nuevo curso' :
                       isEditPage ? 'Modifique la información del curso' :
                       'Explora y gestiona los cursos disponibles'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Información del usuario */}
              <div className="hidden lg:block text-right">
                <div className="text-sm text-gray-600">Conectado como</div>
                <div className="font-medium text-gray-900">{user?.name}</div>
                <div className="flex space-x-1 mt-1">
                  {user?.roles.map((role) => (
                    <span 
                      key={role}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
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
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </NavLink>
                    );
                  })}
                </nav>

                {/* Navegación administrativa */}
                <RoleGuard requiredRoles={['admin', 'instructor']} requireAll={false}>
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
                </RoleGuard>
              </div>
            </div>
          )}

          {/* Acciones para páginas específicas */}
          {isDetailPage && (
            <div className="py-4">
              <div className="flex items-center justify-between">
                <NavLink
                  to="/courses"
                  className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  <span>←</span>
                  <span>Volver al catálogo</span>
                </NavLink>

                <RoleGuard requiredRoles={['admin', 'instructor']} requireAll={false}>
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                      Editar
                    </button>
                    <button className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700">
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
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* Footer del módulo */}
      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              © {new Date().getFullYear()} Plataforma de Cursos
            </div>
            <div className="flex space-x-4">
              <a href="/help/courses" className="hover:text-gray-900">Ayuda</a>
              <a href="/support" className="hover:text-gray-900">Soporte</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}