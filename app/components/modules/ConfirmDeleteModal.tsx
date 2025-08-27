// components/modules/ConfirmDeleteModal.tsx
import { AlertTriangle, X } from "lucide-react";
import { ModuleItem } from "../../api/types/modules";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  module: ModuleItem | null;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export default function ConfirmDeleteModal({
  isOpen,
  module,
  onConfirm,
  onCancel,
  isDeleting = false
}: ConfirmDeleteModalProps) {
  if (!isOpen || !module) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/60 max-w-md w-full animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Confirmar Eliminación
              </h3>
              <p className="text-sm text-gray-600">
                Esta acción no se puede deshacer
              </p>
            </div>
          </div>
          
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="bg-red-50/80 backdrop-blur-sm rounded-xl border border-red-200/60 p-4 mb-6">
            <p className="text-gray-800 mb-2">
              ¿Estás seguro de que deseas eliminar el módulo{' '}
              <span className="font-semibold text-red-700">"{module.title}"</span>?
            </p>
            <p className="text-sm text-gray-600">
              Se eliminará permanentemente junto con todo su contenido asociado.
            </p>
          </div>

          {/* Module info */}
          <div className="bg-gray-50/80 backdrop-blur-sm rounded-xl border border-gray-200/60 p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Estado:</span>
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                  module.configuration.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {module.configuration.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Orden:</span>
                <span className="ml-2 font-medium text-gray-900">{module.configuration.order}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">Creado:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {new Date(module.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200/60 bg-gray-50/30">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2.5 text-gray-700 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl hover:bg-gray-50/80 hover:border-gray-300 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg hover:shadow-xl"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                <span>Eliminando...</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4" />
                <span>Eliminar Módulo</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}