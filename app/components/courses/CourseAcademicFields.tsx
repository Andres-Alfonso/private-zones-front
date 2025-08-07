// app/components/courses/CourseAcademicFields.tsx
import { Tag, Code, Clock, TrendingUp, RefreshCw, Zap } from "lucide-react";
import Input from "~/components/ui/Input";
import { CourseVisibility, CourseStatus } from "~/api/types/course.types";

interface CourseAcademicFieldsProps {
  formData: any;
  errors: Array<{ field: string; message: string }>;
  isSubmitting: boolean;
  onChange: (field: string, value: string | number) => void;
  // Nuevas props para el control del acrónimo
  isAcronymManuallyEdited?: boolean;
  onResetAcronym?: () => void;
}

export function CourseAcademicFields({ 
  formData, 
  errors, 
  isSubmitting, 
  onChange,
  isAcronymManuallyEdited = false,
  onResetAcronym
}: CourseAcademicFieldsProps) {
  const getErrorByField = (field: string): string | null => {
    const error = errors.find(err => err.field === field);
    return error ? error.message : null;
  };

  return (
    <div className="space-y-6">
      {/* Información sobre la generación automática */}
      {!isAcronymManuallyEdited && (
        <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Zap className="h-5 w-5 text-blue-500 mt-0.5" />
            </div>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Generación Automática de Siglas</p>
              <p>Las siglas se generan automáticamente basándose en el título del curso. Puedes editarlas manualmente si lo deseas.</p>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Siglas del curso con generación automática */}
        <div className="relative">
          <Input
            type="text"
            id="acronym"
            name="acronym"
            label="Siglas del Curso"
            error={getErrorByField('acronym')}
            disabled={isSubmitting}
            placeholder="CARD-101"
            maxLength={10}
            value={formData.acronym || ''}
            onChange={(e) => onChange('acronym', e.target.value)}
            icon={<Tag className="h-5 w-5" />}
            helperText="Máximo 10 caracteres"
          />
          
          {/* Indicador de generación automática y botón de reset */}
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {!isAcronymManuallyEdited && formData.title && (
                <div className="flex items-center space-x-1 text-xs text-green-600">
                  <Zap className="h-3 w-3" />
                  <span>Generado automáticamente</span>
                </div>
              )}
              {isAcronymManuallyEdited && (
                <div className="flex items-center space-x-1 text-xs text-blue-600">
                  <Tag className="h-3 w-3" />
                  <span>Editado manualmente</span>
                </div>
              )}
            </div>
            
            {/* Botón para resetear a automático */}
            {isAcronymManuallyEdited && onResetAcronym && formData.title && (
              <button
                type="button"
                onClick={onResetAcronym}
                disabled={isSubmitting}
                className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200"
                title="Volver a generar automáticamente desde el título"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Auto</span>
              </button>
            )}
          </div>
        </div>

        {/* Código interno */}
        {/* <Input
          type="text"
          id="code"
          name="code"
          label="Código Interno"
          disabled={isSubmitting}
          placeholder="COURSE_2024_001"
          value={formData.code || ''}
          onChange={(e) => onChange('code', e.target.value)}
          icon={<Code className="h-5 w-5" />}
          helperText="Para uso interno del sistema"
        /> */}

        {/* Subcategoría */}
        <Input
          type="text"
          id="subcategory"
          name="subcategory"
          label="Subcategoría"
          disabled={isSubmitting}
          placeholder="React Avanzado"
          value={formData.subcategory || ''}
          onChange={(e) => onChange('subcategory', e.target.value)}
          icon={<Tag className="h-5 w-5" />}
        />

        {/* Horas estimadas */}
        <Input
          type="number"
          id="estimatedHours"
          name="estimatedHours"
          label="Horas Estimadas"
          min="1"
          error={getErrorByField('estimatedHours')}
          disabled={isSubmitting}
          placeholder="40"
          value={formData.estimatedHours || ''}
          onChange={(e) => onChange('estimatedHours', e.target.value)}
          icon={<Clock className="h-5 w-5" />}
          helperText="Tiempo estimado para completar el curso"
        />
      </div>

      {/* Intensidad del curso */}
      <div>
        <label htmlFor="intensity" className="block text-sm font-bold text-gray-700 mb-3">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Intensidad del Curso</span>
          </div>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: 1, label: '🟢 Baja', desc: '1-5 horas' },
            { value: 2, label: '🟡 Media', desc: '6-15 horas' },
            { value: 3, label: '🟠 Alta', desc: '16-40 horas' },
            { value: 4, label: '🔴 Intensiva', desc: '40+ horas' }
          ].map((intensity) => (
            <label
              key={intensity.value}
              className={`relative flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                formData.intensity === intensity.value
                  ? 'border-blue-500 bg-blue-50/80 backdrop-blur-sm shadow-lg'
                  : 'border-gray-200 bg-white/80 backdrop-blur-sm hover:border-gray-300 hover:shadow-md'
              }`}
            >
              <input
                type="radio"
                name="intensity"
                value={intensity.value}
                checked={formData.intensity === intensity.value}
                onChange={(e) => onChange('intensity', Number(e.target.value))}
                className="sr-only"
                disabled={isSubmitting}
              />
              <span className="font-medium text-sm mb-1">{intensity.label}</span>
              <span className="text-xs text-gray-600 text-center">{intensity.desc}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Estado y visibilidad */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="status" className="block text-sm font-bold text-gray-700 mb-3">
            Estado del Curso
          </label>
          <select
            id="status"
            name="status"
            disabled={isSubmitting}
            value={formData.status || CourseStatus.DRAFT}
            onChange={(e) => onChange('status', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
          >
            <option value={CourseStatus.DRAFT}>📝 Borrador</option>
            <option value={CourseStatus.PUBLISHED}>✅ Publicado</option>
            <option value={CourseStatus.ARCHIVED}>📦 Archivado</option>
            <option value={CourseStatus.SUSPENDED}>⏸️ Suspendido</option>
          </select>
        </div>

        <div>
          <label htmlFor="visibility" className="block text-sm font-bold text-gray-700 mb-3">
            Visibilidad
          </label>
          <select
            id="visibility"
            name="visibility"
            disabled={isSubmitting}
            value={formData.visibility || CourseVisibility.PRIVATE}
            onChange={(e) => onChange('visibility', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
          >
            <option value={CourseVisibility.PUBLIC}>🌍 Público</option>
            <option value={CourseVisibility.PRIVATE}>🔒 Privado</option>
            <option value={CourseVisibility.RESTRICTED}>🎯 Restringido</option>
          </select>
        </div>
      </div>
    </div>
  );
}