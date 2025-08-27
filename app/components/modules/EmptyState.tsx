// components/modules/EmptyState.tsx
import { NavLink } from "@remix-run/react";
import { Plus, Layers } from "lucide-react";
import { RoleGuard } from '~/components/AuthGuard';

interface EmptyStateProps {
  hasSearchParams: boolean;
  courseId: string;
}

export default function EmptyState({ hasSearchParams, courseId }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mb-6">
        <Layers className="h-12 w-12 text-purple-600" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {hasSearchParams ? 'No se encontraron módulos' : 'No hay módulos creados'}
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {hasSearchParams 
          ? 'Intenta ajustar los términos de búsqueda o crear un nuevo módulo.'
          : 'Comienza creando el primer módulo para organizar el contenido de tu curso de manera estructurada.'
        }
      </p>
      
      <RoleGuard requiredRoles={['admin', 'instructor']} requireAll={false}>
        <NavLink
          to={`/modules/course/${courseId}/create`}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
        >
          <Plus className="h-5 w-5" />
          <span>{hasSearchParams ? 'Crear Módulo' : 'Crear Primer Módulo'}</span>
        </NavLink>
      </RoleGuard>
    </div>
  );
}