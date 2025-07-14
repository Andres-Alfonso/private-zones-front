// app/components/users/ProfileInfoForm.tsx

import { 
  Phone, FileText, Building2, Briefcase, Calendar, 
  MapPin, Globe, Home 
} from "lucide-react";
import type { UserFormData } from "./types/user-form.types";

interface ProfileInfoFormProps {
  formData: Partial<UserFormData>;
  onFieldChange: (field: keyof UserFormData, value: any) => void;
}

export default function ProfileInfoForm({ 
  formData, 
  onFieldChange 
}: ProfileInfoFormProps) {
  
  // Manejador genérico para cambios en inputs
  const handleInputChange = (field: keyof UserFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    onFieldChange(field, e.target.value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Perfil</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bio */}
          <div className="md:col-span-2">
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
              Biografía
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={3}
              value={formData.bio || ''}
              onChange={handleInputChange('bio')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Breve descripción del usuario"
            />
          </div>

          {/* Teléfono */}
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="h-4 w-4 inline mr-1" />
              Teléfono
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber || ''}
              onChange={handleInputChange('phoneNumber')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="+57 300 123 4567"
            />
          </div>

          {/* Tipo de documento */}
          <div>
            <label htmlFor="type_document" className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="h-4 w-4 inline mr-1" />
              Tipo de Documento
            </label>
            <select
              id="type_document"
              name="type_document"
              value={formData.type_document || ''}
              onChange={handleInputChange('type_document')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Seleccionar tipo</option>
              <option value="DNI">DNI</option>
              <option value="Passport">Pasaporte</option>
              <option value="License">Licencia</option>
              <option value="Other">Otro</option>
            </select>
          </div>

          {/* Número de documento */}
          <div>
            <label htmlFor="documentNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Número de Documento
            </label>
            <input
              type="text"
              id="documentNumber"
              name="documentNumber"
              value={formData.documentNumber || ''}
              onChange={handleInputChange('documentNumber')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="123456789"
            />
          </div>

          {/* Organización */}
          <div>
            <label htmlFor="Organization" className="block text-sm font-medium text-gray-700 mb-2">
              <Building2 className="h-4 w-4 inline mr-1" />
              Organización
            </label>
            <input
              type="text"
              id="Organization"
              name="Organization"
              value={formData.Organization || ''}
              onChange={handleInputChange('Organization')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nombre de la empresa"
            />
          </div>

          {/* Cargo */}
          <div>
            <label htmlFor="Charge" className="block text-sm font-medium text-gray-700 mb-2">
              <Briefcase className="h-4 w-4 inline mr-1" />
              Cargo
            </label>
            <input
              type="text"
              id="Charge"
              name="Charge"
              value={formData.Charge || ''}
              onChange={handleInputChange('Charge')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Desarrollador, Gerente, etc."
            />
          </div>

          {/* Género */}
          <div>
            <label htmlFor="Genger" className="block text-sm font-medium text-gray-700 mb-2">
              Género
            </label>
            <select
              id="Genger"
              name="Genger"
              value={formData.Genger || ''}
              onChange={handleInputChange('Genger')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Seleccionar género</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="Otro">Otro</option>
              <option value="Prefiero no decir">Prefiero no decir</option>
            </select>
          </div>

          {/* Fecha de nacimiento */}
          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="h-4 w-4 inline mr-1" />
              Fecha de Nacimiento
            </label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth || ''}
              onChange={handleInputChange('dateOfBirth')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Ciudad */}
          <div>
            <label htmlFor="City" className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="h-4 w-4 inline mr-1" />
              Ciudad
            </label>
            <input
              type="text"
              id="City"
              name="City"
              value={formData.City || ''}
              onChange={handleInputChange('City')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Bogotá"
            />
          </div>

          {/* País */}
          <div>
            <label htmlFor="Country" className="block text-sm font-medium text-gray-700 mb-2">
              <Globe className="h-4 w-4 inline mr-1" />
              País
            </label>
            <input
              type="text"
              id="Country"
              name="Country"
              value={formData.Country || ''}
              onChange={handleInputChange('Country')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Colombia"
            />
          </div>

          {/* Dirección */}
          <div className="md:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              <Home className="h-4 w-4 inline mr-1" />
              Dirección
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address || ''}
              onChange={handleInputChange('address')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Calle 123 #45-67, Bogotá"
            />
          </div>
        </div>
      </div>
    </div>
  );
}