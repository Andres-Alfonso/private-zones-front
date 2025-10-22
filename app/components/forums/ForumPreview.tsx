// app/components/forums/ForumPreview.tsx

import { X, MessageSquare, Calendar, Tag, Pin, Eye, EyeOff } from "lucide-react";

interface ForumFormData {
  title: string;
  description: string;
  category: string;
  thumbnailUrl: string;
  isActive: boolean;
  isPinned: boolean;
  expirationDate: string;
  tags: string[];
}

interface ForumPreviewProps {
  formData: ForumFormData;
  selectedFile: File | null;
  onClose: () => void;
}

export function ForumPreview({ formData, selectedFile, onClose }: ForumPreviewProps) {
  const getPreviewUrl = () => {
    if (selectedFile) {
      return URL.createObjectURL(selectedFile);
    }
    return formData.thumbnailUrl;
  };

  const hasImage = selectedFile || formData.thumbnailUrl;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Vista Previa del Foro</h2>
            <p className="text-sm text-gray-600">Así se verá tu foro para los usuarios</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Contenido del Preview */}
        <div className="p-6 space-y-6">
          {/* Imagen de Portada */}
          {hasImage && (
            <div className="w-full h-64 rounded-lg overflow-hidden">
              <img
                src={getPreviewUrl()}
                alt="Forum thumbnail"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {formData.isPinned && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                <Pin className="h-3 w-3 mr-1" />
                Fijado
              </span>
            )}
            {formData.isActive ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <Eye className="h-3 w-3 mr-1" />
                Activo
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                <EyeOff className="h-3 w-3 mr-1" />
                Inactivo
              </span>
            )}
            {formData.category && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                <MessageSquare className="h-3 w-3 mr-1" />
                {formData.category}
              </span>
            )}
          </div>

          {/* Título */}
          <div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">
              {formData.title || "Título del foro"}
            </h3>
            {formData.expirationDate && (
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-1" />
                Expira el {new Date(formData.expirationDate).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            )}
          </div>

          {/* Descripción */}
          {formData.description && (
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">
                {formData.description}
              </p>
            </div>
          )}

          {/* Tags */}
          {formData.tags.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                <Tag className="h-4 w-4 mr-1" />
                Etiquetas
              </h4>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Estado:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {formData.isActive ? "Activo" : "Inactivo"}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Fijado:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {formData.isPinned ? "Sí" : "No"}
                </span>
              </div>
              {formData.category && (
                <div>
                  <span className="text-gray-600">Categoría:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {formData.category}
                  </span>
                </div>
              )}
              <div>
                <span className="text-gray-600">Etiquetas:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {formData.tags.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Cerrar Vista Previa
          </button>
        </div>
      </div>
    </div>
  );
}