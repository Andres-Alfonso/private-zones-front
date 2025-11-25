// app/routes/courses/manage.tsx

import { json, LoaderFunction, ActionFunction } from "@remix-run/node";
import { useLoaderData, useActionData, Form, Link, useNavigation } from "@remix-run/react";
import { useState } from "react";
import { 
  Plus, Search, Filter, Edit, Trash2, Eye, EyeOff, 
  Users, DollarSign, TrendingUp, AlertCircle, MoreHorizontal,
  Download, Upload, BarChart3, BookOpen, Calendar, Star,
  ChevronLeft, ChevronRight
} from "lucide-react";
import { Course, CourseLevel, CourseFilters, CoursesResponse } from "~/api/types/course.types";
// import { CoursesAPI } from "~/api/endpoints/courses";
import { RoleGuard } from "~/components/AuthGuard";
import { CoursesAPI } from "~/api/endpoints/courses";
import { createApiClientFromRequest } from "~/api/client";
import { getCurrentTranslation } from "~/utils/courseHelpers";

interface ManageCourse extends Course {
  enrollments: number;
  revenue: number;
  averageRating: number;
  completionRate: number;
}

interface LoaderData {
  courses: ManageCourse[];
  stats: {
    totalCourses: number;
    activeCourses: number;
    totalStudents: number;
    totalRevenue: number;
    averageRating: number;
  };
  categories: string[];
  instructors: Array<{ id: string; name: string; email: string }>;
  error: string | null;
}

interface ActionData {
  success?: boolean;
  error?: string;
  action?: string;
}

export const loader: LoaderFunction = async ({ request, params }) => {

  const url = new URL(request.url);
  const tenantDomain = request.headers.get('host');

  try {
    // En producción: llamadas reales al API
    // const courses = await CoursesAPI.getAll({ includeStats: true });
    // const categories = await CoursesAPI.getCategories();
    // const instructors = await CoursesAPI.getInstructors();

    const filters: CourseFilters = {
      search: url.searchParams.get('search') || undefined,
      isActive: url.searchParams.get('active') ? url.searchParams.get('active') === 'true' : undefined,
      page: parseInt(url.searchParams.get('page') || '1'),
      limit: parseInt(url.searchParams.get('limit') || '20'),
    };

    const authenticatedApiClient = createApiClientFromRequest(request);
    
    const apiResponse: CoursesResponse = await CoursesAPI.getAll(filters, authenticatedApiClient);

    
    // Datos simulados para gestión
    const mockCourses: ManageCourse[] = [
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
        enrollments: 23,
        revenue: 2299.77,
        averageRating: 4.6,
        completionRate: 78
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
        enrollments: 18,
        revenue: 2699.82,
        averageRating: 4.8,
        completionRate: 89
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
        isActive: false,
        maxStudents: 40,
        currentStudents: 12,
        startDate: '2024-03-01T00:00:00Z',
        endDate: '2024-04-15T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        enrollments: 12,
        revenue: 959.88,
        averageRating: 4.2,
        completionRate: 65
      }
    ];

    const stats = {
      totalCourses: mockCourses.length,
      activeCourses: mockCourses.filter(c => c.isActive).length,
      totalStudents: mockCourses.reduce((acc, c) => acc + c.enrollments, 0),
      totalRevenue: mockCourses.reduce((acc, c) => acc + c.revenue, 0),
      averageRating: mockCourses.reduce((acc, c) => acc + c.averageRating, 0) / mockCourses.length
    };

    // return json<LoaderData>({ 
    //   courses: mockCourses,
    //   stats,
    //   categories: ['Frontend', 'Backend', 'Diseño', 'DevOps'],
    //   instructors: [
    //     { id: '1', name: 'Juan Pérez', email: 'juan@example.com' },
    //     { id: '2', name: 'María García', email: 'maria@example.com' },
    //     { id: '3', name: 'Ana Rodríguez', email: 'ana@example.com' }
    //   ],
    //   error: null 
    // });

    return json({
        courses: apiResponse,
        stats,
        categories: ['Frontend', 'Backend', 'Diseño', 'DevOps'],
        instructors: [
          { id: '1', name: 'Juan Pérez', email: 'juan@example.com' },
          { id: '2', name: 'María García', email: 'maria@example.com' },
          { id: '3', name: 'Ana Rodríguez', email: 'ana@example.com' }
        ],
        error: null
    });
  } catch (error: any) {
    // console.error('Error loading course management data:', error);
    // return json<LoaderData>({ 
    //   courses: [],
    //   stats: { totalCourses: 0, activeCourses: 0, totalStudents: 0, totalRevenue: 0, averageRating: 0 },
    //   categories: [],
    //   instructors: [],
    //   error: error.message || 'Error al cargar los datos de gestión'
    // });

    console.error('Error loading modules:', error);
    return json({
        modules: { 
            data: [], 
            pagination: { page: 1, limit: 12, total: 0, totalPages: 0, hasNext: false, hasPrev: false }
        },
        courseId: params.courseId,
        error: error.message || 'Error al cargar los módulos'
    });
  }
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get('_action') as string;
  const courseId = formData.get('courseId') as string;

  try {
    switch (action) {
      case 'toggle-active':
        // await CoursesAPI.toggleActive(courseId);
        return json<ActionData>({ 
          success: true, 
          action: 'toggle-active' 
        });

      case 'delete':
        // await CoursesAPI.delete(courseId);
        return json<ActionData>({ 
          success: true, 
          action: 'delete' 
        });

      case 'bulk-delete':
        const courseIds = formData.getAll('selectedCourses') as string[];
        // await Promise.all(courseIds.map(id => CoursesAPI.delete(id)));
        return json<ActionData>({ 
          success: true, 
          action: 'bulk-delete' 
        });

      default:
        throw new Error('Acción no válida');
    }
  } catch (error: any) {
    return json<ActionData>({ 
      error: error.message || 'Error al procesar la acción'
    });
  }
};

export default function ManageCourses() {
  return (
    <RoleGuard requiredRoles={['superadmin', 'admin', 'instructor']} requireAll={false}>
      <ManageCoursesContent />
    </RoleGuard>
  );
}

function ManageCoursesContent() {
  const { courses, stats, categories, error } = useLoaderData<{
    courses: CoursesResponse,
    stats: {
      totalCourses: number,
      activeCourses: number,
      totalStudents: number,
      totalRevenue: number,
      averageRating: number
    },
    categories: string[],
    error: string | null
  }>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();

  const getCourseTitle = (course: Course, languageCode: string = 'en'): string => {
    const translation = course.translations.find(t => t.languageCode === languageCode);
    return translation?.title || course.translations[0]?.title || '';
  };
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  const isSubmitting = navigation.state === 'submitting';

  // Filtrar cursos
  const filteredCourses = courses?.data?.filter(course => {
    const title = getCourseTitle(course);
    
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filterStatus || 
                         (filterStatus === 'active' && course.isActive) ||
                         (filterStatus === 'inactive' && !course.isActive);
    
    return matchesSearch && matchesStatus;
  }) || [];

  // Manejar selección de cursos
  const handleSelectCourse = (courseId: string) => {
    setSelectedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleSelectAll = () => {
    setSelectedCourses(
      selectedCourses.length === filteredCourses.length 
        ? [] 
        : filteredCourses.map(c => c.id)
    );
  };

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8 max-w-md mx-auto">
          <AlertCircle className="mx-auto h-16 w-16 text-red-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Mensajes de estado */}
      {actionData?.error && (
        <div className="bg-red-50/80 backdrop-blur-sm border border-red-200/50 text-red-700 px-6 py-4 rounded-xl flex items-center shadow-lg">
          <AlertCircle className="h-5 w-5 mr-2" />
          {actionData.error}
        </div>
      )}

      {actionData?.success && (
        <div className="bg-green-50/80 backdrop-blur-sm border border-green-200/50 text-green-700 px-6 py-4 rounded-xl shadow-lg">
          {actionData.action === 'toggle-active' && 'Estado del curso actualizado exitosamente'}
          {actionData.action === 'delete' && 'Curso eliminado exitosamente'}
          {actionData.action === 'bulk-delete' && 'Cursos eliminados exitosamente'}
        </div>
      )}

      {/* Panel de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-200 transform hover:scale-105">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Cursos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-200 transform hover:scale-105">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
              <Eye className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Cursos Activos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeCourses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-200 transform hover:scale-105">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Estudiantes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
            </div>
          </div>
        </div>

        {/* <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-200 transform hover:scale-105">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div> */}

        {/* <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-200 transform hover:scale-105">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rating Promedio</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
            </div>
          </div>
        </div> */}
      </div>

      {/* Controles y filtros */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Búsqueda y filtros */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar cursos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/60 backdrop-blur-sm transition-all duration-200"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border border-gray-300/50 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/60 backdrop-blur-sm transition-all duration-200"
            >
              <option value="">Todas las categorías</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300/50 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/60 backdrop-blur-sm transition-all duration-200"
            >
              <option value="">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>

          {/* Acciones */}
          <div className="flex items-center space-x-3">
            {selectedCourses.length > 0 && (
              <Form method="post" className="inline">
                <input type="hidden" name="_action" value="bulk-delete" />
                {selectedCourses.map(id => (
                  <input key={id} type="hidden" name="selectedCourses" value={id} />
                ))}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Eliminar ({selectedCourses.length})</span>
                </button>
              </Form>
            )}

            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300/50 rounded-xl hover:bg-white/80 hover:shadow-md transition-all duration-200 bg-white/60 backdrop-blur-sm transform hover:scale-105">
              <Download className="h-4 w-4" />
              <span>Exportar</span>
            </button>

            <Link
              to="/courses/create"
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo Curso</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabla de cursos */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200/50 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200/50">
            <thead className="bg-gray-50/80 backdrop-blur-sm">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedCourses.length === filteredCourses.length && filteredCourses.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Curso
                </th>
                {/* <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Instructor
                </th> */}
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Usuarios
                </th>
                {/* <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Ingresos
                </th> */}
                {/* <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Rating
                </th> */}
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/60 backdrop-blur-sm divide-y divide-gray-200/50">
              {filteredCourses.map((course) => (
                <CourseManagementRow
                  key={course.id}
                  course={course}
                  isSelected={selectedCourses.includes(course.id)}
                  onSelect={() => handleSelectCourse(course.id)}
                  isSubmitting={isSubmitting}
                />
              ))}
            </tbody>
          </table>
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto">
              <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron cursos</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterCategory || filterStatus
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Aún no hay cursos creados'
                }
              </p>
              <Link
                to="/courses/create"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Plus className="h-5 w-5 mr-2" />
                Crear primer curso
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente para una fila de curso en la tabla
function CourseManagementRow({ 
  course, 
  isSelected, 
  onSelect, 
  isSubmitting 
}: { 
  course: ManageCourse, 
  isSelected: boolean, 
  onSelect: () => void,
  isSubmitting: boolean 
}) {

  const currentLanguage = 'es'; // o desde context, localStorage, etc.
  const currentTranslation = getCurrentTranslation(course.translations, currentLanguage);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <tr className={`transition-all duration-200 ${isSelected ? 'bg-blue-50/80' : 'hover:bg-gray-50/80'}`}>
      <td className="px-6 py-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
        />
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center">
          {course.configuration?.thumbnailImage && (
            <div className="flex-shrink-0 h-12 w-12 mr-4">
              <img 
                className="h-12 w-12 rounded-xl object-cover shadow-md" 
                src={course.configuration?.thumbnailImage} 
                alt={currentTranslation?.title || 'Course image'}
              />
            </div>
          )}
          <div>
            <div className="text-sm font-semibold text-gray-900">
              <Link 
                to={`/make/courses/${course.id}`}
                className="hover:text-blue-600 transition-colors"
              >
                {currentTranslation?.title ?? course.slug ?? 'Curso prueba'}
              </Link>
            </div>
            {/* <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(course.level)}`}>
                {getLevelText(course.level)}
              </span>
              <span className="text-xs text-gray-500">{course.category}</span>
            </div> */}
            <div className="flex items-center text-xs text-gray-400 mt-1">
              <Calendar className="h-3 w-3 mr-1" />
              {course.configuration?.estimatedHours}h
            </div>
          </div>
        </div>
      </td>

      {/* <td className="px-6 py-4">
        <div className="text-sm font-medium text-gray-900">{course.instructor}</div>
        <div className="text-xs text-gray-500">Creado: {formatDate(course.createdAt)}</div>
      </td> */}

      <td className="px-6 py-4">
        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
          course.isActive 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {course.isActive ? 'Activo' : 'Inactivo'}
        </span>
      </td>

      <td className="px-6 py-4">
        <div>
          <div className="text-sm font-semibold text-gray-900">{course.enrollments ?? 0} / {course.configuration?.maxEnrollments ?? 1000}</div>
          <div className="text-xs text-gray-500">{course.completionRate ?? 0}% completado</div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
            {/* <div 
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-200" 
              style={{ width: `${(course.enrollments / course.configuration.maxEnrollments) * 100}%` }}
            ></div> */}
          </div>
        </div>
      </td>

      {/* <td className="px-6 py-4">
        <div className="text-sm font-semibold text-gray-900">${course.revenue.toFixed(2)}</div>
        <div className="text-xs text-gray-500">${course.price}/estudiante</div>
      </td> */}

      {/* <td className="px-6 py-4">
        <div className="flex items-center space-x-1">
          <div className="flex text-yellow-400">
            {Array.from({ length: 5 }, (_, i) => (
              <Star 
                key={i} 
                className={`h-3 w-3 ${i < Math.floor(course.averageRating) ? 'fill-current' : ''}`} 
              />
            ))}
          </div>
          <span className="text-sm font-medium text-gray-900 ml-1">{course.averageRating.toFixed(1)}</span>
        </div>
      </td> */}

      <td className="px-6 py-4 text-sm font-medium">
        <div className="flex items-center space-x-2">
          <Link
            to={`/courses/${course.id}`}
            className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded-lg hover:bg-blue-50"
            title="Ver detalles"
          >
            <Eye className="h-4 w-4" />
          </Link>
          
          <Link
            to={`/courses/${course.id}/edit`}
            className="text-gray-600 hover:text-gray-900 transition-colors p-1 rounded-lg hover:bg-gray-50"
            title="Editar curso"
          >
            <Edit className="h-4 w-4" />
          </Link>

          <Form method="post" className="inline">
            <input type="hidden" name="_action" value="toggle-active" />
            <input type="hidden" name="courseId" value={course.id} />
            <button
              type="submit"
              disabled={isSubmitting}
              className={`p-1 rounded-lg transition-all duration-200 disabled:opacity-50 ${
                course.isActive 
                  ? 'text-red-600 hover:text-red-900 hover:bg-red-50' 
                  : 'text-green-600 hover:text-green-900 hover:bg-green-50'
              }`}
              title={course.isActive ? 'Desactivar curso' : 'Activar curso'}
            >
              {course.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </Form>

          <Form 
            method="post" 
            className="inline"
            onSubmit={(e) => {
              if (!confirm('¿Estás seguro de que quieres eliminar este curso? Esta acción no se puede deshacer.')) {
                e.preventDefault();
              }
            }}
          >
            <input type="hidden" name="_action" value="delete" />
            <input type="hidden" name="courseId" value={course.id} />
            <button
              type="submit"
              disabled={isSubmitting}
              className="text-red-600 hover:text-red-900 disabled:opacity-50 transition-all duration-200 p-1 rounded-lg hover:bg-red-50"
              title="Eliminar curso"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </Form>
        </div>
      </td>
    </tr>
  );
}