// ~/components/modules/BasicModuleInformation.tsx

import { useState } from "react";
import { Upload, X, Image as ImageIcon, Layers } from "lucide-react";
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
      onFormChange('thumbnailImagePath', url);
    } else {
      if (previewUrl && previewUrl.startsWith('blob:')) {
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleThumbnailFileSelect(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Layers className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">Información Básica</h2>
      </div>

      <div className="space-y-4">
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
              w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
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
              w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
              transition-colors duration-200 resize-none
              ${errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'}
            `}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        {/* Imagen del módulo */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Imagen del Módulo</h3>
          <div className="flex items-center justify-center w-full">
            <label 
              htmlFor="thumbnailUpload" 
              className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {getThumbnailPreviewUrl() ? (
                <div className="relative w-full h-full">
                  <img 
                    src={getThumbnailPreviewUrl()!} 
                    alt="Vista previa" 
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleThumbnailFileSelect(null);
                      onFormChange('thumbnailImagePath', '');
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Clic para subir</span> o arrastra
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG hasta 10MB</p>
                </div>
              )}
              <input 
                id="thumbnailUpload" 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleImageUpload}
              />
            </label>
          </div>
          
          <div className="mt-3">
            <label htmlFor="thumbnailUrl" className="block text-sm font-medium text-gray-700 mb-1">
              O ingresa una URL
            </label>
            <input
              type="url"
              id="thumbnailUrl"
              value={previewUrl ? '' : formData.thumbnailImagePath}
              onChange={(e) => {
                const value = e.target.value;
                onFormChange('thumbnailImagePath', value);
                if (value && selectedThumbnailFile) {
                  handleThumbnailFileSelect(null);
                }
              }}
              placeholder="https://ejemplo.com/imagen.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              disabled={!!selectedThumbnailFile}
            />
          </div>
        </div>
      </div>
    </div>
  );
}