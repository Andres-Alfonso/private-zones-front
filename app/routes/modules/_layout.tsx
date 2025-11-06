// app/routes/modules/_layout.tsx

import type { MetaFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, NavLink, useLocation, useLoaderData, useParams } from "@remix-run/react";
import { BookOpen, Plus, Search, Filter, Grid, List, BarChart3, Settings, ArrowLeft, Layers } from "lucide-react";
import { useEffect, useRef } from "react";
import { createApiClientFromRequest } from "~/api/client";
import { CoursesAPI } from "~/api/endpoints/courses";
import { CourseLayoutData } from "~/api/types/course.types";
import AuthGuard, { RoleGuard } from '~/components/AuthGuard';
import NavigationMenu from "~/components/courses/NavigationMenu";
import { useCurrentUser } from '~/context/AuthContext';


export const meta: MetaFunction = () => {
    return [
        { title: "Gestión de Módulos - Admin Panel" },
        { name: "description", content: "Gestión de módulos del curso" },
    ];
};

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

export default function ModulesLayout() {
    return (
        <AuthGuard>
            <RoleGuard requiredRoles={['superadmin', 'admin']}>
                <ModulesLayoutContent />
            </RoleGuard>
        </AuthGuard>
    );
}

interface LoaderData {
    course: CourseLayoutData | null;
    error: string | null;
    timestamp: string;
}

function ModulesLayoutContent() {
    const location = useLocation();
    const params = useParams();
    const { user, hasRole } = useCurrentUser();
    const { course, error } = useLoaderData<LoaderData>();
    const mainContentRef = useRef(null);

    const isCreatePage = location.pathname.includes('/create');
    const isEditPage = location.pathname.includes('/edit');
    const isDetailPage = location.pathname.match(/\/modules\/[^\/]+$/) && !isCreatePage;
    const isIndexPage = location.pathname === '/modules';
    const isCourseModulesPage = location.pathname.includes('/modules/course/');


    // Efecto para manejar el scroll al hash
    useEffect(() => {
        const hash = location.hash;

        if (hash === '#content-modules') {
            // Intento 1: Scroll inmediato si el elemento existe
            scrollToMainContent();

            // Intento 2: Scroll después de un breve delay (por si el contenido se carga asíncronamente)
            const timer = setTimeout(scrollToMainContent, 300);

            return () => clearTimeout(timer);
        }
    }, [location]);

    // Función reutilizable para el scroll
    const scrollToMainContent = () => {
        if (mainContentRef.current) {
        
        // Scroll suave al elemento
        mainContentRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
            {/* Header del módulo de módulos */}
            <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200/50">
                <div className="container mx-auto px-4">
                    {/* Breadcrumb y título */}
                    <div className="py-6 border-b border-gray-200/50">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                                    <a href="/" className="hover:text-purple-600 transition-colors font-medium">Inicio</a>
                                    <span className="text-gray-300">/</span>
                                    {course ? (
                                        <>
                                            <span className="text-gray-600 font-medium">{course.translations?.[0]?.title ?? course.slug}</span>
                                            <span className="text-gray-300">/</span>
                                            <span className="text-purple-600 font-semibold">Módulos</span>
                                        </>
                                    ) : (
                                        <span className="text-gray-900 font-semibold">Módulos</span>
                                    )}
                                    {isCreatePage && (
                                        <>
                                            <span className="text-gray-300">/</span>
                                            <span className="text-purple-600 font-semibold">Crear Módulo</span>
                                        </>
                                    )}
                                    {isDetailPage && (
                                        <>
                                            <span className="text-gray-300">/</span>
                                            <span className="text-purple-600 font-semibold">Detalle</span>
                                        </>
                                    )}
                                    {isEditPage && (
                                        <>
                                            <span className="text-gray-300">/</span>
                                            <span className="text-purple-600 font-semibold">Editar Módulo</span>
                                        </>
                                    )}
                                </nav>

                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg">
                                        <Layers className="h-8 w-8 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                            {course
                                                ? `${course.translations?.[0]?.title}`
                                                : 'Gestión de Módulos'
                                            }
                                        </h1>
                                        <p className="text-gray-600 mt-1 text-lg">
                                            {course
                                                ? 'Organiza el contenido del curso en módulos estructurados'
                                                : 'Gestión y organización de módulos de aprendizaje'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Botón de volver si estamos en módulos de un curso */}
                            {/* {course && (
                                <div className="ml-4">
                                    <NavLink
                                        to={`/courses/${course.id}`}
                                        className="flex items-center space-x-2 text-sm text-gray-600 hover:text-purple-600 transition-colors font-medium bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200/50 hover:bg-white/80 hover:shadow-md"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        <span>Volver al curso</span>
                                    </NavLink>
                                </div>
                            )} */}
                        </div>
                    </div>

                    {/* Navegación general para módulos */}
                    {!course && !isCreatePage && !isEditPage && !isDetailPage && (
                        <div className="py-6">
                            <div className="flex items-center justify-between">
                                <nav className="flex space-x-2">
                                    <NavLink
                                        to="/modules"
                                        className={({ isActive }) =>
                                            `flex items-center space-x-3 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive
                                                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg transform scale-105'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-white/80 hover:shadow-md hover:scale-105 backdrop-blur-sm border border-gray-200/50'
                                            }`
                                        }
                                    >
                                        <Layers className="h-5 w-5" />
                                        <span>Todos los Módulos</span>
                                    </NavLink>

                                    <NavLink
                                        to="/modules/analytics"
                                        className={({ isActive }) =>
                                            `flex items-center space-x-3 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive
                                                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg transform scale-105'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-white/80 hover:shadow-md hover:scale-105 backdrop-blur-sm border border-gray-200/50'
                                            }`
                                        }
                                    >
                                        <BarChart3 className="h-5 w-5" />
                                        <span>Analíticas</span>
                                    </NavLink>
                                </nav>

                                <RoleGuard requiredRoles={['superadmin', 'admin', 'instructor']} requireAll={false}>
                                    <div className="flex space-x-3">
                                        <NavLink
                                            to="/modules/create"
                                            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm font-semibold"
                                        >
                                            <Plus className="h-5 w-5" />
                                            <span>Crear Módulo</span>
                                        </NavLink>
                                    </div>
                                </RoleGuard>
                            </div>
                        </div>
                    )}

                    {/* Barra de herramientas para módulos de curso específico */}
                    {/* {course && isCourseModulesPage && (
                        <div className="py-4 border-t border-gray-200/50">
                            <div className="flex items-center justify-between">
                                <div className="flex space-x-3">
                                    <button className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-200/50 hover:bg-white/80 transition-all">
                                        <Filter className="h-4 w-4" />
                                        <span>Filtrar</span>
                                    </button>
                                    <button className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-200/50 hover:bg-white/80 transition-all">
                                        <Search className="h-4 w-4" />
                                        <span>Buscar</span>
                                    </button>
                                </div>

                                <RoleGuard requiredRoles={['admin', 'instructor']} requireAll={false}>
                                    <NavLink
                                        to={`/modules/course/${course.id}/create`}
                                        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium"
                                    >
                                        <Plus className="h-4 w-4" />
                                        <span>Nuevo Módulo</span>
                                    </NavLink>
                                </RoleGuard>
                            </div>
                        </div>
                    )} */}
                </div>
                {/* Navigation Menu para módulos de curso */}
                {course && isCourseModulesPage && (
                    <div className="">
                        <NavigationMenu course={course} />
                    </div>
                )}
            </div>

            {/* Contenido principal */}
            <main className="container mx-auto px-4 py-8" id="content-modules">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Error</h3>
                                <div className="mt-2 text-sm text-red-700">
                                    {error}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <Outlet />
            </main>

            {/* Footer del módulo */}
            <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50 mt-16 shadow-lg">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-between text-sm">
                        <div className="font-medium text-gray-700">
                            © {new Date().getFullYear()} Plataforma de Aprendizaje - Módulos
                        </div>
                        <div className="flex space-x-6">
                            <a
                                href="/help/modules"
                                className="text-gray-600 hover:text-purple-600 transition-colors font-medium hover:underline"
                            >
                                Ayuda con Módulos
                            </a>
                            <a
                                href="/support"
                                className="text-gray-600 hover:text-purple-600 transition-colors font-medium hover:underline"
                            >
                                Soporte Técnico
                            </a>
                            <a
                                href="/modules/templates"
                                className="text-gray-600 hover:text-purple-600 transition-colors font-medium hover:underline"
                            >
                                Plantillas
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}