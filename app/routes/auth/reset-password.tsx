// app/routes/auth/reset-password.tsx
import { json, ActionFunction, LoaderFunction, redirect } from '@remix-run/node';
import { useActionData, Form, useNavigation, NavLink, useLoaderData } from '@remix-run/react';
import type { MetaFunction } from "@remix-run/node";
import Input from '~/components/ui/Input';
import { AuthAPI } from '~/api/endpoints/auth';
import { Lock, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export const meta: MetaFunction = () => {
  return [
    { title: "Restablecer Contraseña" },
    { name: "description", content: "Crea una nueva contraseña segura" },
  ];
};

interface LoaderData {
  token: string;
  tokenValid: boolean;
}

interface ActionData {
  errors?: Array<{ field: string; message: string }>;
  generalError?: string;
  success?: boolean;
}

interface ValidationError {
  field: string;
  message: string;
}

function validateResetPasswordForm(formData: FormData): { isValid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = [];
  
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirm-password') as string;

  // Validar contraseña
  if (!password || password.length === 0) {
    errors.push({
      field: 'password',
      message: 'La contraseña es requerida'
    });
  } else if (password.length < 8) {
    errors.push({
      field: 'password',
      message: 'La contraseña debe tener al menos 8 caracteres'
    });
  } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/.test(password)) {
    errors.push({
      field: 'password',
      message: 'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
    });
  }

  // Validar confirmación de contraseña
  if (!confirmPassword || confirmPassword.length === 0) {
    errors.push({
      field: 'confirm-password',
      message: 'Confirma tu contraseña'
    });
  } else if (password !== confirmPassword) {
    errors.push({
      field: 'confirm-password',
      message: 'Las contraseñas no coinciden'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

function getErrorByField(errors: ValidationError[], fieldName: string): string | undefined {
  const error = errors.find(error => error.field === fieldName);
  return error?.message;
}

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (!token) {
    throw new Response("Token requerido", { status: 400 });
  }

  try {
    // Aquí verificarías si el token es válido
    // const tokenValid = await verifyResetToken(token);
    const tokenValid = true; // Por ahora simulamos que es válido

    if (!tokenValid) {
      throw new Response("Token inválido o expirado", { status: 400 });
    }

    return json<LoaderData>({
      token,
      tokenValid
    });
  } catch (error) {
    console.error('Error verificando token:', error);
    throw new Response("Error verificando token", { status: 500 });
  }
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const token = formData.get('token') as string;

  if (!token) {
    return json<ActionData>({ 
      generalError: 'Token requerido' 
    }, { status: 400 });
  }

  // Validar formulario
  const validation = validateResetPasswordForm(formData);

  if (!validation.isValid) {
    return json<ActionData>({ 
      errors: validation.errors 
    }, { status: 400 });
  }

  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirm-password') as string;

  try {
    // Llamar al API para resetear la contraseña
    await AuthAPI.resetPassword({ 
      token, 
      password, 
      confirmPassword 
    });
    
    return json<ActionData>({ 
      success: true 
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('Error en reset password:', error);
    
    let generalError = 'Error interno del servidor';
    
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;
      
      if (status === 400) {
        generalError = errorData?.message || 'Token inválido o expirado';
      } else if (status === 429) {
        generalError = 'Demasiados intentos. Intenta más tarde';
      } else if (errorData?.message) {
        generalError = errorData.message;
      }
    } else if (error.message) {
      generalError = error.message;
    }
    
    return json<ActionData>({ 
      generalError 
    }, { status: 400 });
  }
};

export default function ResetPasswordPage() {
  const loaderData = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const isSubmitting = navigation.state === 'submitting';
  const errors = actionData?.errors || [];

  // Si fue exitoso, mostrar mensaje de confirmación
  if (actionData?.success) {
    return (
      <div className="space-y-6">
        {/* Mensaje de éxito */}
        <div className="bg-green-50/80 backdrop-blur-sm border border-green-200 text-green-800 px-6 py-6 rounded-xl shadow-md">
          <div className="flex items-start">
            <CheckCircle2 className="w-6 h-6 mr-3 flex-shrink-0 mt-0.5 text-green-600" />
            <div>
              <h3 className="font-semibold text-lg mb-2">¡Contraseña restablecida!</h3>
              <p className="text-sm text-green-700 leading-relaxed">
                Tu contraseña ha sido actualizada exitosamente. Ahora puedes iniciar sesión 
                con tu nueva contraseña.
              </p>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-xl p-6 shadow-md">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
            <Lock className="w-5 h-5 mr-2" />
            Por tu seguridad:
          </h4>
          <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
            <li>Tu sesión anterior ha sido cerrada automáticamente</li>
            <li>Si no fuiste tú quien cambió la contraseña, contacta soporte inmediatamente</li>
            <li>Considera habilitar la autenticación de dos factores</li>
          </ul>
        </div>

        {/* Botón para ir al login */}
        <div>
          <NavLink
            to="/auth/login"
            className="w-full flex justify-center py-3 px-6 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 transform hover:scale-105"
          >
            <div className="flex items-center">
              <Lock className="w-5 h-5 mr-2" />
              Iniciar sesión
            </div>
          </NavLink>
        </div>
      </div>
    );
  }

  // Formulario de reset password
  return (
    <div className="space-y-6">
      {/* Mensaje de error general */}
      {actionData?.generalError && (
        <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-md">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            <span className="font-medium">{actionData.generalError}</span>
          </div>
        </div>
      )}

      {/* Información explicativa */}
      <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-xl p-6 shadow-md">
        <div className="flex items-start">
          <Lock className="w-6 h-6 mr-3 flex-shrink-0 mt-0.5 text-blue-600" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Crear nueva contraseña</h3>
            <p className="text-sm text-blue-800 leading-relaxed">
              Tu nueva contraseña debe tener al menos 8 caracteres e incluir una mayúscula, 
              una minúscula y un número para mayor seguridad.
            </p>
          </div>
        </div>
      </div>

      <Form method="post" className="space-y-6" noValidate>
        <input type="hidden" name="token" value={loaderData.token} />
        
        <Input
          type={showPassword ? "text" : "password"}
          id="password"
          name="password"
          label="Nueva contraseña"
          required
          autoComplete="new-password"
          error={getErrorByField(errors, 'password')}
          disabled={isSubmitting}
          placeholder="Mínimo 8 caracteres"
          icon={<Lock className="w-5 h-5" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          }
          helperText="Debe contener al menos una mayúscula, una minúscula y un número"
        />
        
        <Input
          type={showConfirmPassword ? "text" : "password"}
          id="confirm-password"
          name="confirm-password"
          label="Confirmar nueva contraseña"
          required
          autoComplete="new-password"
          error={getErrorByField(errors, 'confirm-password')}
          disabled={isSubmitting}
          placeholder="Repite tu nueva contraseña"
          icon={<Lock className="w-5 h-5" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          }
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
                Guardando contraseña...
              </div>
            ) : (
              <div className="flex items-center">
                <Lock className="w-5 h-5 mr-2" />
                Restablecer contraseña
              </div>
            )}
          </button>
        </div>
      </Form>

      {/* Enlaces adicionales */}
      <div className="text-center">
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-md border border-gray-200/50">
          <div className="text-sm text-gray-600">
            ¿Recordaste tu contraseña?{' '}
            <NavLink
              to="/auth/login"
              className="font-medium text-blue-600 hover:text-blue-700 transition-colors hover:underline"
            >
              Iniciar sesión
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
}