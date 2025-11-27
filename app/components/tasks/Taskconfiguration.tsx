// src/components/tasks/TaskConfiguration.tsx
import { Calendar, Paperclip, CheckCircle2, Settings, Award, Clock, FileCheck, Users } from "lucide-react";

interface TaskConfigurationProps {
  startDate: string;
  endDate: string;
  lateSubmissionDate: string;
  maxPoints: number;
  lateSubmissionPenalty: number;
  maxAttachments: number;
  maxFileSize: number;
  allowedFileTypes: string[];
  allowMultipleSubmissions: boolean;
  maxSubmissionAttempts: number | null;
  requireSubmission: boolean;
  enablePeerReview: boolean;
  showGradeToStudent: boolean;
  showFeedbackToStudent: boolean;
  notifyOnSubmission: boolean;
  isAutoGradable: boolean;
  taskInfo: string;
  supportDocument?: File | null;

  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onLateSubmissionDateChange: (value: string) => void;
  onMaxPointsChange: (value: number) => void;
  onLateSubmissionPenaltyChange: (value: number) => void;
  onMaxAttachmentsChange: (value: number) => void;
  onMaxFileSizeChange: (value: number) => void;
  onAllowedFileTypesChange: (value: string[]) => void;
  onAllowMultipleSubmissionsChange: (value: boolean) => void;
  onMaxSubmissionAttemptsChange: (value: number | null) => void;
  onRequireSubmissionChange: (value: boolean) => void;
  onEnablePeerReviewChange: (value: boolean) => void;
  onShowGradeToStudentChange: (value: boolean) => void;
  onShowFeedbackToStudentChange: (value: boolean) => void;
  onNotifyOnSubmissionChange: (value: boolean) => void;
  onIsAutoGradableChange: (value: boolean) => void;
  onTaskInfoChange: (value: string) => void;
  onSupportDocumentChange: (file: File | null) => void;

  errors?: {
    startDate?: string;
    endDate?: string;
    lateSubmissionDate?: string;
    maxPoints?: string;
    lateSubmissionPenalty?: string;
    maxAttachments?: string;
    maxFileSize?: string;
    allowedFileTypes?: string;
    maxSubmissionAttempts?: string;
    supportDocument?: string;
    taskInfo?: string;
  };
}

export function TaskConfiguration({
  startDate,
  endDate,
  lateSubmissionDate,
  maxPoints,
  lateSubmissionPenalty,
  maxAttachments,
  maxFileSize,
  allowedFileTypes,
  allowMultipleSubmissions,
  maxSubmissionAttempts,
  requireSubmission,
  enablePeerReview,
  showGradeToStudent,
  showFeedbackToStudent,
  notifyOnSubmission,
  isAutoGradable,
  taskInfo,
  supportDocument,
  onStartDateChange,
  onEndDateChange,
  onLateSubmissionDateChange,
  onMaxPointsChange,
  onLateSubmissionPenaltyChange,
  onMaxAttachmentsChange,
  onMaxFileSizeChange,
  onAllowedFileTypesChange,
  onAllowMultipleSubmissionsChange,
  onMaxSubmissionAttemptsChange,
  onRequireSubmissionChange,
  onEnablePeerReviewChange,
  onShowGradeToStudentChange,
  onShowFeedbackToStudentChange,
  onNotifyOnSubmissionChange,
  onIsAutoGradableChange,
  onTaskInfoChange,
  onSupportDocumentChange,
  errors = {}
}: TaskConfigurationProps) {

  const fileTypeOptions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'jpg', 'jpeg', 'png', 'gif'];

  const handleFileTypeToggle = (type: string) => {
    if (allowedFileTypes.includes(type)) {
      onAllowedFileTypesChange(allowedFileTypes.filter(t => t !== type));
    } else {
      onAllowedFileTypesChange([...allowedFileTypes, type]);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Settings className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Configuración</h2>
          <p className="text-sm text-gray-600">Configura los parámetros de la tarea</p>
        </div>
      </div>

      {/* SECCIÓN: FECHAS */}
      <div className="bg-gray-50 rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-blue-600" />
          Fechas
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Fecha de Inicio */}
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Inicio
            </label>
            <input
              type="datetime-local"
              id="startDate"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className={`
                w-full px-4 py-3 border rounded-lg
                focus:outline-none focus:ring-2 focus:ring-blue-500
                ${errors.startDate ? "border-red-300 bg-red-50" : "border-gray-300"}
              `}
            />
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
            )}
          </div>

          {/* Fecha de Finalización */}
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Límite <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              id="endDate"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className={`
                w-full px-4 py-3 border rounded-lg
                focus:outline-none focus:ring-2 focus:ring-blue-500
                ${errors.endDate ? "border-red-300 bg-red-50" : "border-gray-300"}
              `}
            />
            {errors.endDate && (
              <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
            )}
          </div>

          {/* Fecha de Entrega Tardía */}
          <div>
            <label htmlFor="lateSubmissionDate" className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Límite Entregas Tardías
            </label>
            <input
              type="datetime-local"
              id="lateSubmissionDate"
              value={lateSubmissionDate}
              onChange={(e) => onLateSubmissionDateChange(e.target.value)}
              className={`
                w-full px-4 py-3 border rounded-lg
                focus:outline-none focus:ring-2 focus:ring-blue-500
                ${errors.lateSubmissionDate ? "border-red-300 bg-red-50" : "border-gray-300"}
              `}
            />
            {errors.lateSubmissionDate && (
              <p className="mt-1 text-sm text-red-600">{errors.lateSubmissionDate}</p>
            )}
          </div>
        </div>
      </div>

      {/* SECCIÓN: CALIFICACIÓN */}
      <div className="bg-gray-50 rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Award className="h-5 w-5 mr-2 text-blue-600" />
          Calificación
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Puntos Máximos */}
          <div>
            <label htmlFor="maxPoints" className="block text-sm font-medium text-gray-700 mb-2">
              Puntos Máximos
            </label>
            <input
              type="number"
              id="maxPoints"
              min="0"
              step="0.01"
              value={maxPoints}
              onChange={(e) => onMaxPointsChange(Number(e.target.value))}
              className={`
                w-full px-4 py-3 border rounded-lg
                focus:outline-none focus:ring-2 focus:ring-blue-500
                ${errors.maxPoints ? "border-red-300 bg-red-50" : "border-gray-300"}
              `}
            />
            {errors.maxPoints && (
              <p className="mt-1 text-sm text-red-600">{errors.maxPoints}</p>
            )}
          </div>

          {/* Penalización por Entrega Tardía */}
          <div>
            <label htmlFor="lateSubmissionPenalty" className="block text-sm font-medium text-gray-700 mb-2">
              Penalización por Entrega Tardía (%)
            </label>
            <input
              type="number"
              id="lateSubmissionPenalty"
              min="0"
              max="100"
              step="0.01"
              value={lateSubmissionPenalty}
              onChange={(e) => onLateSubmissionPenaltyChange(Number(e.target.value))}
              className={`
                w-full px-4 py-3 border rounded-lg
                focus:outline-none focus:ring-2 focus:ring-blue-500
                ${errors.lateSubmissionPenalty ? "border-red-300 bg-red-50" : "border-gray-300"}
              `}
            />
            {errors.lateSubmissionPenalty && (
              <p className="mt-1 text-sm text-red-600">{errors.lateSubmissionPenalty}</p>
            )}
          </div>
        </div>

        {/* Checkboxes de calificación */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3 p-4 border rounded-lg bg-white">
            <input
              type="checkbox"
              id="isAutoGradable"
              checked={isAutoGradable}
              onChange={(e) => onIsAutoGradableChange(e.target.checked)}
              className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
            />
            <label htmlFor="isAutoGradable" className="flex-1">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Auto-calificable</span>
              </div>
            </label>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg bg-white">
            <input
              type="checkbox"
              id="showGradeToStudent"
              checked={showGradeToStudent}
              onChange={(e) => onShowGradeToStudentChange(e.target.checked)}
              className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
            />
            <label htmlFor="showGradeToStudent" className="flex-1">
              <span className="text-sm font-medium text-gray-700">Mostrar calificación al estudiante</span>
            </label>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg bg-white">
            <input
              type="checkbox"
              id="showFeedbackToStudent"
              checked={showFeedbackToStudent}
              onChange={(e) => onShowFeedbackToStudentChange(e.target.checked)}
              className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
            />
            <label htmlFor="showFeedbackToStudent" className="flex-1">
              <span className="text-sm font-medium text-gray-700">Mostrar retroalimentación al estudiante</span>
            </label>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg bg-white">
            <input
              type="checkbox"
              id="notifyOnSubmission"
              checked={notifyOnSubmission}
              onChange={(e) => onNotifyOnSubmissionChange(e.target.checked)}
              className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
            />
            <label htmlFor="notifyOnSubmission" className="flex-1">
              <span className="text-sm font-medium text-gray-700">Notificar al profesor en envíos</span>
            </label>
          </div>
        </div>
      </div>

      {/* SECCIÓN: ARCHIVOS Y ENVÍOS */}
      <div className="bg-gray-50 rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <FileCheck className="h-5 w-5 mr-2 text-blue-600" />
          Configuración de Archivos y Envíos
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Máximo de Adjuntos */}
          <div>
            <label htmlFor="maxAttachments" className="block text-sm font-medium text-gray-700 mb-2">
              Máximo de Adjuntos
            </label>
            <input
              type="number"
              id="maxAttachments"
              min="0"
              max="10"
              value={maxAttachments}
              onChange={(e) => onMaxAttachmentsChange(Number(e.target.value))}
              className={`
                w-full px-4 py-3 border rounded-lg
                focus:outline-none focus:ring-2 focus:ring-blue-500
                ${errors.maxAttachments ? "border-red-300 bg-red-50" : "border-gray-300"}
              `}
            />
            {errors.maxAttachments && (
              <p className="mt-1 text-sm text-red-600">{errors.maxAttachments}</p>
            )}
          </div>

          {/* Tamaño Máximo por Archivo */}
          <div>
            <label htmlFor="maxFileSize" className="block text-sm font-medium text-gray-700 mb-2">
              Tamaño Máximo por Archivo (MB)
            </label>
            <input
              type="number"
              id="maxFileSize"
              min="1"
              max="100"
              value={maxFileSize}
              onChange={(e) => onMaxFileSizeChange(Number(e.target.value))}
              className={`
                w-full px-4 py-3 border rounded-lg
                focus:outline-none focus:ring-2 focus:ring-blue-500
                ${errors.maxFileSize ? "border-red-300 bg-red-50" : "border-gray-300"}
              `}
            />
            {errors.maxFileSize && (
              <p className="mt-1 text-sm text-red-600">{errors.maxFileSize}</p>
            )}
          </div>

          {/* Máximo de Intentos */}
          <div>
            <label htmlFor="maxSubmissionAttempts" className="block text-sm font-medium text-gray-700 mb-2">
              Máximo de Intentos (0 = ilimitado)
            </label>
            <input
              type="number"
              id="maxSubmissionAttempts"
              min="0"
              value={maxSubmissionAttempts ?? 0}
              onChange={(e) => {
                const val = Number(e.target.value);
                onMaxSubmissionAttemptsChange(val === 0 ? null : val);
              }}
              className={`
                w-full px-4 py-3 border rounded-lg
                focus:outline-none focus:ring-2 focus:ring-blue-500
                ${errors.maxSubmissionAttempts ? "border-red-300 bg-red-50" : "border-gray-300"}
              `}
            />
            {errors.maxSubmissionAttempts && (
              <p className="mt-1 text-sm text-red-600">{errors.maxSubmissionAttempts}</p>
            )}
          </div>
        </div>

        {/* Tipos de Archivo Permitidos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipos de Archivo Permitidos
          </label>
          <div className="flex flex-wrap gap-2">
            {fileTypeOptions.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleFileTypeToggle(type)}
                className={`
                  px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${allowedFileTypes.includes(type)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
                `}
              >
                {type}
              </button>
            ))}
          </div>
          {errors.allowedFileTypes && (
            <p className="mt-1 text-sm text-red-600">{errors.allowedFileTypes}</p>
          )}
        </div>

        {/* Checkboxes de envíos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3 p-4 border rounded-lg bg-white">
            <input
              type="checkbox"
              id="allowMultipleSubmissions"
              checked={allowMultipleSubmissions}
              onChange={(e) => onAllowMultipleSubmissionsChange(e.target.checked)}
              className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
            />
            <label htmlFor="allowMultipleSubmissions" className="flex-1">
              <span className="text-sm font-medium text-gray-700">Permitir múltiples envíos</span>
            </label>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg bg-white">
            <input
              type="checkbox"
              id="requireSubmission"
              checked={requireSubmission}
              onChange={(e) => onRequireSubmissionChange(e.target.checked)}
              className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
            />
            <label htmlFor="requireSubmission" className="flex-1">
              <span className="text-sm font-medium text-gray-700">Tarea obligatoria</span>
            </label>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg bg-white">
            <input
              type="checkbox"
              id="enablePeerReview"
              checked={enablePeerReview}
              onChange={(e) => onEnablePeerReviewChange(e.target.checked)}
              className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
            />
            <label htmlFor="enablePeerReview" className="flex-1">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Habilitar revisión entre pares</span>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* SECCIÓN: DOCUMENTO DE APOYO E INFORMACIÓN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Documento de Apoyo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Paperclip className="inline h-4 w-4 mr-1" />
            Documento de Apoyo
          </label>

          {supportDocument ? (
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center space-x-2">
                <Paperclip className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-700 font-medium">{supportDocument.name}</p>
                  <p className="text-xs text-gray-500">
                    {(supportDocument.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onSupportDocumentChange(null)}
                className="text-red-500 hover:text-red-700 text-sm font-medium"
              >
                Eliminar
              </button>
            </div>
          ) : (
            <label
              htmlFor="supportDocument"
              className={`
                flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer
                transition-all duration-200
                ${
                  errors.supportDocument
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                }
              `}
            >
              <Paperclip className="w-10 h-10 text-blue-600 mb-2" />
              <span className="text-sm text-gray-600 font-medium">Haz clic para subir</span>
              <span className="text-xs text-gray-400 mt-1">(PDF, DOC, etc.)</span>
            </label>
          )}

          <input
            id="supportDocument"
            type="file"
            className="hidden"
            onChange={(e) => onSupportDocumentChange(e.target.files?.[0] ?? null)}
          />

          {errors.supportDocument && (
            <p className="mt-1 text-sm text-red-600">{errors.supportDocument}</p>
          )}
        </div>

        {/* Información de la Tarea */}
        <div>
          <label htmlFor="taskInfo" className="block text-sm font-medium text-gray-700 mb-2">
            Información Adicional de la Tarea
          </label>
          <textarea
            id="taskInfo"
            value={taskInfo}
            onChange={(e) => onTaskInfoChange(e.target.value)}
            placeholder="Instrucciones adicionales, criterios de evaluación, recursos, etc."
            rows={8}
            className={`
              w-full px-4 py-3 border rounded-lg resize-none
              focus:outline-none focus:ring-2 focus:ring-blue-500
              ${errors.taskInfo ? "border-red-300 bg-red-50" : "border-gray-300"}
            `}
          />
          {errors.taskInfo && (
            <p className="mt-1 text-sm text-red-600">{errors.taskInfo}</p>
          )}
        </div>
      </div>

    </div>
  );
}