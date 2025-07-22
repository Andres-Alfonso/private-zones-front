// app/routes/auth/register.tsx
import { json, redirect, ActionFunction, LoaderFunction } from '@remix-run/node';
import { useActionData, Form, useNavigation, useLoaderData, useNavigate } from '@remix-run/react';
import type { MetaFunction } from "@remix-run/node";
import { useEffect, useState } from 'react';
import Input from '~/components/ui/Input';
import Select from '~/components/ui/Select';
import Checkbox from '~/components/ui/Checkbox';
import Modal from '~/components/ui/Modal';
import { validateRegisterForm, getErrorByField } from '~/utils/validation';
import { AuthAPI } from '~/api/endpoints/auth';
import SuccessModal from '~/components/ui/SuccessModal';
import { useAuthRedirect } from '~/components/AuthGuard';
import { useAuth } from '~/context/AuthContext';
import { useTenant } from '~/context/TenantContext';

export const meta: MetaFunction = () => {
  return [
    { title: "Registro" },
    { name: "description", content: "Crea una cuenta en nuestra plataforma" },
  ];
};

interface TenantConfig {
  allowSelfRegistration: boolean;
  allowGoogleLogin: boolean;
  allowFacebookLogin: boolean;
  requireLastName: boolean;
  requirePhone: boolean;
  requireDocumentType: boolean;
  requireDocument: boolean;
  requireOrganization: boolean;
  requirePosition: boolean;
  requireGender: boolean;
  requireCity: boolean;
  requireAddress: boolean;
}

interface LoaderData {
  tenantConfig: TenantConfig;
  documentTypes: Array<{ value: string; label: string }>;
  genderOptions: Array<{ value: string; label: string }>;
}

interface ActionData {
  errors?: Array<{ field: string; message: string }>;
  generalError?: string;
  success?: boolean;
}

export const loader: LoaderFunction = async ({ request }) => {
  // Obtener configuración del tenant desde tu API o base de datos
  const url = new URL(request.url);
  const domain = url.hostname;
  
  try {
    // Aquí deberías obtener la configuración del tenant
    // const tenantConfig = await getTenantConfig(domain);
    
    // Por ahora, simulo la configuración
    const tenantConfig: TenantConfig = {
      allowSelfRegistration: true,
      allowGoogleLogin: false,
      allowFacebookLogin: false,
      requireLastName: true,
      requirePhone: true,
      requireDocumentType: true,
      requireDocument: true,
      requireOrganization: false,
      requirePosition: true,
      requireGender: false,
      requireCity: true,
      requireAddress: false,
    };

    // Si no se permite auto-registro, redirigir
    if (!tenantConfig.allowSelfRegistration) {
      throw new Response("Registro no permitido", { status: 403 });
    }

    const documentTypes = [
      { value: 'cc', label: 'Cédula de Ciudadanía' },
      { value: 'ce', label: 'Cédula de Extranjería' },
      { value: 'passport', label: 'Pasaporte' },
      { value: 'ti', label: 'Tarjeta de Identidad' },
    ];

    const genderOptions = [
      { value: 'MASCULINO', label: 'Masculino' },
      { value: 'FEMENINO', label: 'Femenino' },
      { value: 'OTRO', label: 'Otro' },
      { value: 'PREFIERO_NO_DECIR', label: 'Prefiero no decir' },
    ];

    return json<LoaderData>({
      tenantConfig,
      documentTypes,
      genderOptions,
    });
  } catch (error) {
    throw new Response("Error al cargar configuración", { status: 500 });
  }
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  
  // Obtener configuración del tenant para validación
  const url = new URL(request.url);
  const domain = url.hostname;
  
  // Aquí deberías obtener la configuración del tenant nuevamente
  // const tenantConfig = await getTenantConfig(domain);
  
  // Validar formulario con configuración dinámica
  const validation = validateRegisterForm(formData, /* tenantConfig */);

  if (!validation.isValid) {
    return json<ActionData>({ 
      errors: validation.errors 
    }, { status: 400 });
  }

  // Preparar datos para el API
  const registrationData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    name: formData.get('first-name') as string,
    lastName: formData.get('last-name') as string,
    phone: formData.get('phone') as string,
    documentType: formData.get('document-type') as string,
    document: formData.get('document') as string,
    organization: formData.get('organization') as string,
    position: formData.get('position') as string,
    gender: formData.get('gender') as string,
    city: formData.get('city') as string,
    address: formData.get('address') as string,
    tenantId: domain,
  };

  try {
    // Llamar al API de registro
    const response = await AuthAPI.register(registrationData);
    
    console.log('Registro exitoso:', response);
    
    return json<ActionData>({ 
      success: true 
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('Error en registro:', error);
    
    let generalError = 'Error interno del servidor';
    
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;
      
      if (status === 409 || status === 400) {
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
  const loaderData = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const navigate = useNavigate();
  const { state, login, clearError } = useAuth();
  const { redirectAfterLogin } = useAuthRedirect();

  // ← Estado para controlar el modal de términos
  const [showTermsModal, setShowTermsModal] = useState(false);

  const { tenantConfig, documentTypes, genderOptions } = loaderData;

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (state.isAuthenticated) {
      redirectAfterLogin('/home');
    }
  }, [state.isAuthenticated, redirectAfterLogin]);
  
  const isSubmitting = navigation.state === 'submitting';
  const errors = actionData?.errors || [];

  return (
    <div className="space-y-6">
      {/* Mensaje de error general */}
      {actionData?.generalError && (
        <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-md">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path 
                fillRule="evenodd" 
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
                clipRule="evenodd" 
              />
            </svg>
            <span className="font-medium">{actionData.generalError}</span>
          </div>
        </div>
      )}

      <Form method="post" className="space-y-4" noValidate>
        {/* Información básica */}
        <div className={`grid grid-cols-1 gap-4 ${tenantConfig.requireLastName ? 'sm:grid-cols-2' : ''}`}>
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
          
          {tenantConfig.requireLastName && (
            <Input
              type="text"
              id="last-name"
              name="last-name"
              label="Apellido"
              required={tenantConfig.requireLastName}
              autoComplete="family-name"
              error={getErrorByField(errors, 'last-name')}
              disabled={isSubmitting}
              placeholder="Tu apellido"
            />
          )}
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

        {/* Teléfono */}
        {tenantConfig.requirePhone && (
          <Input
            type="tel"
            id="phone"
            name="phone"
            label="Teléfono"
            required={tenantConfig.requirePhone}
            autoComplete="tel"
            error={getErrorByField(errors, 'phone')}
            disabled={isSubmitting}
            placeholder="+57 300 123 4567"
          />
        )}

        {/* Documentos de identidad */}
        {(tenantConfig.requireDocumentType || tenantConfig.requireDocument) && (
          <div className={`grid grid-cols-1 gap-4 ${
            tenantConfig.requireDocumentType && tenantConfig.requireDocument ? 'sm:grid-cols-2' : ''
          }`}>
            {tenantConfig.requireDocumentType && (
              <Select
                id="document-type"
                name="document-type"
                label="Tipo de documento"
                required={tenantConfig.requireDocumentType}
                error={getErrorByField(errors, 'document-type')}
                disabled={isSubmitting}
                options={documentTypes}
                placeholder="Selecciona el tipo"
              />
            )}
            
            {tenantConfig.requireDocument && (
              <Input
                type="text"
                id="document"
                name="document"
                label="Número de documento"
                required={tenantConfig.requireDocument}
                error={getErrorByField(errors, 'document')}
                disabled={isSubmitting}
                placeholder="12345678"
              />
            )}
          </div>
        )}

        {/* Información profesional */}
        {(tenantConfig.requireOrganization || tenantConfig.requirePosition) && (
          <div className={`grid grid-cols-1 gap-4 ${
            tenantConfig.requireOrganization && tenantConfig.requirePosition ? 'sm:grid-cols-2' : ''
          }`}>
            {tenantConfig.requireOrganization && (
              <Input
                type="text"
                id="organization"
                name="organization"
                label="Organización"
                required={tenantConfig.requireOrganization}
                error={getErrorByField(errors, 'organization')}
                disabled={isSubmitting}
                placeholder="Nombre de la empresa"
              />
            )}
            
            {tenantConfig.requirePosition && (
              <Input
                type="text"
                id="position"
                name="position"
                label="Cargo"
                required={tenantConfig.requirePosition}
                error={getErrorByField(errors, 'position')}
                disabled={isSubmitting}
                placeholder="Tu cargo o posición"
              />
            )}
          </div>
        )}

        {/* Información personal adicional */}
        {tenantConfig.requireGender && (
          <Select
            id="gender"
            name="gender"
            label="Género"
            required={tenantConfig.requireGender}
            error={getErrorByField(errors, 'gender')}
            disabled={isSubmitting}
            options={genderOptions}
            placeholder="Selecciona una opción"
          />
        )}

        {/* Información de ubicación */}
        {(tenantConfig.requireCity || tenantConfig.requireAddress) && (
          <div className={`grid grid-cols-1 gap-4 ${
            tenantConfig.requireCity && tenantConfig.requireAddress ? 'sm:grid-cols-2' : ''
          }`}>
            {tenantConfig.requireCity && (
              <Input
                type="text"
                id="city"
                name="city"
                label="Ciudad"
                required={tenantConfig.requireCity}
                error={getErrorByField(errors, 'city')}
                disabled={isSubmitting}
                placeholder="Tu ciudad"
              />
            )}
            
            {tenantConfig.requireAddress && (
              <Input
                type="text"
                id="address"
                name="address"
                label="Dirección"
                required={tenantConfig.requireAddress}
                error={getErrorByField(errors, 'address')}
                disabled={isSubmitting}
                placeholder="Tu dirección completa"
              />
            )}
          </div>
        )}
        
        {/* Contraseñas */}
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
        
        {/* ← Checkbox con enlace personalizado para términos */}
        <div className="space-y-2">
          <div className="flex items-start">
            <input
              type="checkbox"
              id="agree-terms"
              name="agree-terms"
              required
              disabled={isSubmitting}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
            />
            <label htmlFor="agree-terms" className="ml-3 text-sm text-gray-700">
              Acepto los{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowTermsModal(true);
                }}
                className="text-blue-600 hover:text-blue-700 underline font-medium"
              >
                términos y condiciones
              </button>
              {' '}y la{' '}
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 underline font-medium"
              >
                política de privacidad
              </a>
            </label>
          </div>
          {getErrorByField(errors, 'agree-terms') && (
            <p className="text-sm text-red-600">{getErrorByField(errors, 'agree-terms')}</p>
          )}
        </div>
        
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
                Creando cuenta...
              </div>
            ) : (
              'Crear cuenta'
            )}
          </button>
        </div>

        {/* Opciones de login social si están habilitadas */}
        {(tenantConfig.allowGoogleLogin || tenantConfig.allowFacebookLogin) && (
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300/60" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/80 backdrop-blur-sm text-gray-500 font-medium rounded-lg">
                  O regístrate con
                </span>
              </div>
            </div>

            <div className="grid gap-3">
              {tenantConfig.allowGoogleLogin && (
                <button
                  type="button"
                  disabled={isSubmitting}
                  className="w-full inline-flex justify-center py-3 px-6 border border-gray-300 rounded-xl shadow-md bg-white/80 backdrop-blur-sm text-sm font-semibold text-gray-700 hover:bg-white hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 disabled:hover:scale-100"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continuar con Google
                </button>
              )}

              {tenantConfig.allowFacebookLogin && (
                <button
                  type="button"
                  disabled={isSubmitting}
                  className="w-full inline-flex justify-center py-3 px-6 border border-gray-300 rounded-xl shadow-md bg-white/80 backdrop-blur-sm text-sm font-semibold text-gray-700 hover:bg-white hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 disabled:hover:scale-100"
                >
                  <svg className="w-5 h-5 mr-3" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Continuar con Facebook
                </button>
              )}
            </div>
          </div>
        )}
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

      {/* ← Modal de términos y condiciones */}
      <Modal
        title="Términos y Condiciones"
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      >
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">1. Aceptación de Términos</h4>
            <p className="text-gray-700">
              Al registrarte en nuestra plataforma, aceptas cumplir con estos términos y condiciones. 
              Si no estás de acuerdo, no debes utilizar nuestros servicios.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">2. Uso del Servicio</h4>
            <p className="text-gray-700">
              Te comprometes a utilizar nuestros servicios de manera responsable y conforme a las leyes aplicables.
              No debes usar la plataforma para actividades ilegales o que violen los derechos de otros.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">3. Privacidad y Datos</h4>
            <p className="text-gray-700">
              Nos comprometemos a proteger tu información personal de acuerdo con nuestra política de privacidad.
              Al registrarte, consientes el procesamiento de tus datos según se describe en dicha política.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">4. Responsabilidades del Usuario</h4>
            <p className="text-gray-700">
              Eres responsable de mantener la confidencialidad de tu cuenta y contraseña.
              Debes notificarnos inmediatamente sobre cualquier uso no autorizado de tu cuenta.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">5. Limitaciones</h4>
            <p className="text-gray-700">
              Nos reservamos el derecho de modificar, suspender o discontinuar el servicio en cualquier momento.
              No seremos responsables por daños indirectos o consecuenciales derivados del uso del servicio.
            </p>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Última actualización: {new Date().toLocaleDateString('es-ES')}
            </p>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setShowTermsModal(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cerrar
            </button>
            <button
              onClick={() => setShowTermsModal(false)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      </Modal>

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