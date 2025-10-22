// app/components/forums/ThumbnailUploader.tsx

import { Image, Upload, X } from "lucide-react";
import { useState } from "react";

interface ThumbnailUploaderProps {
  thumbnailUrl: string;
  selectedFile: File | null;
  onUrlChange: (url: string) => void;
  onFileChange: (file: File | null) => void;
  error?: string;
}

export function ThumbnailUploader({
  thumbnailUrl,
  selectedFile,
  onUrlChange,
  onFileChange,
  error
}: ThumbnailUploaderProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onFileChange(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileChange(e.target.files[0]);
    }
  };

  const removeFile = () => {
    onFileChange(null);
  };

  const getPreviewUrl = () => {
    if (selectedFile) {
      return URL.createObjectURL(selectedFile);
    }
    return thumbnailUrl;
  };

  const hasImage = selectedFile || thumbnailUrl;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-green-100 rounded-lg">
          <Image className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Imagen de Portada</h2>
          <p className="text-sm text-gray-600">Agrega una imagen para el foro (opcional)</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Vista Previa */}
        {hasImage && (
          <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200">
            <img
              src={getPreviewUrl()}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={removeFile}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Área de Subida */}
        {!hasImage && (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-all
              ${dragActive 
                ? 'border-purple-500 bg-purple-50' 
                : 'border-gray-300 hover:border-purple-400'
              }
              ${error ? 'border-red-300 bg-red-50' : ''}
            `}
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-gray-100 rounded-full">
                <Upload className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <label
                  htmlFor="thumbnail-file"
                  className="cursor-pointer text-purple-600 hover:text-purple-700 font-medium"
                >
                  Haz clic para subir
                </label>
                <span className="text-gray-600"> o arrastra una imagen aquí</span>
                <input
                  id="thumbnail-file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              <p className="text-sm text-gray-500">
                PNG, JPG, GIF hasta 5MB
              </p>
            </div>
          </div>
        )}

        {/* URL Alternativa */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">o proporciona una URL</span>
          </div>
        </div>

        <input
          type="url"
          value={thumbnailUrl}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="https://ejemplo.com/imagen.jpg"
          disabled={!!selectedFile}
          className={`
            w-full px-4 py-3 border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-purple-500
            transition-all duration-200
            ${selectedFile ? 'bg-gray-100 cursor-not-allowed' : ''}
            ${error ? 'border-red-300' : 'border-gray-300'}
          `}
        />

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
}