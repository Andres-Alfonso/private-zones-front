// app/routes/contents/$courseId._index.tsx

import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData, useSearchParams, useParams } from "@remix-run/react";
import { useState } from "react";
import { AlertCircle, ChevronLeft, ChevronRight, Filter, Search, Grid, List, Video, FileText, Image, Globe, Package, Eye, Edit, Trash2, Plus, Calendar, Clock } from "lucide-react";
import { useCurrentUser } from "~/context/AuthContext";
import { RoleGuard } from "~/components/AuthGuard";
import { ContentAPI } from "~/api/endpoints/contents";
import { createApiClientFromRequest } from "~/api/client";
import ContentCards from "~/components/contents/ContentCards";

// Tipos basados en la entidad ContentItem
export interface ContentItem {
  id: string;
  tenantId: string;
  title: string;
  contentType: 'video' | 'image' | 'document' | 'embed' | 'scorm';
  contentUrl: string;
  description: string | null;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ContentFilters {
  search?: string;
  contentType?: string;
  page: number;
  limit: number;
}

// Componente de filtros mejorado visualmente
const ContentFilters = ({ 
  searchTerm, 
  onSearchChange, 
  onSearchSubmit, 
  showFilters, 
  onToggleFilters,
  filterType,
  onTypeChange,
  contentTypes,
  totalResults,
  onClearFilters 
}: {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  filterType: string;
  onTypeChange: (value: string) => void;
  contentTypes: string[];
  totalResults: number;
  onClearFilters: () => void;
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda principal */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={onSearchSubmit} className="flex-1">
          <div className="relative group">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-all duration-200 ${
              isSearchFocused ? 'text-blue-500 scale-110' : 'text-gray-400'
            }`} />
            <input
              type="text"
              placeholder="Buscar contenidos..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full pl-10 pr-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 placeholder-gray-500 transition-all duration-200 hover:bg-white/80 focus:bg-white/90 hover:shadow-md"
            />
            <div className={`absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl transition-opacity duration-200 pointer-events-none ${
              isSearchFocused ? 'opacity-100' : 'opacity-0'
            }`} />
          </div>
        </form>

        <div className="flex gap-3">
          <button
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
          </button>
        </div>
      </div>

      {/* Filtros expandidos */}
      {showFilters && (
        <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200/40 animate-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Filtro por tipo de contenido */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Contenido
              </label>
              <select
                value={filterType}
                onChange={(e) => onTypeChange(e.target.value)}
                className="w-full px-3 py-2 bg-white/70 backdrop-blur-sm border border-gray-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 hover:bg-white/80"
              >
                <option value="">Todos los tipos</option>
                {contentTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

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
};

// Componente de grid de contenidos
const ContentGrid = ({ contents, hasAdminRole }: { contents: ContentItem[], hasAdminRole: boolean }) => {
  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-6 w-6" />;
      case 'document':
        return <FileText className="h-6 w-6" />;
      case 'image':
        return <Image className="h-6 w-6" />;
      case 'embed':
        return <Globe className="h-6 w-6" />;
      case 'scorm':
        return <Package className="h-6 w-6" />;
      default:
        return <FileText className="h-6 w-6" />;
    }
  };

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'document':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'image':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'embed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'scorm':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <ContentCards contents={contents} hasAdminRole={hasAdminRole} getContentIcon={getContentIcon} getContentTypeColor={getContentTypeColor}/>
  );
};

export const loader: LoaderFunction = async ({ request, params }) => {
  try {
    const courseId = params.courseId;
    const url = new URL(request.url);

    if(!courseId) {
      throw new Error('Course ID is required');
    }
    
    const filters: ContentFilters = {
      search: url.searchParams.get('search') || '',
      contentType: url.searchParams.get('contentType') || '',
      page: parseInt(url.searchParams.get('page') || '1'),
      limit: parseInt(url.searchParams.get('limit') || ''),
    };

    const authenticatedApiClient = createApiClientFromRequest(request);
    
    // 🔥 USAR LA API REAL (reemplaza todo el mock data)
    const apiResponse = await ContentAPI.getAllContents(courseId, filters, authenticatedApiClient);

    return json({
      contents: apiResponse, // Ahora incluye { data: [], pagination: { ... } }
      contentTypes: ['video', 'document', 'image', 'embed', 'scorm'],
      courseId,
      error: null
    });
  } catch (error: any) {
    console.error('Error loading contents:', error);
    return json({
      contents: { 
        data: [], 
        pagination: { page: 1, limit: 12, total: 0, totalPages: 0, hasNext: false, hasPrev: false }
      },
      contentTypes: [],
      courseId: params.courseId,
      error: error.message || 'Error al cargar los contenidos'
    });
  }
};

export default function CourseContentsIndex() {
  const { contents, contentTypes, courseId, error } = useLoaderData<{
    contents: { 
      data: ContentItem[], 
      pagination: { 
        page: number, 
        limit: number, 
        total: number, 
        totalPages: number, 
        hasNext: boolean, 
        hasPrev: boolean 
      }
    },
    contentTypes: string[],
    courseId: string,
    error: string | null
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

  // Manejar filtros
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
      {/* Header con estadísticas */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 p-6 hover:bg-white/90 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Contenidos del Curso</h2>
            <p className="text-gray-600">
              Total de contenidos: <span className="font-semibold text-blue-600">{contents.pagination.total}</span>
            </p>
          </div>

          <RoleGuard requiredRoles={['admin', 'instructor']} requireAll={false}>
            <button className="group flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm font-semibold">
              <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
              <span>Agregar Contenido</span>
            </button>
          </RoleGuard>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 p-6 hover:bg-white/90 hover:shadow-xl transition-all duration-300">
        <ContentFilters
          searchTerm={localSearch}
          onSearchChange={setLocalSearch}
          onSearchSubmit={handleSearch}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
          filterType={searchParams.get('contentType') || ''}
          onTypeChange={(value) => handleFilterChange('contentType', value)}
          contentTypes={contentTypes}
          totalResults={contents.pagination.total}
          onClearFilters={handleClearFilters}
        />
      </div>

      {/* Grid de contenidos */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 p-6 hover:bg-white/90 hover:shadow-xl transition-all duration-300">
        {contents.data.length > 0 ? (
          <ContentGrid 
            contents={contents.data} 
            hasAdminRole={hasRole('admin') || hasRole('instructor')}
          />
        ) : (
          <div className="text-center py-16">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto border border-gray-200/60 hover:bg-white/80 transition-all duration-300">
              <AlertCircle className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron contenidos</h3>
               <p className="text-gray-600 mb-6">
                  {searchParams.toString() 
                    ? 'Intenta ajustar los filtros de búsqueda'
                    : 'Aún no hay contenidos disponibles para este curso'
                  }
                </p>
              {(hasRole('admin') || hasRole('instructor')) && (
                <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                  <Plus className="h-5 w-5 mr-2" />
                  Crear primer contenido
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Paginación */}
      {contents.pagination.total > contents.pagination.limit && (
      <div className="flex justify-center">
        <nav className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 p-3 hover:bg-white/90 transition-all duration-300">
          <button
            disabled={!contents.pagination.hasPrev}
            onClick={() => handlePageChange(contents.pagination.page - 1)}
            className="p-2 text-sm border border-gray-300/60 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50/80 transition-all duration-200 backdrop-blur-sm hover:scale-105 disabled:hover:scale-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          {Array.from({ length: contents.pagination.totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-4 py-2 text-sm rounded-xl transition-all duration-200 font-medium ${
                page === contents.pagination.page
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                  : 'border border-gray-300/60 hover:bg-gray-50/80 backdrop-blur-sm hover:shadow-md hover:scale-105'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            disabled={!contents.pagination.hasNext}
            onClick={() => handlePageChange(contents.pagination.page + 1)}
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