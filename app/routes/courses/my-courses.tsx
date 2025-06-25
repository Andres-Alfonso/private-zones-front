// app/routes/courses/my-courses.tsx

import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { useState } from "react";
import { 
  BookOpen, Clock, Users, Star, Calendar, Play, 
  CheckCircle, AlertCircle, Filter, Grid, List 
} from "lucide-react";
import { Course, CourseLevel } from "~/api/types/course.types";
import { useCurrentUser } from "~/context/AuthContext";

interface EnrolledCourse extends Course {
  enrollmentDate: string;
  progress: number; // 0-100
  status: 'in-progress' | 'completed' | 'not-started';
  lastAccessed?: string;
  certificateUrl?: string;
}

interface LoaderData {
  enrolledCourses: EnrolledCourse[];
  stats: {
    total: number;
    completed: number;
    inProgress: number;
    notStarted: number;
  };
  error: string | null;
}

export const loader: LoaderFunction = async ({ request }) => {
  try {
    // En producción, aquí harías la llamada al API para obtener los cursos del usuario
    // const userId = await getUserIdFromSession(request);
    // const enrolledCourses = await CoursesAPI.getMyEnrolledCourses(userId);
    
    // Datos simulados
    const mockEnrolledCourses: EnrolledCourse[] = [
      {
        id: '1',
        title: 'Introducción a React',
        description: 'Aprende los fundamentos de React desde cero',
        instructor: 'Juan Pérez',
        duration: 40,
        level: CourseLevel.BEGINNER,
        category: 'Frontend',
        price: 99.99,
        thumbnail: 'https://via.placeholder.com/300x200',
        isActive: true,
        maxStudents: 50,
        currentStudents: 23,
        startDate: '2024-02-01T00:00:00Z',
        endDate: '2024-04-01T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        enrollmentDate: '2024-01-15T00:00:00Z',
        progress: 75,
        status: 'in-progress',
        lastAccessed: '2024-01-20T00:00:00Z'
      },
      {
        id: '2',
        title: 'Node.js Avanzado',
        description: 'Domina Node.js y construye APIs robustas',
        instructor: 'María García',
        duration: 60,
        level: CourseLevel.ADVANCED,
        category: 'Backend',
        price: 149.99,
        thumbnail: 'https://via.placeholder.com/300x200',
        isActive: true,
        maxStudents: 30,
        currentStudents: 18,
        startDate: '2024-02-15T00:00:00Z',
        endDate: '2024-05-15T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        enrollmentDate: '2024-01-10T00:00:00Z',
        progress: 100,
        status: 'completed',
        lastAccessed: '2024-01-25T00:00:00Z',
        certificateUrl: '/certificates/course-2.pdf'
      },
      {
        id: '3',
        title: 'Diseño UX/UI Fundamentals',
        description: 'Principios básicos de diseño de experiencia de usuario',
        instructor: 'Ana Rodríguez',
        duration: 30,
        level: CourseLevel.BEGINNER,
        category: 'Diseño',
        price: 79.99,
        thumbnail: 'https://via.placeholder.com/300x200',
        isActive: true,
        maxStudents: 40,
        currentStudents: 12,
        startDate: '2024-03-01T00:00:00Z',
        endDate: '2024-04-15T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        enrollmentDate: '2024-01-25T00:00:00Z',
        progress: 0,
        status: 'not-started'
      }
    ];

    const stats = {
      total: mockEnrolledCourses.length,
      completed: mockEnrolledCourses.filter(c => c.status === 'completed').length,
      inProgress: mockEnrolledCourses.filter(c => c.status === 'in-progress').length,
      notStarted: mockEnrolledCourses.filter(c => c.status === 'not-started').length,
    };

    return json<LoaderData>({ 
      enrolledCourses: mockEnrolledCourses,
      stats,
      error: null 
    });
  } catch (error: any) {
    console.error('Error loading enrolled courses:', error);
    return json<LoaderData>({ 
      enrolledCourses: [],
      stats: { total: 0, completed: 0, inProgress: 0, notStarted: 0 },
      error: error.message || 'Error al cargar tus cursos'
    });
  }
};

export default function MyCourses() {
  const { enrolledCourses, stats, error } = useLoaderData<LoaderData>();
  const { user } = useCurrentUser();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');

  // Filtrar cursos según el estado seleccionado
  const filteredCourses = enrolledCourses.filter(course => {
    if (filterStatus === 'all') return true;
    return course.status === filterStatus;
  });

  // Ordenar cursos
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.lastAccessed || b.enrollmentDate).getTime() - 
               new Date(a.lastAccessed || a.enrollmentDate).getTime();
      case 'progress':
        return b.progress - a.progress;
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const getStatusColor = (status: EnrolledCourse['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'not-started':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: EnrolledCourse['status']) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'in-progress':
        return 'En Progreso';
      case 'not-started':
        return 'Sin Empezar';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <Link
          to="/courses"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Explorar cursos
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Mis Cursos
            </h2>
            <p className="text-gray-600">
              Bienvenido de vuelta, {user?.name}. Continúa con tu aprendizaje.
            </p>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <BookOpen className="h-6 w-6 text-blue-600 mr-2" />
              <div>
                <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
                <div className="text-sm text-blue-600">Total Cursos</div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
              <div>
                <div className="text-2xl font-bold text-green-900">{stats.completed}</div>
                <div className="text-sm text-green-600">Completados</div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Play className="h-6 w-6 text-yellow-600 mr-2" />
              <div>
                <div className="text-2xl font-bold text-yellow-900">{stats.inProgress}</div>
                <div className="text-sm text-yellow-600">En Progreso</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Calendar className="h-6 w-6 text-gray-600 mr-2" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.notStarted}</div>
                <div className="text-sm text-gray-600">Sin Empezar</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controles y filtros */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Filtros */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos los estados</option>
                <option value="in-progress">En progreso</option>
                <option value="completed">Completados</option>
                <option value="not-started">Sin empezar</option>
              </select>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="recent">Más recientes</option>
              <option value="progress">Por progreso</option>
              <option value="title">Por título</option>
            </select>
          </div>

          {/* Vista y resultados */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {filteredCourses.length} curso{filteredCourses.length !== 1 ? 's' : ''}
            </span>
            
            <div className="flex items-center border border-gray-300 rounded-md">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de cursos */}
      {sortedCourses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filterStatus === 'all' ? 'No tienes cursos inscritos' : 'No hay cursos con este estado'}
          </h3>
          <p className="text-gray-600 mb-6">
            {filterStatus === 'all' 
              ? 'Explora nuestro catálogo y encuentra el curso perfecto para ti'
              : 'Cambia el filtro para ver otros cursos'
            }
          </p>
          <Link
            to="/courses"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Explorar cursos
          </Link>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedCourses.map((course) => (
            <EnrolledCourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedCourses.map((course) => (
            <EnrolledCourseListItem key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}

// Componente para vista de tarjeta
function EnrolledCourseCard({ course }: { course: EnrolledCourse }) {
  const getStatusColor = (status: EnrolledCourse['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'not-started':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: EnrolledCourse['status']) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'in-progress':
        return 'En Progreso';
      case 'not-started':
        return 'Sin Empezar';
      default:
        return status;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      {/* Imagen */}
      {course.thumbnail && (
        <div className="aspect-video overflow-hidden rounded-t-lg relative">
          <img 
            src={course.thumbnail} 
            alt={course.title}
            className="w-full h-full object-cover"
          />
          {course.status === 'completed' && (
            <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
              <CheckCircle className="h-4 w-4" />
            </div>
          )}
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(course.status)}`}>
            {getStatusText(course.status)}
          </span>
          <span className="text-sm text-gray-500">{course.category}</span>
        </div>

        {/* Título */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          <Link 
            to={`/courses/${course.id}`} 
            className="hover:text-blue-600 transition-colors"
          >
            {course.title}
          </Link>
        </h3>

        {/* Instructor */}
        <div className="text-sm text-gray-700 mb-4">
          Por <span className="font-medium">{course.instructor}</span>
        </div>

        {/* Barra de progreso */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progreso</span>
            <span>{course.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${course.progress}%` }}
            ></div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="space-y-2">
          {course.status === 'completed' && course.certificateUrl ? (
            <a
              href={course.certificateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Ver Certificado</span>
            </a>
          ) : (
            <Link
              to={`/courses/${course.id}/learn`}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Play className="h-4 w-4" />
              <span>{course.status === 'not-started' ? 'Empezar' : 'Continuar'}</span>
            </Link>
          )}
          
          <Link
            to={`/courses/${course.id}`}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Ver Detalles
          </Link>
        </div>
      </div>
    </div>
  );
}

// Componente para vista de lista
function EnrolledCourseListItem({ course }: { course: EnrolledCourse }) {
  const getStatusColor = (status: EnrolledCourse['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'not-started':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: EnrolledCourse['status']) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'in-progress':
        return 'En Progreso';
      case 'not-started':
        return 'Sin Empezar';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center space-x-6">
        {/* Imagen */}
        {course.thumbnail && (
          <div className="flex-shrink-0 w-20 h-20 overflow-hidden rounded-lg relative">
            <img 
              src={course.thumbnail} 
              alt={course.title}
              className="w-full h-full object-cover"
            />
            {course.status === 'completed' && (
              <div className="absolute top-1 right-1 bg-green-500 text-white p-0.5 rounded-full">
                <CheckCircle className="h-3 w-3" />
              </div>
            )}
          </div>
        )}

        {/* Información principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  <Link 
                    to={`/courses/${course.id}`} 
                    className="hover:text-blue-600 transition-colors"
                  >
                    {course.title}
                  </Link>
                </h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(course.status)}`}>
                  {getStatusText(course.status)}
                </span>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                <span>Por {course.instructor}</span>
                <span>{course.category}</span>
                <span>{course.duration}h</span>
                {course.lastAccessed && (
                  <span>Último acceso: {formatDate(course.lastAccessed)}</span>
                )}
              </div>

              {/* Barra de progreso */}
              <div className="max-w-md">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progreso</span>
                  <span>{course.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex items-center space-x-3">
              {course.status === 'completed' && course.certificateUrl ? (
                <a
                  href={course.certificateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Certificado</span>
                </a>
              ) : (
                <Link
                  to={`/courses/${course.id}/learn`}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                >
                  <Play className="h-4 w-4" />
                  <span>{course.status === 'not-started' ? 'Empezar' : 'Continuar'}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}