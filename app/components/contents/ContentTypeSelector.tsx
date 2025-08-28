// app/components/contents/ContentTypeSelector.tsx

import { Video, FileText, Image, Globe, Package, CheckCircle, AlertCircle } from "lucide-react";

interface ContentTypeSelectorProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
  error?: string;
}

export const ContentTypeSelector = ({ 
  selectedType, 
  onTypeChange,
  error 
}: ContentTypeSelectorProps) => {
  const contentTypes = [
    {
      type: 'video',
      icon: <Video className="h-6 w-6" />,
      title: 'Video',
      description: 'Contenido de video (MP4, WebM, etc.)',
      features: ['Streaming', 'Controles de reproducción', 'Subtítulos']
    },
    {
      type: 'document',
      icon: <FileText className="h-6 w-6" />,
      title: 'Documento',
      description: 'PDFs, presentaciones, documentos',
      features: ['Visualización en línea', 'Descarga', 'Búsqueda de texto']
    },
    {
      type: 'image',
      icon: <Image className="h-6 w-6" />,
      title: 'Imagen',
      description: 'Imágenes, infografías, diagramas',
      features: ['Zoom', 'Galería', 'Descripción alt']
    },
    {
      type: 'embed',
      icon: <Globe className="h-6 w-6" />,
      title: 'Contenido Embebido',
      description: 'CodePen, YouTube, simuladores',
      features: ['Interactivo', 'Responsive', 'Externo']
    },
    {
      type: 'scorm',
      icon: <Package className="h-6 w-6" />,
      title: 'Paquete SCORM',
      description: 'Contenido e-learning estándar',
      features: ['Seguimiento', 'Evaluaciones', 'Progreso']
    }
  ];

  return (
    <div className="space-y-4 select-none">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Tipo de Contenido</h3>
        <p className="text-gray-600 text-sm">Selecciona el tipo de contenido que deseas crear</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contentTypes.map((type) => (
          <div
            key={type.type}
            onClick={() => onTypeChange(type.type)}
            className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedType === type.type
                ? 'border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-500/20'
                : 'border-gray-200 bg-white/60 hover:border-gray-300'
            }`}
          >
            {selectedType === type.type && (
              <div className="absolute top-3 right-3">
                <CheckCircle className="h-5 w-5 text-blue-500" />
              </div>
            )}

            <div className={`p-3 rounded-xl mb-4 inline-block ${
              selectedType === type.type ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
            }`}>
              {type.icon}
            </div>

            <h4 className="font-semibold text-gray-900 mb-2">{type.title}</h4>
            <p className="text-gray-600 text-sm mb-4">{type.description}</p>

            <div className="space-y-1">
              {type.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 text-xs text-gray-500">
                  <div className="h-1 w-1 bg-gray-400 rounded-full"></div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};