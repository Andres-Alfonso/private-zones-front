import { Calendar, Paperclip, CheckCircle2, Settings } from "lucide-react";

interface TaskConfigurationProps {
  expirationDate: string;
  maxAttachments: number;
  isAutoGradable: boolean;
  taskInfo: string;
  supportDocument?: File | null;

  onExpirationDateChange: (value: string) => void;
  onMaxAttachmentsChange: (value: number) => void;
  onIsAutoGradableChange: (value: boolean) => void;
  onTaskInfoChange: (value: string) => void;
  onSupportDocumentChange: (file: File | null) => void;

  errors?: {
    expirationDate?: string;
    maxAttachments?: string;
    supportDocument?: string;
    taskInfo?: string;
  };
}

export function TaskConfiguration({
  expirationDate,
  maxAttachments,
  isAutoGradable,
  taskInfo,
  supportDocument,
  onExpirationDateChange,
  onMaxAttachmentsChange,
  onIsAutoGradableChange,
  onTaskInfoChange,
  onSupportDocumentChange,
  errors = {}
}: TaskConfigurationProps) {
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

      {/* GRID DOS COLUMNAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* COLUMNA IZQUIERDA */}
        <div className="space-y-4">

          {/* Fecha de Expiración */}
          <div>
            <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Fecha de Expiración
            </label>
            <input
              type="datetime-local"
              id="expirationDate"
              value={expirationDate}
              onChange={(e) => onExpirationDateChange(e.target.value)}
              className={`
                w-full px-4 py-3 border rounded-lg
                focus:outline-none focus:ring-2 focus:ring-blue-500
                ${errors.expirationDate ? "border-red-300 bg-red-50" : "border-gray-300"}
              `}
            />
            {errors.expirationDate && (
              <p className="mt-1 text-sm text-red-600">{errors.expirationDate}</p>
            )}
          </div>

          {/* Máximo de Adjuntos */}
          <div>
            <label htmlFor="maxAttachments" className="block text-sm font-medium text-gray-700 mb-2">
              Máximo de Adjuntos del Usuario
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
            <p className="mt-1 text-xs text-gray-500">Cantidad de archivos permitidos</p>
            {errors.maxAttachments && (
              <p className="mt-1 text-sm text-red-600">{errors.maxAttachments}</p>
            )}
          </div>

          {/* Auto Calificable */}
          <div className="flex items-start space-x-3 p-4 border rounded-lg bg-gray-50">
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
                <span className="text-sm font-medium text-gray-700">Tarea Auto-calificable</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                La tarea se calificará automáticamente
              </p>
            </label>
          </div>
        </div>

        {/* COLUMNA DERECHA */}
        <div className="space-y-4">

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
              Información de la Tarea
            </label>
            <textarea
              id="taskInfo"
              value={taskInfo}
              onChange={(e) => onTaskInfoChange(e.target.value)}
              placeholder="Instrucciones, criterios de evaluación, recursos adicionales, etc."
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
    </div>
  );
}
