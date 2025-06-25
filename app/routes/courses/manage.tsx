// app/routes/courses/manage.tsx

import { json, LoaderFunction, ActionFunction } from "@remix-run/node";
import { useLoaderData, useActionData, Form, Link, useNavigation } from "@remix-run/react";
import { useState } from "react";
import { 
  Plus, Search, Filter, Edit, Trash2, Eye, EyeOff, 
  Users, DollarSign, TrendingUp, AlertCircle, MoreHorizontal,
  Download, Upload, BarChart3
} from "lucide-react";
import { Course, CourseLevel } from "~/api/types/course.types";
// import { CoursesAPI } from "~/api/endpoints/courses";
import { RoleGuard } from "~/components/AuthGuard";

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

export const loader: LoaderFunction = async ({ request }) => {
  try {
    // En producción: llamadas reales al API
    // const courses = await CoursesAPI.getAll({ includeStats: true });
    // const categories = await CoursesAPI.getCategories();
    // const instructors = await CoursesAPI.getInstructors();
    
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

    return json<LoaderData>({ 
      courses: mockCourses,
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
    console.error('Error loading course management data:', error);
    return json<LoaderData>({ 
      courses: [],
      stats: { totalCourses: 0, activeCourses: 0, totalStudents: 0, totalRevenue: 0, averageRating: 0 },
      categories: [],
      instructors: [],
      error: error.message || 'Error al cargar los datos de gestión'
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
    <RoleGuard requiredRoles={['admin', 'instructor']} requireAll={false}>
      <ManageCoursesContent />
    </RoleGuard>
  );
}

function ManageCoursesContent() {
  const { courses, stats, categories, instructors, error } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const isSubmitting = navigation.state === 'submitting';

  // Filtrar cursos
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || course.category === filterCategory;
    const matchesStatus = !filterStatus || 
                         (filterStatus === 'active' && course.isActive) ||
                         (filterStatus === 'inactive' && !course.isActive);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

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
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mensajes de estado */}
      {actionData?.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {actionData.error}
        </div>
      )}

      {actionData?.success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {actionData.action === 'toggle-active' && 'Estado del curso actualizado exitosamente'}
          {actionData.action === 'delete' && 'Curso eliminado exitosamente'}
          {actionData.action === 'bulk-delete' && 'Cursos eliminados exitosamente'}
        </div>
      )}

      {/* Panel de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total Cursos</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalCourses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Eye className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Cursos Activos</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.activeCourses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total Estudiantes</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Ingresos Totales</p>
              <p className="text-2xl font-semibold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Rating Promedio</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.averageRating.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controles y filtros */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
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
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todas las categorías</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Eliminar ({selectedCourses.length})</span>
                </button>
              </Form>
            )}

            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
              <Download className="h-4 w-4" />
              <span>Exportar</span>
            </button>

            <Link
              to="/courses/create"
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo Curso</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabla de cursos */}
      <div className="bg-white shadow-sm border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedCourses.length === filteredCourses.length && filteredCourses.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Curso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Instructor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estudiantes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ingresos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
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
          <div className="text-center py-12">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron cursos</h3>
            <p className="text-gray-600">
              {searchTerm || filterCategory || filterStatus
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Aún no hay cursos creados'
              }
            </p>
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
  const [showActions, setShowActions] = useState(false);

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
    <tr className={isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}>
      <td className="px-6 py-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="h-4 w-4 text-blue-600 rounded border-gray-300"
        />
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center">
          {course.thumbnail && (
            <div className="flex-shrink-0 h-12 w-12 mr-4">
              <img 
                className="h-12 w-12 rounded-lg object-cover" 
                src={course.thumbnail} 
                alt={course.title}
              />
            </div>
          )}
          <div>
            <div className="text-sm font-medium text-gray-900">
              <Link 
                to={`/courses/${course.id}`}
                className="hover:text-blue-600"
              >
                {course.title}
              </Link>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(course.level)}`}>
                {getLevelText(course.level)}
              </span>
              <span className="text-xs text-gray-500">{course.category}</span>
            </div>
          </div>
        </div>
      </td>

      <td className="px-6 py-4 text-sm text-gray-900">
        {course.instructor}
      </td>

      <td className="px-6 py-4">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          course.isActive 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {course.isActive ? 'Activo' : 'Inactivo'}
        </span>
      </td>

      <td className="px-6 py-4 text-sm text-gray-900">
        <div>
          <div className="font-medium">{course.enrollments}</div>
          <div className="text-gray-500">{course.completionRate}% completado</div>
        </div>
      </td>

      <td className="px-6 py-4 text-sm text-gray-900">
        <div className="font-medium">${course.revenue.toFixed(2)}</div>
      </td>

      <td className="px-6 py-4 text-sm text-gray-900">
        <div className="flex items-center">
          <div className="flex text-yellow-400 mr-1">
            {'★'.repeat(Math.floor(course.averageRating))}
          </div>
          <span>{course.averageRating.toFixed(1)}</span>
        </div>
      </td>

      <td className="px-6 py-4 text-sm font-medium relative">
        <div className="flex items-center space-x-2">
          <Link
            to={`/courses/${course.id}`}
            className="text-blue-600 hover:text-blue-900"
          >
            <Eye className="h-4 w-4" />
          </Link>
          
          <Link
            to={`/courses/${course.id}/edit`}
            className="text-gray-600 hover:text-gray-900"
          >
            <Edit className="h-4 w-4" />
          </Link>

          <Form method="post" className="inline">
            <input type="hidden" name="_action" value="toggle-active" />
            <input type="hidden" name="courseId" value={course.id} />
            <button
              type="submit"
              disabled={isSubmitting}
              className={`${course.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'} disabled:opacity-50`}
            >
              {course.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </Form>

          <Form 
            method="post" 
            className="inline"
            onSubmit={(e) => {
              if (!confirm('¿Estás seguro de que quieres eliminar este curso?')) {
                e.preventDefault();
              }
            }}
          >
            <input type="hidden" name="_action" value="delete" />
            <input type="hidden" name="courseId" value={course.id} />
            <button
              type="submit"
              disabled={isSubmitting}
              className="text-red-600 hover:text-red-900 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </Form>
        </div>
      </td>
    </tr>
  );
}