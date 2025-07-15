// app/components/courses/CourseViewConfigFields.tsx
import { Eye, Palette, Monitor, MessageSquare } from "lucide-react";

interface CourseViewConfigFieldsProps {
  formData: any;
  isSubmitting: boolean;
  onChange: (field: string, value: string | boolean) => void;
}

export function CourseViewConfigFields({ 
  formData, 
  isSubmitting, 
  onChange 
}: CourseViewConfigFieldsProps) {
  const viewTypes = [
    { 
      key: 'contents', 
      label: 'Contenidos', 
      icon: Monitor,
      description: 'Materiales y lecciones del curso'
    },
    { 
      key: 'forums', 
      label: 'Foros', 
      icon: MessageSquare,
      description: 'Espacios de discusión y debate'
    },
    { 
      key: 'tasks', 
      label: 'Tareas', 
      icon: Eye,
      description: 'Actividades y asignaciones'
    },
    { 
      key: 'evaluations', 
      label: 'Evaluaciones', 
      icon: Eye,
      description: 'Exámenes y pruebas'
    }
  ];

  const ViewConfigCard = ({ viewType }: { viewType: typeof viewTypes[0] }) => {
    const Icon = viewType.icon;
    const isActive = formData[`${viewType.key}ViewActive`];
    
    return (
      <div className={`border-2 rounded-xl p-6 transition-all duration-200 ${
        isActive 
          ? 'border-blue-500 bg-blue-50/80 backdrop-blur-sm' 
          : 'border-gray-200 bg-white/80 backdrop-blur-sm'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">{viewType.label}</h4>
              <p className="text-sm text-gray-600">{viewType.description}</p>
            </div>
          </div>
          
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name={`${viewType.key}ViewActive`}
              checked={isActive || false}
              onChange={(e) => onChange(`${viewType.key}ViewActive`, e.target.checked)}
              disabled={isSubmitting}
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {isActive && (
          <div className="space-y-4 pt-4 border-t border-gray-200">
            {/* Tipo de fondo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Fondo
              </label>
              <select
                name={`${viewType.key}BackgroundType`}
                value={formData[`${viewType.key}BackgroundType`] || 'color'}
                onChange={(e) => onChange(`${viewType.key}BackgroundType`, e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm text-sm"
              >
                <option value="color">Color Sólido</option>
                <option value="image">Imagen</option>
              </select>
            </div>

            {/* Color de fondo */}
            {formData[`${viewType.key}BackgroundType`] === 'color' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color de Fondo
                </label>
                <input
                  type="color"
                  name={`${viewType.key}BackgroundColor`}
                  value={formData[`${viewType.key}BackgroundColor`] || '#ffffff'}
                  onChange={(e) => onChange(`${viewType.key}BackgroundColor`, e.target.value)}
                  disabled={isSubmitting}
                  className="w-full h-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            {/* Título personalizado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título Personalizado
              </label>
              <input
                type="text"
                name={`${viewType.key}CustomTitle`}
                value={formData[`${viewType.key}CustomTitle`] || ''}
                onChange={(e) => onChange(`${viewType.key}CustomTitle`, e.target.value)}
                placeholder={`Título personalizado para ${viewType.label.toLowerCase()}`}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm text-sm"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200/50">
        <div className="flex items-center space-x-3 mb-4">
          <Palette className="h-6 w-6 text-purple-600" />
          <div>
            <h3 className="text-lg font-bold text-gray-900">Personalización de Vistas</h3>
            <p className="text-sm text-gray-600">Configura cómo se verán las diferentes secciones de tu curso</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {viewTypes.map((viewType) => (
          <ViewConfigCard key={viewType.key} viewType={viewType} />
        ))}
      </div>
    </div>
  );
}