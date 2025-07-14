// app/components/users/BasicInfoForm.tsx

import { 
  User, Mail, Lock, Building2, Shield, Eye, EyeOff, 
  AlertCircle, Users as UsersIcon, Check 
} from "lucide-react";
import type { FormErrors, Tenant, Role, UserFormData } from "./types/user-form.types";
import { RoleGuard } from "../AuthGuard";

interface BasicInfoFormProps {
  errors?: FormErrors;
  tenants: Tenant[];
  roles: Role[];
  selectedRoles: string[];
  showPassword: boolean;
  onRoleToggle: (roleId: string) => void;
  onTogglePasswordVisibility: () => void;
  
  // Nuevas props para manejar el estado
  formData: Partial<UserFormData>;
  onFieldChange: (field: keyof UserFormData, value: any) => void;
}

export default function BasicInfoForm({
  errors,
  tenants,
  roles,
  selectedRoles,
  showPassword,
  onRoleToggle,
  onTogglePasswordVisibility,
  formData,
  onFieldChange
}: BasicInfoFormProps) {
  
  // Manejador genérico para cambios en inputs
  const handleInputChange = (field: keyof UserFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value = e.target.type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked
      : e.target.value;
    onFieldChange(field, value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="h-4 w-4 inline mr-1" />
              Correo Electronico *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email || ''}
              onChange={handleInputChange('email')}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors?.email ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="usuario@ejemplo.com"
            />
            {errors?.email && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              <Lock className="h-4 w-4 inline mr-1" />
              Contraseña *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                required
                value={formData.password || ''}
                onChange={handleInputChange('password')}
                className={`w-full px-3 py-2 pr-10 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors?.password ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Mínimo 6 caracteres"
              />
              <button
                type="button"
                onClick={onTogglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
            {errors?.password && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.password}
              </p>
            )}
          </div>

          {/* Nombre */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              <User className="h-4 w-4 inline mr-1" />
              Nombres *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name || ''}
              onChange={handleInputChange('name')}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors?.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Nombre del usuario"
            />
            {errors?.name && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Apellido */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
              <User className="h-4 w-4 inline mr-1" />
              Apellidos
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName || ''}
              onChange={handleInputChange('lastName')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Apellido del usuario"
            />
          </div>

          {/* Tenant */}
          <div>
            <label htmlFor="tenantId" className="block text-sm font-medium text-gray-700 mb-2">
              <Building2 className="h-4 w-4 inline mr-1" />
              Tenant *
            </label>
            <select
              id="tenantId"
              name="tenantId"
              required
              value={formData.tenantId || ''}
              onChange={handleInputChange('tenantId')}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors?.tenantId ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Seleccionar tenant</option>
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </option>
              ))}
            </select>
            {errors?.tenantId && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.tenantId}
              </p>
            )}
          </div>

          {/* Estado */}
          <div>
            <label htmlFor="isActive" className="block text-sm font-medium text-gray-700 mb-2">
              <Shield className="h-4 w-4 inline mr-1" />
              Estado
            </label>
            <select
              id="isActive"
              name="isActive"
              value={formData.isActive ? "true" : "false"}
              onChange={(e) => onFieldChange('isActive', e.target.value === "true")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </div>
        </div>

        <RoleGuard requiredRole="admin">
          {/* Roles */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <UsersIcon className="h-4 w-4 inline mr-1" />
              Roles
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedRoles.includes(role.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => onRoleToggle(role.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{role.name}</div>
                      {role.description && (
                        <div className="text-sm text-gray-500">{role.description}</div>
                      )}
                    </div>
                    {selectedRoles.includes(role.id) && (
                      <Check className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  {/* Hidden inputs para envío del formulario */}
                  {selectedRoles.includes(role.id) && (
                    <input
                      type="hidden"
                      name="roles"
                      value={role.id}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </RoleGuard>
      </div>
    </div>
  );
}