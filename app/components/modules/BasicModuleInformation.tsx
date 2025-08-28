// ~/components/modules/BasicModuleInformation.tsx

import { useState } from "react";
import { Upload, X, Image as ImageIcon, FileText, Layers } from "lucide-react";
import { ModuleFormData } from "~/routes/modules/create";

interface BasicModuleInformationProps {
  formData: ModuleFormData;
  onFormChange: (field: string, value: any) => void;
  onThumbnailFileChange: (file: File | null) => void;
  selectedThumbnailFile: File | null;
  errors: Record<string, string>;
}

export function BasicModuleInformation({
  formData,
  onFormChange,
  onThumbnailFileChange,
  selectedThumbnailFile,
  errors
}: BasicModuleInformationProps) {
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Manejar selección de archivo de thumbnail
  const handleThumbnailFileSelect = (file: File | null) => {
    onThumbnailFileChange(file);
    
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      // Limpiar URL existente
      onFormChange('thumbnailImagePath', '');
    } else {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
    }
  };

  // Manejar drag & drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleThumbnailFileSelect(imageFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  // Obtener URL de preview
  const getThumbnailPreviewUrl = () => {
    if (previewUrl) return previewUrl;
    if (formData.thumbnailImagePath) return formData.thumbnailImagePath;
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Layers className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Información Básica del Módulo</h2>
          <p className="text-sm text-gray-600">Define los datos principales del módulo</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna izquierda - Información básica */}
        <div className="space-y-6">
          {/* Título */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Título del Módulo *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => onFormChange('title', e.target.value)}
              placeholder="Ej: Fundamentos de React"
              className={`
                w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent
                transition-colors duration-200
                ${errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'}
              `}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => onFormChange('description', e.target.value)}
              placeholder="Describe el contenido y objetivos del módulo..."
              rows={4}
              className={`
                w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent
                transition-colors duration-200 resize-none
                ${errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'}
              `}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* URL de thumbnail manual */}
          <div>
            <label htmlFor="thumbnailUrl" className="block text-sm font-medium text-gray-700 mb-2">
              URL de Imagen (opcional)
            </label>
            <input
              type="url"
              id="thumbnailUrl"
              value={formData.thumbnailImagePath}
              onChange={(e) => {
                onFormChange('thumbnailImagePath', e.target.value);
                // Si se escribe URL, limpiar archivo
                if (e.target.value && selectedThumbnailFile) {
                  handleThumbnailFileSelect(null);
                }
              }}
              placeholder="https://ejemplo.com/imagen.jpg"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              disabled={!!selectedThumbnailFile}
            />
            <p className="mt-1 text-xs text-gray-500">
              Proporciona una URL de imagen o sube un archivo abajo
            </p>
          </div>
        </div>

        {/* Columna derecha - Subir thumbnail */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagen del Módulo
            </label>
            
            {/* Vista previa de thumbnail */}
            {getThumbnailPreviewUrl() && (
              <div className="relative mb-4 group">
                <img
                  src={getThumbnailPreviewUrl()!}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-xl border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => {
                    handleThumbnailFileSelect(null);
                    onFormChange('thumbnailImagePath', '');
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Área de carga de archivo */}
            {!getThumbnailPreviewUrl() && (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`
                  relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200
                  ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
                  ${selectedThumbnailFile ? 'bg-green-50 border-green-300' : ''}
                `}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    handleThumbnailFileSelect(file);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={!!formData.thumbnailImagePath}
                />

                <div className="space-y-3">
                  <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    {selectedThumbnailFile ? (
                      <ImageIcon className="h-6 w-6 text-green-600" />
                    ) : (
                      <Upload className="h-6 w-6 text-gray-400" />
                    )}
                  </div>

                  {selectedThumbnailFile ? (
                    <div>
                      <p className="text-sm font-medium text-green-600">
                        Archivo seleccionado: {selectedThumbnailFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Tamaño: {(selectedThumbnailFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Arrastra una imagen aquí o haz clic para seleccionar
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, JPEG hasta 10MB
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <p className="mt-2 text-xs text-gray-500">
              La imagen ayudará a identificar visualmente el módulo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}