// app/routes/forums/_index.tsx

import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData, useSearchParams, Link } from "@remix-run/react";
import { useState } from "react";
import { 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  Filter,
  Search, 
  MessageSquare, 
  Users, 
  MessageCircle, 
  Clock,
  Plus,
  TrendingUp,
  BookOpen,
  ExternalLink,
  FolderOpen
} from "lucide-react";

// Tipos para los foros con información del curso
export interface ForumItemWithCourse {
  id: string;
  title: string;
  description: string | null;
  tenantId: string;
  courseId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  course: {
    id: string;
    title: string;
    category: string;
    instructor: string;
  };
  totalThreads: number;
  totalPosts: number;
  lastActivity: string | null;
  activeUsers: number;
}

export interface ForumStats {
  totalForums: number;
  totalThreads: number;
  totalPosts: number;
  activeUsers: number;
}

export interface ForumFilters {
  search?: string;
  course?: string;
  page: number;
  limit: number;
}

// Dashboard de estadísticas generales
const ForumsDashboard = ({ stats }: { stats: ForumStats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium">Total Foros</p>
            <p className="text-3xl font-bold">{stats.totalForums.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-white/20 rounded-xl">
            <MessageSquare className="h-8 w-8" />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100 text-sm font-medium">Total Hilos</p>
            <p className="text-3xl font-bold">{stats.totalThreads.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-white/20 rounded-xl">
            <MessageCircle className="h-8 w-8" />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm font-medium">Total Mensajes</p>
            <p className="text-3xl font-bold">{stats.totalPosts.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-white/20 rounded-xl">
            <TrendingUp className="h-8 w-8" />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-orange-100 text-sm font-medium">Usuarios Activos</p>
            <p className="text-3xl font-bold">{stats.activeUsers.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-white/20 rounded-xl">
            <Users className="h-8 w-8" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Filtros administrativos
const AdminForumFilters = ({ 
  searchTerm, 
  onSearchChange, 
  onSearchSubmit, 
  showFilters, 
  onToggleFilters,
  filterCourse,
  onCourseChange,
  courses,
  totalResults,
  onClearFilters 
}: {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  filterCourse: string;
  onCourseChange: (value: string) => void;
  courses: Array<{id: string, title: string}>;
  totalResults: number;
  onClearFilters: () => void;
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-4">
        <form onSubmit={onSearchSubmit} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar foros, cursos, temas..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 placeholder-gray-500"
            />
          </div>
        </form>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onToggleFilters}
            className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border ${
              showFilters
                ? 'bg-blue-500 text-white border-blue-500 shadow-lg'
                : 'bg-white/60 text-gray-700 border-gray-200/50 hover:bg-white/80'
            }`}
          >
            <Filter className="h-4 w-4" />
            <span>Filtros</span>
          </button>

          <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm font-semibold">
            <Plus className="h-4 w-4" />
            <span>Nuevo Foro</span>
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white/40 backdrop-blur-sm rounded-xl p-6 border border-gray-200/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Curso
              </label>
              <select
                value={filterCourse}
                onChange={(e) => onCourseChange(e.target.value)}
                className="w-full px-3 py-2 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="">Todos los cursos</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <div className="text-sm text-gray-600">
                <div className="font-medium">Resultados encontrados:</div>
                <div className="text-2xl font-bold text-blue-600 mt-1">{totalResults}</div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200/30">
            <button
              onClick={onClearFilters}
              className="text-sm text-gray-600 hover:text-gray-800 font-medium hover:underline"
            >
              Limpiar todos los filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Grid de foros
const AdminForumGrid = ({ forums }: { forums: ForumItemWithCourse[] }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getTimeAgo = (dateString: string | null) => {
    if (!dateString) return 'Sin actividad';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    return formatDate(dateString);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {forums.map((forum) => (
        <div key={forum.id} className="group bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105">
          {/* Header con información del curso */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-white text-sm">
                <BookOpen className="h-4 w-4" />
                <span className="font-medium truncate">{forum.course.title}</span>
              </div>
              <Link 
                to={`/forums/course/${forum.course.id}`}
                className="text-white/80 hover:text-white transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-gray-600">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {forum.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Por {forum.course.instructor}
                  </p>
                </div>
              </div>
            </div>
            
            {forum.description && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {forum.description}
              </p>
            )}

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 pt-4 border-t border-gray-200">
              <div className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 backdrop-blur-sm bg-white/80 group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Hilos</p>
                    <p className="text-2xl font-bold text-gray-900">{forum.totalThreads}</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600 font-medium">+5%</span>
                      <span className="text-xs text-gray-500 ml-1">vs mes anterior</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 group-hover:scale-110 transition-transform duration-200">
                    <MessageCircle className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 backdrop-blur-sm bg-white/80 group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Mensajes</p>
                    <p className="text-2xl font-bold text-gray-900">{forum.totalPosts}</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600 font-medium">+18%</span>
                      <span className="text-xs text-gray-500 ml-1">vs mes anterior</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-green-50 to-green-100 group-hover:scale-110 transition-transform duration-200">
                    <MessageCircle className="h-8 w-8 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 backdrop-blur-sm bg-white/80 group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Usuarios Activos</p>
                    <p className="text-2xl font-bold text-gray-900">{forum.activeUsers}</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600 font-medium">+10%</span>
                      <span className="text-xs text-gray-500 ml-1">vs mes anterior</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 group-hover:scale-110 transition-transform duration-200">
                    <Users className="h-8 w-8 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Última actividad */}
            <div className="flex items-center space-x-2 text-xs text-gray-500 pt-3 border-t border-gray-200">
              <Clock className="h-3 w-3" />
              <span>Última actividad: {getTimeAgo(forum.lastActivity)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Loader
export const loader: LoaderFunction = async ({ request }) => {
  try {
    const url = new URL(request.url);
    
    const filters: ForumFilters = {
      search: url.searchParams.get('search') || undefined,
      course: url.searchParams.get('course') || undefined,
      page: parseInt(url.searchParams.get('page') || '1'),
      limit: parseInt(url.searchParams.get('limit') || '12'),
    };

    // Mock data para estadísticas
    const mockStats: ForumStats = {
      totalForums: 24,
      totalThreads: 156,
      totalPosts: 842,
      activeUsers: 89
    };

    // Mock data para foros con información de curso
    const mockForums: ForumItemWithCourse[] = [
      {
        id: '1',
        title: 'Dudas sobre Hooks en React',
        description: 'Espacio para resolver dudas sobre useState, useEffect y otros hooks',
        tenantId: 'tenant-1',
        courseId: 'course-1',
        createdBy: 'user-1',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-20T15:30:00Z',
        course: {
          id: 'course-1',
          title: 'Introducción a React',
          category: 'Frontend',
          instructor: 'Juan Pérez'
        },
        totalThreads: 23,
        totalPosts: 145,
        lastActivity: '2024-01-20T15:30:00Z',
        activeUsers: 18
      },
      {
        id: '2',
        title: 'Consultas sobre Node.js',
        description: 'Foro para preguntas relacionadas con Node.js y desarrollo backend',
        tenantId: 'tenant-1',
        courseId: 'course-2',
        createdBy: 'user-2',
        createdAt: '2024-01-16T14:30:00Z',
        updatedAt: '2024-01-19T10:20:00Z',
        course: {
          id: 'course-2',
          title: 'Node.js Avanzado',
          category: 'Backend',
          instructor: 'María García'
        },
        totalThreads: 31,
        totalPosts: 198,
        lastActivity: '2024-01-19T10:20:00Z',
        activeUsers: 25
      },
      {
        id: '3',
        title: 'Diseño y Prototipos',
        description: 'Comparte tus diseños y recibe feedback de la comunidad',
        tenantId: 'tenant-1',
        courseId: 'course-3',
        createdBy: 'user-3',
        createdAt: '2024-01-17T09:15:00Z',
        updatedAt: '2024-01-18T16:45:00Z',
        course: {
          id: 'course-3',
          title: 'Diseño UX/UI Moderno',
          category: 'Diseño',
          instructor: 'Ana Rodríguez'
        },
        totalThreads: 18,
        totalPosts: 92,
        lastActivity: '2024-01-18T16:45:00Z',
        activeUsers: 12
      }
    ];

    // Mock data para cursos
    const mockCourses = [
      { id: 'course-1', title: 'Introducción a React' },
      { id: 'course-2', title: 'Node.js Avanzado' },
      { id: 'course-3', title: 'Diseño UX/UI Moderno' },
    ];

    // Aplicar filtros
    let filteredForums = mockForums;

    if (filters.search) {
      filteredForums = filteredForums.filter(forum =>
        forum.title.toLowerCase().includes(filters.search!.toLowerCase()) ||
        forum.description?.toLowerCase().includes(filters.search!.toLowerCase()) ||
        forum.course.title.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }

    if (filters.course) {
      filteredForums = filteredForums.filter(forum =>
        forum.course.id === filters.course
      );
    }

    const total = filteredForums.length;
    const startIndex = (filters.page - 1) * filters.limit;
    const endIndex = startIndex + filters.limit;
    const paginatedForums = filteredForums.slice(startIndex, endIndex);

    return json({
      forums: {
        data: paginatedForums,
        total,
        page: filters.page,
        limit: filters.limit
      },
      stats: mockStats,
      courses: mockCourses,
      error: null
    });
  } catch (error: any) {
    console.error('Error loading forums:', error);
    return json({
      forums: { data: [], total: 0, page: 1, limit: 12 },
      stats: { totalForums: 0, totalThreads: 0, totalPosts: 0, activeUsers: 0 },
      courses: [],
      error: error.message || 'Error al cargar los foros'
    });
  }
};

export default function AdminForumsIndex() {
  const { forums, stats, courses, error } = useLoaderData<{
    forums: { data: ForumItemWithCourse[], total: number, page: number, limit: number },
    stats: ForumStats,
    courses: Array<{id: string, title: string}>,
    error: string | null
  }>();

  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchParams.get('search') || '');

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

  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setSearchParams({});
    setLocalSearch('');
  };

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
  };

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-lg border border-gray-200/50 max-w-md mx-auto">
          <AlertCircle className="mx-auto h-16 w-16 text-red-400 mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ForumsDashboard stats={stats} />

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
        <AdminForumFilters
          searchTerm={localSearch}
          onSearchChange={setLocalSearch}
          onSearchSubmit={handleSearch}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
          filterCourse={searchParams.get('course') || ''}
          onCourseChange={(value) => handleFilterChange('course', value)}
          courses={courses}
          totalResults={forums.total}
          onClearFilters={handleClearFilters}
        />
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Gestión de Foros ({forums.total} foros)
          </h2>
        </div>

        {forums.data.length > 0 ? (
          <AdminForumGrid forums={forums.data} />
        ) : (
          <div className="text-center py-16">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto">
              <FolderOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron foros</h3>
              <p className="text-gray-600 mb-6">
                {searchParams.toString() 
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Aún no hay foros en el sistema'
                }
              </p>
              <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                <Plus className="h-5 w-5 mr-2" />
                Crear primer foro
              </button>
            </div>
          </div>
        )}
      </div>

      {forums.total > forums.limit && (
        <div className="flex justify-center">
          <nav className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-3">
            <button
              disabled={forums.page <= 1}
              onClick={() => handlePageChange(forums.page - 1)}
              className="p-2 text-sm border border-gray-300/50 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50/80 transition-all duration-200 backdrop-blur-sm"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            {Array.from({ length: Math.ceil(forums.total / forums.limit) }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 text-sm rounded-xl transition-all duration-200 ${
                  page === forums.page
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                    : 'border border-gray-300/50 hover:bg-gray-50/80 backdrop-blur-sm hover:shadow-md hover:scale-105'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              disabled={forums.page >= Math.ceil(forums.total / forums.limit)}
              onClick={() => handlePageChange(forums.page + 1)}
              className="p-2 text-sm border border-gray-300/50 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50/80 transition-all duration-200 backdrop-blur-sm"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}