import { Save, Loader2 } from "lucide-react";

interface FormActionsProps {
  isSubmitting: boolean;
  isValid: boolean;
}

export function FormActionTask({ isSubmitting, isValid }: FormActionsProps) {
  return (
    <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
      <button
        type="submit"
        disabled={!isValid || isSubmitting}
        className={`
          flex items-center space-x-2 px-6 py-3 rounded-lg font-medium
          transition-all duration-200 transform hover:scale-105
          ${isValid && !isSubmitting
            ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }
        `}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Creando Tarea...</span>
          </>
        ) : (
          <>
            <Save className="h-5 w-5" />
            <span>Crear Tarea</span>
          </>
        )}
      </button>
    </div>
  );
}