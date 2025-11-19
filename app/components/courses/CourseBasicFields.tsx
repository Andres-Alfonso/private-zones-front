// app/components/courses/CourseBasicFields.tsx
import { BookOpen, User, Tag, Clock, Layers, Globe, RefreshCw, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { CourseLevel } from "~/api/types/course.types";
import Input from "~/components/ui/Input";

interface CourseBasicFieldsProps {
  formData: any;
  errors: Array<{ field: string; message: string }>;
  categories: string[];
  isSubmitting: boolean;
  onChange: (field: string, value: string) => void;
  onClearError?: (field: string) => void; // Nueva prop
  tenantId?: string;
}

export function CourseBasicFields({ 
  formData, 
  errors, 
  categories, 
  isSubmitting, 
  onChange,
  onClearError,
  tenantId = 'tenant-1'
}: CourseBasicFieldsProps) {

  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [codeGenerated, setCodeGenerated] = useState(false);

  // Función para generar código interno automáticamente
  const generateInternalCode = async () => {
    setIsGeneratingCode(true);
    try {
      const response = await fetch(`/api/courses/codes/generate/${tenantId}`);
      const data = await response.json();
      
      if (response.ok) {
        onChange('code', data.code);
        setCodeGenerated(true);
        setTimeout(() => setCodeGenerated(false), 2000);
      } else {
        console.error('Error generando código:', data.message);
      }
    } catch (error) {
      console.error('Error generando código:', error);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  // Generar código automáticamente al cargar el componente si no existe
  useEffect(() => {
    if (!formData.code && tenantId) {
      generateInternalCode();
    }
  }, [tenantId]);

  const getErrorByField = (field: string): string | null => {
    const error = errors.find(err => err.field === field);
    return error ? error.message : null;
  };

  const handleFieldChange = (field: string, value: string) => {
    // Limpiar el error del campo cuando el usuario empiece a escribir
    if (onClearError && getErrorByField(field)) {
      onClearError(field);
    }
    onChange(field, value);
  };

  return (
    <div className="space-y-8">
      
{/* Títulos del Curso */}
      <div className="mb-8 p-4 bg-blue-50 rounded-lg">
        <h5 className="text-sm font-medium text-gray-800 mb-3">Títulos del Curso</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título en Español *
            </label>
            <input
              type="text"
              value={formData.title || ''}
              name="title"
              onChange={(e) => handleFieldChange('title', e.target.value)}
              placeholder="Introducción a React - Construye interfaces modernas"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                getErrorByField('title') 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {getErrorByField('title') && (
              <p className="mt-1 text-xs text-red-600">{getErrorByField('title')}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título en Inglés
            </label>
            <input
              type="text"
              value={formData.titleEn || ''}
              name="titleEn"
              onChange={(e) => handleFieldChange('titleEn', e.target.value)}
              placeholder="Introduction to React - Build Modern Interfaces"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      {/* Descripción del Curso */}
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
          onChange={(e) => handleFieldChange('description', e.target.value)}
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

      {/* Etiquetas del Curso */}
      <div className="mb-8 p-4 bg-green-50 rounded-lg">
        <h5 className="text-sm font-medium text-gray-800 mb-3">Etiquetas del Curso</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Etiquetas en Español
            </label>
            <input
              type="text"
              name="tagsEs"
              value={formData.tagsEs || ''}
              onChange={(e) => handleFieldChange('tagsEs', e.target.value)}
              placeholder="react, javascript, frontend, desarrollo web"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">Separadas por comas</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Etiquetas en Inglés
            </label>
            <input
              type="text"
              value={formData.tagsEn || ''}
              name="tagsEn"
              onChange={(e) => handleFieldChange('tagsEn', e.target.value)}
              placeholder="react, javascript, frontend, web development"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">Comma separated</p>
          </div>
        </div>
      </div>

      {/* Código Interno */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-3">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Código Interno</span>
              </div>
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                name="code"
                value={formData.code || ''}
                onChange={(e) => handleFieldChange('code', e.target.value)}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/80 backdrop-blur-sm"
                placeholder="Se generará automáticamente"
                readOnly
              />
              <button
                type="button"
                onClick={generateInternalCode}
                disabled={isGeneratingCode || isSubmitting}
                className="px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isGeneratingCode ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : codeGenerated ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Código único generado automáticamente para identificar el curso
            </p>
          </div>
      {/* Grid de información adicional */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      </div> */}

      {/* Nivel de dificultad */}
      {/* <div>
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
      </div> */}
    </div>
  );
}