// app/routes/courses/$id.tsx

import { json, LoaderFunction, ActionFunction } from "@remix-run/node";
import { useLoaderData, useActionData, Link, useNavigation } from "@remix-run/react";
import { useState } from "react";
import { 
  AlertCircle, Edit, Trash2, ArrowLeft, Shield, Settings 
} from "lucide-react";
import { Course } from "~/api/types/course.types";
// import { CoursesAPI } from "~/api/endpoints/courses";
import { useCurrentUser } from "~/context/AuthContext";
import { RoleGuard } from "~/components/AuthGuard";

// Componentes de detalle
import { CourseDetailHero } from "~/components/courses/CourseDetailHero";
import { CourseDetailContent } from "~/components/courses/CourseDetailContent";
import { CourseDetailSidebar } from "~/components/courses/CourseDetailSidebar";

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
- Fundamentos de React y su ecosistema
- Componentes funcionales y de clase  
- Hooks (useState, useEffect, useContext)
- Manejo de formularios
- React Router
- Estado global con Context API
- Mejores prácticas
- Proyecto final

¿Qué aprenderás específicamente?

En este curso completo de React, comenzarás desde los conceptos más básicos hasta llegar a construir aplicaciones complejas. Aprenderás a pensar en React, a estructurar tus componentes de manera eficiente, y a manejar el estado de tu aplicación de forma profesional.

El curso está diseñado para ser práctico, con ejercicios en cada módulo y un proyecto final donde construirás una aplicación completa desde cero. Al finalizar, tendrás las habilidades necesarias para trabajar como desarrollador React en cualquier empresa.`,
      instructor: 'Juan Pérez',
      duration: 40,
      level: 'beginner' as any,
      category: 'Frontend',
      price: 99.99,
      thumbnail: 'https://via.placeholder.com/800x400/4F46E5/ffffff?text=React+Course',
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
  const { hasRole } = useCurrentUser();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isSubmitting = navigation.state === 'submitting';

  if (error || !course) {
    return (
      <div className="text-center py-16">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-lg border border-gray-200/50 max-w-md mx-auto">
          <AlertCircle className="mx-auto h-16 w-16 text-red-400 mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-8">{error || 'Curso no encontrado'}</p>
          <Link
            to="/courses"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Volver al catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Navegación superior */}
      <div className="flex items-center justify-between">
        <Link
          to="/courses"
          className="flex items-center space-x-3 text-gray-600 hover:text-blue-600 transition-colors bg-white/60 backdrop-blur-sm px-6 py-3 rounded-xl border border-gray-200/50 hover:bg-white/80 hover:shadow-md transform hover:scale-105 font-medium"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Volver al catálogo</span>
        </Link>

        <RoleGuard requiredRoles={['admin', 'instructor']} requireAll={false}>
          <div className="flex items-center space-x-3">
            <Link
              to={`/courses/${course.id}/edit`}
              className="flex items-center space-x-2 px-6 py-3 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-xl hover:bg-white hover:shadow-md transition-all duration-200 font-medium text-gray-700 transform hover:scale-105"
            >
              <Edit className="h-4 w-4" />
              <span>Editar</span>
            </Link>
            
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-bold"
            >
              <Trash2 className="h-4 w-4" />
              <span>Eliminar</span>
            </button>
          </div>
        </RoleGuard>
      </div>

      {/* Mensajes de estado */}
      {actionData?.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl flex items-center shadow-lg">
          <AlertCircle className="h-6 w-6 mr-3 flex-shrink-0" />
          <div>
            <div className="font-bold">Error</div>
            <div className="text-sm">{actionData.error}</div>
          </div>
        </div>
      )}

      {actionData?.success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-2xl shadow-lg">
          <div className="font-bold">
            {actionData.action === 'enroll' && '¡Te has inscrito al curso exitosamente!'}
            {actionData.action === 'unenroll' && 'Te has desinscrito del curso'}
            {actionData.action === 'delete' && 'Curso eliminado exitosamente'}
          </div>
        </div>
      )}

      {/* Hero del curso */}
      <CourseDetailHero course={course} isEnrolled={isEnrolled} />

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contenido del curso */}
        <div className="lg:col-span-2">
          <CourseDetailContent course={course} />
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <CourseDetailSidebar 
            course={course} 
            isEnrolled={isEnrolled}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>

      {/* Panel administrativo adicional */}
      <RoleGuard requiredRoles={['admin', 'instructor']} requireAll={false}>
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-sm border border-yellow-200/50 rounded-2xl p-8 shadow-lg">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl text-white">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Panel Administrativo</h3>
              <p className="text-gray-600">Herramientas para gestionar este curso</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to={`/courses/${course.id}/edit`}
              className="flex items-center justify-center space-x-3 p-4 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl hover:bg-white hover:shadow-md transition-all duration-200 font-medium text-gray-700 transform hover:scale-105"
            >
              <Edit className="h-5 w-5" />
              <span>Editar Curso</span>
            </Link>
            
            <Link
              to={`/courses/${course.id}/analytics`}
              className="flex items-center justify-center space-x-3 p-4 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl hover:bg-white hover:shadow-md transition-all duration-200 font-medium text-gray-700 transform hover:scale-105"
            >
              <Settings className="h-5 w-5" />
              <span>Analíticas</span>
            </Link>
            
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Trash2 className="h-5 w-5" />
              <span>Eliminar</span>
            </button>
          </div>
        </div>
      </RoleGuard>

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform scale-100 transition-all duration-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Confirmar Eliminación
              </h3>
              
              <p className="text-gray-600 mb-8">
                ¿Estás seguro de que quieres eliminar el curso <strong>"{course.title}"</strong>? 
                Esta acción no se puede deshacer y se perderán todos los datos asociados.
              </p>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium"
                >
                  Cancelar
                </button>
                
                <form method="post" className="flex-1">
                  <input type="hidden" name="_action" value="delete" />
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 font-bold shadow-lg hover:shadow-xl"
                  >
                    Eliminar Curso
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}