// app/routes/home/_layout.tsx

import type { MetaFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, NavLink, useLocation, useLoaderData } from "@remix-run/react";
import { Building2, Plus, Search, Filter, Grid, List, BarChart3, Settings } from "lucide-react";
import AuthGuard, { RoleGuard } from '~/components/AuthGuard';
import NavTabs from "~/components/tenant/button-header";
import { useCurrentUser } from '~/context/AuthContext';
import { useTenant } from "~/context/TenantContext";

export const meta: MetaFunction = () => {
    return [
        { title: "Home" },
        { name: "description", content: "Vista inicial" },
    ];
};

export const loader: LoaderFunction = async ({ request }) => {
    return json({
        timestamp: new Date().toISOString()
    });
};

export default function HomeLayout() {
    return (
        <AuthGuard>
            <RoleGuard requiredRoles={["admin", "usuario"]}>
                <HomeLayoutContent />
            </RoleGuard>
        </AuthGuard>
    );
}

function HomeLayoutContent() {
    const location = useLocation();
    const { user } = useCurrentUser();
    
    const data = useLoaderData<{ timestamp: string }>();

    return (
        <div className="min-h-screen bg-gradient-to-br bg-[#f2f8ff]">
            <div className="backdrop-blur-sm shadow-lg border-b border-gray-200/50">
                <div className="container mx-auto px-4">
                    {/* Breadcrumb y título */}
                    <div className="py-6 border-b border-gray-200/50">
                        <div className="flex flex-col space-y-4">
                            {/* <div className="flex items-center space-x-4">
                                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                                    <Building2 className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                        aaa
                                    </h1>
                                    <p className="text-gray-600 mt-1 text-lg">bb</p>
                                </div>
                            </div> */}

                            {/* Bienvenida y botones */}
                            <div className="mt-4">
                                <p className="mb-4 text-xl font-semibold text-gray-800">Bienvenido {user?.name} {user?.lastName}</p>
                                <div className="mt-2 flex flex-wrap gap-4">
                                    <button className="flex items-center space-x-3 px-6 py-3 rounded-xl text-sm font-semibold duration-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow hover:from-blue-700 hover:to-blue-800 hover:shadow-md hover:scale-105 transition-all">
                                        Mi Actividad
                                    </button>
                                    <button className="flex items-center space-x-3 px-6 py-3 rounded-xl text-sm font-semibold duration-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow hover:from-blue-700 hover:to-blue-800 hover:shadow-md hover:scale-105 transition-all">
                                        Documentos y Certificados Externos
                                    </button>
                                    <button className="flex items-center space-x-3 px-6 py-3 rounded-xl text-sm font-semibold duration-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow hover:from-blue-700 hover:to-blue-800 hover:shadow-md hover:scale-105 transition-all">
                                        Formación Presencial
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contenido principal */}
                    <main className="container mx-auto px-2 py-8">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
}