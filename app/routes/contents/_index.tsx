// app/routes/contents/_index.tsx

import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData, useSearchParams, Link } from "@remix-run/react";
import { useState } from "react";
import { AlertCircle, ChevronLeft, ChevronRight, Filter, Search, Grid, List, Video, FileText, Image, Globe, Package, Eye, Edit, Trash2, Plus, BookOpen, ExternalLink, BarChart3, Users, Calendar, TrendingUp, Settings, Upload, FolderOpen } from "lucide-react";
import { useCurrentUser } from "~/context/AuthContext";
import { RoleGuard } from "~/components/AuthGuard";

// Tipos para estadísticas administrativas
interface ContentStats {
  totalContents: number;
  contentsByType: Record<string, number>;
  recentUploads: number;
  totalViews: number;
  averageRating: number;
  storageUsed: string;
}

// Tipos extendidos para incluir información del curso y estadísticas
export interface ContentItemWithCourse {
  id: string;
  tenantId: string;
  title: string;
  contentType: 'video' | 'image' | 'document' | 'embed' | 'scorm';
  contentUrl: string;
  description: string | null;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  course: {
    id: string;
    title: string;
    category: string;
    instructor: string;
  };
  views: number;
  status: 'active' | 'inactive' | 'pending';
}

export interface ContentFilters {
  search?: string;
  contentType?: string;
  course?: string;
  status?: string;
  page: number;
  limit: number;
}

// Dashboard de estadísticas administrativas
const AdminContentsDashboard = ({ stats }: { stats: ContentStats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total de Contenidos */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium">Total Contenidos</p>
            <p className="text-3xl font-bold">{stats.totalContents.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-white/20 rounded-xl">
            <BookOpen className="h-8 w-8" />
          </div>
        </div>
      </div>

      {/* Visualizaciones Totales */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm font-medium">Total Visualizaciones</p>
            <p className="text-3xl font-bold">{stats.totalViews.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-white/20 rounded-xl">
            <Eye className="h-8 w-8" />
          </div>
        </div>
      </div>

      {/* Subidas Recientes */}
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100 text-sm font-medium">Subidas esta semana</p>
            <p className="text-3xl font-bold">{stats.recentUploads}</p>
          </div>
          <div className="p-3 bg-white/20 rounded-xl">
            <Upload className="h-8 w-8" />
          </div>
        </div>
      </div>

      {/* Almacenamiento */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-orange-100 text-sm font-medium">Almacenamiento</p>
            <p className="text-3xl font-bold">{stats.storageUsed}</p>
          </div>
          <div className="p-3 bg-white/20 rounded-xl">
            <BarChart3 className="h-8 w-8" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Gráfico de distribución por tipos
const ContentTypeChart = ({ stats }: { stats: ContentStats }) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-red-500';
      case 'document': return 'bg-blue-500';
      case 'image': return 'bg-green-500';
      case 'embed': return 'bg-purple-500';
      case 'scorm': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-5 w-5" />;
      case 'document': return <FileText className="h-5 w-5" />;
      case 'image': return <Image className="h-5 w-5" />;
      case 'embed': return <Globe className="h-5 w-5" />;
      case 'scorm': return <Package className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Tipo de Contenido</h3>
      <div className="space-y-4">
        {Object.entries(stats.contentsByType).map(([type, count]) => {
          const percentage = Math.round((count / stats.totalContents) * 100);
          return (
            <div key={type} className="flex items-center space-x-4">
              <div className={`p-2 rounded-lg text-white ${getTypeColor(type)}`}>
                {getTypeIcon(type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700 capitalize">{type}</span>
                  <span className="text-sm text-gray-500">{count} ({percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getTypeColor(type)}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Componente de filtros administrativos
const AdminContentFilters = ({ 
  searchTerm, 
  onSearchChange, 
  onSearchSubmit, 
  showFilters, 
  onToggleFilters,
  filterType,
  onTypeChange,
  filterCourse,
  onCourseChange,
  filterStatus,
  onStatusChange,
  contentTypes,
  courses,
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
  filterCourse: string;
  onCourseChange: (value: string) => void;
  filterStatus: string;
  onStatusChange: (value: string) => void;
  contentTypes: string[];
  courses: Array<{id: string, title: string}>;
  totalResults: number;
  onClearFilters: () => void;
}) => {
  return (
    <div className="space-y-4">
      {/* Barra de búsqueda y acciones principales */}
      <div className="flex flex-col lg:flex-row gap-4">
        <form onSubmit={onSearchSubmit} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar contenidos, cursos, instructores..."
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
            <span>Filtros Avanzados</span>
          </button>

          <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm font-semibold">
            <Plus className="h-4 w-4" />
            <span>Nuevo Contenido</span>
          </button>

          <button className="flex items-center space-x-2 px-4 py-3 bg-white/60 text-gray-700 border border-gray-200/50 rounded-xl hover:bg-white/80 transition-all duration-200 text-sm font-medium">
            <Upload className="h-4 w-4" />
            <span>Subida Masiva</span>
          </button>
        </div>
      </div>

      {/* Filtros expandidos */}
      {showFilters && (
        <div className="bg-white/40 backdrop-blur-sm rounded-xl p-6 border border-gray-200/30">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Filtro por tipo de contenido */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Contenido
              </label>
              <select
                value={filterType}
                onChange={(e) => onTypeChange(e.target.value)}
                className="w-full px-3 py-2 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="">Todos los tipos</option>
                {contentTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por curso */}
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

            {/* Filtro por estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={filterStatus}
                onChange={(e) => onStatusChange(e.target.value)}
                className="w-full px-3 py-2 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="">Todos los estados</option>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
                <option value="pending">Pendiente</option>
              </select>
            </div>

            {/* Estadísticas */}
            <div>
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

// Grid administrativo de contenidos
const AdminContentGrid = ({ contents, hasAdminRole }: { contents: ContentItemWithCourse[], hasAdminRole: boolean }) => {
  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-6 w-6" />;
      case 'document': return <FileText className="h-6 w-6" />;
      case 'image': return <Image className="h-6 w-6" />;
      case 'embed': return <Globe className="h-6 w-6" />;
      case 'scorm': return <Package className="h-6 w-6" />;
      default: return <FileText className="h-6 w-6" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'inactive': return 'Inactivo';
      case 'pending': return 'Pendiente';
      default: return 'Desconocido';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {contents.map((content) => (
        <div key={content.id} className="group bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105">
          {/* Header con información del curso */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-white text-sm">
                <BookOpen className="h-4 w-4" />
                <span className="font-medium truncate">{content.course.title}</span>
              </div>
              <Link 
                to={`/contents/course/${content.course.id}`}
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
                  {getContentIcon(content.contentType)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {content.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Por {content.course.instructor}
                  </p>
                </div>
              </div>
            </div>
            
            {content.description && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {content.description}
              </p>
            )}

            {/* Estado y estadísticas */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(content.status)}`}>
                  {getStatusText(content.status)}
                </span>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Eye className="h-4 w-4" />
                  <span>{content.views.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="text-xs text-gray-500">
                Creado: {new Date(content.createdAt).toLocaleDateString()}
              </div>
            </div>

            {/* Acciones administrativas */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Ver contenido">
                  <Eye className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" title="Editar">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all" title="Configurar">
                  <Settings className="h-4 w-4" />
                </button>
              </div>
              
              <button className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Eliminar">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Loader para cargar datos del servidor
export const loader: LoaderFunction = async ({ request }) => {
  try {
    const url = new URL(request.url);
    
    const filters: ContentFilters = {
      search: url.searchParams.get('search') || undefined,
      contentType: url.searchParams.get('contentType') || undefined,
      course: url.searchParams.get('course') || undefined,
      status: url.searchParams.get('status') || undefined,
      page: parseInt(url.searchParams.get('page') || '1'),
      limit: parseInt(url.searchParams.get('limit') || '12'),
    };

    // Mock data para estadísticas administrativas
    const mockStats: ContentStats = {
      totalContents: 156,
      contentsByType: {
        video: 45,
        document: 62,
        image: 28,
        embed: 15,
        scorm: 6
      },
      recentUploads: 12,
      totalViews: 8945,
      averageRating: 4.7,
      storageUsed: "2.4 GB"
    };

    // Mock data para contenidos con información de curso
    const mockContents: ContentItemWithCourse[] = [
      {
        id: '1',
        tenantId: 'tenant-1',
        title: 'Introducción a React - Conceptos Básicos',
        contentType: 'video',
        contentUrl: 'https://example.com/video1.mp4',
        description: 'Video introductorio que explica los conceptos fundamentales de React',
        metadata: {
          duration: 25,
          difficulty: 'beginner',
          tags: ['react', 'javascript', 'frontend']
        },
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        course: {
          id: 'course-1',
          title: 'Introducción a React',
          category: 'Frontend',
          instructor: 'Juan Pérez'
        },
        views: 1245,
        status: 'active'
      },
      {
        id: '2',
        tenantId: 'tenant-1',
        title: 'Manual de Node.js Avanzado',
        contentType: 'document',
        contentUrl: 'https://example.com/document1.pdf',
        description: 'Guía completa para desarrollo backend con Node.js',
        metadata: {
          pages: 48,
          difficulty: 'advanced',
          tags: ['nodejs', 'backend', 'javascript']
        },
        createdAt: '2024-01-16T14:30:00Z',
        updatedAt: '2024-01-16T14:30:00Z',
        course: {
          id: 'course-2',
          title: 'Node.js Avanzado',
          category: 'Backend',
          instructor: 'María García'
        },
        views: 892,
        status: 'active'
      },
      {
        id: '3',
        tenantId: 'tenant-1',
        title: 'Mockups de UX/UI',
        contentType: 'image',
        contentUrl: 'https://example.com/mockup.png',
        description: 'Colección de mockups para interfaces modernas',
        metadata: {
          resolution: '2560x1440',
          format: 'png',
          tags: ['ux', 'ui', 'design', 'mockup']
        },
        createdAt: '2024-01-17T09:15:00Z',
        updatedAt: '2024-01-17T09:15:00Z',
        course: {
          id: 'course-3',
          title: 'Diseño UX/UI Moderno',
          category: 'Diseño',
          instructor: 'Ana Rodríguez'
        },
        views: 567,
        status: 'pending'
      },
      {
        id: '4',
        tenantId: 'tenant-1',
        title: 'Simulador Docker',
        contentType: 'embed',
        contentUrl: 'https://labs.docker.com/simulator',
        description: 'Entorno interactivo para practicar Docker',
        metadata: {
          platform: 'docker-labs',
          interactive: true,
          tags: ['docker', 'devops', 'containers']
        },
        createdAt: '2024-01-18T16:45:00Z',
        updatedAt: '2024-01-18T16:45:00Z',
        course: {
          id: 'course-4',
          title: 'DevOps con Docker',
          category: 'DevOps',
          instructor: 'Carlos López'
        },
        views: 423,
        status: 'active'
      },
      {
        id: '5',
        tenantId: 'tenant-1',
        title: 'Curso Interactivo ML',
        contentType: 'scorm',
        contentUrl: 'https://example.com/scorm/ml-course.zip',
        description: 'Paquete SCORM completo de Machine Learning',
        metadata: {
          version: '1.2',
          lessons: 15,
          duration: 180,
          tags: ['machine-learning', 'python', 'ai']
        },
        createdAt: '2024-01-19T11:20:00Z',
        updatedAt: '2024-01-19T11:20:00Z',
        course: {
          id: 'course-5',
          title: 'Machine Learning con Python',
          category: 'Data Science',
          instructor: 'Dr. Elena Martínez'
        },
        views: 756,
        status: 'active'
      },
      {
        id: '6',
        tenantId: 'tenant-1',
        title: 'Video Tutorial Flutter',
        contentType: 'video',
        contentUrl: 'https://example.com/flutter-tutorial.mp4',
        description: 'Tutorial paso a paso para crear apps móviles',
        metadata: {
          duration: 42,
          difficulty: 'beginner',
          tags: ['flutter', 'mobile', 'dart']
        },
        createdAt: '2024-01-20T13:10:00Z',
        updatedAt: '2024-01-20T13:10:00Z',
        course: {
          id: 'course-6',
          title: 'Flutter Mobile Development',
          category: 'Mobile',
          instructor: 'Miguel Santos'
        },
        views: 334,
        status: 'inactive'
      }
    ];

    // Mock data para cursos disponibles
    const mockCourses = [
      { id: 'course-1', title: 'Introducción a React' },
      { id: 'course-2', title: 'Node.js Avanzado' },
      { id: 'course-3', title: 'Diseño UX/UI Moderno' },
      { id: 'course-4', title: 'DevOps con Docker' },
      { id: 'course-5', title: 'Machine Learning con Python' },
      { id: 'course-6', title: 'Flutter Mobile Development' }
    ];

    // Aplicar filtros (simulado)
    let filteredContents = mockContents;

    if (filters.search) {
      filteredContents = filteredContents.filter(content =>
        content.title.toLowerCase().includes(filters.search!.toLowerCase()) ||
        content.description?.toLowerCase().includes(filters.search!.toLowerCase()) ||
        content.course.title.toLowerCase().includes(filters.search!.toLowerCase()) ||
        content.course.instructor.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }

    if (filters.contentType) {
      filteredContents = filteredContents.filter(content =>
        content.contentType === filters.contentType
      );
    }

    if (filters.course) {
      filteredContents = filteredContents.filter(content =>
        content.course.id === filters.course
      );
    }

    if (filters.status) {
      filteredContents = filteredContents.filter(content =>
        content.status === filters.status
      );
    }

    const total = filteredContents.length;
    const startIndex = (filters.page - 1) * filters.limit;
    const endIndex = startIndex + filters.limit;
    const paginatedContents = filteredContents.slice(startIndex, endIndex);

    return json({
      contents: {
        data: paginatedContents,
        total,
        page: filters.page,
        limit: filters.limit
      },
      stats: mockStats,
      contentTypes: ['video', 'document', 'image', 'embed', 'scorm'],
      courses: mockCourses,
      error: null
    });
  } catch (error: any) {
    console.error('Error loading contents:', error);
    return json({
      contents: { data: [], total: 0, page: 1, limit: 12 },
      stats: { totalContents: 0, contentsByType: {}, recentUploads: 0, totalViews: 0, averageRating: 0, storageUsed: "0 GB" },
      contentTypes: [],
      courses: [],
      error: error.message || 'Error al cargar los contenidos'
    });
  }
};

export default function AdminContentsIndex() {
  const { contents, stats, contentTypes, courses, error } = useLoaderData<{
    contents: { data: ContentItemWithCourse[], total: number, page: number, limit: number },
    stats: ContentStats,
    contentTypes: string[],
    courses: Array<{id: string, title: string}>,
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
      <AdminContentsDashboard stats={stats} />

      {/* Gráfico de distribución y acciones rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ContentTypeChart stats={stats} />
        </div>
        
        {/* Acciones rápidas */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50/80 rounded-xl transition-colors border border-gray-200/50">
              <Plus className="h-5 w-5 text-green-600" />
              <span className="font-medium">Crear Contenido</span>
            </button>
            <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50/80 rounded-xl transition-colors border border-gray-200/50">
              <Upload className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Subida Masiva</span>
            </button>
            <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50/80 rounded-xl transition-colors border border-gray-200/50">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <span className="font-medium">Ver Analíticas</span>
            </button>
            <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50/80 rounded-xl transition-colors border border-gray-200/50">
              <Settings className="h-5 w-5 text-gray-600" />
              <span className="font-medium">Configuración</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda administrativa */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
        <AdminContentFilters
          searchTerm={localSearch}
          onSearchChange={setLocalSearch}
          onSearchSubmit={handleSearch}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
          filterType={searchParams.get('contentType') || ''}
          onTypeChange={(value) => handleFilterChange('contentType', value)}
          filterCourse={searchParams.get('course') || ''}
          onCourseChange={(value) => handleFilterChange('course', value)}
          filterStatus={searchParams.get('status') || ''}
          onStatusChange={(value) => handleFilterChange('status', value)}
          contentTypes={contentTypes}
          courses={courses}
          totalResults={contents.total}
          onClearFilters={handleClearFilters}
        />
      </div>

      {/* Grid administrativo de contenidos */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Gestión de Contenidos ({contents.total} elementos)
          </h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Grid className="h-4 w-4" />
            <span>Vista de tarjetas</span>
          </div>
        </div>

        {contents.data.length > 0 ? (
          <AdminContentGrid 
            contents={contents.data} 
            hasAdminRole={hasRole('admin') || hasRole('instructor')}
          />
        ) : (
          <div className="text-center py-16">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto">
              <FolderOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron contenidos</h3>
              <p className="text-gray-600 mb-6">
                {searchParams.toString() 
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Aún no hay contenidos en el sistema'
                }
              </p>
              <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                <Plus className="h-5 w-5 mr-2" />
                Crear primer contenido
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Paginación */}
      {contents.total > contents.limit && (
        <div className="flex justify-center">
          <nav className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-3">
            <button
              disabled={contents.page <= 1}
              onClick={() => handlePageChange(contents.page - 1)}
              className="p-2 text-sm border border-gray-300/50 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50/80 transition-all duration-200 backdrop-blur-sm"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            {Array.from({ length: Math.ceil(contents.total / contents.limit) }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 text-sm rounded-xl transition-all duration-200 ${
                  page === contents.page
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                    : 'border border-gray-300/50 hover:bg-gray-50/80 backdrop-blur-sm hover:shadow-md hover:scale-105'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              disabled={contents.page >= Math.ceil(contents.total / contents.limit)}
              onClick={() => handlePageChange(contents.page + 1)}
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