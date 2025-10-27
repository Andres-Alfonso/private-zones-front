// app/components/profile/ProfileEditForm.tsx
import { useState } from 'react';
import Input from '~/components/ui/Input';
import { ProfileData } from '../../api/types/user.types';
import apiClient from '~/api/client';
import { getErrorMessage, getFieldErrors } from '~/utils/errorMessages';

interface ProfileEditFormProps {
  profileData: ProfileData;
  onCancel: () => void;
  onSuccess: (data: ProfileData) => void;
}

export default function ProfileEditForm({ profileData, onCancel, onSuccess }: ProfileEditFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    
    const updateData = {
      name: formData.get('name') as string,
      lastName: formData.get('lastName') as string,
      phoneNumber: formData.get('phoneNumber') as string || null,
      organization: formData.get('organization') as string || null,
      charge: formData.get('charge') as string || null,
      city: formData.get('city') as string || null,
      country: formData.get('country') as string || null,
      address: formData.get('address') as string || null,
      bio: formData.get('bio') as string || null,
    };

    try {
      const response = await apiClient.patch('/v1/auth/profile', updateData);
      onSuccess(response.data);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      
      // Obtener mensaje de error personalizado
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      
      // Obtener errores por campo si existen
      const fieldErrs = getFieldErrors(err);
      setFieldErrors(fieldErrs);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Mensaje de error general */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">
                No se pudo actualizar el perfil
              </h3>
              <p className="mt-1 text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          type="text"
          id="name"
          name="name"
          label="Nombre"
          defaultValue={profileData.name}
          required
          disabled={isSubmitting}
          error={fieldErrors.name}
        />
        <Input
          type="text"
          id="lastName"
          name="lastName"
          label="Apellido"
          defaultValue={profileData.lastName}
          required
          disabled={isSubmitting}
          error={fieldErrors.lastName}
        />
        <Input
          type="email"
          id="email"
          name="email"
          label="Correo electrónico"
          defaultValue={profileData.email}
          required
          disabled
          helperText="El correo no se puede modificar"
        />
        <Input
          type="text"
          id="phoneNumber"
          name="phoneNumber"
          label="Teléfono"
          defaultValue={profileData.profileConfig?.phoneNumber || ''}
          disabled={isSubmitting}
          error={fieldErrors.phoneNumber}
        />
        <Input
          type="text"
          id="organization"
          name="organization"
          label="Organización"
          defaultValue={profileData.profileConfig?.organization || ''}
          disabled={isSubmitting}
          error={fieldErrors.organization}
        />
        <Input
          type="text"
          id="charge"
          name="charge"
          label="Cargo"
          defaultValue={profileData.profileConfig?.charge || ''}
          disabled={isSubmitting}
          error={fieldErrors.charge}
        />
        <Input
          type="text"
          id="city"
          name="city"
          label="Ciudad"
          defaultValue={profileData.profileConfig?.city || ''}
          disabled={isSubmitting}
          error={fieldErrors.city}
        />
        <Input
          type="text"
          id="country"
          name="country"
          label="País"
          defaultValue={profileData.profileConfig?.country || ''}
          disabled={isSubmitting}
          error={fieldErrors.country}
        />
      </div>
      
      <Input
        type="text"
        id="address"
        name="address"
        label="Dirección"
        defaultValue={profileData.profileConfig?.address || ''}
        disabled={isSubmitting}
        error={fieldErrors.address}
      />

      <div className="col-span-full">
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
          Biografía
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={3}
          defaultValue={profileData.profileConfig?.bio || ''}
          disabled={isSubmitting}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
            fieldErrors.bio ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Cuéntanos sobre ti..."
        />
        {fieldErrors.bio && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.bio}</p>
        )}
      </div>

      <div className="pt-4 flex gap-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Guardando...
            </div>
          ) : (
            'Guardar Cambios'
          )}
        </button>
      </div>
    </form>
  );
}