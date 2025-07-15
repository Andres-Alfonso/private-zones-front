// app/components/courses/CourseBasicFields.tsx
import { BookOpen, User, Tag, Clock, Layers } from "lucide-react";
import { CourseLevel } from "~/api/types/course.types";
import Input from "~/components/ui/Input";

interface CourseBasicFieldsProps {
  formData: any;
  errors: Array<{ field: string; message: string }>;
  categories: string[];
  isSubmitting: boolean;
  onChange: (field: string, value: string) => void;
}

export function CourseBasicFields({ 
  formData, 
  errors, 
  categories, 
  isSubmitting, 
  onChange 
}: CourseBasicFieldsProps) {
  const getErrorByField = (field: string): string | null => {
    const error = errors.find(err => err.field === field);
    return error ? error.message : null;
  };

  return (
    <div className="space-y-8">
      {/* Información principal */}
      <div className="space-y-6">
        <Input
          type="text"
          id="title"
          name="title"
          label="Título del Curso"
          required
          error={getErrorByField('title')}
          disabled={isSubmitting}
          placeholder="Ej: Introducción a React - Construye interfaces modernas"
          value={formData.title || ''}
          onChange={(e) => onChange('title', e.target.value)}
          icon={<BookOpen className="h-5 w-5" />}
          helperText="Un título claro y atractivo que describa tu curso"
        />

        <div>
          <label htmlFor="description" className="block text-sm font-bold text-gray-700 mb-3">
            <div className="flex items-center space-x-2">
              <Layers className="h-5 w-5" />
              <span>Descripción del Curso *</span>
            </div>
          </label>
          <textarea
            id="description"
            name="description"
            rows={6}
            required
            disabled={isSubmitting}
            placeholder="Describe el contenido del curso, qué aprenderán los estudiantes, los objetivos de aprendizaje y qué los hace únicos. Incluye información sobre metodología, herramientas que se usarán y a quién está dirigido..."
            value={formData.description || ''}
            onChange={(e) => onChange('description', e.target.value)}
            className={`w-full px-4 py-4 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 bg-white/80 backdrop-blur-sm resize-none ${
              getErrorByField('description') 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }`}
          />
          {getErrorByField('description') && (
            <p className="mt-2 text-sm text-red-600 font-medium">{getErrorByField('description')}</p>
          )}
          <div className="mt-2 text-xs text-gray-500">
            {formData.description?.length || 0} caracteres (mínimo 20)
          </div>
        </div>
      </div>

      {/* Grid de información adicional */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          type="text"
          id="instructor"
          name="instructor"
          label="Instructor Principal"
          required
          error={getErrorByField('instructor')}
          disabled={isSubmitting}
          placeholder="Nombre completo del instructor"
          value={formData.instructor || ''}
          onChange={(e) => onChange('instructor', e.target.value)}
          icon={<User className="h-5 w-5" />}
          helperText="Quien facilitará el curso"
        />

        <div>
          <label htmlFor="category" className="block text-sm font-bold text-gray-700 mb-3">
            <div className="flex items-center space-x-2">
              <Tag className="h-5 w-5" />
              <span>Categoría Principal *</span>
            </div>
          </label>
          <select
            id="category"
            name="category"
            required
            disabled={isSubmitting}
            value={formData.category || ''}
            onChange={(e) => onChange('category', e.target.value)}
            className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 bg-white/80 backdrop-blur-sm ${
              getErrorByField('category') 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }`}
          >
            <option value="">Selecciona una categoría</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {getErrorByField('category') && (
            <p className="mt-2 text-sm text-red-600 font-medium">{getErrorByField('category')}</p>
          )}
        </div>
      </div>

      {/* Nivel de dificultad */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-4">
          Nivel de Dificultad *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { 
              value: CourseLevel.BEGINNER, 
              label: 'Principiante', 
              emoji: '🟢',
              description: 'Sin conocimientos previos requeridos'
            },
            { 
              value: CourseLevel.INTERMEDIATE, 
              label: 'Intermedio', 
              emoji: '🟡',
              description: 'Requiere conocimientos básicos'
            },
            { 
              value: CourseLevel.ADVANCED, 
              label: 'Avanzado', 
              emoji: '🔴',
              description: 'Para estudiantes experimentados'
            }
          ].map((level) => (
            <label
              key={level.value}
              className={`relative flex flex-col p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                formData.level === level.value
                  ? 'border-blue-500 bg-blue-50/80 backdrop-blur-sm shadow-lg transform scale-105'
                  : 'border-gray-200 bg-white/80 backdrop-blur-sm hover:border-gray-300 hover:shadow-md hover:scale-102'
              }`}
            >
              <input
                type="radio"
                name="level"
                value={level.value}
                checked={formData.level === level.value}
                onChange={(e) => onChange('level', e.target.value)}
                className="sr-only"
                disabled={isSubmitting}
              />
              <div className="text-center">
                <div className="text-2xl mb-2">{level.emoji}</div>
                <div className="font-bold text-gray-900 mb-1">{level.label}</div>
                <div className="text-sm text-gray-600">{level.description}</div>
              </div>
              {formData.level === level.value && (
                <div className="absolute top-3 right-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                </div>
              )}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}