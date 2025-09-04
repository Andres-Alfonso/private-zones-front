// app/root.tsx - Versión actualizada con mejor manejo de errores

import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
  isRouteErrorResponse,
} from "@remix-run/react";
import { json, LoaderFunction } from "@remix-run/node";
import { useEffect } from "react";

import "./tailwind.css";
import { TenantProvider } from "./context/TenantContext";
import { AuthProvider } from "./context/AuthContext";
import TenantGuard from "./components/TenantGuard";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { setAuthContext, setupAutoRefresh } from "./api/interceptors/authInterceptor";
import { cookieHelpers } from "./utils/cookieHelpers";

// Loader para obtener información del servidor (como el dominio)
export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const hostname = url.hostname;
  
  return json({
    domain: hostname,
    isProduction: process.env.NODE_ENV === 'production'
  });
};

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        
        {/* Estilos críticos inline para prevenir FOUC */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Critical CSS para prevenir FOUC */
            * { box-sizing: border-box; }
            html, body { height: 100%; margin: 0; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              background-color: #f9fafb;
              line-height: 1.5;
              color: #111827;
            }
            
            /* Variables CSS para el tema del tenant */
            :root {
              --tenant-primary-color: #feeae7;
              --tenant-secondary-color: #ffffff;
            }
          `
        }} />
      </head>
      <body className="bg-gray-50">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

// Componente interno para configurar los interceptores
function AppSetup({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Configurar auto-refresh de tokens
    const cleanup = setupAutoRefresh();
    
    return cleanup;
  }, []);

  return <>{children}</>;
}

export default function App() {
  const { domain } = useLoaderData<{ domain: string; isProduction: boolean }>();

  return (
    <TenantProvider initialDomain={domain}>
      <TenantGuard>
        <AuthProvider>
          <AppSetup>
            <div className="flex flex-col min-h-screen">
              <Header />
              
              <main className="flex-grow">
                <Outlet />
              </main>
              
              {/* <Footer /> */}
            </div>
          </AppSetup>
        </AuthProvider>
      </TenantGuard>
    </TenantProvider>
  );
}

// Componente reutilizable para la página de error
function ErrorPage({ 
  title, 
  message, 
  statusCode, 
  technicalError,
  showReloadButton = true,
  showHomeButton = true 
}: {
  title: string;
  message: string;
  statusCode?: number;
  technicalError?: string;
  showReloadButton?: boolean;
  showHomeButton?: boolean;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gray-50">
      <div className="max-w-md w-full">
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <div className="text-6xl mb-4">
            {statusCode === 404 ? '🔍' : statusCode === 500 ? '⚠️' : '🚨'}
          </div>
          
          {statusCode && (
            <div className="text-sm font-mono text-gray-500 mb-2">
              Error {statusCode}
            </div>
          )}
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {title}
          </h1>
          
          <p className="text-gray-600 mb-6">
            {message}
          </p>
          
          {technicalError && process.env.NODE_ENV === 'development' && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <div className="text-sm text-red-800 text-left">
                <strong>Error técnico:</strong>
                <pre className="mt-2 whitespace-pre-wrap text-xs max-h-32 overflow-y-auto">
                  {technicalError}
                </pre>
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            {showReloadButton && (
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
              >
                Recargar página
              </button>
            )}
            
            {showHomeButton && (
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    cookieHelpers.clearAuth();
                    window.location.href = '/';
                  }
                }}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition-colors"
              >
                Ir al inicio
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Error boundary mejorado que maneja todos los tipos de errores
export function ErrorBoundary() {
  const error = useRouteError();

  console.error('App Error:', error);

  let title: string;
  let message: string;
  let statusCode: number | undefined;
  let technicalError: string;

  if (isRouteErrorResponse(error)) {
    // Errores de respuesta HTTP (404, 500, etc.)
    statusCode = error.status;
    
    switch (error.status) {
      case 404:
        title = "Página no encontrada";
        message = "La página que buscas no existe o ha sido movida.";
        break;
      case 401:
        title = "No autorizado";
        message = "Necesitas iniciar sesión para acceder a esta página.";
        break;
      case 403:
        title = "Acceso denegado";
        message = "No tienes permisos para acceder a esta página.";
        break;
      case 500:
        title = "Error del servidor";
        message = "Ha ocurrido un error interno en el servidor.";
        break;
      default:
        title = `Error ${error.status}`;
        message = error.statusText || "Ha ocurrido un error inesperado.";
    }
    
    technicalError = `${error.status}: ${error.statusText}\n${error.data || ''}`;
  } else if (error instanceof Error) {
    // Errores de JavaScript/TypeScript
    title = "Error en la aplicación";
    message = "Ha ocurrido un error inesperado en la aplicación.";
    technicalError = `${error.name}: ${error.message}\n${error.stack || ''}`;
  } else if (typeof error === 'string') {
    // Errores como string
    title = "Error en la aplicación";
    message = "Ha ocurrido un error inesperado.";
    technicalError = error;
  } else {
    // Otros tipos de errores
    title = "Error desconocido";
    message = "Ha ocurrido un error inesperado que no pudimos identificar.";
    technicalError = typeof error === 'object' 
      ? JSON.stringify(error, null, 2) 
      : String(error);
  }

  // CLAVE: Determinar si es un error crítico que requiere documento HTML completo
  // Solo errores de servidor (500+) y errores de JavaScript necesitan HTML completo
  const isCriticalError = !isRouteErrorResponse(error) || 
                         (error.status >= 500 && error.status < 600);

  // Para errores críticos, renderizar documento HTML completo
  if (isCriticalError) {
    return (
      <html lang="es">
        <head>
          <title>{title} - Aplicación no disponible</title>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <Meta />
          <Links />
          
          {/* Estilos críticos inline para evitar FOUC */}
          <style dangerouslySetInnerHTML={{
            __html: `
              /* Reset básico */
              * { box-sizing: border-box; margin: 0; padding: 0; }
              
              /* Estilos críticos inline */
              body { 
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                background-color: #f9fafb; 
                line-height: 1.5;
                color: #111827;
              }
              
              .error-container { 
                min-height: 100vh; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                padding: 3rem 1rem; 
              }
              
              .error-card { 
                max-width: 28rem; 
                width: 100%; 
                background: white; 
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); 
                border-radius: 0.5rem; 
                padding: 1.5rem; 
                text-align: center; 
              }
              
              .error-icon { 
                font-size: 3.75rem; 
                margin-bottom: 1rem; 
              }
              
              .error-code { 
                font-size: 0.875rem; 
                font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; 
                color: #6b7280; 
                margin-bottom: 0.5rem; 
              }
              
              .error-title { 
                font-size: 1.5rem; 
                font-weight: 700; 
                color: #111827; 
                margin-bottom: 1rem; 
              }
              
              .error-message { 
                color: #4b5563; 
                margin-bottom: 1.5rem; 
              }
              
              .error-technical { 
                background-color: #fef2f2; 
                border: 1px solid #fecaca; 
                border-radius: 0.375rem; 
                padding: 1rem; 
                margin-bottom: 1rem; 
              }
              
              .error-technical-title { 
                font-size: 0.875rem; 
                color: #991b1b; 
                font-weight: 600; 
              }
              
              .error-technical-content { 
                margin-top: 0.5rem; 
                white-space: pre-wrap; 
                font-size: 0.75rem; 
                max-height: 8rem; 
                overflow-y: auto; 
                text-align: left; 
              }
              
              .error-buttons { 
                display: flex; 
                flex-direction: column; 
                gap: 0.75rem; 
              }
              
              .error-button { 
                width: 100%; 
                padding: 0.5rem 1rem; 
                border-radius: 0.375rem; 
                border: none; 
                font-weight: 500; 
                cursor: pointer; 
                transition: background-color 0.2s; 
              }
              
              .error-button-primary { 
                background-color: #2563eb; 
                color: white; 
              }
              
              .error-button-primary:hover { 
                background-color: #1d4ed8; 
              }
              
              .error-button-secondary { 
                background-color: #4b5563; 
                color: white; 
              }
              
              .error-button-secondary:hover { 
                background-color: #374151; 
              }
              
              /* Variables CSS para mantener consistencia */
              :root {
                --tenant-primary-color: #feeae7;
                --tenant-secondary-color: #ffffff;
              }
            `
          }} />
        </head>
        <body>
          <div className="error-container">
            <div className="error-card">
              <div className="error-icon">
                {statusCode === 404 ? '🔍' : statusCode === 500 ? '⚠️' : '🚨'}
              </div>
              
              {statusCode && (
                <div className="error-code">
                  Error {statusCode}
                </div>
              )}
              
              <h1 className="error-title">
                {title}
              </h1>
              
              <p className="error-message">
                {message}
              </p>
              
              {technicalError && process.env.NODE_ENV === 'development' && (
                <div className="error-technical">
                  <div className="error-technical-title">
                    Error técnico:
                  </div>
                  <pre className="error-technical-content">
                    {technicalError}
                  </pre>
                </div>
              )}
              
              <div className="error-buttons">
                {statusCode !== 404 && (
                  <button
                    onClick={() => window.location.reload()}
                    className="error-button error-button-primary"
                  >
                    Recargar página
                  </button>
                )}
                
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      cookieHelpers.clearAuth();
                      window.location.href = '/';
                    }
                  }}
                  className="error-button error-button-secondary"
                >
                  Ir al inicio
                </button>
              </div>
            </div>
          </div>
          
          <Scripts />
        </body>
      </html>
    );
  }

  // Para errores no críticos (404, 401, 403), usar el layout existente
  // ESTO EVITA EL ERROR DE HIDRATACIÓN
  return (
    <ErrorPage
      title={title}
      message={message}
      statusCode={statusCode}
      technicalError={technicalError}
      showReloadButton={statusCode !== 404}
    />
  );
}