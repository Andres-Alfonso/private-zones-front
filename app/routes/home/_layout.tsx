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
            <RoleGuard requiredRoles={["superadmin", "admin", "usuario"]}>
                <HomeLayoutContent />
            </RoleGuard>
        </AuthGuard>
    );
}

function HomeLayoutContent() {
    const location = useLocation();
    const { user } = useCurrentUser();
    const { state: tenantState } = useTenant();
    const { tenant } = tenantState;
    
    const data = useLoaderData<{ timestamp: string }>();

    // Obtener la configuración de vista de tipo 'home'
    const homeViewConfig = tenant?.viewConfigs?.find(
        (config) => config.viewType === 'home'
    );

    // Verificar si el background está activo
    const isBackgroundActive = homeViewConfig?.allowBackground && homeViewConfig?.isActive;
    const backgroundType = homeViewConfig?.backgroundType;

    // Obtener el background según el tipo
    let backgroundImage: string | undefined = undefined;
    let backgroundColor: string | undefined = undefined;
    
    if (isBackgroundActive) {
        if (backgroundType === 'image' && homeViewConfig?.backgroundImagePath) {
            // NO codificar - la URL ya viene codificada desde la BD
            backgroundImage = homeViewConfig.backgroundImagePath;
        } else if (backgroundType === 'color' && homeViewConfig?.backgroundColor) {
            backgroundColor = homeViewConfig.backgroundColor;
        }
    }

    // Determinar si hay background activo
    const hasBackground = !!(backgroundImage || backgroundColor);

    return (
        <div 
            className="min-h-screen"
            style={{
                backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
                backgroundColor: backgroundColor || undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed'
            }}
        >
            <div className={`shadow-lg border-b border-gray-200/50 ${!hasBackground ? 'backdrop-blur-sm' : ''}`}>
                <div className="container mx-auto px-4">
                    {/* Breadcrumb y título */}
                    <div className="py-6 border-b border-gray-200/50">
                        <div className="flex flex-col space-y-4">
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