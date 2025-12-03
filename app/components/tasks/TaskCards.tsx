import { NavLink } from '@remix-run/react';
import { Calendar, Clock, Edit, Eye, FileText, Trash2 } from 'lucide-react';
import React from 'react';

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

interface TaskCardsProps {
  tasks: TaskItem[];
  hasAdminRole: boolean;
  courseId: string;
}

export default function TaskCards({ tasks, hasAdminRole, courseId }: TaskCardsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 overflow-hidden hover:shadow-xl hover:bg-white/80 transition-all duration-300 group"
        >
          {/* Header de la tarjeta */}
          <div className="p-6 border-b border-gray-200/30">
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl group-hover:scale-110 transition-transform duration-200">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              {task.totalSubmissions !== undefined && (
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full border border-purple-200">
                  {task.totalSubmissions} entregas
                </span>
              )}
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
              {task.title}
            </h3>

            {task.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>

          {/* Información de fechas */}
          <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-200/30">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>Creada: {formatDate(task.createdAt)}</span>
              </div>
              {task.updatedAt !== task.createdAt && (
                <div className="flex items-center space-x-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Actualizada</span>
                </div>
              )}
            </div>
          </div>

          {/* Acciones */}
          <div className="p-4 bg-white/50 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-2">
              <NavLink
                to={`/tasks/${task.id}`}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm font-semibold transform hover:scale-105"
              >
                <Eye className="h-4 w-4" />
                <span>Ver</span>
              </NavLink>

              {hasAdminRole && (
                <>
                  <NavLink
                    to={`/tasks/${task.id}/edit?course=${courseId}`}
                    className="flex items-center justify-center p-2.5 border border-gray-300/60 rounded-xl hover:bg-gray-50/80 transition-all duration-200 backdrop-blur-sm hover:shadow-md transform hover:scale-105"
                  >
                    <Edit className="h-4 w-4 text-gray-600" />
                  </NavLink>

                  <button
                    onClick={() => {
                      if (confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
                        // TODO: Implementar lógica de eliminación
                        console.log('Eliminar tarea:', task.id);
                      }
                    }}
                    className="flex items-center justify-center p-2.5 border border-red-300/60 rounded-xl hover:bg-red-50/80 transition-all duration-200 backdrop-blur-sm hover:shadow-md transform hover:scale-105"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}