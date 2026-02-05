// app/routes/activities/_layout.tsx

import type { MetaFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, NavLink, useLocation, useLoaderData } from "@remix-run/react";
import { Gamepad2, Plus, Grid, BarChart3, ArrowLeft, BookOpen } from "lucide-react";
import { createApiClientFromRequest } from "~/api/client";
import { CoursesAPI } from "~/api/endpoints/courses";
import { CourseLayoutData } from "~/api/types/course.types";
import AuthGuard, { RoleGuard } from "~/components/AuthGuard";
import NavigationMenu from "~/components/courses/NavigationMenu";

export const meta: MetaFunction = () => {
    return [
        { title: "Gestión de Actividades - Admin Panel" },
        { name: "description", content: "Gestión de juegos y actividades educativas" },
    ];
};

export const loader: LoaderFunction = async ({ request, params }) => {

    const courseId = params.courseId;

    if (!courseId) {
        return json({
            course: null,
            error: "ID de curso no proporcionado",
            timestamp: new Date().toISOString(),
        });
    }

    try {
        // Crear cliente autenticado desde la request
        const authenticatedApiClient = createApiClientFromRequest(request);

        // Obtener el curso usando la API real
        const courseData = await CoursesAPI.getById(
            courseId,
            authenticatedApiClient
        );

        return json({
            course: courseData,
            error: null,
            timestamp: new Date().toISOString(),
        });
        
    } catch (error) {
        console.error("Error al cargar curso:", error);

        // Determinar el mensaje de error apropiado
        let errorMessage = "Error al cargar el curso";

        if (error instanceof Error) {
            // Si es un error de red o API
            if (error.message.includes("404")) {
                errorMessage = "El curso no fue encontrado";
            } else if (error.message.includes("403")) {
                errorMessage = "No tienes permisos para ver este curso";
            } else if (error.message.includes("401")) {
                errorMessage = "Debes iniciar sesión para ver este curso";
            } else if (error.message.includes("500")) {
                errorMessage = "Error interno del servidor";
            } else {
                errorMessage = error.message || "Error de conexión";
            }
        }

        return json({
            course: null,
            error: errorMessage,
            timestamp: new Date().toISOString(),
        });
    }
};

export default function ActivitiesLayout() {
    return (
        <AuthGuard>
            <RoleGuard requiredRoles={['superadmin', 'admin', 'instructor']}>
                <ActivitiesLayoutContent />
            </RoleGuard>
        </AuthGuard>
    );
}

interface LoaderData {
    course: CourseLayoutData | null;
    error: string | null;
    timestamp: string;
}

function ActivitiesLayoutContent() {

    const { course, error } = useLoaderData<LoaderData>();
    
    const location = useLocation();

    const isCreatePage = location.pathname.includes("/create");
    const isEditPage = location.pathname.includes("/edit");
    const isDetailPage = location.pathname.match(/\/activities\/[^\/]+$/) && !isCreatePage;
    const isIndexPage = location.pathname === "/activities";
    const isStatsPage = location.pathname === "/activities/stats";

    const isCourseAssessmentsPage = location.pathname.includes("/activities/course/");


    const navigation = [
        {
            name: "Todas las Actividades",
            href: "/activities",
            icon: Grid,
            active: isIndexPage,
        },
        {
            name: "Crear Actividad",
            href: "/activities/create",
            icon: Plus,
            active: isCreatePage,
        },
        {
            name: "Estadísticas",
            href: "/activities/stats",
            icon: BarChart3,
            active: isStatsPage,
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200/50">
                <div className="container mx-auto px-4">
                    
                    <div className="py-6 border-b border-gray-200/50">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                                    <a
                                        href="/"
                                        className="hover:text-blue-600 transition-colors font-medium"
                                    >
                                        Inicio
                                    </a>
                                    <span className="text-gray-300">/</span>
                                    {course ? (
                                        <>
                                            <span className="text-gray-600 font-medium">
                                                {course.translations?.[0]?.title ?? course.slug}
                                            </span>
                                            <span className="text-gray-300">/</span>
                                            <span className="text-blue-600 font-semibold">
                                                Actividades
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-gray-900 font-semibold">
                                            Actividades
                                        </span>
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
                                            <span className="text-blue-600 font-semibold">
                                                detalle
                                            </span>
                                        </>
                                    )}
                                    {isEditPage && (
                                        <>
                                            <span className="text-gray-300">/</span>
                                            <span className="text-purple-600 font-semibold">
                                                Editar
                                            </span>
                                        </>
                                    )}
                                </nav>

                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                                        <BookOpen className="h-8 w-8 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                            {course
                                                ? course.translations?.[0]?.title
                                                : "Gestión de Actividades"}
                                        </h1>
                                        <p className="text-gray-600 mt-1 text-lg">
                                            Gestión general de actividades didacticas
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
                </div>

                {/* Navigation Menu para contenidos de curso */}
                {course && isCourseAssessmentsPage && (
                    <div className="">
                        <NavigationMenu course={course} />
                    </div>
                )}
            </div>

            {/* Contenido principal */}
            <main className="container mx-auto px-4 py-8">
                <Outlet context={{ course }} />
            </main>

            {/* Footer */}
            <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50 mt-16 shadow-lg">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-between text-sm">
                        <div className="font-medium text-gray-700">
                            © {new Date().getFullYear()} Sistema de Gestión de Actividades
                        </div>
                        <div className="flex space-x-6">
                            <a href="/help/activities" className="text-gray-600 hover:text-purple-600 transition-colors font-medium hover:underline">
                                Ayuda
                            </a>
                            <a href="/admin/activity-logs" className="text-gray-600 hover:text-purple-600 transition-colors font-medium hover:underline">
                                Logs de Actividades
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}