// app/components/AuthIntegration.tsx
// Componente para integrar el AuthContext con los interceptores

import { useEffect } from 'react';
import { useAuth } from '~/context/AuthContext';
import { setAuthContext } from '~/api/interceptors/authInterceptor';

export function AuthIntegration({ children }: { children: React.ReactNode }) {
  const authContext = useAuth();

  useEffect(() => {
    // Configurar la referencia del contexto para los interceptores
    setAuthContext(authContext);
  }, [authContext]);

  return <>{children}</>;
}