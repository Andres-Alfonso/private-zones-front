// app/components/TenantErrorPage.tsx

import React from 'react';
import { Tenant } from '~/types/tenant.types';

interface TenantErrorPageProps {
  error: string | null;
  tenant: Tenant | null;
}

export default function TenantErrorPage({ error, tenant }: TenantErrorPageProps) {
  const getErrorContent = () => {
    switch (error) {
      case 'TENANT_NOT_FOUND':
        return {
          title: 'Dominio no encontrado',
          message: 'No pudimos encontrar una configuración para este dominio.',
          suggestion: 'Verifica que hayas ingresado la URL correcta o contacta al administrador.',
          icon: '🔍'
        };
      
      case 'TENANT_INACTIVE':
        return {
          title: 'Cuenta inactiva',
          message: 'Esta cuenta no está disponible en este momento.',
          suggestion: 'La cuenta puede estar suspendida o desactivada. Contacta al soporte técnico.',
          icon: '⏸️'
        };
      
      case 'TENANT_EXPIRED':
        return {
          title: 'Cuenta expirada',
          message: 'La suscripción de esta cuenta ha expirado.',
          suggestion: 'Contacta al administrador para renovar la suscripción.',
          icon: '⏰'
        };
      
      case 'DOMAIN_MISMATCH':
        return {
          title: 'Dominio no válido',
          message: 'Este dominio no está configurado correctamente.',
          suggestion: 'Verifica la configuración DNS o contacta al soporte técnico.',
          icon: '🌐'
        };
      
      case 'NETWORK_ERROR':
        return {
          title: 'Error de conexión',
          message: 'No pudimos verificar el estado de la cuenta.',
          suggestion: 'Verifica tu conexión a internet e intenta nuevamente.',
          icon: '📡'
        };
      
      default:
        return {
          title: 'Acceso no disponible',
          message: 'No es posible acceder a esta aplicación en este momento.',
          suggestion: 'Intenta nuevamente más tarde o contacta al soporte técnico.',
          icon: '⚠️'
        };
    }
  };

  const errorContent = getErrorContent();
  const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'dominio';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Icono y título */}
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">{errorContent.icon}</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {errorContent.title}
            </h2>
          </div>

          {/* Información del dominio */}
          <div className="bg-gray-50 rounded-md p-4 mb-6">
            <div className="text-sm text-gray-600">
              <strong>Cliente:</strong> {currentDomain}
            </div>
            {tenant && (
              <div className="text-sm text-gray-600 mt-1">
                <strong>Tenant:</strong> {tenant.name}
              </div>
            )}
          </div>

          {/* Mensaje principal */}
          <div className="text-center space-y-4">
            <p className="text-gray-700">
              {errorContent.message}
            </p>
            <p className="text-sm text-gray-600">
              {errorContent.suggestion}
            </p>
          </div>

          {/* Acciones */}
          <div className="mt-8 space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Intentar nuevamente
            </button>
            
            {error === 'NETWORK_ERROR' && (
              <button
                onClick={() => {
                  // Implementar lógica de reintento
                  window.location.reload();
                }}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Verificar conexión
              </button>
            )}
          </div>

          {/* Información de contacto */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center text-sm text-gray-600">
              <p>¿Necesitas ayuda?</p>
              <div className="mt-2 space-x-4">
                <a 
                  href="mailto:soporte@tudominio.com" 
                  className="text-blue-600 hover:text-blue-500"
                >
                  Contactar soporte
                </a>
                <span className="text-gray-400">|</span>
                <a 
                  href="/ayuda" 
                  className="text-blue-600 hover:text-blue-500"
                >
                  Centro de ayuda
                </a>
              </div>
            </div>
          </div>

          {/* Información técnica (solo en desarrollo) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="text-xs text-yellow-800">
                <strong>Debug info:</strong>
                <div className="mt-1 font-mono">
                  Error: {error || 'Unknown'}
                </div>
                {tenant && (
                  <div className="font-mono">
                    Tenant ID: {tenant.id}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}