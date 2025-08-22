// app/components/contents/ContentUploader.tsx

import { useState, useRef } from "react";
import { Upload, Link as LinkIcon, AlertCircle, File, X, CheckCircle } from "lucide-react";

interface ContentUploaderProps {
  contentType: string;
  contentUrl: string;
  selectedFile?: File | null;
  onUrlChange: (url: string) => void;
  onFileChange: (file: File | null) => void;
  error?: string;
}

export const ContentUploader = ({ 
  contentType, 
  contentUrl, 
  selectedFile,
  onUrlChange, 
  onFileChange,
  error 
}: ContentUploaderProps) => {
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>(contentType === 'scorm' ? 'file' : 'url');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInstructions = () => {
    switch (contentType) {
      case 'video':
        return {
          title: 'Subir Video',
          description: 'Sube un archivo de video o proporciona una URL',
          formats: 'MP4, WebM, MOV (máx. 500MB)',
          placeholder: 'https://ejemplo.com/video.mp4 o https://youtube.com/watch?v=...',
          accept: 'video/*,.mp4,.webm,.mov'
        };
      case 'document':
        return {
          title: 'Subir Documento',
          description: 'Sube un documento o proporciona una URL',
          formats: 'PDF, DOC, DOCX, PPT, PPTX (máx. 50MB)',
          placeholder: 'https://ejemplo.com/documento.pdf',
          accept: '.pdf,.doc,.docx,.ppt,.pptx'
        };
      case 'image':
        return {
          title: 'Subir Imagen',
          description: 'Sube una imagen o proporciona una URL',
          formats: 'JPG, PNG, GIF, SVG (máx. 10MB)',
          placeholder: 'https://ejemplo.com/imagen.jpg',
          accept: 'image/*,.jpg,.jpeg,.png,.gif,.svg'
        };
      case 'embed':
        return {
          title: 'Contenido Embebido',
          description: 'Proporciona la URL del contenido a embebir',
          formats: 'CodePen, YouTube, Vimeo, simuladores, etc.',
          placeholder: 'https://codepen.io/usuario/pen/codigo',
          accept: ''
        };
      case 'scorm':
        return {
          title: 'Paquete SCORM',
          description: 'Sube un archivo ZIP con el paquete SCORM',
          formats: 'ZIP con estructura SCORM (máx. 100MB)',
          placeholder: 'Selecciona archivo ZIP del paquete SCORM',
          accept: '.zip'
        };
      default:
        return {
          title: 'Subir Contenido',
          description: 'Selecciona un tipo de contenido primero',
          formats: '',
          placeholder: '',
          accept: ''
        };
    }
  };

  const instructions = getInstructions();

  // Validar tipos de archivo
  const validateFile = (file: File): boolean => {
    const maxSizes = {
      video: 500 * 1024 * 1024, // 500MB
      document: 50 * 1024 * 1024, // 50MB
      image: 10 * 1024 * 1024, // 10MB
      scorm: 100 * 1024 * 1024 // 100MB
    };

    const maxSize = maxSizes[contentType as keyof typeof maxSizes];
    if (file.size > maxSize) {
      alert(`El archivo es demasiado grande. Máximo permitido: ${maxSize / (1024 * 1024)}MB`);
      return false;
    }

    // Validar extensiones específicas para SCORM
    if (contentType === 'scorm' && !file.name.toLowerCase().endsWith('.zip')) {
      alert('Solo se permiten archivos ZIP para paquetes SCORM');
      return false;
    }

    return true;
  };

  // Manejar selección de archivo
  const handleFileSelect = (file: File) => {
    if (validateFile(file)) {
      onFileChange(file);
      // Si es un archivo, limpiar la URL
      onUrlChange('');
    }
  };

  // Manejar drag and drop
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
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Formatear tamaño del archivo
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{instructions.title}</h3>
        <p className="text-gray-600 text-sm">{instructions.description}</p>
        {instructions.formats && (
          <p className="text-gray-500 text-xs mt-1">Formatos soportados: {instructions.formats}</p>
        )}
      </div>

      {/* Selector de modo de subida (excepto para embed; scorm solo archivo) */}
      {contentType !== 'embed' && contentType !== 'scorm' && (
        <div className="flex space-x-4 mb-4">
          <button
            type="button"
            onClick={() => {
              setUploadMode('url');
              onFileChange(null); // Limpiar archivo seleccionado
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              uploadMode === 'url'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <LinkIcon className="h-4 w-4 inline mr-2" />
            URL
          </button>
          <button
            type="button"
            onClick={() => {
              setUploadMode('file');
              onUrlChange(''); // Limpiar URL
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              uploadMode === 'file'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Upload className="h-4 w-4 inline mr-2" />
            Subir Archivo
          </button>
        </div>
      )}

      {/* Campo URL */}
      {(uploadMode === 'url' || contentType === 'embed') && contentType !== 'scorm' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL del Contenido *
          </label>
          <input
            type="url"
            value={contentUrl}
            onChange={(e) => {
              onUrlChange(e.target.value);
              onFileChange(null); // Limpiar archivo si se escribe URL
            }}
            placeholder={instructions.placeholder}
            className={`w-full px-4 py-3 bg-white/60 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
              error ? 'border-red-300 focus:border-red-500' : 'border-gray-200/50 focus:border-blue-500/50'
            }`}
          />
        </div>
      )}

      {/* Zona de subida de archivos */}
      {(uploadMode === 'file' || contentType === 'scorm') && contentType !== 'embed' && (
        <div>
          {/* Input oculto para archivos */}
          <input
            ref={fileInputRef}
            type="file"
            accept={instructions.accept}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleFileSelect(file);
              }
            }}
            className="hidden"
          />

          {/* Mostrar archivo seleccionado */}
          {selectedFile ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <File className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-green-900">{selectedFile.name}</p>
                    <p className="text-sm text-green-600">{formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <button
                    type="button"
                    onClick={() => {
                      onFileChange(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="p-1 text-green-600 hover:text-green-800 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Zona drag and drop */
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors bg-white/40 ${
                dragActive 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-300 hover:border-blue-400'
              }`}
            >
              <Upload className={`mx-auto h-12 w-12 mb-4 ${
                dragActive ? 'text-blue-500' : 'text-gray-400'
              }`} />
              <div className="space-y-2">
                <p className={`font-medium ${
                  dragActive ? 'text-blue-700' : 'text-gray-600'
                }`}>
                  {dragActive ? 'Suelta el archivo aquí' : 'Arrastra y suelta tu archivo aquí'}
                </p>
                <p className="text-gray-500 text-sm">o</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Seleccionar archivo
                </button>
              </div>
              <p className="text-gray-400 text-xs mt-4">{instructions.formats}</p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};