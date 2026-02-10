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


  const documentTypes = [
    { value: "CC", label: "Cédula de Ciudadanía" },
    { value: "TI", label: "Tarjeta de Identidad" },
    { value: "CE", label: "Cédula de Extranjería" },
    { value: "PA", label: "Pasaporte" },
    { value: "RC", label: "Registro Civil" },
    { value: "NIT", label: "NIT (Número de Identificación Tributaria)" },
    // { value: "PEP", label: "Permiso Especial de Permanencia" },
    { value: "DNI", label: "Documento Nacional de Identidad" },
    // { value: "ID", label: "Documento de Identidad (General)" },
    // { value: "DL", label: "Licencia de Conducción" },
    // { value: "SSN", label: "Número de Seguridad Social" },
    // { value: "CURP", label: "CURP (México)" },
    // { value: "RUT", label: "RUT (Chile)" },
    { value: "OTHER", label: "Otro" },
  ];

  const handleProfileConfigChange = (
    field: keyof UserFormData["profileConfig"]
  ) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    onFieldChange("profileConfig", {
      ...formData.profileConfig,
      [field]: e.target.value,
    });
  };

  
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
              value={formData.profileConfig?.bio || ''}
              onChange={handleProfileConfigChange('bio')}
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
              value={formData.profileConfig?.phoneNumber || ''}
              onChange={handleProfileConfigChange('phoneNumber')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="+57 300 123 4567"
            />
          </div>

          {/* Tipo de Identificación */}
          <div>
            <label htmlFor="type_document" className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="h-4 w-4 inline mr-1" />
              Tipo de Identificación
            </label>
            <select
              id="type_document"
              name="type_document"
              value={formData.profileConfig?.type_document || 'CC'}  // Default a CC si está vacío
              onChange={handleProfileConfigChange('type_document')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {/* <option value="">Seleccionar tipo</option> */}
              {documentTypes.map((doc) => (
                <option key={doc.value} value={doc.value}>
                  {doc.label}
                </option>
              ))}
            </select>
          </div>

          {/* Número de Identificación */}
          <div>
            <label htmlFor="documentNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Número de Identificación
            </label>
            <input
              type="text"
              id="documentNumber"
              name="documentNumber"
              value={formData.profileConfig?.documentNumber || ''}
              onChange={handleProfileConfigChange('documentNumber')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="123456789"
            />
          </div>

          {/* Organización */}
          <div>
            <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-2">
              <Building2 className="h-4 w-4 inline mr-1" />
              Organización
            </label>
            <input
              type="text"
              id="organization"
              name="organization"
              value={formData.profileConfig?.organization || ''}
              onChange={handleProfileConfigChange('organization')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nombre de la empresa"
            />
          </div>

          {/* Cargo */}
          <div>
            <label htmlFor="charge" className="block text-sm font-medium text-gray-700 mb-2">
              <Briefcase className="h-4 w-4 inline mr-1" />
              Cargo
            </label>
            <input
              type="text"
              id="charge"
              name="charge"
              value={formData.profileConfig?.charge || ''}
              onChange={handleProfileConfigChange('charge')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Desarrollador, Gerente, etc."
            />
          </div>

          {/* Género */}
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
              Género
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.profileConfig?.gender || ''}
              onChange={handleProfileConfigChange('gender')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Seleccionar género</option>
              <option value="MASCULINO">Masculino</option>
              <option value="FEMENINO">Femenino</option>
              <option value="OTRO">Otro</option>
              <option value="PREFIERO_NO_DECIR">Prefiero no decir</option>
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
              value={formData.profileConfig?.dateOfBirth || ''}
              onChange={handleProfileConfigChange('dateOfBirth')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Ciudad */}
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="h-4 w-4 inline mr-1" />
              Ciudad
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.profileConfig?.city || ''}
              onChange={handleProfileConfigChange('city')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Bogotá"
            />
          </div>

          {/* País */}
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
              <Globe className="h-4 w-4 inline mr-1" />
              País
            </label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.profileConfig?.country || ''}
              onChange={handleProfileConfigChange('country')}
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
              value={formData.profileConfig?.address || ''}
              onChange={handleProfileConfigChange('address')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Calle 123 #45-67, Bogotá"
            />
          </div>
        </div>
      </div>
    </div>
  );
}