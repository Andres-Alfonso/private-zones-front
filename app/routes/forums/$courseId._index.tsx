// app/routes/forums/$courseId._index.tsx

import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData, useSearchParams, useParams } from "@remix-run/react";
import { useState } from "react";
import { 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  MessageSquare, 
  Users, 
  MessageCircle, 
  Clock,
  Plus,
  TrendingUp,
  Trash2,
  Eye,
  Edit,
  MoreVertical,
  Settings
} from "lucide-react";
import { createApiClientFromRequest } from "~/api/client";
import { ForumsAPI } from "~/api/endpoints/forums";

// Tipos para los foros
export interface ForumItem {
  id: string;
  title: string;
  description: string | null;
  tenantId: string;
  courseId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  totalThreads?: number;
  totalPosts?: number;
  lastActivity?: string;
}

export interface ForumStats {
  totalForums: number;
  totalThreads: number;
  totalPosts: number;
  activeUsers: number;
}

export interface ForumsFilters {
  search?: string;
  page: number;
  limit: number;
}

// Dashboard de estadísticas de foros
const ForumsDashboard = ({ stats }: { stats: ForumStats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total de Foros */}
      <div className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 backdrop-blur-sm bg-white/80 group">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Foros</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalForums.toLocaleString()}</p>
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
            <p className="text-2xl font-bold text-gray-900">{stats.totalThreads.toLocaleString()}</p>
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
            <p className="text-2xl font-bold text-gray-900">{stats.totalPosts.toLocaleString()}</p>
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

// Componente de filtros de foros
const ForumsFilters = ({ 
  searchTerm, 
  onSearchChange, 
  onSearchSubmit,
  totalResults
}: {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  totalResults: number;
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-4">
        <form onSubmit={onSearchSubmit} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar foros por título o descripción..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 placeholder-gray-500"
            />
          </div>
        </form>

        <div className="flex gap-3">
          <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm font-semibold">
            <Plus className="h-4 w-4" />
            <span>Crear Foro</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const ForumsGrid = ({ forums }: { forums: ForumItem[] }) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getTimeAgo = (dateString: string) => {
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

  const handleMenuAction = (action: string, forumId: string) => {
    setOpenMenuId(null);
    console.log(`${action} forum:`, forumId);
    // Aquí puedes agregar la lógica para cada acción
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {forums.map((forum) => (
        <div 
          key={forum.id} 
          className="group select-none bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden hover:shadow-xl hover:border-gray-300/50 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-white">
                <MessageSquare className="h-5 w-5" />
                <span className="text-sm font-medium">Foro</span>
              </div>
              
              {/* Menú de tres puntos */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === forum.id ? null : forum.id);
                  }}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <MoreVertical className="h-5 w-5 text-white" />
                </button>

                {/* Dropdown */}
                {openMenuId === forum.id && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMenuAction('Ver', forum.id);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Ver detalles</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMenuAction('Editar', forum.id);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMenuAction('Configurar', forum.id);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Configuración</span>
                    </button>
                    <div className="border-t border-gray-200 my-1"></div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMenuAction('Eliminar', forum.id);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Eliminar</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="p-6">
            <h3 className="font-bold text-gray-900 text-lg mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
              {forum.title}
            </h3>
            
            {forum.description && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {forum.description}
              </p>
            )}

            {/* Estadísticas */}
            <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 text-purple-600 mb-1">
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-lg font-bold">{forum.totalThreads || 0}</span>
                </div>
                <p className="text-xs text-gray-500">Hilos</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 text-green-600 mb-1">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-lg font-bold">{forum.totalPosts || 0}</span>
                </div>
                <p className="text-xs text-gray-500">Mensajes</p>
              </div>
            </div>

            {/* Última actividad */}
            <div className="flex items-center space-x-2 text-xs text-gray-500 pt-3 border-t border-gray-200">
              <Clock className="h-3 w-3" />
              <span>Última actividad: {forum.lastActivity ? getTimeAgo(forum.lastActivity) : 'Sin actividad'}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Loader para cargar datos del servidor
export const loader: LoaderFunction = async ({ request, params }) => {
  try {
    const { courseId } = params;
    
    if (!courseId) {
      return json({
        forums: { data: [], total: 0, page: 1, limit: 12 },
        stats: { totalForums: 0, totalThreads: 0, totalPosts: 0, activeUsers: 0 },
        error: 'ID de curso no proporcionado'
      });
    }

    const url = new URL(request.url);
    const filters: ForumsFilters = {
      search: url.searchParams.get('search') || undefined,
      page: parseInt(url.searchParams.get('page') || '1'),
      limit: parseInt(url.searchParams.get('limit') || '12'),
    };

    const authenticatedApiClient = createApiClientFromRequest(request);
        
    const apiResponse = await ForumsAPI.getAllContents(courseId, filters, authenticatedApiClient);

    return json({
      forums: apiResponse,
      stats: apiResponse.stats || { totalForums: 0, totalThreads: 0, totalPosts: 0, activeUsers: 0 },
      error: null
    });

  } catch (error: any) {
    console.error('Error loading forums:', error);
    return json({
      forums: { data: [], total: 0, page: 1, limit: 12 },
      stats: { totalForums: 0, totalThreads: 0, totalPosts: 0, activeUsers: 0 },
      error: error.message || 'Error al cargar los foros'
    });
  }
};

export default function ForumsIndex() {
  const { forums, stats, error } = useLoaderData<{
    forums: { data: ForumItem[], total: number, page: number, limit: number },
    stats: ForumStats,
    error: string | null
  }>();

  const [searchParams, setSearchParams] = useSearchParams();
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

  // Paginación
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
      {/* Dashboard de estadísticas */}
      <ForumsDashboard stats={stats} />

      {/* Filtros y búsqueda */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
        <ForumsFilters
          searchTerm={localSearch}
          onSearchChange={setLocalSearch}
          onSearchSubmit={handleSearch}
          totalResults={forums.total}
        />
      </div>

      {/* Grid de foros */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
        {/* <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Foros del Curso ({forums.total} foros)
          </h2>
        </div> */}

        {forums.data.length > 0 ? (
          <ForumsGrid forums={forums.data} />
        ) : (
          <div className="text-center py-16">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto">
              <MessageSquare className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron foros</h3>
              <p className="text-gray-600 mb-6">
                {searchParams.toString() 
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Aún no hay foros en este curso'
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

      {/* Paginación */}
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