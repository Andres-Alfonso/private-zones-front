// app/components/contents/BasicInformation.tsx

import { AlertCircle } from "lucide-react";
import { Course, CourseBasic } from "~/api/types/course.types";

interface ContentFormData {
  title: string;
  description: string;
  contentType: 'video' | 'image' | 'document' | 'embed' | 'scorm';
  contentUrl: string;
  courseId: string;
  metadata: Record<string, any>;
}

interface FormErrors {
  title?: string;
  description?: string;
  contentType?: string;
  contentUrl?: string;
  courseId?: string;
  general?: string;
}

interface BasicInformationProps {
  formData: ContentFormData;
  onFormChange: (field: string, value: any) => void;
  courses: CourseBasic[];
  errors: FormErrors;
}

export const BasicInformation = ({ 
  formData, 
  onFormChange, 
  courses, 
  errors 
}: BasicInformationProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
      </div>

      {/* Título */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Título del Contenido *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => onFormChange('title', e.target.value)}
          placeholder="Ej: Introducción a React - Conceptos Básicos"
          className={`w-full px-4 py-3 bg-white/60 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
            errors.title ? 'border-red-300 focus:border-red-500' : 'border-gray-200/50 focus:border-blue-500/50'
          }`}
        />
        {errors.title && (
          <div className="flex items-center space-x-2 text-red-600 text-sm mt-1">
            <AlertCircle className="h-4 w-4" />
            <span>{errors.title}</span>
          </div>
        )}
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descripción
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => onFormChange('description', e.target.value)}
          placeholder="Describe el contenido, objetivos de aprendizaje, y lo que los estudiantes pueden esperar..."
          rows={4}
          className={`w-full px-4 py-3 bg-white/60 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none ${
            errors.description ? 'border-red-300 focus:border-red-500' : 'border-gray-200/50 focus:border-blue-500/50'
          }`}
        />
        {errors.description && (
          <div className="flex items-center space-x-2 text-red-600 text-sm mt-1">
            <AlertCircle className="h-4 w-4" />
            <span>{errors.description}</span>
          </div>
        )}
      </div>

      {/* Curso */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Curso de Destino *
        </label>
        <select
          value={formData.courseId}
          onChange={(e) => onFormChange('courseId', e.target.value)}
          className={`w-full px-4 py-3 bg-white/60 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
            errors.courseId ? 'border-red-300 focus:border-red-500' : 'border-gray-200/50 focus:border-blue-500/50'
          }`}
        >
          <option value="">Selecciona un curso</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.translations[0].title}
            </option>
          ))}
        </select>
        {errors.courseId && (
          <div className="flex items-center space-x-2 text-red-600 text-sm mt-1">
            <AlertCircle className="h-4 w-4" />
            <span>{errors.courseId}</span>
          </div>
        )}
      </div>
    </div>
  );
};