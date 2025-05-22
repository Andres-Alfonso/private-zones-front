// app/root.tsx - Versión actualizada con middleware de tenant

import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { json, LoaderFunction } from "@remix-run/node";

import "./tailwind.css";
import { TenantProvider } from "./context/TenantContext";
import TenantGuard from "./components/TenantGuard";
import Header from "./components/Header";
import Footer from "./components/Footer";

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
        {/* Variables CSS para el tema del tenant */}
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              --tenant-primary-color: #0052cc;
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

export default function App() {
  const { domain } = useLoaderData<{ domain: string; isProduction: boolean }>();

  return (
    <TenantProvider initialDomain={domain}>
      <TenantGuard>
        <div className="flex flex-col min-h-screen">
          {/* Header comentado por defecto - descomenta según necesites */}
          {/* <Header /> */}
          
          <main className="flex-grow">
            <Outlet />
          </main>
          
          {/* Footer comentado por defecto - descomenta según necesites */}
          {/* <Footer /> */}
        </div>
      </TenantGuard>
    </TenantProvider>
  );
}

// Error boundary mejorado para manejar errores de tenant
export function ErrorBoundary({ error }: { error: Error }) {
  console.error('App Error:', error);
  
  return (
    <html lang="es">
      <head>
        <title>Error - Aplicación no disponible</title>
        <Meta />
        <Links />
      </head>
      <body className="bg-gray-50">
        <div className="min-h-screen flex items-center justify-center py-12 px-4">
          <div className="max-w-md w-full">
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <div className="text-6xl mb-4">🚨</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Error en la aplicación
              </h1>
              <p className="text-gray-600 mb-6">
                Ha ocurrido un error inesperado. Por favor, intenta nuevamente.
              </p>
              
              {process.env.NODE_ENV === 'development' && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                  <div className="text-sm text-red-800 text-left">
                    <strong>Error técnico:</strong>
                    <pre className="mt-2 whitespace-pre-wrap text-xs">
                      {error.message}
                    </pre>
                  </div>
                </div>
              )}
              
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
              >
                Recargar página
              </button>
            </div>
          </div>
        </div>
        <Scripts />
      </body>
    </html>
  );
}