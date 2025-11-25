import { Filter, Plus, Search } from 'lucide-react';
import React, { useState } from 'react';
import { RoleGuard } from '../AuthGuard';
import { NavLink } from '@remix-run/react';

interface TaskFiltersProps {
    courseId: string;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onSearchSubmit: (e: React.FormEvent) => void;
    showFilters: boolean;
    onToggleFilters: () => void;
    totalResults: number;
    onClearFilters: () => void;
}

export default function TaskFilters({
    courseId,
    searchTerm,
    onSearchChange,
    onSearchSubmit,
    showFilters,
    onToggleFilters,
    totalResults,
    onClearFilters
}: TaskFiltersProps) {
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    return (
        <div className="space-y-4">
            {/* Barra de búsqueda principal */}
            <div className="flex flex-col sm:flex-row gap-4">
                <form onSubmit={onSearchSubmit} className="flex-1">
                    <div className="relative group">
                        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-all duration-200 ${isSearchFocused ? 'text-blue-500 scale-110' : 'text-gray-400'
                            }`} />
                        <input
                            type="text"
                            placeholder="Buscar tareas..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                            className="w-full pl-10 pr-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 placeholder-gray-500 transition-all duration-200 hover:bg-white/80 focus:bg-white/90 hover:shadow-md"
                        />
                        <div className={`absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl transition-opacity duration-200 pointer-events-none ${isSearchFocused ? 'opacity-100' : 'opacity-0'
                            }`} />
                    </div>
                </form>

                <div className="flex gap-3">
                    {/* <button
            type="button"
            onClick={onToggleFilters}
            className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border hover:scale-105 ${
              showFilters
                ? 'bg-blue-500 text-white border-blue-500 shadow-lg hover:bg-blue-600'
                : 'bg-white/70 text-gray-700 border-gray-200/60 hover:bg-white/90 hover:shadow-md'
            }`}
          >
            <Filter className={`h-4 w-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : 'group-hover:rotate-12'}`} />
            <span>Filtros</span>
          </button> */}
                    <RoleGuard requiredRoles={['superadmin', 'admin', 'instructor']} requireAll={false}>
                        <NavLink
                            to={`/tasks/create?course=${courseId}`}
                            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm font-semibold"
                        >
                            <Plus className="h-5 w-5" />
                            <span>Crear Tarea</span>
                        </NavLink>
                    </RoleGuard>
                </div>
            </div>

            {/* Filtros expandidos */}
            {showFilters && (
                <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200/40 animate-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Estadísticas */}
                        <div className="md:col-span-2 lg:col-span-1">
                            <div className="text-sm text-gray-600">
                                <div className="font-medium">Resultados encontrados:</div>
                                <div className="text-2xl font-bold text-blue-600 mt-1">{totalResults}</div>
                            </div>
                        </div>
                    </div>

                    {/* Botón limpiar filtros */}
                    <div className="mt-6 pt-4 border-t border-gray-200/30">
                        <button
                            onClick={onClearFilters}
                            className="text-sm text-gray-600 hover:text-gray-800 font-medium hover:underline transition-colors duration-200"
                        >
                            Limpiar todos los filtros
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}