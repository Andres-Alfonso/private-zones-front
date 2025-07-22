// app/routes/auth/forgot-password.tsx
import { json, ActionFunction, LoaderFunction } from '@remix-run/node';
import { useActionData, Form, useNavigation, NavLink } from '@remix-run/react';
import type { MetaFunction } from "@remix-run/node";
import Input from '~/components/ui/Input';
import { AuthAPI } from '~/api/endpoints/auth';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export const meta: MetaFunction = () => {
  return [
    { title: "Recuperar Contraseña" },
    { name: "description", content: "Recupera el acceso a tu cuenta" },
  ];
};

interface ActionData {
  error?: string;
  success?: boolean;
  email?: string;
}

interface ValidationError {
  field: string;
  message: string;
}

function validateEmail(email: string): ValidationError | null {
  if (!email || email.trim().length === 0) {
    return {
      field: 'email',
      message: 'El correo electrónico es requerido'
    };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      field: 'email',
      message: 'Ingresa un correo electrónico válido'
    };
  }
  
  return null;
}

export const loader: LoaderFunction = async ({ request }) => {
  // Aquí podrías verificar si el usuario ya está autenticado
  // y redirigir a home si es necesario
  return json({});
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get('email') as string;

  // Validar email
  const emailError = validateEmail(email);
  if (emailError) {
    return json<ActionData>({ 
      error: emailError.message 
    }, { status: 400 });
  }

  try {
    // Llamar al API para enviar email de recuperación
    await AuthAPI.forgotPassword({ email });
    
    return json<ActionData>({ 
      success: true,
      email: email 
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('Error en forgot password:', error);
    
    let errorMessage = 'Error interno del servidor';
    
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;
      
      if (status === 404) {
        errorMessage = 'No se encontró una cuenta con este correo electrónico';
      } else if (status === 429) {
        errorMessage = 'Demasiados intentos. Intenta más tarde';
      } else if (status === 400) {
        errorMessage = errorData?.message || 'Datos inválidos';
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return json<ActionData>({ 
      error: errorMessage 
    }, { status: 400 });
  }
};

export default function ForgotPasswordPage() {
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const [countdown, setCountdown] = useState(0);
  
  const isSubmitting = navigation.state === 'submitting';

  // Countdown para reenvío de email
  useEffect(() => {
    if (actionData?.success && countdown === 0) {
      setCountdown(60); // 60 segundos de espera
    }
  }, [actionData?.success]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Si fue exitoso, mostrar mensaje de confirmación
  if (actionData?.success) {
    return (
      <div className="space-y-6">
        {/* Mensaje de éxito */}
        <div className="bg-green-50/80 backdrop-blur-sm border border-green-200 text-green-800 px-6 py-6 rounded-xl shadow-md">
          <div className="flex items-start">
            <CheckCircle2 className="w-6 h-6 mr-3 flex-shrink-0 mt-0.5 text-green-600" />
            <div>
              <h3 className="font-semibold text-lg mb-2">¡Email enviado exitosamente!</h3>
              <p className="text-sm text-green-700 leading-relaxed">
                Hemos enviado un enlace de recuperación a{' '}
                <span className="font-semibold">{actionData.email}</span>. 
                Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
              </p>
              <p className="text-xs text-green-600 mt-3">
                Si no ves el email, revisa tu carpeta de spam.
              </p>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-xl p-6 shadow-md">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
            <Mail className="w-5 h-5 mr-2" />
            Pasos siguientes:
          </h4>
          <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
            <li>Revisa tu correo electrónico en los próximos minutos</li>
            <li>Haz clic en el enlace de recuperación</li>
            <li>Crea una nueva contraseña segura</li>
            <li>Inicia sesión con tu nueva contraseña</li>
          </ol>
        </div>

        {/* Botón para reenviar email */}
        <div className="flex flex-col space-y-4">
          <Form method="post">
            <input type="hidden" name="email" value={actionData.email} />
            <button
              type="submit"
              disabled={isSubmitting || countdown > 0}
              className="w-full flex justify-center py-3 px-6 border border-gray-300 rounded-xl shadow-md bg-white/80 backdrop-blur-sm text-sm font-semibold text-gray-700 hover:bg-white hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 disabled:hover:scale-100"
            >
              {countdown > 0 ? (
                <span>Reenviar en {countdown}s</span>
              ) : isSubmitting ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Reenviando...
                </div>
              ) : (
                'Reenviar email'
              )}
            </button>
          </Form>

          <NavLink
            to="/auth/login"
            className="flex items-center justify-center space-x-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors bg-white/60 backdrop-blur-sm px-6 py-3 rounded-xl border border-blue-200/50 hover:bg-white/80 hover:shadow-md transform hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al inicio de sesión</span>
          </NavLink>
        </div>
      </div>
    );
  }

  // Formulario de recuperación
  return (
    <div className="space-y-6">
      {/* Mensaje de error general */}
      {actionData?.error && (
        <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-md">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            <span className="font-medium">{actionData.error}</span>
          </div>
        </div>
      )}

      {/* Información explicativa */}
      <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-xl p-6 shadow-md">
        <div className="flex items-start">
          <Mail className="w-6 h-6 mr-3 flex-shrink-0 mt-0.5 text-blue-600" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Recuperar contraseña</h3>
            <p className="text-sm text-blue-800 leading-relaxed">
              Ingresa tu correo electrónico y te enviaremos un enlace seguro para que puedas 
              restablecer tu contraseña. El enlace será válido por 1 hora.
            </p>
          </div>
        </div>
      </div>

      <Form method="post" className="space-y-6" noValidate>
        <Input
          type="email"
          id="email"
          name="email"
          label="Correo electrónico"
          required
          autoComplete="email"
          error={actionData?.error && actionData.error.includes('correo') ? actionData.error : undefined}
          disabled={isSubmitting}
          placeholder="ejemplo@correo.com"
          icon={<Mail className="w-5 h-5" />}
          helperText="Te enviaremos un enlace de recuperación a este correo"
        />
        
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-3 px-6 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Enviando enlace...
              </div>
            ) : (
              <div className="flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Enviar enlace de recuperación
              </div>
            )}
          </button>
        </div>
      </Form>

      {/* Enlaces adicionales */}
      <div className="flex flex-col space-y-3">
        <NavLink
          to="/auth/login"
          className="flex items-center justify-center space-x-2 text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors bg-white/60 backdrop-blur-sm px-4 py-3 rounded-xl border border-gray-200/50 hover:bg-white/80 hover:shadow-md transform hover:scale-105"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Recordé mi contraseña</span>
        </NavLink>

        <div className="text-center">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-md border border-gray-200/50">
            <div className="text-sm text-gray-600">
              ¿No tienes cuenta?{' '}
              <NavLink
                to="/auth/register"
                className="font-medium text-green-600 hover:text-green-700 transition-colors hover:underline"
              >
                Regístrate aquí
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}