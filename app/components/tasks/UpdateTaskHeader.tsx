// app/components/tasks/CreateTaskHeader.tsx

import { ArrowLeft, Eye } from "lucide-react";

interface UpateTaskHeaderProps {
  onBack: () => void;
  isValid: boolean;
}

export function UpateTaskHeader({ onBack, isValid }: UpateTaskHeaderProps) {
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
          <h1 className="text-3xl font-bold text-gray-900">Actualizar Nueva Tarea</h1>
          <p className="text-gray-600 mt-1">
            Actualiza o modifica un espacio de tarea.
          </p>
        </div>
      </div>

    </div>
  );
}