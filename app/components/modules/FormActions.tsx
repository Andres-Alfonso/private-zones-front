// ~/components/modules/FormActions.tsx

import { Save, Loader2 } from "lucide-react";

interface FormActionsProps {
  onSave: () => void;
  isSubmitting: boolean;
  isValid: boolean;
}

export function FormActions({
  onSave,
  isSubmitting,
  isValid
}: FormActionsProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <p>
            {isValid ? (
              <span className="text-green-600">✓ El módulo está listo para ser creado</span>
            ) : (
              <span className="text-amber-600">⚠ Completa los campos obligatorios</span>
            )}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onSave}
            disabled={!isValid || isSubmitting}
            className={`
              flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200
              ${isValid && !isSubmitting
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Creando Módulo...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Crear Módulo</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Indicador de progreso mientras se envía */}
      {isSubmitting && (
        <div className="mt-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="flex space-x-1">
              <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span>Procesando información del módulo...</span>
          </div>
        </div>
      )}
    </div>
  );
}