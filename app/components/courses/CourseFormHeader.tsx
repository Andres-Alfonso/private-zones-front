// app/components/courses/CourseFormHeader.tsx
import { ArrowLeft, Save, AlertTriangle } from "lucide-react";
import { Link } from "@remix-run/react";

interface CourseFormHeaderProps {
  title: string;
  subtitle: string;
  isEditing?: boolean;
  hasChanges?: boolean;
  isSubmitting?: boolean;
  onCancel?: () => void;
  cancelLink?: string;
}

export function CourseFormHeader({ 
  title, 
  subtitle, 
  isEditing = false,
  hasChanges = false,
  isSubmitting = false,
  onCancel,
  cancelLink 
}: CourseFormHeaderProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200/50 rounded-2xl">
      {/* Breadcrumb */}
      {/* <div className="px-8 py-4 border-b border-gray-200/50">
        <nav className="flex items-center space-x-2 text-sm text-gray-500">
          <Link to="/" className="hover:text-blue-600 transition-colors font-medium">
            Inicio
          </Link>
          <span className="text-gray-300">/</span>
          <Link to="/courses" className="hover:text-blue-600 transition-colors font-medium">
            Cursos
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-blue-600 font-semibold">
            {isEditing ? 'Editar' : 'Crear'}
          </span>
        </nav>
      </div> */}

      {/* Header principal */}
      <div className="px-8 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {cancelLink && (
              <Link
                to={cancelLink}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200/50 hover:bg-white/80 hover:shadow-md"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="font-medium">Volver</span>
              </Link>
            )}
            
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                <Save className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  {title}
                </h1>
                <p className="text-gray-600 mt-1 text-lg max-w-2xl">
                  {subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Indicador de cambios */}
          <div className="hidden lg:block">
            {hasChanges && (
              <div className="bg-yellow-50/80 backdrop-blur-sm border border-yellow-200/50 text-yellow-700 px-6 py-4 rounded-2xl shadow-lg">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5" />
                  <div>
                    <div className="font-bold">Cambios pendientes</div>
                    <div className="text-sm">Recuerda guardar tu progreso</div>
                  </div>
                </div>
              </div>
            )}
            
            {isSubmitting && (
              <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-200/50 text-blue-700 px-6 py-4 rounded-2xl shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  <div>
                    <div className="font-bold">Guardando curso...</div>
                    <div className="text-sm">Por favor espera</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile warnings */}
        {(hasChanges || isSubmitting) && (
          <div className="lg:hidden mt-6 space-y-3">
            {hasChanges && (
              <div className="bg-yellow-50/80 backdrop-blur-sm border border-yellow-200/50 text-yellow-700 px-4 py-3 rounded-xl">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Tienes cambios sin guardar</span>
                </div>
              </div>
            )}
            
            {isSubmitting && (
              <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-200/50 text-blue-700 px-4 py-3 rounded-xl">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  <span className="font-medium">Guardando curso...</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}