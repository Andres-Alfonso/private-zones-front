// app/routes/home/_index.tsx

import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useTenant } from "~/context/TenantContext";
import { useCurrentUser } from "~/context/AuthContext";
import { SectionApi } from "~/api/endpoints/sections";
import CoursesSection from "~/components/home/CoursesSection";
import SectionsSection from "~/components/home/SectionsSection";
import { CoursesAPI } from "~/api/endpoints/courses";
import { createApiClientFromRequest } from "~/api/client";
import { CourseFilters } from "~/api/types/course.types";

export const loader: LoaderFunction = async ({ request }) => {
    try {
        const url = new URL(request.url);
        const hostname = url.hostname;

        const filters: CourseFilters = {
            search: url.searchParams.get('search') || undefined,
            isActive: url.searchParams.get('active') ? url.searchParams.get('active') === 'true' : undefined,
            page: parseInt(url.searchParams.get('page') || '1'),
            limit: parseInt(url.searchParams.get('limit') || '20'),
        };
        
        // Obtener secciones si es necesario
        const sections = await SectionApi.getAll({}, hostname);

        // const courses = await CoursesAPI.getAll({});

        const authenticatedApiClient = createApiClientFromRequest(request);
            
        const courses = await CoursesAPI.getForHome(filters, authenticatedApiClient);
        
        return json({ 
            sections: sections || { data: [], total: 0 },
            courses: courses || { data: [], total: 0 },
            error: null 
        });
    } catch (error: any) {
        console.error('Error loading home data:', error);
        return json({ 
            sections: { data: [], total: 0 },
            error: error.message || 'Error al cargar los datos' 
        });
    }
};

export default function HomeIndex() {
    const { sections, courses, error } = useLoaderData<typeof loader>();
    const { user } = useCurrentUser();
    const { state: tenantState } = useTenant();
    const { tenant } = tenantState;

    const homeConfig = tenant?.viewConfigs?.find(
        (config: any) => config.viewType === 'home'
    );

    // Verificar configuraciones
    const allowSectionsHome = homeConfig?.additionalSettings?.allowSectionsHome;
    const allowCoursesHome = homeConfig?.additionalSettings?.allowCoursesHome;

    const customTextColor = homeConfig?.additionalSettings?.textColor || '#000000';

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="bg-white rounded-2xl shadow-lg border border-red-200/50 p-8 max-w-md mx-auto">
                        <div className="text-red-400 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.924-.833-2.694 0L3.12 14.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
                        <p className="text-gray-600">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Mostrar secciones si está habilitado */}
            {allowSectionsHome && (
                <SectionsSection sections={sections} textColor={customTextColor} />
            )}

            
            {/* Mostrar cursos si está habilitado */}
            {allowCoursesHome && (
                <CoursesSection courses={courses} textColor={customTextColor} />
            )}


            {/* Si no hay nada habilitado, mostrar mensaje de bienvenida */}
            {!allowCoursesHome && !allowSectionsHome && (
                <div className="text-center py-12">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-8 max-w-md mx-auto">
                        <div className="text-blue-400 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m6-8v6m0 0v6m0-6h6m-6 0H8" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2" style={{ color: customTextColor }}>
                            Bienvenido, {user?.name}
                        </h3>
                        <p className="text-gray-600" style={{ color: customTextColor }}>
                            Tu espacio de aprendizaje está siendo configurado.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}