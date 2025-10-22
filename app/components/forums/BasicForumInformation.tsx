// app/components/forums/BasicForumInformation.tsx

import { FileText, MessageSquare } from "lucide-react";

interface BasicForumInformationProps {
  title: string;
  description: string;
  category: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  errors?: {
    title?: string;
    description?: string;
    category?: string;
  };
}

export function BasicForumInformation({
  title,
  description,
  category,
  onTitleChange,
  onDescriptionChange,
  onCategoryChange,
  errors = {}
}: BasicForumInformationProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-purple-100 rounded-lg">
          <MessageSquare className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Información Básica</h2>
          <p className="text-sm text-gray-600">Define los detalles principales del foro</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Título */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Título del Foro <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Ej: Dudas sobre el módulo 3"
            className={`
              w-full px-4 py-3 border rounded-lg
              focus:outline-none focus:ring-2 focus:ring-purple-500
              transition-all duration-200
              ${errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'}
            `}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        {/* Descripción */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Descripción
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Describe de qué trata este foro..."
            rows={4}
            className={`
              w-full px-4 py-3 border rounded-lg
              focus:outline-none focus:ring-2 focus:ring-purple-500
              transition-all duration-200 resize-none
              ${errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'}
            `}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        {/* Categoría */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Categoría
          </label>
          <input
            type="text"
            id="category"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            placeholder="Ej: General, Técnico, Dudas"
            className={`
              w-full px-4 py-3 border rounded-lg
              focus:outline-none focus:ring-2 focus:ring-purple-500
              transition-all duration-200
              ${errors.category ? 'border-red-300 bg-red-50' : 'border-gray-300'}
            `}
          />
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category}</p>
          )}
        </div>
      </div>
    </div>
  );
}