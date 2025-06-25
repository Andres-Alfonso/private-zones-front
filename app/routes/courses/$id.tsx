// app/routes/courses/$id.tsx

import { json, LoaderFunction, ActionFunction } from "@remix-run/node";
import { useLoaderData, useActionData, Form, Link, useNavigation } from "@remix-run/react";
import { useState } from "react";
import { 
  Clock, Users, Star, Calendar, DollarSign, BookOpen, 
  User, Edit, Trash2, UserPlus, UserMinus, AlertCircle 
} from "lucide-react";
import { Course, CourseLevel } from "~/api/types/course.types";
// import { CoursesAPI } from "~/api/endpoints/courses";
import { useCurrentUser } from "~/context/AuthContext";
import { RoleGuard } from "~/components/AuthGuard";

interface LoaderData {
  course: Course | null;
  error: string | null;
  isEnrolled: boolean;
}

interface ActionData {
  success?: boolean;
  error?: string;
  action?: 'enroll' | 'unenroll' | 'delete';
}

export const loader: LoaderFunction = async ({ params }) => {
  try {
    const courseId = params.id as string;
    
    if (!courseId) {
      throw new Error('ID de curso no proporcionado');
    }

    // En producción, aquí llamarías al API real
    // const course = await CoursesAPI.getById(courseId);
    
    // Datos simulados
    const mockCourse: Course = {
      id: courseId,
      title: 'Introducción a React',
      description: `Este curso está diseñado para desarrolladores que quieren aprender React desde cero. 
      
      Aprenderás los conceptos fundamentales de React, incluyendo componentes, estado, props, hooks, y el ecosistema de React. Al final del curso, serás capaz de construir aplicaciones web modernas utilizando React.
      
      El curso incluye:
      - Fundamentos de React
      - Componentes funcionales y de clase  
      - Hooks (useState, useEffect, useContext)
      - Manejo de formularios
      - React Router
      - Estado global con Context API
      - Mejores prácticas
      - Proyecto final`,
      instructor: 'Juan Pérez',
      duration: 40,
      level: CourseLevel.BEGINNER,
      category: 'Frontend',
      price: 99.99,
      thumbnail: 'https://via.placeholder.com/800x400',
      isActive: true,
      maxStudents: 50,
      currentStudents: 23,
      startDate: '2024-02-01T00:00:00Z',
      endDate: '2024-04-01T00:00:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    };

    // Simular si el usuario está inscrito
    const isEnrolled = Math.random() > 0.5; // En producción, esto vendría del API

    return json<LoaderData>({ 
      course: mockCourse, 
      error: null,
      isEnrolled 
    });
  } catch (error: any) {
    console.error('Error loading course:', error);
    return json<LoaderData>({ 
      course: null, 
      error: error.message || 'Error al cargar el curso',
      isEnrolled: false 
    });
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const actionType = formData.get('_action') as string;
  const courseId = params.id as string;

  try {
    switch (actionType) {
      case 'enroll':
        // await CoursesAPI.enrollStudent(courseId);
        return json<ActionData>({ 
          success: true, 
          action: 'enroll' 
        });

      case 'unenroll':
        // await CoursesAPI.unenrollStudent(courseId);
        return json<ActionData>({ 
          success: true, 
          action: 'unenroll' 
        });

      case 'delete':
        // await CoursesAPI.delete(courseId);
        return json<ActionData>({ 
          success: true, 
          action: 'delete' 
        });

      default:
        throw new Error('Acción no válida');
    }
  } catch (error: any) {
    return json<ActionData>({ 
      error: error.message || 'Error al procesar la acción',
      action: actionType as any
    });
  }
};

export default function CourseDetail() {
  const { course, error, isEnrolled } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const { user, hasRole } = useCurrentUser();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isSubmitting = navigation.state === 'submitting';

  if (error || !course) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
        <p className="text-gray-600 mb-6">{error || 'Curso no encontrado'}</p>
        <Link
          to="/courses"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Volver al catálogo
        </Link>
      </div>
    );
  }

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
      month: 'long',
      day: 'numeric'
    });
  };

  const progressPercentage = (course.currentStudents / course.maxStudents) * 100;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Mensajes de estado */}
      {actionData?.error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {actionData.error}
        </div>
      )}

      {actionData?.success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {actionData.action === 'enroll' && '¡Te has inscrito al curso exitosamente!'}
          {actionData.action === 'unenroll' && 'Te has desinscrito del curso'}
          {actionData.action === 'delete' && 'Curso eliminado exitosamente'}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contenido principal */}
        <div className="lg:col-span-2 space-y-8">
          {/* Imagen del curso */}
          {course.thumbnail && (
            <div className="aspect-video overflow-hidden rounded-lg shadow-lg">
              <img 
                src={course.thumbnail} 
                alt={course.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Información básica */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getLevelColor(course.level)}`}>
                {getLevelText(course.level)}
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                {course.category}
              </span>
              {!course.isActive && (
                <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
                  Inactivo
                </span>
              )}
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>

            <div className="flex items-center space-x-6 text-sm text-gray-600 mb-6">
              <div className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>Por {course.instructor}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{course.duration} horas</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{course.currentStudents} estudiantes</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400" />
                <span>4.5 (120 reseñas)</span>
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Descripción del Curso</h2>
            <div className="prose text-gray-700 whitespace-pre-line">
              {course.description}
            </div>
          </div>

          {/* Qué aprenderás */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Qué aprenderás</h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <span>Fundamentos de React y su ecosistema</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <span>Componentes funcionales y hooks</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <span>Manejo de estado y props</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <span>React Router para navegación</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <span>Mejores prácticas y patrones</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Card de inscripción */}
          <div className="bg-white p-6 rounded-lg shadow-sm border sticky top-6">
            <div className="text-3xl font-bold text-gray-900 mb-4">
              ${course.price}
            </div>

            {/* Progreso de inscripciones */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>{course.currentStudents} inscritos</span>
                <span>{course.maxStudents} máximo</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="space-y-3">
              {isEnrolled ? (
                <div className="space-y-2">
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-md text-center text-sm">
                    Ya estás inscrito en este curso
                  </div>
                  <Form method="post">
                    <input type="hidden" name="_action" value="unenroll" />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-red-300 text-red-700 rounded-md hover:bg-red-50 disabled:opacity-50"
                    >
                      <UserMinus className="h-4 w-4" />
                      <span>Desinscribirse</span>
                    </button>
                  </Form>
                </div>
              ) : (
                <Form method="post">
                  <input type="hidden" name="_action" value="enroll" />
                  <button
                    type="submit"
                    disabled={isSubmitting || course.currentStudents >= course.maxStudents}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>
                      {course.currentStudents >= course.maxStudents ? 'Curso Lleno' : 'Inscribirse'}
                    </span>
                  </button>
                </Form>
              )}

              <button className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                <BookOpen className="h-4 w-4 inline mr-2" />
                Vista Previa
              </button>
            </div>

            {/* Información adicional */}
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Fecha de inicio:</span>
                <span className="font-medium">{formatDate(course.startDate)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Fecha de fin:</span>
                <span className="font-medium">{formatDate(course.endDate)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Duración:</span>
                <span className="font-medium">{course.duration} horas</span>
              </div>
            </div>
          </div>

          {/* Información del instructor */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructor</h3>
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">{course.instructor}</div>
                <div className="text-sm text-gray-600">Desarrollador Senior</div>
                <div className="flex items-center space-x-1 mt-2 text-sm text-gray-600">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span>4.8 (95 cursos)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Panel administrativo */}
          <RoleGuard requiredRoles={['admin', 'instructor']} requireAll={false}>
            <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-800 mb-4">Panel Administrativo</h3>
              <div className="space-y-3">
                <Link
                  to={`/courses/${course.id}/edit`}
                  className="flex items-center space-x-2 w-full px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                >
                  <Edit className="h-4 w-4" />
                  <span>Editar Curso</span>
                </Link>
                
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center space-x-2 w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Eliminar Curso</span>
                </button>
              </div>
            </div>
          </RoleGuard>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirmar Eliminación
            </h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que quieres eliminar este curso? Esta acción no se puede deshacer.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <Form method="post" className="flex-1">
                <input type="hidden" name="_action" value="delete" />
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Eliminar
                </button>
              </Form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}