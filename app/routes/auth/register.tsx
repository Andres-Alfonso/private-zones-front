// app/routes/auth/register.tsx
import { json, redirect, ActionFunction } from '@remix-run/node';
import { useActionData, Form, useNavigation, useLoaderData, useNavigate } from '@remix-run/react';
import type { MetaFunction } from "@remix-run/node";
import Input from '~/components/ui/Input';
import Checkbox from '~/components/ui/Checkbox';
import { validateRegisterForm, getErrorByField } from '~/utils/validation';
import { AuthAPI } from '~/api/endpoints/auth';
import SuccessModal from '~/components/ui/SuccessModal';

export const meta: MetaFunction = () => {
  return [
    { title: "Registro" },
    { name: "description", content: "Crea una cuenta en nuestra plataforma" },
  ];
};

interface ActionData {
  errors?: Array<{ field: string; message: string }>;
  generalError?: string;
  success?: boolean;
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  // Obtener dominio desde el header Host
  const url = new URL(request.url);
  const domain = url.hostname;
  
  // Validar formulario
  const validation = validateRegisterForm(formData);
  
  if (!validation.isValid) {
    return json<ActionData>({ 
      errors: validation.errors 
    }, { status: 400 });
  }

  // Preparar datos para el API
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('first-name') as string;
  const lastName = formData.get('last-name') as string;
  
  // Combinar nombre completo
  // const name = `${firstName.trim()} ${lastName.trim()}`;

  try {
    // Llamar al API de registro
    const response = await AuthAPI.register({ 
      email, 
      password, 
      name,
      lastName,
      tenantId: domain 
    });
    
    // Aquí podrías guardar el token en cookies/session automáticamente
    // o redirigir a una página de confirmación
    console.log('Registro exitoso:', response);
    
    return json<ActionData>({ 
      success: true 
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('Error en registro:', error);
    
    // Manejar diferentes tipos de errores
    let generalError = 'Error interno del servidor';
    
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;
      
      if (status === 409 || status === 400) {
        // Usuario ya existe o datos inválidos
        if (errorData?.message) {
          generalError = errorData.message;
        } else {
          generalError = 'El correo electrónico ya está en uso';
        }
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

export default function RegisterPage() {
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const navigate = useNavigate();
  
  const isSubmitting = navigation.state === 'submitting';
  const errors = actionData?.errors || [];

  return (
    <div className="space-y-6">
      {/* Mensaje de error general */}
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

      <Form method="post" className="space-y-4" noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            type="text"
            id="first-name"
            name="first-name"
            label="Nombre"
            required
            autoComplete="given-name"
            error={getErrorByField(errors, 'first-name')}
            disabled={isSubmitting}
            placeholder="Tu nombre"
          />
          
          <Input
            type="text"
            id="last-name"
            name="last-name"
            label="Apellido"
            required
            autoComplete="family-name"
            error={getErrorByField(errors, 'last-name')}
            disabled={isSubmitting}
            placeholder="Tu apellido"
          />
        </div>
        
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
          autoComplete="new-password"
          error={getErrorByField(errors, 'password')}
          disabled={isSubmitting}
          placeholder="Mínimo 8 caracteres"
          helperText="Debe contener al menos una mayúscula, una minúscula y un número"
        />
        
        <Input
          type="password"
          id="confirm-password"
          name="confirm-password"
          label="Confirmar contraseña"
          required
          autoComplete="new-password"
          error={getErrorByField(errors, 'confirm-password')}
          disabled={isSubmitting}
          placeholder="Repite tu contraseña"
        />
        
        <Checkbox
          id="agree-terms"
          name="agree-terms"
          label="Acepto los términos y condiciones y la política de privacidad"
          required
          error={getErrorByField(errors, 'agree-terms')}
          disabled={isSubmitting}
        />
        
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
                Creando cuenta...
              </div>
            ) : (
              'Crear cuenta'
            )}
          </button>
        </div>
      </Form>

      {/* Enlaces adicionales */}
      <div className="text-center text-sm text-gray-600">
        <p>
          ¿Ya tienes cuenta?{' '}
          <a 
            href="/auth/login" 
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            Inicia sesión aquí
          </a>
        </p>
      </div>
      <SuccessModal
        isOpen={actionData?.success === true}
        onClose={() => window.location.href = '/auth/login'}
        onConfirm={() => window.location.href = '/auth/login'}
        title="¡Registro Exitoso!"
        message="Tu cuenta ha sido creada correctamente. Ahora puedes iniciar sesión con tus credenciales."
        confirmText="Ir al Login"
      />
    </div>
  );
}