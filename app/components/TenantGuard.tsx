// app/components/TenantGuard.tsx

import React from 'react';
import { useTenant } from '~/context/TenantContext';
import LoadingSpinner from './ui/LoadingSpinner';
import TenantErrorPage from './TenantErrorPage';

interface TenantGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function TenantGuard({ children, fallback }: TenantGuardProps) {
  const { state } = useTenant();

  // Mostrar loading mientras se valida
  if (state.isLoading) {
    return fallback || <TenantLoadingPage />;
  }

  // Mostrar error si no es válido
  if (!state.isValid || state.error) {
    return <TenantErrorPage error={state.error} tenant={state.tenant} />;
  }

  // Si todo está bien, mostrar el contenido
  return <>{children}</>;
}

// Componente de loading específico para tenant
function TenantLoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="large" />
        <div className="mt-4 space-y-2">
          <h2 className="text-xl font-semibold text-gray-800">
            Validating access...
          </h2>
          <p className="text-gray-600">
            Verifying tenant configuration
          </p>
        </div>
      </div>
    </div>
  );
}