import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Eye, Edit, Trash2, Calendar, Clock, X } from 'lucide-react';

const ContentCards = ({ contents, hasAdminRole, getContentIcon, getContentTypeColor }) => {
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, contentId: null, contentTitle: '' });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (e, content) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteModal({
      isOpen: true,
      contentId: content.id,
      contentTitle: content.title
    });
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    
    // Simulación de eliminación
    setTimeout(() => {
      console.log(`Contenido ${deleteModal.contentId} eliminado exitosamente`);
      setIsDeleting(false);
      setDeleteModal({ isOpen: false, contentId: null, contentTitle: '' });
      // Aquí iría la llamada real a la API para eliminar
      // await deleteContent(deleteModal.contentId);
    }, 1500);
  };

  const handleEditClick = (e, contentId) => {
    e.preventDefault();
    e.stopPropagation();
    // Aquí iría la lógica para editar
    console.log(`Editando contenido ${contentId}`);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {contents.map((content) => (
          <Link 
            key={content.id}
            to={`/contents/${content.id}`}
            className="group block bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200/50 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-blue-200"
          >
            {/* Thumbnail */}
            <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-blue-400 opacity-60 group-hover:opacity-80 transition-opacity">
                  {getContentIcon(content.contentType)}
                </div>
              </div>
              
              {/* Overlay con tipo de contenido */}
              <div className="absolute top-3 right-3">
                <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium backdrop-blur-sm border ${getContentTypeColor(content.contentType)}`}>
                  {content.contentType.charAt(0).toUpperCase() + content.contentType.slice(1)}
                </span>
              </div>
            </div>
            
            {/* Contenido */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors line-clamp-1">
                {content.title}
              </h3>
              
              {content.description && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {content.description}
                </p>
              )}
              
              {/* Footer con metadatos y acciones */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(content.createdAt).toLocaleDateString()}
                  </span>
                  {content.metadata?.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {content.metadata.duration} min
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  {hasAdminRole ? (
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={(e) => handleEditClick(e, content.id)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={(e) => handleDeleteClick(e, content)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button className="flex items-center gap-1 text-blue-600 text-xs font-medium group-hover:text-blue-700 transition-colors ml-1 p-1">
                        <Eye className="h-4 w-4" />
                        Ver
                      </button>
                    </div>
                  ) : (
                    <button className="flex items-center gap-1 text-blue-600 text-xs font-medium group-hover:text-blue-700 transition-colors p-1">
                      <Eye className="h-4 w-4" />
                      Ver
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Modal de confirmación de eliminación */}
      {deleteModal.isOpen && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Confirmar eliminación</h3>
              <button 
                onClick={() => setDeleteModal({ isOpen: false, contentId: null, contentTitle: '' })}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar el contenido <span className="font-medium text-gray-900">"{deleteModal.contentTitle}"</span>? 
              Esta acción no se puede deshacer.
            </p>
            
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setDeleteModal({ isOpen: false, contentId: null, contentTitle: '' })}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Eliminando...
                  </>
                ) : (
                  'Eliminar'
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default ContentCards;