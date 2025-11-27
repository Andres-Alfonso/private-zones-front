// src/components/tasks/BasicTaskInformation.tsx
import { FileText, MessageSquare } from "lucide-react";

interface BasicTaskInformationProps {
  title: string;
  description: string;
  instructions: string;
  thumbnail?: File | null;
  status: string;
  order: number;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onInstructionsChange: (value: string) => void;
  onThumbnailChange: (file: File | null) => void;
  onStatusChange: (value: string) => void;
  onOrderChange: (value: number) => void;
  errors?: {
    title?: string;
    description?: string;
    instructions?: string;
    thumbnail?: string;
    status?: string;
    order?: string;
  };
}

export function BasicTaskInformation({
  title,
  description,
  instructions,
  thumbnail,
  status,
  order,
  onTitleChange,
  onDescriptionChange,
  onInstructionsChange,
  onThumbnailChange,
  onStatusChange,
  onOrderChange,
  errors = {}
}: BasicTaskInformationProps) {

  const thumbnailPreview = thumbnail ? URL.createObjectURL(thumbnail) : null;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-purple-100 rounded-lg">
          <MessageSquare className="h-5 w-5 text-purple-600" />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Información Básica</h2>
          <p className="text-sm text-gray-600">Define los detalles principales de la tarea</p>
        </div>
      </div>

      {/* CONTENEDOR DOS COLUMNAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* COLUMNA IZQUIERDA: TÍTULO + DESCRIPCIÓN + INSTRUCCIONES */}
        <div className="space-y-4">

          {/* Título */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Título de la Tarea <span className="text-red-500">*</span>
            </label>

            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Ej: Tarea del Módulo 3"
              className={`
                w-full px-4 py-3 border rounded-lg
                focus:outline-none focus:ring-2 focus:ring-purple-500
                ${errors.title ? "border-red-300 bg-red-50" : "border-gray-300"}
              `}
            />

            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Descripción General
            </label>

            <textarea
              id="description"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Describe brevemente la tarea..."
              rows={4}
              className={`
                w-full px-4 py-3 border rounded-lg resize-none
                focus:outline-none focus:ring-2 focus:ring-purple-500
                ${errors.description ? "border-red-300 bg-red-50" : "border-gray-300"}
              `}
            />

            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Instrucciones */}
          <div>
            <label
              htmlFor="instructions"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Instrucciones Detalladas
            </label>

            <textarea
              id="instructions"
              value={instructions}
              onChange={(e) => onInstructionsChange(e.target.value)}
              placeholder="Instrucciones paso a paso para completar la tarea..."
              rows={6}
              className={`
                w-full px-4 py-3 border rounded-lg resize-none
                focus:outline-none focus:ring-2 focus:ring-purple-500
                ${errors.instructions ? "border-red-300 bg-red-50" : "border-gray-300"}
              `}
            />

            {errors.instructions && (
              <p className="mt-1 text-sm text-red-600">{errors.instructions}</p>
            )}
          </div>

          {/* Estado y Orden */}
          <div className="grid grid-cols-2 gap-4">
            {/* Estado */}
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Estado
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => onStatusChange(e.target.value)}
                className={`
                  w-full px-4 py-3 border rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-purple-500
                  ${errors.status ? "border-red-300 bg-red-50" : "border-gray-300"}
                `}
              >
                {/* <option value="draft">Borrador</option> */}
                <option value="published">Publicada</option>
                <option value="closed">Cerrada</option>
                {/* <option value="archived">Archivada</option> */}
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-600">{errors.status}</p>
              )}
            </div>

            {/* Orden */}
            <div>
              <label
                htmlFor="order"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Orden
              </label>
              <input
                id="order"
                type="number"
                min="0"
                value={order}
                onChange={(e) => onOrderChange(Number(e.target.value))}
                className={`
                  w-full px-4 py-3 border rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-purple-500
                  ${errors.order ? "border-red-300 bg-red-50" : "border-gray-300"}
                `}
              />
              {errors.order && (
                <p className="mt-1 text-sm text-red-600">{errors.order}</p>
              )}
            </div>
          </div>

        </div>

        {/* COLUMNA DERECHA: THUMBNAIL */}
        <div className="flex flex-col items-start">

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imagen Miniatura (Thumbnail)
          </label>

          {thumbnailPreview ? (
            <div className="relative w-full h-64 border-2 border-gray-300 rounded-lg overflow-hidden">
              <img
                src={thumbnailPreview}
                alt="Thumbnail Preview"
                className="w-full h-full object-cover"
              />

              <button
                type="button"
                onClick={() => onThumbnailChange(null)}
                className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-600 transition-colors shadow-lg"
              >
                Eliminar
              </button>
            </div>
          ) : (
            <label
              htmlFor="thumbnail"
              className={`
                flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer
                transition-all duration-200
                ${errors.thumbnail
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300 hover:border-purple-400 hover:bg-purple-50"}
              `}
            >
              <FileText className="w-10 h-10 text-purple-600 mb-2" />
              <span className="text-sm text-gray-600 font-medium">Haz clic para subir</span>
              <span className="text-xs text-gray-400 mt-1">(PNG, JPG, WEBP)</span>
            </label>
          )}

          <input
            id="thumbnail"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onThumbnailChange(e.target.files?.[0] ?? null)}
          />

          {errors.thumbnail && (
            <p className="mt-1 text-sm text-red-600">{errors.thumbnail}</p>
          )}

        </div>

      </div>

    </div>
  );
}