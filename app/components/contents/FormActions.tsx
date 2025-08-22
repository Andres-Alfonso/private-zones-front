// app/components/contents/FormActions.tsx

import { Save, CheckCircle } from "lucide-react";

interface FormActionsProps {
  onSave: () => void;
  onSaveAndAdd: () => void;
  isSubmitting: boolean;
  isValid: boolean;
}

export const FormActions = ({ 
  onSave, 
  onSaveAndAdd, 
  isSubmitting, 
  isValid 
}: FormActionsProps) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <p>Revisa toda la información antes de crear el contenido</p>
          {!isValid && (
            <p className="text-red-600 mt-1">
              • Completa todos los campos obligatorios para continuar
            </p>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onSaveAndAdd}
            disabled={!isValid || isSubmitting}
            className="flex items-center space-x-2 px-6 py-3 border border-blue-500 text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            <Save className="h-4 w-4" />
            <span>Guardar y Crear Otro</span>
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={!isValid || isSubmitting}
            className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Creando...</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                <span>Crear Contenido</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};