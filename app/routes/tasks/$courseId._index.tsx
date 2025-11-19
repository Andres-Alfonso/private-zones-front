import { LoaderFunction } from '@remix-run/node';
import { json, useLoaderData } from '@remix-run/react';
import { MessageCircle, MessageSquare, TrendingUp, Users } from 'lucide-react';
import React from 'react'
import { createApiClientFromRequest } from '~/api/client';
import TaskAPI from '~/api/endpoints/tasks';


export interface TaskItem {
    id: string;
    title: string;
    description: string | null;
    tenantId: string;
    courseId: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    totalSubmissions?: number;
}

export interface TaskStats {
    totalTasks: number;
    totalSubmissions: number;
    gradedSubmissions: number;
    activeUsers: number;
}

export interface TasksFilters {
    search?: string;
    page: number;
    limit: number;
}

// Dashboard de estadísticas de foros
const TasksDashboard = ({ stats }: { stats: TaskStats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total de Foros */}
            <div className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 backdrop-blur-sm bg-white/80 group">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Total Foros</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalTasks.toLocaleString()}</p>
                        {/* <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 font-medium">+8%</span>
              <span className="text-xs text-gray-500 ml-1">vs mes anterior</span>
            </div> */}
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 group-hover:scale-110 transition-transform duration-200">
                        <MessageSquare className="h-8 w-8 text-blue-600" />
                    </div>
                </div>
            </div>

            {/* Total Hilos */}
            <div className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 backdrop-blur-sm bg-white/80 group">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Total Hilos</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalSubmissions.toLocaleString()}</p>
                        {/* <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 font-medium">+12%</span>
              <span className="text-xs text-gray-500 ml-1">vs mes anterior</span>
            </div> */}
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 group-hover:scale-110 transition-transform duration-200">
                        <MessageCircle className="h-8 w-8 text-purple-600" />
                    </div>
                </div>
            </div>

            {/* Total Mensajes */}
            <div className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 backdrop-blur-sm bg-white/80 group">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Total Mensajes</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.gradedSubmissions.toLocaleString()}</p>
                        {/* <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 font-medium">+18%</span>
              <span className="text-xs text-gray-500 ml-1">vs mes anterior</span>
            </div> */}
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-green-50 to-green-100 group-hover:scale-110 transition-transform duration-200">
                        <TrendingUp className="h-8 w-8 text-green-600" />
                    </div>
                </div>
            </div>

            {/* Usuarios Activos */}
            <div className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 backdrop-blur-sm bg-white/80 group">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Usuarios Activos</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.activeUsers.toLocaleString()}</p>
                        {/* <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 font-medium">+15%</span>
              <span className="text-xs text-gray-500 ml-1">vs mes anterior</span>
            </div> */}
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 group-hover:scale-110 transition-transform duration-200">
                        <Users className="h-8 w-8 text-orange-600" />
                    </div>
                </div>
            </div>
        </div>
    );
};


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

    console.log(apiResponse);

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

    return (
        <div>
            <TasksDashboard stats={stats}/>
        </div>
    )
}
