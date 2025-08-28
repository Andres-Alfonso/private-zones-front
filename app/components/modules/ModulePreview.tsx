// ~/components/modules/ModulePreview.tsx

import { X, BookOpen, Users, Clock, Target, CheckCircle, XCircle, FileText, MessageSquare, ClipboardList, HelpCircle, BarChart3, Activity } from "lucide-react";
import { ModuleFormData } from "~/routes/modules/course/$courseId/create";
import { CourseBasic } from "~/api/types/course.types";
import { ContentItem } from "~/api/types/content.types";

interface ModulePreviewProps {
  formData: ModuleFormData;
  course: CourseBasic;
  availableContents: ContentItem[];
  selectedThumbnailFile: File | null;
  onClose: () => void;
}

const ITEM_TYPE_CONFIG = {
  content: { icon: FileText, color: 'blue', label: 'Contenido' },
  forum: { icon: MessageSquare, color: 'green', label: 'Foro' },
  task: { icon: ClipboardList, color: 'orange', label: 'Tarea' },
  quiz: { icon: HelpCircle, color: 'purple', label: 'Quiz' },
  survey: { icon: BarChart3, color: 'teal', label: 'Encuesta' },
  activity: { icon: Activity, color: 'red', label: 'Actividad' }
};

export function ModulePreview({
  formData,
  course,
  availableContents,
  selectedThumbnailFile,
  onClose
}: ModulePreviewProps) {

  // Obtener URL de thumbnail para preview
  const getThumbnailUrl = () => {
    if (selectedThumbnailFile) {
      return URL.createObjectURL(selectedThumbnailFile);
    }
    if (formData.thumbnailImagePath) {
      return formData.thumbnailImagePath;
    }
    return null;
  };

  // Obtener información de un item
  const getItemInfo = (item: any) => {
    const config = ITEM_TYPE_CONFIG[item.type as keyof typeof ITEM_TYPE_CONFIG] || ITEM_TYPE_CONFIG.content;
    
    let title = item.title;
    if (!title && item.type === 'content') {
      const content = availableContents.find(c => c.id === item.referenceId);
      title = content ? content.title : `Contenido ${item.referenceId}`;
    }
    
    return {
      ...config,
      title: title || `${config.label} ${item.referenceId}`
    };
  };

  // Formatear duración
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  // Obtener texto de dificultad
  const getDifficultyText = (difficulty: string) => {
    const levels = {
      beginner: 'Principiante',
      intermediate: 'Intermedio',
      advanced: 'Avanzado',
      expert: 'Experto'
    };
    return levels[difficulty as keyof typeof levels] || difficulty;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Vista Previa del Módulo</h3>
                  <p className="text-sm text-blue-100">Así verán el módulo los estudiantes</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="bg-white px-6 py-6 max-h-[80vh] overflow-y-auto">
            {/* Header del módulo */}
            <div className="mb-8">
              <div className="flex items-start space-x-6">
                {/* Thumbnail */}
                <div className="flex-shrink-0">
                  {getThumbnailUrl() ? (
                    <img
                      src={getThumbnailUrl()!}
                      alt="Module thumbnail"
                      className="w-32 h-32 object-cover rounded-xl border border-gray-200"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl border border-gray-200 flex items-center justify-center">
                      <BookOpen className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Información del módulo */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                      Módulo #{formData.order}
                    </span>
                    {formData.isActive ? (
                      <span className="flex items-center space-x-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                        <CheckCircle className="h-3 w-3" />
                        <span>Activo</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                        <XCircle className="h-3 w-3" />
                        <span>Inactivo</span>
                      </span>
                    )}
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{formData.title || 'Título del módulo'}</h2>
                  
                  <p className="text-gray-600 mb-4">
                    {formData.description || 'Descripción del módulo...'}
                  </p>

                  {/* Metadatos */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.metadata.estimatedDuration && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{formatDuration(formData.metadata.estimatedDuration)}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Target className="h-4 w-4" />
                      <span>{formData.approvalPercentage}% aprobación</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>{formData.items.length} items</span>
                    </div>

                    {formData.metadata.difficulty && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <div className="h-4 w-4 rounded-full bg-blue-500" />
                        <span>{getDifficultyText(formData.metadata.difficulty)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Información adicional */}
            {(formData.metadata.prerequisites || formData.metadata.learningObjectives) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {formData.metadata.prerequisites && (
                  <div className="bg-yellow-50 rounded-xl p-4">
                    <h4 className="font-medium text-yellow-800 mb-2">📚 Prerrequisitos</h4>
                    <p className="text-sm text-yellow-700">{formData.metadata.prerequisites}</p>
                  </div>
                )}

                {formData.metadata.learningObjectives && (
                  <div className="bg-green-50 rounded-xl p-4">
                    <h4 className="font-medium text-green-800 mb-2">🎯 Objetivos de Aprendizaje</h4>
                    <p className="text-sm text-green-700">{formData.metadata.learningObjectives}</p>
                  </div>
                )}
              </div>
            )}

            {/* Contenido del módulo */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contenido del Módulo</h3>
              
              {formData.items.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <ClipboardList className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">No hay items agregados al módulo</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.items.map((item, index) => {
                    const itemInfo = getItemInfo(item);
                    const IconComponent = itemInfo.icon;
                    
                    return (
                      <div
                        key={`preview-${item.type}-${item.referenceId}-${index}`}
                        className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                      >
                        <div className="flex-shrink-0 flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-500 w-6">
                            {index + 1}
                          </span>
                          <div className={`p-2 bg-${itemInfo.color}-100 rounded-lg`}>
                            <IconComponent className={`h-4 w-4 text-${itemInfo.color}-600`} />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={`px-2 py-1 text-xs font-medium bg-${itemInfo.color}-100 text-${itemInfo.color}-700 rounded-full`}>
                              {itemInfo.label}
                            </span>
                          </div>
                          <h4 className="font-medium text-gray-900 truncate">{itemInfo.title}</h4>
                          <p className="text-sm text-gray-600">ID: {item.referenceId}</p>
                        </div>
                        
                        <div className="flex-shrink-0">
                          <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Información del curso */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-700 mb-2">Información del Curso</h4>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span><strong>Curso:</strong> {course.title}</span>
                <span><strong>Categoría:</strong> {course.category}</span>
                <span><strong>Instructor:</strong> {course.instructor}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors duration-200"
              >
                Cerrar Vista Previa
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}