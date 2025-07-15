// app/components/courses/DeleteConfirmModal.tsx
import { Fragment } from 'react';
import { Form } from '@remix-run/react';
import { Trash2, X, AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isSubmitting?: boolean;
  actionName?: string;
  actionValue?: string;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  title,
  message,
  confirmText = "Eliminar",
  cancelText = "Cancelar",
  isSubmitting = false,
  actionName = "_action",
  actionValue = "delete"
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform scale-100 transition-all duration-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 flex space-x-4">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium disabled:opacity-50"
          >
            {cancelText}
          </button>
          
          <Form method="post" className="flex-1">
            <input type="hidden" name={actionName} value={actionValue} />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 font-bold shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  <span>Eliminando...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  <span>{confirmText}</span>
                </>
              )}
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
}