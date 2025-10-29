// ~/components/tenant/viewCustomizers/RegistrationViewCustomizer.tsx

import { useState } from 'react';
import { User, Settings, Mail, Eye, EyeOff } from 'lucide-react';
import Input from '~/components/ui/Input';
import Checkbox from '~/components/ui/Checkbox';

export enum LoginMethod {
  EMAIL = 'email',
  DOCUMENT = 'document',
  BOTH = 'both',
}

interface RegistrationSettings {
  // Configuración de registro y login
  allowSelfRegistration: boolean;
  allowGoogleLogin: boolean;
  allowFacebookLogin: boolean;
  loginMethod: LoginMethod;
  allowValidationStatusUsers: boolean;
  
  // Campos requeridos en registro
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

interface RegistrationViewCustomizerProps {
  onChange: (field: string, value: any) => void;
  isSubmitting: boolean;
  errors: Record<string, string>;
  settings: RegistrationSettings;
}

export default function RegistrationViewCustomizer({
  onChange,
  isSubmitting,
  errors,
  settings
}: RegistrationViewCustomizerProps) {
  const [showRequiredFields, setShowRequiredFields] = useState(false);

  const handleChange = (field: string, value: any) => {
    onChange(field, value);
  };

  const loginMethodOptions = [
    { value: LoginMethod.EMAIL, label: 'Solo Email' },
    { value: LoginMethod.DOCUMENT, label: 'Solo Documento' },
    { value: LoginMethod.BOTH, label: 'Email o Documento' }
  ];

  const requiredFields = [
    { key: 'requireLastName', label: 'Apellido', icon: User },
    { key: 'requirePhone', label: 'Teléfono', icon: User },
    { key: 'requireDocumentType', label: 'Tipo de Identificación', icon: User },
    { key: 'requireDocument', label: 'Número de Identificación', icon: User },
    { key: 'requireOrganization', label: 'Organización', icon: User },
    { key: 'requirePosition', label: 'Cargo', icon: User },
    { key: 'requireGender', label: 'Género', icon: User },
    { key: 'requireCity', label: 'Ciudad', icon: User },
    { key: 'requireAddress', label: 'Dirección', icon: User }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Configuración de Registro */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <User className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900">Configuración de Registro</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Checkbox
            id="allowSelfRegistration"
            name="allowSelfRegistration"
            label="Permitir auto-registro"
            checked={settings.allowSelfRegistration}
            onChange={(checked) => handleChange('allowSelfRegistration', checked)}
            disabled={isSubmitting}
            helperText="Permite que los usuarios se registren por sí mismos"
          />

          <Checkbox
            id="allowValidationStatusUsers"
            name="allowValidationStatusUsers"
            label="Validar estado de usuarios"
            checked={settings.allowValidationStatusUsers}
            onChange={(checked) => handleChange('allowValidationStatusUsers', checked)}
            disabled={isSubmitting}
            helperText="Solo usuarios activos pueden iniciar sesión"
          />
        </div>
      </div>

      {/* Métodos de Login */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900">Métodos de Autenticación</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="loginMethod" className="block text-sm font-medium text-gray-700 mb-2">
              Método de Login *
            </label>
            <select
              id="loginMethod"
              name="loginMethod"
              value={settings.loginMethod}
              onChange={(e) => handleChange('loginMethod', e.target.value as LoginMethod)}
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {loginMethodOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.loginMethod && (
              <p className="mt-1 text-sm text-red-600">{errors.loginMethod}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Checkbox
              id="allowGoogleLogin"
              name="allowGoogleLogin"
              label="Login con Google"
              checked={settings.allowGoogleLogin}
              onChange={(checked) => handleChange('allowGoogleLogin', checked)}
              disabled={isSubmitting}
              helperText="Permitir autenticación con Google"
            />

            <Checkbox
              id="allowFacebookLogin"
              name="allowFacebookLogin"
              label="Login con Facebook"
              checked={settings.allowFacebookLogin}
              onChange={(checked) => handleChange('allowFacebookLogin', checked)}
              disabled={isSubmitting}
              helperText="Permitir autenticación con Facebook"
            />
          </div>
        </div>
      </div>

      {/* Campos Requeridos en Registro */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Campos Requeridos en Registro</h3>
          </div>
          <button
            type="button"
            onClick={() => setShowRequiredFields(!showRequiredFields)}
            className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
            disabled={isSubmitting}
          >
            {showRequiredFields ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span>{showRequiredFields ? 'Ocultar' : 'Mostrar'} campos</span>
          </button>
        </div>

        {showRequiredFields && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            {requiredFields.map(field => (
              <Checkbox
                key={field.key}
                id={field.key}
                name={field.key}
                label={field.label}
                checked={settings[field.key as keyof RegistrationSettings] as boolean}
                onChange={(checked) => handleChange(field.key, checked)}
                disabled={isSubmitting}
              />
            ))}
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <User className="h-5 w-5 text-blue-400 mt-0.5" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Información sobre configuración de registro
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Al deshabilitar el auto-registro, solo los administradores podrán crear usuarios</li>
                <li>Los campos marcados como requeridos serán obligatorios en el formulario de registro</li>
                <li>El método de login determina qué campo se utilizará para la autenticación</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}