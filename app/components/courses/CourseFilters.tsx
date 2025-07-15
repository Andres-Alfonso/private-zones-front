// app/components/courses/CourseFilters.tsx
import { Search, Filter } from "lucide-react";
import { CourseLevel } from "~/api/types/course.types";

interface CourseFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  filterCategory: string;
  onCategoryChange: (value: string) => void;
  filterLevel: string;
  onLevelChange: (value: string) => void;
  categories: string[];
  totalResults: number;
  onClearFilters: () => void;
}

export function CourseFilters({
  searchTerm,
  onSearchChange,
  onSearchSubmit,
  showFilters,
  onToggleFilters,
  filterCategory,
  onCategoryChange,
  filterLevel,
  onLevelChange,
  categories,
  totalResults,
  onClearFilters
}: CourseFiltersProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Búsqueda */}
        <form onSubmit={onSearchSubmit} className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar cursos increíbles..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
            />
          </div>
        </form>

        {/* Controles de filtro */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleFilters}
            className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 bg-white/80 backdrop-blur-sm hover:shadow-md transform hover:scale-105"
          >
            <Filter className="h-4 w-4" />
            <span className="font-medium">Filtros</span>
          </button>

          <div className="text-sm text-gray-600 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200/50">
            <span className="font-medium">{totalResults}</span> curso{totalResults !== 1 ? 's' : ''} encontrado{totalResults !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Panel de filtros expandido */}
      {showFilters && (
        <div className="mt-6 pt-6 border-t border-gray-200/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <select
                value={filterCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
              >
                <option value="">Todas las categorías</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Nivel */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nivel
              </label>
              <select
                value={filterLevel}
                onChange={(e) => onLevelChange(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
              >
                <option value="">Todos los niveles</option>
                <option value={CourseLevel.BEGINNER}>Principiante</option>
                <option value={CourseLevel.INTERMEDIATE}>Intermedio</option>
                <option value={CourseLevel.ADVANCED}>Avanzado</option>
              </select>
            </div>

            {/* Limpiar filtros */}
            <div className="flex items-end">
              <button
                onClick={onClearFilters}
                className="w-full px-4 py-3 text-sm text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 bg-white/80 backdrop-blur-sm hover:shadow-md transform hover:scale-105 font-medium"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}