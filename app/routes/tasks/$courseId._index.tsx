import { LoaderFunction } from '@remix-run/node';
import { json, NavLink, useLoaderData, useSearchParams } from '@remix-run/react';
import { AlertCircle, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import React, { useState } from 'react';
import { createApiClientFromRequest } from '~/api/client';
import TaskAPI from '~/api/endpoints/tasks';
import { RoleGuard } from '~/components/AuthGuard';
import TaskCards, { TaskItem } from '~/components/tasks/TaskCards';
import TaskFilters from '~/components/tasks/TaskFilters';
import TasksDashboard, { TaskStats } from '~/components/tasks/TasksDashboard';
import { useCurrentUser } from '~/context/AuthContext';

export interface TasksFilters {
    search?: string;
    page: number;
    limit: number;
}

// Loader para cargar datos del servidor
export const loader: LoaderFunction = async ({ request, params }) => {
  try {
    const { courseId } = params;
    
    if (!courseId) {
      return json({
        tasks: { data: [], total: 0, page: 1, limit: 12 },
        stats: { totalTasks: 0, totalSubmissions: 0, gradedSubmissions: 0, activeUsers: 0 },
        error: 'ID de curso no proporcionado'
      });
    }

    const url = new URL(request.url);
    const filters: TasksFilters = {
      search: url.searchParams.get('search') || undefined,
      page: parseInt(url.searchParams.get('page') || '1'),
      limit: parseInt(url.searchParams.get('limit') || '12'),
    };

    const authenticatedApiClient = createApiClientFromRequest(request);
    
    const apiResponse = await TaskAPI.getAll(courseId, filters, authenticatedApiClient);

    return json({
      tasks: apiResponse,
      stats: apiResponse.stats || { totalTasks: 0, totalSubmissions: 0, gradedSubmissions: 0, activeUsers: 0 },
      error: null,
      courseId
    });

  } catch (error: any) {
    console.error('Error loading tasks:', error);
    return json({
      tasks: { data: [], total: 0, page: 1, limit: 12 },
      stats: { totalTasks: 0, totalSubmissions: 0, gradedSubmissions: 0, activeUsers: 0 },
      error: error.message || 'Error al cargar las tareas'
    });
  }
};

export default function CourseTasksIndex() {
    const { tasks, stats, error, courseId } = useLoaderData<{
        tasks: { data: TaskItem[], total: number, page: number, limit: number },
        stats: TaskStats,
        error: string | null,
        courseId: string | 'undefined'
    }>();

    const [searchParams, setSearchParams] = useSearchParams();
    const [showFilters, setShowFilters] = useState(false);
    const { hasRole } = useCurrentUser();

    // Estados para filtros
    const [localSearch, setLocalSearch] = useState(searchParams.get('search') || '');

    // Manejar búsqueda
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const newParams = new URLSearchParams(searchParams);
        if (localSearch) {
            newParams.set('search', localSearch);
        } else {
            newParams.delete('search');
        }
        newParams.set('page', '1');
        setSearchParams(newParams);
    };

    // Limpiar filtros
    const handleClearFilters = () => {
        setSearchParams({});
        setLocalSearch('');
    };

    // Paginación
    const handlePageChange = (page: number) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', page.toString());
        setSearchParams(newParams);
    };

    // Calcular paginación
    const totalPages = Math.ceil(tasks.total / tasks.limit);
    const hasNext = tasks.page < totalPages;
    const hasPrev = tasks.page > 1;

    if (error) {
        return (
            <div className="text-center py-16">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-gray-200/60 max-w-md mx-auto hover:shadow-2xl transition-all duration-300">
                    <AlertCircle className="mx-auto h-16 w-16 text-red-400 mb-6" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Dashboard de estadísticas */}
            <TasksDashboard stats={stats} />

            {/* Header con botón de crear */}
            {/* <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 p-6 hover:bg-white/90 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tareas del Curso</h2>
                        <p className="text-gray-600">
                            Total de tareas: <span className="font-semibold text-blue-600">{tasks.total}</span>
                        </p>
                    </div>

                    
                </div>
            </div> */}

            {/* Filtros y búsqueda */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 p-6 hover:bg-white/90 hover:shadow-xl transition-all duration-300">
                <TaskFilters
                    courseId={courseId}
                    searchTerm={localSearch}
                    onSearchChange={setLocalSearch}
                    onSearchSubmit={handleSearch}
                    showFilters={showFilters}
                    onToggleFilters={() => setShowFilters(!showFilters)}
                    totalResults={tasks.total}
                    onClearFilters={handleClearFilters}
                />
            </div>

            {/* Grid de tareas */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 p-6 hover:bg-white/90 hover:shadow-xl transition-all duration-300">
                {tasks.data.length > 0 ? (
                    <TaskCards 
                        tasks={tasks.data} 
                        hasAdminRole={hasRole('admin') || hasRole('superadmin')}
                        courseId={courseId}
                    />
                ) : (
                    <div className="text-center py-16">
                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto border border-gray-200/60 hover:bg-white/80 transition-all duration-300">
                            <AlertCircle className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron tareas</h3>
                            <p className="text-gray-600 mb-6">
                                {searchParams.toString() 
                                    ? 'Intenta ajustar los filtros de búsqueda'
                                    : 'Aún no hay tareas disponibles para este curso'
                                }
                            </p>
                            {(hasRole('admin') || hasRole('instructor')) && (
                                <NavLink
                                    to={`/tasks/create?course=${courseId}`}
                                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                                >
                                    <Plus className="h-5 w-5 mr-2" />
                                    Crear primera tarea
                                </NavLink>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Paginación */}
            {tasks.total > tasks.limit && (
                <div className="flex justify-center">
                    <nav className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 p-3 hover:bg-white/90 transition-all duration-300">
                        <button
                            disabled={!hasPrev}
                            onClick={() => handlePageChange(tasks.page - 1)}
                            className="p-2 text-sm border border-gray-300/60 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50/80 transition-all duration-200 backdrop-blur-sm hover:scale-105 disabled:hover:scale-100"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`px-4 py-2 text-sm rounded-xl transition-all duration-200 font-medium ${
                                    page === tasks.page
                                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                                        : 'border border-gray-300/60 hover:bg-gray-50/80 backdrop-blur-sm hover:shadow-md hover:scale-105'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                        
                        <button
                            disabled={!hasNext}
                            onClick={() => handlePageChange(tasks.page + 1)}
                            className="p-2 text-sm border border-gray-300/60 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50/80 transition-all duration-200 backdrop-blur-sm hover:scale-105 disabled:hover:scale-100"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </nav>
                </div>
            )}
        </div>
    );
}