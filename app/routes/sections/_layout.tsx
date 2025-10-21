// app/routes/sections/_layout.tsx

import type { MetaFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, NavLink, useLocation, useLoaderData } from "@remix-run/react";
import {
    Layers3,
    Plus,
    Search,
    Filter,
    Grid,
    List,
    BarChart3,
    Settings,
} from "lucide-react";
import AuthGuard, { RoleGuard } from "~/components/AuthGuard";
import NavTabs from "~/components/tenant/button-header";
import { useCurrentUser } from "~/context/AuthContext";

export const meta: MetaFunction = () => {
    return [
        { title: "Gestión de Secciones - Admin Panel" },
        { name: "description", content: "Gestión y organización de secciones" },
    ];
};

export const loader: LoaderFunction = async ({ request }) => {
    return json({
        timestamp: new Date().toISOString(),
    });
};

export default function SectionsLayout() {
    return (
        <AuthGuard>
            <RoleGuard requiredRoles={['superadmin', 'admin']}>
                <SectionsLayoutContent />
            </RoleGuard>
        </AuthGuard>
    );
}

function SectionsLayoutContent() {
    const location = useLocation();
    const { user, hasRole } = useCurrentUser();
    const data = useLoaderData<{ timestamp: string }>();

    const isCreatePage = location.pathname.includes("/create");
    const isEditPage = location.pathname.includes("/edit");
    const isDetailPage =
        location.pathname.match(/\/sections\/[^\/]+$/) && !isCreatePage;
    const isIndexPage = location.pathname === "/sections";
    const isStatsPage = location.pathname === "/sections/stats";
    const isManagePage = location.pathname === "/sections/manage";

    // Navegación principal
    const navigation = [
        {
            name: "Todas las Secciones",
            href: "/sections",
            icon: Grid,
            active: isIndexPage,
        },
        // {
        //     name: "Gestionar Secciones",
        //     href: "/sections/manage",
        //     icon: List,
        //     active: isManagePage,
        // },
    ];

    // Navegación para administradores
    const adminNavigation = [
        {
            name: "Crear Sección",
            href: "/sections/create",
            icon: Plus,
            active: isCreatePage,
        },
        {
            name: "Estadísticas",
            href: "/sections/stats",
            icon: BarChart3,
            active: isStatsPage,
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Header del módulo de secciones */}
            <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200/50">
                <div className="container mx-auto px-4">
                    {/* Breadcrumb y título */}
                    <div className="py-6 border-b border-gray-200/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-2xl shadow-lg">
                                    <Layers3 className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                                        <span>Inicio</span>
                                        <span>/</span>
                                        <span className="font-medium">Administracion</span>
                                        <span className="text-gray-300">/</span>
                                        <span className="text-gray-900 font-semibold">Sections</span>
                                    </div>
                                    <h1 className="text-3xl font-bold text-gray-900">
                                        {isCreatePage
                                            ? "Crear Nueva Sección"
                                            : isEditPage
                                                ? "Editar Sección"
                                                : isDetailPage
                                                    ? "Detalle de la Sección"
                                                    : isStatsPage
                                                        ? "Estadísticas de Secciones"
                                                        : "Gestión de Secciones"}
                                    </h1>
                                    <p className="text-gray-600 mt-1 text-lg">
                                        {isCreatePage
                                            ? "Complete la información para crear una nueva sección"
                                            : isEditPage
                                                ? "Modifique la información de la sección"
                                                : isStatsPage
                                                    ? "Analiza el rendimiento y uso de las secciones"
                                                    : "Organiza y administra las secciones de contenido de la plataforma"}
                                    </p>
                                </div>
                            </div>

                            {/* Información del usuario administrador */}
                            {/* <div className="hidden lg:block">
                                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
                                    <div className="text-right">
                                        <div className="text-sm text-gray-500 font-medium">
                                            Panel de Administración
                                        </div>
                                        <div className="font-bold text-gray-900 text-lg mt-1">
                                            {user?.name}
                                        </div>
                                        <div className="flex justify-end mt-3">
                                            <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-semibold rounded-full shadow-sm">
                                                Admin
                                            </span>
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
                                                    `flex items-center space-x-3 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive
                                                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105"
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

                                {/* Navegación administrativa */}
                                {/* <NavTabs items={adminNavigation} /> */}
                            </div>
                        </div>
                    )}

                    {/* Acciones para páginas específicas */}
                    {isDetailPage && (
                        <div className="py-6">
                            <div className="flex items-center justify-between">
                                <NavLink
                                    to="/sections"
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
                                    to="/sections"
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
                            © {new Date().getFullYear()} Sistema de Gestión de Secciones
                        </div>
                        <div className="flex space-x-6">
                            <a
                                href="/help/sections"
                                className="text-gray-600 hover:text-purple-600 transition-colors font-medium hover:underline"
                            >
                                Ayuda
                            </a>
                            <a
                                href="/admin/section-logs"
                                className="text-gray-600 hover:text-purple-600 transition-colors font-medium hover:underline"
                            >
                                Logs de Secciones
                            </a>
                            <a
                                href="/admin/content-management"
                                className="text-gray-600 hover:text-purple-600 transition-colors font-medium hover:underline"
                            >
                                Gestión de Contenido
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
