// app/components/forums/ForumSummaryPanel.tsx

import { Settings, AlertCircle, Save, X } from "lucide-react";

interface ForumSummaryPanelProps {
  formData: {
    title: string;
    category: string;
    isActive: boolean;
    isPinned: boolean;
    expirationDate: string;
    tags: string[];
  };
  hasChanges: boolean;
  isSubmitting: boolean;
  isValid: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export function ForumSummaryPanel({
  formData,
  hasChanges,
  isSubmitting,
  isValid,
  onSubmit,
  onCancel,
  isEditing = false
}: ForumSummaryPanelProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 sticky top-6">
      <div className="flex items-center space-x-2 mb-6">
        <Settings className="h-6 w-6 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">Resumen</h2>
      </div>
      
      <div className="space-y-4">
        <div>
          <span className="text-sm font-medium text-gray-700">Título:</span>
          <p className="text-sm text-gray-900 mt-1">
            {formData.title || <span className="text-gray-400 italic">Sin especificar</span>}
          </p>
        </div>
        
        <div>
          <span className="text-sm font-medium text-gray-700">Categoría:</span>
          <p className="text-sm text-gray-900 mt-1">
            {formData.category || <span className="text-gray-400 italic">Sin categoría</span>}
          </p>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Estado:</span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            formData.isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {formData.isActive ? 'Activo' : 'Inactivo'}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Fijado:</span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            formData.isPinned 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {formData.isPinned ? 'Sí' : 'No'}
          </span>
        </div>
        
        {formData.expirationDate && (
          <div>
            <span className="text-sm font-medium text-gray-700">Expira:</span>
            <p className="text-sm text-gray-900 mt-1">
              {new Date(formData.expirationDate).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        )}
        
        <div>
          <span className="text-sm font-medium text-gray-700">Etiquetas:</span>
          {formData.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1 mt-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic mt-1">Sin etiquetas</p>
          )}
        </div>
      </div>

      {hasChanges && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-blue-400 mr-2 flex-shrink-0" />
            <p className="text-xs text-blue-800">
              {isEditing ? 'Hay cambios sin guardar' : 'Completa el formulario'}
            </p>
          </div>
        </div>
      )}

      {/* Botones de acción */}
      <div className="mt-6 space-y-3">
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting || !isValid}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          <Save className="h-5 w-5" />
          <span>{isSubmitting ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Foro')}</span>
        </button>
        
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="h-5 w-5" />
          <span>Cancelar</span>
        </button>
      </div>
    </div>
  );
}