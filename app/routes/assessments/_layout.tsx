// app/routes/assessments/_layout.tsx

import type { MetaFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, NavLink, useLocation } from "@remix-run/react";
import {
    ClipboardList,
    Plus,
    Grid,
    BarChart3,
} from "lucide-react";
import AuthGuard, { RoleGuard } from "~/components/AuthGuard";
import { useCurrentUser } from "~/context/AuthContext";

export const meta: MetaFunction = () => {
    return [
        { title: "Gestión de Evaluaciones - Admin Panel" },
        { name: "description", content: "Gestión y organización de evaluaciones" },
    ];
};

export const loader: LoaderFunction = async ({ request }) => {
    return json({
        timestamp: new Date().toISOString(),
    });
};

export default function AssessmentsLayout() {
    return (
        <AuthGuard>
            <RoleGuard requiredRoles={['superadmin', 'admin', 'instructor']}>
                <AssessmentsLayoutContent />
            </RoleGuard>
        </AuthGuard>
    );
}

function AssessmentsLayoutContent() {
    const location = useLocation();
    const { user, hasRole } = useCurrentUser();

    const isCreatePage = location.pathname.includes("/create");
    const isEditPage = location.pathname.includes("/edit");
    const questionsPage = location.pathname.includes("/questions");
    const isDetailPage =
        location.pathname.match(/\/assessments\/[^\/]+$/) && !isCreatePage;
    const isIndexPage = location.pathname === "/assessments";
    const isStatsPage = location.pathname === "/assessments/stats";
    const isManagePage = location.pathname === "/assessments/manage";

    // Navegación principal
    const navigation = [
        {
            name: "Todas las Evaluaciones",
            href: "/assessments",
            icon: Grid,
            active: isIndexPage,
        },
    ];

    // Navegación para administradores e instructores
    const adminNavigation = [
        {
            name: "Crear Evaluación",
            href: "/assessments/create",
            icon: Plus,
            active: isCreatePage,
        },
        {
            name: "Estadísticas",
            href: "/assessments/stats",
            icon: BarChart3,
            active: isStatsPage,
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Header del módulo de evaluaciones */}
            <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200/50">
                <div className="container mx-auto px-4">
                    {/* Breadcrumb y título */}
                    <div className="py-6 border-b border-gray-200/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-2xl shadow-lg">
                                    <ClipboardList className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                                        <span>Inicio</span>
                                        <span>/</span>
                                        <span className="font-medium">Administración</span>
                                        <span className="text-gray-300">/</span>
                                        <span className="text-gray-900 font-semibold">Evaluaciones</span>
                                    </div>
                                    <h1 className="text-3xl font-bold text-gray-900">
                                        {isCreatePage
                                            ? "Crear Nueva Evaluación"
                                            : isEditPage
                                                ? "Editar Evaluación"
                                                : isDetailPage
                                                    ? "Detalle de la Evaluación"
                                                    : isStatsPage
                                                        ? "Estadísticas de Evaluaciones"
                                                        : "Gestión de Evaluaciones"}
                                    </h1>
                                    <p className="text-gray-600 mt-1 text-lg">
                                        {isCreatePage
                                            ? "Complete la información para crear una nueva evaluación"
                                            : isEditPage
                                                ? "Modifique la información de la evaluación"
                                                : isStatsPage
                                                    ? "Analiza el rendimiento y resultados de las evaluaciones"
                                                    : "Administra las evaluaciones, encuestas y autoevaluaciones de la plataforma"}
                                    </p>
                                </div>
                            </div>
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
                                                    `flex items-center space-x-3 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive
                                                        ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg transform scale-105"
                                                        : "text-gray-600 hover:text-gray-900 hover:bg-white/80 hover:shadow-md hover:scale-105 backdrop-blur-sm border border-gray-200/50"
                                                    }`
                                                }
                                            >
                                                <Icon className="h-5 w-5" />
                                                <span>{item.name}</span>
                                            </NavLink>
                                        );
                                    })}
                                </nav>
                            </div>
                        </div>
                    )}

                    {/* Acciones para páginas específicas */}
                    {isDetailPage && (
                        <div className="py-6">
                            <div className="flex items-center justify-between">
                                <NavLink
                                    to="/assessments"
                                    className="flex items-center space-x-2 text-sm text-gray-600 hover:text-purple-600 transition-colors font-medium bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200/50 hover:bg-white/80 hover:shadow-md"
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
                                    to="/assessments"
                                    className="flex items-center space-x-2 text-sm text-gray-600 hover:text-purple-600 transition-colors font-medium bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200/50 hover:bg-white/80 hover:shadow-md"
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

                    {/* {(isEditPage || questionsPage) && (
                    <div className="py-6">
                        <div className="flex items-center space-x-2">
                        <NavLink to={`/assessments/${params.id}/edit`}>
                            Información
                        </NavLink>
                        <NavLink to={`/assessments/${params.id}/questions`}>
                            Preguntas
                        </NavLink>
                        </div>
                    </div>
                    )} */}
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
                            © {new Date().getFullYear()} Sistema de Gestión de Evaluaciones
                        </div>
                        <div className="flex space-x-6">
                            <a
                                href="/help/assessments"
                                className="text-gray-600 hover:text-purple-600 transition-colors font-medium hover:underline"
                            >
                                Ayuda
                            </a>
                            <a
                                href="/admin/assessment-logs"
                                className="text-gray-600 hover:text-purple-600 transition-colors font-medium hover:underline"
                            >
                                Logs de Evaluaciones
                            </a>
                            <a
                                href="/admin/grading"
                                className="text-gray-600 hover:text-purple-600 transition-colors font-medium hover:underline"
                            >
                                Sistema de Calificación
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}