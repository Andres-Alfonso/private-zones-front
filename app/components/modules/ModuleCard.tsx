// components/modules/ModuleCard.tsx
import { useState } from "react";
import { NavLink } from "@remix-run/react";
import { Layers, Edit, Trash2, MoreVertical, Image } from "lucide-react";
import { ModuleItem } from "../../api/types/modules";

interface ModuleCardProps {
  module: ModuleItem;
  viewMode: 'grid' | 'list';
  hasAdminRole: boolean;
  onEdit: (moduleId: string) => void;
  onDelete: (moduleId: string) => void;
}

export default function ModuleCard({ 
  module, 
  viewMode, 
  hasAdminRole, 
  onEdit, 
  onDelete 
}: ModuleCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    // Evitar navegación si se hace click en los botones de acción
    if ((e.target as HTMLElement).closest('.actions-menu')) {
      e.preventDefault();
      return;
    }
  };

  const renderThumbnail = (size: 'small' | 'large') => {
    const sizeClasses = size === 'large' ? 'w-full h-48' : 'w-16 h-16';
    
    if (module.thumbnailUrl && !imageError) {
      return (
        <img
          src={module.thumbnailUrl}
          alt={`Thumbnail de ${module.title}`}
          className={`${sizeClasses} object-cover rounded-lg group-hover:scale-105 transition-transform duration-300`}
          onError={() => setImageError(true)}
          loading="lazy"
        />
      );
    }

    // Placeholder cuando no hay imagen o falló la carga
    return (
      <div className={`${sizeClasses} bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}>
        <Image className={`${size === 'large' ? 'h-12 w-12' : 'h-6 w-6'} text-purple-400`} />
      </div>
    );
  };

  if (viewMode === 'grid') {
    return (
      <NavLink 
        to={`/module/${module.id}`}
        className="block bg-white/70 backdrop-blur-sm rounded-xl shadow-md border border-gray-200/60 hover:bg-white/90 hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer"
        onClick={handleCardClick}
      >
        {/* Thumbnail superior */}
        <div className="relative">
          {renderThumbnail('large')}
          
          {/* Overlay con estado y acciones */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <span className={`px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
              module.configuration.isActive 
                ? 'bg-green-100/90 text-green-800 border border-green-200/80' 
                : 'bg-gray-100/90 text-gray-800 border border-gray-200/80'
            }`}>
              {module.configuration.isActive ? 'Activo' : 'Inactivo'}
            </span>
            
            {hasAdminRole && (
              <div className="relative actions-menu">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setShowActions(!showActions);
                  }}
                  className="p-1.5 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
                
                {showActions && (
                  <div 
                    className="absolute right-0 top-full mt-1 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/60 py-1 z-20 min-w-[120px]"
                    onMouseLeave={() => setShowActions(false)}
                  >
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        onEdit(module.id);
                        setShowActions(false);
                      }}
                      className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-blue-50/80 hover:text-blue-600 transition-colors duration-200"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        onDelete(module.id);
                        setShowActions(false);
                      }}
                      className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-red-50/80 hover:text-red-600 transition-colors duration-200"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Icono del módulo superpuesto */}
          <div className="absolute bottom-3 left-3">
            <div className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-md group-hover:scale-110 transition-transform duration-300">
              <Layers className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </div>
        
        {/* Contenido inferior */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors duration-300 line-clamp-1">
            {module.title}
          </h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {module.description || 'Sin descripción'}
          </p>
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span className="font-medium">Orden: {module.configuration.order}</span>
            <span>{new Date(module.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        {/* Indicador visual de hover */}
        <div className="h-1 bg-gradient-to-r from-purple-500 to-purple-600 rounded-b-xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
      </NavLink>
    );
  }

  // Vista de lista
  return (
    <NavLink 
      to={`/module/${module.id}`}
      className="block bg-white/70 backdrop-blur-sm rounded-xl shadow-md border border-gray-200/60 hover:bg-white/90 hover:shadow-lg transition-all duration-300 group cursor-pointer overflow-hidden"
      onClick={handleCardClick}
    >
      <div className="flex items-center p-4 space-x-4">
        {/* Thumbnail izquierdo */}
        <div className="flex-shrink-0">
          {renderThumbnail('small')}
        </div>
        
        {/* Icono del módulo superpuesto al thumbnail */}
        <div className="relative -ml-12 mr-4">
          <div className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-md group-hover:scale-110 transition-transform duration-300 z-10 relative">
            <Layers className="h-4 w-4 text-purple-600" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-purple-600 transition-colors duration-300">
              {module.title}
            </h3>
            
            <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                module.configuration.isActive 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-gray-100 text-gray-800 border border-gray-200'
              }`}>
                {module.configuration.isActive ? 'Activo' : 'Inactivo'}
              </span>
              
              {hasAdminRole && (
                <div className="relative actions-menu">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setShowActions(!showActions);
                    }}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  
                  {showActions && (
                    <div 
                      className="absolute right-0 top-full mt-1 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/60 py-1 z-20 min-w-[120px]"
                      onMouseLeave={() => setShowActions(false)}
                    >
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          onEdit(module.id);
                          setShowActions(false);
                        }}
                        className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-blue-50/80 hover:text-blue-600 transition-colors duration-200"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          onDelete(module.id);
                          setShowActions(false);
                        }}
                        className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-red-50/80 hover:text-red-600 transition-colors duration-200"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <p className="text-gray-600 text-sm mb-2 line-clamp-1">
            {module.description || 'Sin descripción'}
          </p>
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span className="font-medium">Orden: {module.configuration.order}</span>
            <span>{new Date(module.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        {/* Indicador visual de hover para lista */}
        <div className="w-1 h-12 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 flex-shrink-0"></div>
      </div>
    </NavLink>
  );
}