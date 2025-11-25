import { MessageCircle, MessageSquare, TrendingUp, Users } from 'lucide-react';
import React from 'react';

export interface TaskStats {
    totalTasks: number;
    totalSubmissions: number;
    gradedSubmissions: number;
    activeUsers: number;
}

export default function TasksDashboard({ stats }: { stats: TaskStats }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total de Tareas */}
            <div className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 backdrop-blur-sm bg-white/80 group">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Total Tareas</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalTasks.toLocaleString()}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 group-hover:scale-110 transition-transform duration-200">
                        <MessageSquare className="h-8 w-8 text-blue-600" />
                    </div>
                </div>
            </div>

            {/* Total Entregas */}
            <div className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 backdrop-blur-sm bg-white/80 group">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Total Entregas</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalSubmissions.toLocaleString()}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 group-hover:scale-110 transition-transform duration-200">
                        <MessageCircle className="h-8 w-8 text-purple-600" />
                    </div>
                </div>
            </div>

            {/* Entregas Calificadas */}
            <div className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 backdrop-blur-sm bg-white/80 group">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Calificadas</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.gradedSubmissions.toLocaleString()}</p>
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
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 group-hover:scale-110 transition-transform duration-200">
                        <Users className="h-8 w-8 text-orange-600" />
                    </div>
                </div>
            </div>
        </div>
    );
}