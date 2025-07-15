// app/components/courses/CourseTranslationFields.tsx
import { Globe, Tag } from "lucide-react";
import Input from "~/components/ui/Input";

interface CourseTranslationFieldsProps {
  formData: any;
  errors: Array<{ field: string; message: string }>;
  isSubmitting: boolean;
  onChange: (field: string, value: string) => void;
}

export function CourseTranslationFields({ 
  formData, 
  errors, 
  isSubmitting, 
  onChange 
}: CourseTranslationFieldsProps) {
  return (
    <div className="space-y-8">
      {/* Traducciones en inglés */}
      <div className="bg-blue-50/80 backdrop-blur-sm rounded-xl p-6 border border-blue-200/50">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-500 rounded-lg">
            <Globe className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Traducción al Inglés</h3>
            <p className="text-sm text-gray-600">Opcional: Haz tu curso accesible a audiencia internacional</p>
          </div>
        </div>

        <div className="space-y-6">
          <Input
            type="text"
            id="titleEn"
            name="titleEn"
            label="Título en Inglés"
            disabled={isSubmitting}
            placeholder="Introduction to React"
            value={formData.titleEn || ''}
            onChange={(e) => onChange('titleEn', e.target.value)}
          />

          <div>
            <label htmlFor="descriptionEn" className="block text-sm font-bold text-gray-700 mb-3">
              Descripción en Inglés
            </label>
            <textarea
              id="descriptionEn"
              name="descriptionEn"
              rows={4}
              disabled={isSubmitting}
              placeholder="Describe your course content, objectives and what students will learn..."
              value={formData.descriptionEn || ''}
              onChange={(e) => onChange('descriptionEn', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
            />
          </div>
        </div>
      </div>

      {/* Tags y palabras clave */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Español */}
        <div className="bg-green-50/80 backdrop-blur-sm rounded-xl p-6 border border-green-200/50">
          <div className="flex items-center space-x-2 mb-4">
            <Tag className="h-5 w-5 text-green-600" />
            <h4 className="font-bold text-gray-900">Etiquetas en Español</h4>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (separados por comas)
              </label>
              <input
                type="text"
                name="tagsEs"
                value={formData.tagsEs || ''}
                onChange={(e) => onChange('tagsEs', e.target.value)}
                placeholder="react, javascript, frontend, web"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white/80 backdrop-blur-sm"
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Palabras Clave (separadas por comas)
              </label>
              <input
                type="text"
                name="keywordsEs"
                value={formData.keywordsEs || ''}
                onChange={(e) => onChange('keywordsEs', e.target.value)}
                placeholder="programación, desarrollo, componentes"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white/80 backdrop-blur-sm"
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>

        {/* Inglés */}
        <div className="bg-blue-50/80 backdrop-blur-sm rounded-xl p-6 border border-blue-200/50">
          <div className="flex items-center space-x-2 mb-4">
            <Tag className="h-5 w-5 text-blue-600" />
            <h4 className="font-bold text-gray-900">Tags in English</h4>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma separated)
              </label>
              <input
                type="text"
                name="tagsEn"
                value={formData.tagsEn || ''}
                onChange={(e) => onChange('tagsEn', e.target.value)}
                placeholder="react, javascript, frontend, web"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keywords (comma separated)
              </label>
              <input
                type="text"
                name="keywordsEn"
                value={formData.keywordsEn || ''}
                onChange={(e) => onChange('keywordsEn', e.target.value)}
                placeholder="programming, development, components"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}