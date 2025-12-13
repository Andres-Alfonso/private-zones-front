// ~/components/modules/ModuleConfiguration.tsx

import { Settings, ToggleLeft, ToggleRight, Hash, Target, Tag } from "lucide-react";
import { ModuleFormData } from "~/routes/modules/create";

interface ModuleConfigurationProps {
  formData: ModuleFormData;
  onFormChange: (field: string, value: any) => void;
  errors: Record<string, string>;
}

export function ModuleConfiguration({
  formData,
  onFormChange,
  errors
}: ModuleConfigurationProps) {

  // Manejar cambios en metadata
  const handleMetadataChange = (key: string, value: any) => {
    onFormChange('metadata', {
      ...formData.metadata,
      [key]: value
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Settings className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">Configuración</h2>
      </div>

      <div className="space-y-6">
        {/* Estado del módulo */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                {formData.isActive ? (
                  <ToggleRight className="h-5 w-5 text-green-600" />
                ) : (
                  <ToggleLeft className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Módulo Activo</h3>
                <p className="text-sm text-gray-600">
                  {formData.isActive 
                    ? 'Los estudiantes pueden acceder'
                    : 'Oculto para los estudiantes'
                  }
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onFormChange('isActive', !formData.isActive)}
              className={`
                relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 
                border-transparent transition-colors duration-200 ease-in-out focus:outline-none 
                focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${formData.isActive ? 'bg-green-600' : 'bg-gray-200'}
              `}
            >
              <span
                className={`
                  pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white 
                  shadow ring-0 transition duration-200 ease-in-out
                  ${formData.isActive ? 'translate-x-5' : 'translate-x-0'}
                `}
              />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Orden del módulo */}
          <div>
            <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-2">
              Orden de visualización
            </label>
            <input
              type="number"
              id="order"
              min="1"
              value={formData.order}
              onChange={(e) => onFormChange('order', parseInt(e.target.value) || 1)}
              className={`
                w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
                transition-colors duration-200
                ${errors.order ? 'border-red-300 bg-red-50' : 'border-gray-300'}
              `}
              placeholder="1"
            />
            {errors.order && (
              <p className="mt-1 text-sm text-red-600">{errors.order}</p>
            )}
          </div>

          {/* Porcentaje de aprobación */}
          <div>
            <label htmlFor="approvalPercentage" className="block text-sm font-medium text-gray-700 mb-2">
              Porcentaje de Aprobación
            </label>
            <div className="relative">
              <input
                type="number"
                id="approvalPercentage"
                min="0"
                max="100"
                value={formData.approvalPercentage}
                onChange={(e) => onFormChange('approvalPercentage', parseInt(e.target.value) || 0)}
                className={`
                  w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  transition-colors duration-200
                  ${errors.approvalPercentage ? 'border-red-300 bg-red-50' : 'border-gray-300'}
                `}
                placeholder="80"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-gray-500 text-sm">%</span>
              </div>
            </div>
            {errors.approvalPercentage && (
              <p className="mt-1 text-sm text-red-600">{errors.approvalPercentage}</p>
            )}
          </div>
        </div>

        {/* Barra de progreso del porcentaje */}
        <div>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>0%</span>
            <span className="font-medium text-blue-600">{formData.approvalPercentage}%</span>
            <span>100%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(formData.approvalPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Metadatos adicionales */}
        <div className="bg-blue-50 rounded-xl p-4 space-y-4">
          <div className="flex items-center space-x-2 mb-2">
            <Tag className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium text-gray-900">Metadatos Adicionales</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Duración estimada */}
            <div>
              <label htmlFor="estimatedDuration" className="block text-sm font-medium text-gray-700 mb-1">
                Duración (minutos)
              </label>
              <input
                type="number"
                id="estimatedDuration"
                min="0"
                value={formData.metadata.estimatedDuration || ''}
                onChange={(e) => handleMetadataChange('estimatedDuration', parseInt(e.target.value) || 0)}
                placeholder="60"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              />
            </div>

            {/* Dificultad */}
            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                Nivel de Dificultad
              </label>
              <select
                id="difficulty"
                value={formData.metadata.difficulty || ''}
                onChange={(e) => handleMetadataChange('difficulty', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              >
                <option value="">Seleccionar...</option>
                <option value="beginner">Principiante</option>
                <option value="intermediate">Intermedio</option>
                <option value="advanced">Avanzado</option>
                <option value="expert">Experto</option>
              </select>
            </div>
          </div>

          {/* Prerrequisitos */}
          <div>
            <label htmlFor="prerequisites" className="block text-sm font-medium text-gray-700 mb-1">
              Prerrequisitos
            </label>
            <textarea
              id="prerequisites"
              value={formData.metadata.prerequisites || ''}
              onChange={(e) => handleMetadataChange('prerequisites', e.target.value)}
              placeholder="Conocimientos previos requeridos..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 resize-none"
            />
          </div>

          {/* Objetivos de aprendizaje */}
          <div>
            <label htmlFor="learningObjectives" className="block text-sm font-medium text-gray-700 mb-1">
              Objetivos de Aprendizaje
            </label>
            <textarea
              id="learningObjectives"
              value={formData.metadata.learningObjectives || ''}
              onChange={(e) => handleMetadataChange('learningObjectives', e.target.value)}
              placeholder="Al finalizar este módulo, el estudiante será capaz de..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}