// app/components/courses/CourseFormActions.tsx
import { Save, X, CheckCircle } from "lucide-react";

interface CourseFormActionsProps {
  isSubmitting: boolean;
  hasChanges?: boolean;
  onCancel: () => void;
  submitText?: string;
  cancelText?: string;
}

export function CourseFormActions({ 
  isSubmitting, 
  hasChanges = false,
  onCancel,
  submitText = "Crear Curso",
  cancelText = "Cancelar"
}: CourseFormActionsProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
      <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-6">
        {/* Información de estado */}
        <div className="flex items-center space-x-3 text-sm text-gray-600">
          {hasChanges ? (
            <>
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="font-medium">Cambios pendientes de guardar</span>
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Todo está guardado</span>
            </>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 font-medium bg-white/80 backdrop-blur-sm hover:shadow-md transform hover:scale-105"
            disabled={isSubmitting}
          >
            <div className="flex items-center space-x-2">
              <X className="h-4 w-4" />
              <span>{cancelText}</span>
            </div>
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center space-x-3 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-bold min-w-[160px] justify-center"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                <span>{submitText.includes("Crear") ? "Creando..." : "Guardando..."}</span>
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                <span>{submitText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}