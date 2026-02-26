// app/components/contents/ContentPreview.tsx

import { Video, FileText, Image, Globe, Package, ExternalLink, File } from "lucide-react";
import { CourseBasic } from "~/api/types/course.types";

interface Course {
  id: string;
  title: string;
  category: string;
  instructor: string;
}

interface ContentFormData {
  title: string;
  description: string;
  contentType: 'video' | 'image' | 'document' | 'embed' | 'scorm';
  contentUrl: string;
  courseId: string;
  metadata: Record<string, any>;
}

interface ContentPreviewProps {
  formData: ContentFormData;
  course: CourseBasic | null;
  selectedFile?: File | null;
  onClose: () => void;
}

export const ContentPreview = ({ 
  formData, 
  course,
  selectedFile,
  onClose 
}: ContentPreviewProps) => {
  const getTypeIcon = () => {
    switch (formData.contentType) {
      case 'video': return <Video className="h-6 w-6" />;
      case 'document': return <FileText className="h-6 w-6" />;
      case 'image': return <Image className="h-6 w-6" />;
      case 'embed': return <Globe className="h-6 w-6" />;
      case 'scorm': return <Package className="h-6 w-6" />;
      default: return <FileText className="h-6 w-6" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header del modal */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Vista Previa del Contenido</h3>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors text-xl leading-none"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Contenido del modal */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          {/* Card del contenido */}
          <div className="bg-gray-50 rounded-2xl p-6 shadow-lg">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-blue-500 text-white rounded-xl">
                {getTypeIcon()}
              </div>
              
              <div className="flex-1">
                <h4 className="text-xl font-bold text-gray-900 mb-2">{formData.title}</h4>
                {course && (
                  <p className="text-sm text-gray-600 mb-3">
                    Curso: {course.title}
                  </p>
                )}
                {formData.description && (
                  <p className="text-gray-700 mb-4">{formData.description}</p>
                )}

                {/* Información del archivo o URL */}
                <div className="mb-4">
                  {selectedFile ? (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Archivo seleccionado:</p>
                      <div className="flex items-center space-x-3 bg-white p-3 rounded-lg border">
                        <File className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">{selectedFile.name}</p>
                          <p className="text-sm text-gray-600">{formatFileSize(selectedFile.size)}</p>
                        </div>
                      </div>
                    </div>
                  ) : formData.contentUrl ? (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">URL del contenido:</p>
                      <div className="flex items-center space-x-2 text-sm text-blue-600 bg-white p-3 rounded-lg border">
                        <ExternalLink className="h-4 w-4" />
                        <span className="truncate">{formData.contentUrl}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800">No se ha especificado archivo ni URL</p>
                    </div>
                  )}
                </div>

                {/* Metadatos */}
                {Object.keys(formData.metadata).length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">Metadatos:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {Object.entries(formData.metadata).map(([key, value]) => {
                        // Omitir valores vacíos o undefined
                        if (value === '' || value === undefined || value === null) return null;
                        
                        return (
                          <div key={key} className="bg-white p-3 rounded-lg border">
                            <span className="font-medium text-gray-600 capitalize block mb-1">
                              {key === 'hasSubtitles' ? 'Subtítulos' :
                               key === 'hasEvaluation' ? 'Evaluación' :
                               key === 'downloadable' ? 'Descargable' :
                               key === 'interactive' ? 'Interactivo' :
                               key === 'estimatedTime' ? 'Tiempo estimado' :
                               key === 'altText' ? 'Texto alternativo' :
                               key}:
                            </span>
                            <span className="text-gray-800">
                              {typeof value === 'boolean' ? (value ? 'Sí' : 'No') : 
                               Array.isArray(value) ? value.join(', ') : 
                               key === 'duration' || key === 'estimatedTime' ? `${value} min` :
                               key === 'pages' || key === 'activities' ? `${value}` :
                               String(value)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Mensaje si no hay metadatos */}
                {Object.keys(formData.metadata).length === 0 && (
                  <div className="bg-gray-100 rounded-lg p-3">
                    <p className="text-sm text-gray-600">No se han configurado metadatos adicionales</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-xl p-4">
              <h5 className="font-semibold text-blue-900 mb-2">Tipo de Contenido</h5>
              <p className="text-blue-700 capitalize">{formData.contentType}</p>
            </div>
            
            {course && (
              <div className="bg-green-50 rounded-xl p-4">
                <h5 className="font-semibold text-green-900 mb-2">Destino</h5>
                <p className="text-green-700">{course.title}</p>
                {/* <p className="text-sm text-green-600">{course.category}</p> */}
              </div>
            )}
          </div>

          {/* Acciones del modal */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
            >
              Cerrar Vista Previa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};