// app/components/courses/CourseDetailSidebar.tsx
import { useState } from "react";
import { Form } from "@remix-run/react";
import { 
  DollarSign, Calendar, Clock, Users, BookOpen, UserPlus, UserMinus, 
  CheckCircle, Play, Star, Award, TrendingUp 
} from "lucide-react";
import { Course } from "~/api/types/course.types";

interface CourseDetailSidebarProps {
  course: Course;
  isEnrolled?: boolean;
  isSubmitting?: boolean;
}

export function CourseDetailSidebar({ course, isEnrolled, isSubmitting }: CourseDetailSidebarProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const progressPercentage = (course.currentStudents / course.maxStudents) * 100;
  const isCourseFull = course.currentStudents >= course.maxStudents;

  return (
    <div className="space-y-6">
      {/* Card principal de inscripción */}
      <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-200/50 sticky top-6">
        {/* Precio destacado */}
        <div className="text-center mb-6">
          <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            ${course.price}
          </div>
          <div className="text-sm text-gray-500 font-medium">Acceso completo de por vida</div>
        </div>

        {/* Progreso de inscripciones */}
        <div className="mb-6">
          <div className="flex justify-between text-sm font-medium text-gray-600 mb-3">
            <span>{course.currentStudents} inscritos</span>
            <span>{course.maxStudents} cupos totales</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 relative"
              style={{ width: `${progressPercentage}%` }}
            >
              <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
            </div>
          </div>
          <div className="text-center mt-2 text-xs text-gray-500">
            {isCourseFull ? "¡Curso lleno!" : `${Math.round(100 - progressPercentage)}% de cupos disponibles`}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="space-y-3 mb-6 select-none">
          {isEnrolled ? (
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl text-center text-sm font-bold flex items-center justify-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>Ya estás inscrito en este curso</span>
              </div>
              
              <button className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-bold">
                <Play className="h-5 w-5" />
                <span>Continuar Aprendiendo</span>
              </button>
              
              <Form method="post">
                <input type="hidden" name="_action" value="unenroll" />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 border-2 border-red-300 text-red-700 rounded-xl hover:bg-red-50 disabled:opacity-50 transition-all duration-200 font-medium"
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
                disabled={isSubmitting || isCourseFull}
                className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-bold"
              >
                <UserPlus className="h-5 w-5" />
                <span>
                  {isCourseFull ? 'Curso Lleno' : 'Inscribirse Ahora'}
                </span>
              </button>
            </Form>
          )}

          <button className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium">
            <BookOpen className="h-4 w-4 inline mr-2" />
            Vista Previa Gratuita
          </button>
        </div>

        {/* Información del curso */}
        <div className="space-y-4 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Inicio:</span>
            </span>
            <span className="font-bold text-gray-900">{formatDate(course.startDate)}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Finaliza:</span>
            </span>
            <span className="font-bold text-gray-900">{formatDate(course.endDate)}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Duración:</span>
            </span>
            <span className="font-bold text-gray-900">{course.duration} horas</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 flex items-center space-x-2">
              <Award className="h-4 w-4" />
              <span>Certificado:</span>
            </span>
            <span className="font-bold text-green-600">Incluido</span>
          </div>
        </div>

        {/* Garantía */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="text-center">
            <div className="text-sm font-bold text-blue-800 mb-1">
              💯 Garantía de satisfacción
            </div>
            <div className="text-xs text-blue-600">
              30 días para solicitar reembolso completo
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas destacadas */}
      <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Estadísticas del Curso</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="h-4 w-4 text-yellow-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Rating promedio</span>
            </div>
            <span className="font-bold text-gray-900">4.8/5</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Tasa de finalización</span>
            </div>
            <span className="font-bold text-gray-900">89%</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Estudiantes activos</span>
            </div>
            <span className="font-bold text-gray-900">{course.currentStudents}</span>
          </div>
        </div>
      </div>
    </div>
  );
}