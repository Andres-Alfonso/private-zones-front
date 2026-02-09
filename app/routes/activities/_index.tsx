// app/routes/activities/_index.tsx

import { json, type LoaderFunction } from "@remix-run/node";
import { useLoaderData, useSearchParams, Link } from "@remix-run/react";
import { useState } from "react";
import { Search, Filter, Plus, Gamepad2 } from "lucide-react";
import ActivityCard from "~/components/activities/ActivityCard";
import { getActivitiesMock } from "~/api/mocks/activities.mock";
import type { Activity, ActivityFilters as ActivityFiltersType } from "~/api/types/activity.types";
import { createApiClientFromRequest } from "~/api/client";
import { ActivitiesAPI } from "~/api/endpoints/activities";
import { CourseLayoutData } from "~/api/types/course.types";
import { CoursesAPI } from "~/api/endpoints/courses";

interface LoaderData {
    course: CourseLayoutData | null;
    activities: Activity[];
    filters: ActivityFiltersType;
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    stats: {
        total: number;
        totalActive: number;
        totalInactive: number;
        byType: Record<string, number>;
    };
}

export const loader: LoaderFunction = async ({ request, params }) => {
    const url = new URL(request.url);
    const courseId = params.courseId;

    // 1. Validar ID
    if (!courseId) {
        return json({ error: "ID de curso no proporcionado" }, { status: 400 });
    }

    // 2. Extraer Query Params
    const search = url.searchParams.get("search") || "";
    const type = url.searchParams.get("type") || "";
    const status = url.searchParams.get("status") || "";
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "12");

    try {
        const apiClient = createApiClientFromRequest(request);

        // 3. Ejecutar peticiones en paralelo
        const [activitiesResult, courseData] = await Promise.all([
            ActivitiesAPI.getByCourse(courseId, { search, type, status, page, limit }, apiClient),
            CoursesAPI.getById(courseId, apiClient)
        ]);

        // Si llegamos aquí, asumimos que courseData es el objeto CourseLayoutData
        return json({
            course: courseData, // Ya es el objeto directo
            courseError: null,
            
            activities: activitiesResult.activities,
            filters: activitiesResult.filters,
            pagination: activitiesResult.pagination,
            stats: activitiesResult.stats,
            
            timestamp: new Date().toISOString(),
        });

    } catch (error) {
        console.error("Error en loader:", error);

        // Si el error viene de la API de cursos (ej: un 404), 
        // podrías capturarlo aquí para diferenciarlo.
        return json({
            course: null,
            courseError: error instanceof Error ? error.message : "Error al cargar datos",
            activities: [],
            filters: { search, type, status, courseId: courseId || "", page, limit },
            timestamp: new Date().toISOString(),
        });
    }
};

export default function ActivitiesIndex() {
    const data = useLoaderData<LoaderData>();

    const courseId = data?.filters.courseId || data?.course?.id;
    
    // Valores por defecto seguros
    const activities = data?.activities || [];
    const filters = data?.filters || { search: "", type: "", status: "", courseId: "", page: 1, limit: 12 };
    const pagination = data?.pagination || { total: 0, page: 1, limit: 12, totalPages: 0 };
    const stats = data?.stats || { total: 0, totalActive: 0, totalInactive: 0, byType: {} };


    const [searchParams, setSearchParams] = useSearchParams();
    
    const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
    const [showFilters, setShowFilters] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams);
        if (searchTerm) {
            params.set("search", searchTerm);
        } else {
            params.delete("search");
        }
        params.set("page", "1");
        setSearchParams(params);
    };

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        params.set("page", "1");
        setSearchParams(params);
    };

    const clearFilters = () => {
        setSearchParams({});
        setSearchTerm("");
    };

    const hasActiveFilters = searchParams.get("type") || searchParams.get("status") || searchParams.get("search");

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-xl">
                            <Gamepad2 className="h-6 w-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Activas</p>
                            <p className="text-3xl font-bold text-green-600">{stats.totalActive}</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-xl">
                            <div className="h-6 w-6 rounded-full bg-green-500"></div>
                        </div>
                    </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Inactivas</p>
                            <p className="text-3xl font-bold text-gray-600">{stats.totalInactive}</p>
                        </div>
                        <div className="bg-gray-100 p-3 rounded-xl">
                            <div className="h-6 w-6 rounded-full bg-gray-400"></div>
                        </div>
                    </div>
                </div>

                <Link
                    to={`/activities/create?course=${courseId || ""}`}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl shadow-lg border border-purple-400/50 p-6 hover:from-purple-600 hover:to-purple-700 transition-all duration-200 group"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-purple-100">Nueva</p>
                            <p className="text-2xl font-bold">Actividad</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-xl group-hover:bg-white/30 transition-colors">
                            <Plus className="h-6 w-6" />
                        </div>
                    </div>
                </Link>
            </div>

            {/* Búsqueda y Filtros */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
                <div className="space-y-4">
                    {/* Barra de búsqueda */}
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar por título, descripción o slug..."
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                        >
                            Buscar
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowFilters(!showFilters)}
                            className={`px-6 py-3 rounded-xl transition-all duration-200 font-medium flex items-center gap-2 ${
                                showFilters
                                    ? "bg-purple-100 text-purple-700 border-2 border-purple-300"
                                    : "bg-white border-2 border-gray-300 text-gray-700 hover:border-purple-300"
                            }`}
                        >
                            <Filter className="h-5 w-5" />
                            Filtros
                        </button>
                    </form>

                    {/* Panel de filtros */}
                    {showFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tipo de Juego
                                </label>
                                <select
                                    value={searchParams.get("type") || ""}
                                    onChange={(e) => handleFilterChange("type", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="">Todos los tipos</option>
                                    <option value="word_search">Sopa de Letras</option>
                                    <option value="hanging">Ahorcado</option>
                                    <option value="complete_phrase">Completar Frase</option>
                                    <option value="crossword">Crucigrama</option>
                                    <option value="drag_drop">Arrastrar y Soltar</option>
                                    <option value="matching">Emparejar</option>
                                    <option value="memory">Memoria</option>
                                    <option value="quiz_game">Quiz</option>
                                    <option value="puzzle">Rompecabezas</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Estado
                                </label>
                                <select
                                    value={searchParams.get("status") || ""}
                                    onChange={(e) => handleFilterChange("status", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="">Todos los estados</option>
                                    <option value="draft">Borrador</option>
                                    <option value="published">Publicado</option>
                                    <option value="archived">Archivado</option>
                                </select>
                            </div>

                            <div className="flex items-end">
                                {hasActiveFilters && (
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="w-full px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                    >
                                        Limpiar filtros
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Lista de Actividades */}
            {activities.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activities.map((activity) => (
                            <ActivityCard key={activity.id} activity={activity} />
                        ))}
                    </div>

                    {/* Paginación */}
                    {pagination.totalPages > 1 && (
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-600">
                                    Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} actividades
                                </p>
                                <div className="flex gap-2">
                                    {pagination.page > 1 && (
                                        <button
                                            onClick={() => {
                                                const params = new URLSearchParams(searchParams);
                                                params.set("page", String(pagination.page - 1));
                                                setSearchParams(params);
                                            }}
                                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                        >
                                            Anterior
                                        </button>
                                    )}
                                    {pagination.page < pagination.totalPages && (
                                        <button
                                            onClick={() => {
                                                const params = new URLSearchParams(searchParams);
                                                params.set("page", String(pagination.page + 1));
                                                setSearchParams(params);
                                            }}
                                            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 font-medium"
                                        >
                                            Siguiente
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-12 text-center">
                    <Gamepad2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        No se encontraron actividades
                    </h3>
                    <p className="text-gray-600 mb-6">
                        {hasActiveFilters
                            ? "Intenta ajustar tus filtros de búsqueda"
                            : "Comienza creando tu primera actividad educativa"}
                    </p>
                    <Link
                        to="/activities/create"
                        className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                    >
                        <Plus className="h-5 w-5" />
                        <span>Crear Actividad</span>
                    </Link>
                </div>
            )}
        </div>
    );
}