// app/routes/sections/$id.tsx

import { json, LoaderFunction, ActionFunction } from '@remix-run/node';
import { useLoaderData, Link, useNavigate } from '@remix-run/react';
import { useState } from 'react';
import {
    ArrowLeft, BookOpen, AlertCircle, Layers3,
    CheckCircle, XCircle, Users, Calendar
} from 'lucide-react';
import { SectionApi } from '~/api/endpoints/sections';
import { useTenant } from "~/context/TenantContext";

interface Section {
    id: string;
    tenantId: string;
    slug: string;
    name: string;
    description: string | null;
    thumbnailImagePath: string | null;
    order: number | null;
    allowBanner: boolean;
    bannerPath: string | null;
    courseCount?: number;
    createdAt: string;
    updatedAt: string;
}

interface Course {
    id: string;
    slug: string;
    thumbnailImagePath: string | null;
    isActive: boolean;
    translations: Array<{
        id: string;
        languageCode: string;
        title: string;
        description: string;
    }>;
    userConnections?: Array<{
        id: string;
        userId: string;
    }>;
    createdAt: string;
}

interface LoaderData {
    section: Section | null;
    courses: Course[];
    error: string | null;
}

export const loader: LoaderFunction = async ({ params, request }) => {
    try {
        const sectionId = params.id as string;
        const url = new URL(request.url);
        const hostname = url.hostname;

        if (!sectionId) {
            throw new Error('ID de sección no proporcionado');
        }

        // Obtener la sección con sus cursos desde la API
        const section = await SectionApi.getById(sectionId, hostname);

        // Extraer los cursos de la sección
        const courses = section?.courses || [];

        return json<LoaderData>({
            section,
            courses,
            error: null
        });
    } catch (error: any) {
        console.error('Error loading section details:', error);
        return json<LoaderData>({
            section: null,
            courses: [],
            error: error.message || 'Error al cargar los detalles de la sección'
        });
    }
};

function safeEncodeURI(url: string): string {
    try {
        const decoded = decodeURI(url);
        if (decoded !== url) {
            return url;
        }
        return encodeURI(url);
    } catch (e) {
        return encodeURI(url);
    }
}

export default function SectionDetail() {
    const { section, courses, error } = useLoaderData<LoaderData>();
    const navigate = useNavigate();
    const { state: tenantState } = useTenant();
    const { tenant } = tenantState;

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
            backgroundImage = safeEncodeURI(homeViewConfig.backgroundImagePath);
        } else if (backgroundType === 'color' && homeViewConfig?.backgroundColor) {
            backgroundColor = homeViewConfig.backgroundColor;
        }
    }

    const hasBackground = !!(backgroundImage || backgroundColor);
    const customTextColor = homeViewConfig?.additionalSettings?.textColor || '#000000';

    // Función helper para obtener traducción
    const getCourseTranslation = (course: Course, languageCode: string = 'es') => {
        return course.translations?.find(t => t.languageCode === languageCode) || course.translations?.[0];
    };

    if (error) {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{
                    backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
                    backgroundColor: backgroundColor || undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundAttachment: 'fixed'
                }}
            >
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8 max-w-md w-full">
                    <div className="text-center">
                        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar la sección</h2>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <button
                            onClick={() => navigate('/home')}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Volver al Inicio
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!section) {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{
                    backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
                    backgroundColor: backgroundColor || undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundAttachment: 'fixed'
                }}
            >
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-center text-gray-600 mt-4">Cargando detalles de la sección...</p>
                </div>
            </div>
        );
    }

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
            <div className="container mx-auto px-4 py-6">
                <div className="items-center justify-between">
                    <h1
                        className="text-3xl font-bold"
                        style={{ color: customTextColor }}
                    >
                        {section.name}
                    </h1>

                    <button
                        onClick={() => navigate('/home')}
                        className="flex items-center space-x-2 px-4 py-2 my-4 rounded-xl text-sm font-medium duration-200 bg-white/80 hover:bg-white shadow hover:shadow-md transition-all"
                        style={{ color: customTextColor }}
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Volver al Inicio</span>
                    </button>
                </div>
            </div>

            {/* Contenido principal - Cursos */}
            <main className="container mx-auto px-4 py-8">
                <div className="space-y-6">
                    {/* Título de cursos */}
                    <div className="flex items-center justify-between">
                        <h2
                            className="text-2xl font-bold"
                            style={{ color: customTextColor }}
                        >
                            Cursos ({courses.length})
                        </h2>
                    </div>

                    {/* Grid de cursos */}
                    {courses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {courses.map((course) => {
                                const translation = getCourseTranslation(course);
                                const studentCount = course.userConnections?.length || 0;

                                return (
                                    <Link
                                        key={course.id}
                                        to={`/courses/${course.slug}`}
                                        className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                    >
                                        {/* Imagen del curso */}
                                        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-100 to-blue-50">
                                            {course.thumbnailImagePath ? (
                                                <img
                                                    src={course.thumbnailImagePath}
                                                    alt={translation?.title || 'Curso'}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600">
                                                    <BookOpen className="h-16 w-16 text-white/80" />
                                                </div>
                                            )}

                                            {/* Badge de estado */}
                                            <div className="absolute top-3 right-3">
                                                <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${course.isActive
                                                        ? 'bg-green-100/90 text-green-700'
                                                        : 'bg-gray-100/90 text-gray-700'
                                                    }`}>
                                                    {course.isActive ? (
                                                        <>
                                                            <CheckCircle className="h-3 w-3" />
                                                            <span>Activo</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="h-3 w-3" />
                                                            <span>Inactivo</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Información del curso */}
                                        <div className="p-5">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                                {translation?.title || 'Sin título'}
                                            </h3>

                                            {translation?.description && (
                                                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                                                    {translation.description}
                                                </p>
                                            )}

                                            {/* Metadatos */}
                                            <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
                                                <div className="flex items-center space-x-1">
                                                    <Users className="h-4 w-4" />
                                                    <span>{studentCount} estudiantes</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>{new Date(course.createdAt).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        // Mensaje cuando no hay cursos
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-12 text-center">
                            <div className="max-w-md mx-auto">
                                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <h3
                                    className="text-xl font-semibold mb-2"
                                    style={{ color: customTextColor }}
                                >
                                    No hay cursos disponibles
                                </h3>
                                <p
                                    className="opacity-70 mb-6"
                                    style={{ color: customTextColor }}
                                >
                                    Esta sección aún no tiene cursos asignados.
                                </p>
                                <button
                                    onClick={() => navigate('/home')}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                                >
                                    Explorar otras secciones
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}