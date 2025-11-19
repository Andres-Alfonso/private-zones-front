// app/components/courses/CourseImageFields.tsx
import { Image, Upload, X, Eye } from "lucide-react";
import { useState } from "react";

interface CourseImageFieldsProps {
  formData: any;
  isSubmitting: boolean;
  onChange: (field: string, value: string) => void;
  onImageUpload: (field: string, file: File | null) => void;
}

export function CourseImageFields({ 
  formData, 
  isSubmitting, 
  onChange,
  onImageUpload
}: CourseImageFieldsProps) {
  const [previewUrls, setPreviewUrls] = useState<{[key: string]: string}>({});

  const handleFileUpload = (field: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido');
        return;
      }
      
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo es muy grande. Máximo 5MB permitido');
        return;
      }

      onImageUpload(field, file);
    }
  };

  const removeImage = (field: string) => {
    onImageUpload(field, null);
    const input = document.getElementById(`${field}File`) as HTMLInputElement;
    if (input) input.value = '';
  };

  const ImageUploadCard = ({ 
    field, 
    title, 
    description, 
    recommendedSize 
  }: { 
    field: string; 
    title: string; 
    description: string; 
    recommendedSize: string; 
  }) => {
    const imageUrl = formData[field];
    
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
          <Image className="h-5 w-5 text-blue-600" />
          <div>
            <h4 className="font-bold text-gray-900">{title}</h4>
            <p className="text-sm text-gray-600">{description}</p>
            <span className="text-xs text-gray-500">Recomendado: {recommendedSize}</span>
          </div>
        </div>

        {/* Vista previa de la imagen */}
        {imageUrl && (
          <div className="relative mb-4 group">
            <img 
              src={imageUrl} 
              alt={`Preview ${title}`}
              className="w-full h-48 object-cover rounded-xl border-2 border-gray-200"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl flex items-center justify-center space-x-2">
              <button
                type="button"
                onClick={() => window.open(imageUrl, '_blank')}
                className="p-2 bg-white rounded-lg text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => removeImage(field)}
                className="p-2 bg-red-500 rounded-lg text-white hover:bg-red-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Input de archivo */}
        <div className="space-y-3">
          <label className="block">
            <input
              id={`${field}File`}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(field, e)}
              disabled={isSubmitting}
              className="sr-only"
            />
            <div className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
              imageUrl 
                ? 'border-green-300 bg-green-50/80' 
                : 'border-gray-300 bg-gray-50/80 hover:border-blue-400 hover:bg-blue-50/80'
            }`}>
              <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm font-medium text-gray-700">
                {imageUrl ? 'Cambiar imagen' : 'Seleccionar imagen'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG hasta 5MB
              </p>
            </div>
          </label>

          {/* Opción de URL manual */}
          <div className="relative">
            <input
              type="url"
              name={`${field}Url`}
              placeholder="O pega una URL de imagen..."
              value={formData[`${field}Url`] || ''}
              onChange={(e) => onChange(`${field}Url`, e.target.value)}
              disabled={isSubmitting}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <ImageUploadCard
        field="coverImage"
        title="Imagen de Portada"
        description="Imagen principal del curso"
        recommendedSize="1200x600px"
      />
      
      <ImageUploadCard
        field="menuImage"
        title="Imagen del Menú"
        description="Imagen para navegación"
        recommendedSize="800x400px"
      />
      
      <ImageUploadCard
        field="thumbnailImage"
        title="Imagen Miniatura"
        description="Imagen para listados"
        recommendedSize="400x300px"
      />
    </div>
  );
}