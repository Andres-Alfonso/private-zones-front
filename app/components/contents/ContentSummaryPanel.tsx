// app/components/contents/ContentSummaryPanel.tsx

import { Settings, AlertCircle, Save, X, FileText, Video, Image, FileCode, Package } from "lucide-react";

interface ContentSummaryPanelProps {
  formData: {
    title: string;
    description: string;
    contentType: 'video' | 'image' | 'document' | 'embed' | 'scorm' | '';
    contentUrl: string;
    courseId: string;
    metadata: Record<string, any>;
  };
  selectedCourse: { title: string } | null;
  selectedFile: File | null;
  hasChanges: boolean;
  isSubmitting: boolean;
  isValid: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

const contentTypeIcons = {
  video: Video,
  image: Image,
  document: FileText,
  embed: FileCode,
  scorm: Package,
};

const contentTypeLabels = {
  video: 'Video',
  image: 'Imagen',
  document: 'Documento',
  embed: 'Contenido Embebido',
  scorm: 'Paquete SCORM',
};

export function ContentSummaryPanel({
  formData,
  selectedCourse,
  selectedFile,
  hasChanges,
  isSubmitting,
  isValid,
  onSubmit,
  onCancel
}: ContentSummaryPanelProps) {
  const Icon = formData.contentType ? contentTypeIcons[formData.contentType] : FileText;

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 sticky top-6">
      <div className="flex items-center space-x-2 mb-6">
        <Settings className="h-6 w-6 text-purple-600" />
        <h2 className="text-lg font-semibold text-gray-900">Resumen</h2>
      </div>
      
      <div className="space-y-4">
        <div>
          <span className="text-sm font-medium text-gray-700">Título:</span>
          <p className="text-sm text-gray-900 mt-1">
            {formData.title || <span className="text-gray-400 italic">Sin especificar</span>}
          </p>
        </div>
        
        <div>
          <span className="text-sm font-medium text-gray-700">Curso:</span>
          <p className="text-sm text-gray-900 mt-1">
            {selectedCourse?.title || <span className="text-gray-400 italic">No seleccionado</span>}
          </p>
        </div>
        
        <div>
          <span className="text-sm font-medium text-gray-700">Tipo de contenido:</span>
          {formData.contentType ? (
            <div className="flex items-center space-x-2 mt-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Icon className="h-4 w-4 text-purple-600" />
              </div>
              <span className="text-sm text-gray-900">
                {contentTypeLabels[formData.contentType]}
              </span>
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic mt-1">No seleccionado</p>
          )}
        </div>
        
        <div>
          <span className="text-sm font-medium text-gray-700">Fuente:</span>
          {selectedFile ? (
            <div className="mt-2">
              <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg">
                <FileText className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-900 truncate">{selectedFile.name}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : formData.contentUrl ? (
            <p className="text-sm text-gray-900 mt-1 truncate" title={formData.contentUrl}>
              {formData.contentUrl}
            </p>
          ) : (
            <p className="text-sm text-gray-400 italic mt-1">No especificada</p>
          )}
        </div>

        {formData.description && (
          <div>
            <span className="text-sm font-medium text-gray-700">Descripción:</span>
            <p className="text-sm text-gray-900 mt-1 line-clamp-3">
              {formData.description}
            </p>
          </div>
        )}

        {Object.keys(formData.metadata).length > 0 && (
          <div>
            <span className="text-sm font-medium text-gray-700">Metadatos:</span>
            <div className="mt-2 space-y-1">
              {Object.entries(formData.metadata).slice(0, 3).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">{key}:</span>
                  <span className="text-gray-900 font-medium truncate ml-2" style={{ maxWidth: '60%' }}>
                    {String(value)}
                  </span>
                </div>
              ))}
              {Object.keys(formData.metadata).length > 3 && (
                <p className="text-xs text-gray-500 italic">
                  +{Object.keys(formData.metadata).length - 3} más...
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {hasChanges && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-blue-400 mr-2 flex-shrink-0" />
            <p className="text-xs text-blue-800">
              Completa el formulario para crear el contenido
            </p>
          </div>
        </div>
      )}

      {/* Botones de acción */}
      <div className="mt-6 space-y-3">
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting || !isValid}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          <Save className="h-5 w-5" />
          <span>{isSubmitting ? 'Creando...' : 'Crear Contenido'}</span>
        </button>
        
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="h-5 w-5" />
          <span>Cancelar</span>
        </button>
      </div>
    </div>
  );
}