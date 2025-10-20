// app/routes/contents/_layout.tsx

import type { MetaFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, NavLink, useLocation, useLoaderData, useParams } from "@remix-run/react";
import { BookOpen, Plus, Search, Filter, Grid, List, BarChart3, Settings, ArrowLeft } from "lucide-react";
import { createApiClientFromRequest } from "~/api/client";
import { CoursesAPI } from "~/api/endpoints/courses";
import { CourseLayoutData } from "~/api/types/course.types";
import AuthGuard, { RoleGuard } from '~/components/AuthGuard';
import NavigationMenu from "~/components/courses/NavigationMenu";
import { useCurrentUser } from '~/context/AuthContext';


export const meta: MetaFunction = () => {
  return [
    { title: "Gestión de contenidos - Admin Panel" },
    { name: "description", content: "Gestión de contenidos del curso" },
  ];
};

// export const loader: LoaderFunction = async ({ request, params }) => {
//   const courseId = params.courseId;

//   // Mock data for course - en producción sería una llamada al API
//   const mockCourse = courseId ? {
//     id: courseId,
//     title: "Introducción a React",
//     description: "Aprende los fundamentos de React desde cero con ejercicios prácticos y proyectos reales",
//     instructor: "Juan Pérez",
//     duration: 40,
//     level: "BEGINNER",
//     category: "Frontend",
//     colorTitle: "#4F46E5",
//     thumbnail: "https://via.placeholder.com/400x250/4F46E5/ffffff?text=React+Course",
//     isActive: true,
//     maxStudents: 50,
//     currentStudents: 35,
//     startDate: "2024-02-01T00:00:00Z",
//     endDate: "2024-04-01T00:00:00Z",
//     createdAt: "2024-01-01T00:00:00Z",
//     updatedAt: "2024-01-01T00:00:00Z"
//   } : null;

//   return json({
//     course: mockCourse,
//     timestamp: new Date().toISOString()
//   });
// };

export const loader: LoaderFunction = async ({ request, params }) => {
  const courseId = params.courseId;

  if (!courseId) {
    return json({
      course: null,
      error: "ID de curso no proporcionado",
      timestamp: new Date().toISOString()
    });
  }

  try {
    // Crear cliente autenticado desde la request
    const authenticatedApiClient = createApiClientFromRequest(request);

    // Obtener el curso usando la API real
    const courseData = await CoursesAPI.getById(courseId, authenticatedApiClient);

    return json({
      course: courseData,
      error: null,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error al cargar curso:', error);

    // Determinar el mensaje de error apropiado
    let errorMessage = "Error al cargar el curso";

    if (error instanceof Error) {
      // Si es un error de red o API
      if (error.message.includes('404')) {
        errorMessage = "El curso no fue encontrado";
      } else if (error.message.includes('403')) {
        errorMessage = "No tienes permisos para ver este curso";
      } else if (error.message.includes('401')) {
        errorMessage = "Debes iniciar sesión para ver este curso";
      } else if (error.message.includes('500')) {
        errorMessage = "Error interno del servidor";
      } else {
        errorMessage = error.message || "Error de conexión";
      }
    }

    return json({
      course: null,
      error: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
};

export default function ContentsLayout() {
  return (
    <AuthGuard>
      <RoleGuard requiredRoles={['superadmin', 'admin']}>
        <ContentsLayoutContent />
      </RoleGuard>
    </AuthGuard>
  );
}

interface LoaderData {
  course: CourseLayoutData | null;
  error: string | null;
  timestamp: string;
}

function ContentsLayoutContent() {
  const location = useLocation();
  const params = useParams();
  const { user, hasRole } = useCurrentUser();
  const { course, error } = useLoaderData<LoaderData>();

  const isCreatePage = location.pathname.includes('/create');
  const isEditPage = location.pathname.includes('/edit');
  const isDetailPage = location.pathname.match(/\/contents\/[^\/]+$/) && !isCreatePage;
  const isIndexPage = location.pathname === '/contents';
  const isCourseContentsPage = location.pathname.includes('/contents/course/');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header del módulo de contenidos */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200/50">
        <div className="container mx-auto px-4">
          {/* Breadcrumb y título */}
          <div className="py-6 border-b border-gray-200/50">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                  <a href="/" className="hover:text-blue-600 transition-colors font-medium">Inicio</a>
                  <span className="text-gray-300">/</span>
                  {course ? (
                    <>
                      <span className="text-gray-600 font-medium">{course.translations?.[0]?.title ?? course.slug}</span>
                      <span className="text-gray-300">/</span>
                      <span className="text-blue-600 font-semibold">Contenidos</span>
                    </>
                  ) : (
                    <span className="text-gray-900 font-semibold">Contenidos</span>
                  )}
                  {isCreatePage && (
                    <>
                      <span className="text-gray-300">/</span>
                      <span className="text-blue-600 font-semibold">Crear</span>
                    </>
                  )}
                  {isDetailPage && (
                    <>
                      <span className="text-gray-300">/</span>
                      <span className="text-blue-600 font-semibold">detalle</span>
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
                      {course ? course.translations?.[0]?.title : 'Gestión de Contenidos'}
                    </h1>
                    <p className="text-gray-600 mt-1 text-lg">
                      Gestión general de contenidos
                    </p>
                  </div>
                </div>
              </div>

              {/* Botón de volver si estamos en contenidos de un curso */}
              {course && (
                <div className="ml-4">
                  <NavLink
                    to={`/make/courses/${course.id}`}
                    className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 transition-colors font-medium bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200/50 hover:bg-white/80 hover:shadow-md"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Volver al curso</span>
                  </NavLink>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Menu para contenidos de curso */}
          {course && isCourseContentsPage && (
            <div className="py-4">
              <NavigationMenu course={course} />
            </div>
          )}

          {/* Navegación general para otros casos */}
          {!course && !isCreatePage && !isEditPage && !isDetailPage && (
            <div className="py-6">
              <div className="flex items-center justify-between">
                <nav className="flex space-x-2">
                  <NavLink
                    to="/contents"
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/80 hover:shadow-md hover:scale-105 backdrop-blur-sm border border-gray-200/50'
                      }`
                    }
                  >
                    <Grid className="h-5 w-5" />
                    <span>Todos los Contenidos</span>
                  </NavLink>
                </nav>
                
                <RoleGuard requiredRoles={['superadmin', 'admin', 'instructor']} requireAll={false}>
                  <div className="flex space-x-3">
                    <NavLink
                      to="/contents/create"
                      className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm font-semibold"
                    >
                      <Plus className="h-5 w-5" />
                      <span>Crear Contenido</span>
                    </NavLink>
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
              © {new Date().getFullYear()} Plataforma de Contenidos
            </div>
            <div className="flex space-x-6">
              <a
                href="/help/contents"
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
                href="/contents/analytics"
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