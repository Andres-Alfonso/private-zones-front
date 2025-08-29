// app/components/ErrorDisplay.tsx

import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorDisplayProps {
  status?: number;
  title?: string;
  message?: string;
  showRefresh?: boolean;
}

export function ErrorDisplay({ 
  status, 
  title, 
  message = "Ha ocurrido un error inesperado",
  showRefresh = true 
}: ErrorDisplayProps) {
  const handleRefresh = () => {
    window.location.reload();
  };

  const getErrorTitle = () => {
    if (title) return title;
    
    switch (status) {
      case 404:
        return "Página no encontrada";
      case 403:
        return "Acceso denegado";
      case 500:
        return "Error del servidor";
      default:
        return "Algo salió mal";
    }
  };

  const getErrorIcon = () => {
    const iconClass = status === 404 ? "text-blue-500" : "text-orange-500";
    return <AlertTriangle className={`w-12 h-12 ${iconClass}`} />;
  };

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Icono */}
        <div className="flex justify-center mb-6">
          {getErrorIcon()}
        </div>
        
        {/* Status code (si existe) */}
        {status && (
          <div className="text-6xl font-light text-gray-400 mb-2">
            {status}
          </div>
        )}
        
        {/* Título */}
        <h1 className="text-2xl font-semibold text-gray-900 mb-3">
          {getErrorTitle()}
        </h1>
        
        {/* Mensaje */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          {message}
        </p>
        
        {/* Botón de actualizar */}
        {showRefresh && (
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-6 py-3 
                     bg-gray-900 text-white rounded-lg 
                     hover:bg-gray-800 transition-colors duration-200
                     focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            <RefreshCw className="w-4 h-4" />
            Intentar de nuevo
          </button>
        )}
        
        {/* Línea decorativa */}
        <div className="mt-12 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-400">
            Si el problema persiste, contacta con soporte
          </p>
        </div>
      </div>
    </div>
  );
}

// Versión específica para errores 404
export function NotFoundError({ message }: { message?: string }) {
  return (
    <ErrorDisplay
      status={404}
      message={message || "La página que buscas no existe"}
    />
  );
}

// Versión específica para errores de servidor
export function ServerError({ message }: { message?: string }) {
  return (
    <ErrorDisplay
      status={500}
      message={message || "Estamos experimentando problemas técnicos"}
    />
  );
}