// app/routes/auth/login.tsx
import { json, redirect, ActionFunction } from '@remix-run/node';
import { useActionData, Form, useNavigation, useSearchParams } from '@remix-run/react';
import type { MetaFunction } from "@remix-run/node";
import { useEffect } from 'react';
import Input from '~/components/ui/Input';
import { validateLoginForm, getErrorByField } from '~/utils/validation';
import { useAuth } from '~/context/AuthContext';
import { useAuthRedirect } from '~/components/AuthGuard';

export const meta: MetaFunction = () => {
  return [
    { title: "Iniciar sesión" },
    { name: "description", content: "Inicia sesión en nuestra plataforma" },
  ];
};

interface ActionData {
  errors?: Array<{ field: string; message: string }>;
  generalError?: string;
  success?: boolean;
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  
  // Validar formulario
  const validation = validateLoginForm(formData);
  
  if (!validation.isValid) {
    return json<ActionData>({ 
      errors: validation.errors 
    }, { status: 400 });
  }

  // Si llegamos aquí, significa que la validación del lado del servidor pasó
  // El login real se maneja en el cliente con el AuthContext
  return json<ActionData>({ success: true });
};

export default function LoginPage() {
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();
  const { state, login, clearError } = useAuth();
  const { redirectAfterLogin } = useAuthRedirect();
  
  const isSubmitting = navigation.state === 'submitting' || state.isLoading;
  const errors = actionData?.errors || [];

  // Limpiar errores cuando el componente se monta
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (state.isAuthenticated) {
      redirectAfterLogin('/home'); // Ruta por defecto después del login
    }
  }, [state.isAuthenticated, redirectAfterLogin]);

  // Manejar el envío del formulario
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Validar en el cliente antes de proceder
    const validation = validateLoginForm(formData);
    if (!validation.isValid) {
      return; // Los errores se mostrarán automáticamente
    }

    try {
      await login({ email, password });
      // El useEffect de arriba manejará la redirección
    } catch (error) {
      // Los errores se manejan en el AuthContext
      console.error('Login error:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mensaje de error general del AuthContext */}
      {state.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path 
                fillRule="evenodd" 
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
                clipRule="evenodd" 
              />
            </svg>
            {state.error}
          </div>
        </div>
      )}

      {/* Mensaje de error general del action */}
      {actionData?.generalError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path 
                fillRule="evenodd" 
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
                clipRule="evenodd" 
              />
            </svg>
            {actionData.generalError}
          </div>
        </div>
      )}

      {/* Mostrar mensaje de retorno si viene de una página protegida */}
      {searchParams.get('returnUrl') && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path 
                fillRule="evenodd" 
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
                clipRule="evenodd" 
              />
            </svg>
            Necesitas iniciar sesión para acceder a esa página.
          </div>
        </div>
      )}

      <Form method="post" onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          type="email"
          id="email"
          name="email"
          label="Correo electrónico"
          required
          autoComplete="email"
          error={getErrorByField(errors, 'email')}
          disabled={isSubmitting}
          placeholder="ejemplo@correo.com"
        />
        
        <Input
          type="password"
          id="password"
          name="password"
          label="Contraseña"
          required
          autoComplete="current-password"
          error={getErrorByField(errors, 'password')}
          disabled={isSubmitting}
          placeholder="Tu contraseña"
          helperText="Mínimo 8 caracteres con mayúscula, minúscula y número"
        />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={isSubmitting}
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
              Recordarme
            </label>
          </div>
          
          <div className="text-sm">
            <a 
              href="#" 
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        </div>
        
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Iniciando sesión...
              </div>
            ) : (
              'Iniciar sesión'
            )}
          </button>
        </div>
      </Form>

      {/* Enlaces adicionales */}
      <div className="text-center text-sm text-gray-600">
        <p>
          ¿No tienes cuenta?{' '}
          <a 
            href="/auth/register" 
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            Regístrate aquí
          </a>
        </p>
      </div>
    </div>
  );
}