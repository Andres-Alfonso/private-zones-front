// app/components/tasks/CreateTaskHeader.tsx

import { ArrowLeft, Eye } from "lucide-react";

interface CreateTaskHeaderProps {
  onBack: () => void;
  onPreview: () => void;
  isValid: boolean;
}

export function CreateTaskHeader({ onBack, onPreview, isValid }: CreateTaskHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <button
          type="button"
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-6 w-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Crear Nueva Tarea</h1>
          <p className="text-gray-600 mt-1">
            Crea un espacio de tarea
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onPreview}
        disabled={!isValid}
        className={`
          flex items-center space-x-2 px-4 py-2 rounded-lg font-medium
          transition-all duration-200
          ${isValid
            ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }
        `}
      >
        <Eye className="h-4 w-4" />
        <span>Vista Previa</span>
      </button>
    </div>
  );
}