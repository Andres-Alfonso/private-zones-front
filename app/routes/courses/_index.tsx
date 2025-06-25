// app/routes/courses/_index.tsx

import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData, useSearchParams, Form, Link } from "@remix-run/react";
import { useState, useEffect } from "react";
import { Search, Filter, Clock, Users, Star, BookOpen } from "lucide-react";
import { Course, CourseLevel, CourseFilters } from "~/api/types/course.types";
// import { CoursesAPI } from "~/api/endpoints/courses";
import { useCurrentUser } from "~/context/AuthContext";

// Loader para cargar datos del servidor
export const loader: LoaderFunction = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const filters: CourseFilters = {
      search: url.searchParams.get('search') || undefined,
      category: url.searchParams.get('category') || undefined,
      level: url.searchParams.get('level') as CourseLevel || undefined,
      page: parseInt(url.searchParams.get('page') || '1'),
      limit: parseInt(url.searchParams.get('limit') || '12'),
    };

    // En producción, aquí harías la llamada al API desde el servidor
    // Por ahora simulamos datos
    const mockData = {
      data: [
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
          updatedAt: '2024-01-01T00:00:00Z'
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
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ],
      total: 2,
      page: 1,
      limit: 12
    };

    return json({ 
      courses: mockData,
      categories: ['Frontend', 'Backend', 'Diseño', 'DevOps'],
      error: null 
    });
  } catch (error: any) {
    console.error('Error loading courses:', error);
    return json({ 
      courses: { data: [], total: 0, page: 1, limit: 12 }, 
      categories: [],
      error: error.message || 'Error al cargar los cursos' 
    });
  }
};

export default function CoursesIndex() {
  const { courses, categories, error } = useLoaderData<{
    courses: { data: Course[], total: number, page: number, limit: number },
    categories: string[],
    error: string | null
  }>();
  
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const { user, hasRole } = useCurrentUser();

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

  // Paginación
  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
  };

  return (
    <div className="space-y-6">
      {/* Barra de búsqueda y filtros */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Búsqueda */}
          <Form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar cursos..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </Form>

          {/* Controles de filtro */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Filter className="h-4 w-4" />
              <span>Filtros</span>
            </button>

            <div className="text-sm text-gray-600">
              {courses.total} curso{courses.total !== 1 ? 's' : ''} encontrado{courses.total !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Categoría */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría
                </label>
                <select
                  value={searchParams.get('category') || ''}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  value={searchParams.get('level') || ''}
                  onChange={(e) => handleFilterChange('level', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  onClick={() => setSearchParams({})}
                  className="w-full px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Estado de error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          Error: {error}
        </div>
      )}

      {/* Grid de cursos */}
      {courses.data.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron cursos</h3>
          <p className="text-gray-600 mb-6">
            {searchParams.toString() ? 'Intenta ajustar tus filtros de búsqueda' : 'Aún no hay cursos disponibles'}
          </p>
          {hasRole('admin') || hasRole('instructor') ? (
            <Link
              to="/courses/create"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Crear primer curso
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.data.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}

      {/* Paginación */}
      {courses.total > courses.limit && (
        <div className="flex justify-center">
          <Pagination
            currentPage={courses.page}
            totalPages={Math.ceil(courses.total / courses.limit)}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}

// Componente CourseCard
function CourseCard({ course }: { course: Course }) {
  const getLevelColor = (level: CourseLevel) => {
    switch (level) {
      case CourseLevel.BEGINNER:
        return 'bg-green-100 text-green-800';
      case CourseLevel.INTERMEDIATE:
        return 'bg-yellow-100 text-yellow-800';
      case CourseLevel.ADVANCED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelText = (level: CourseLevel) => {
    switch (level) {
      case CourseLevel.BEGINNER:
        return 'Principiante';
      case CourseLevel.INTERMEDIATE:
        return 'Intermedio';
      case CourseLevel.ADVANCED:
        return 'Avanzado';
      default:
        return level;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      {/* Imagen */}
      {course.thumbnail && (
        <div className="aspect-video overflow-hidden rounded-t-lg">
          <img 
            src={course.thumbnail} 
            alt={course.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(course.level)}`}>
            {getLevelText(course.level)}
          </span>
          <span className="text-sm text-gray-500">{course.category}</span>
        </div>

        {/* Título y descripción */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          <Link 
            to={`/courses/${course.id}`} 
            className="hover:text-blue-600 transition-colors"
          >
            {course.title}
          </Link>
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {course.description}
        </p>

        {/* Instructor */}
        <div className="text-sm text-gray-700 mb-4">
          Por <span className="font-medium">{course.instructor}</span>
        </div>

        {/* Métricas */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{course.duration}h</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{course.currentStudents}/{course.maxStudents}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-400" />
            <span>4.5</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-gray-900">
            ${course.price}
          </div>
          <Link
            to={`/courses/${course.id}`}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
          >
            Ver más
          </Link>
        </div>
      </div>
    </div>
  );
}

// Componente de paginación
function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: { 
  currentPage: number, 
  totalPages: number, 
  onPageChange: (page: number) => void 
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  
  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Anterior
      </button>
      
      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-2 text-sm rounded-md ${
            page === currentPage
              ? 'bg-blue-600 text-white'
              : 'border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {page}
        </button>
      ))}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Siguiente
      </button>
    </div>
  );
}