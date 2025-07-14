// app/components/users/UserForm.tsx

import { Form, useNavigation } from "@remix-run/react";
import { Save, X, AlertCircle } from "lucide-react";
import FormTabs from "./FormTabs";
import BasicInfoForm from "./BasicInfoForm";
import ProfileInfoForm from "./ProfileInfoForm";
import NotificationSettings from "./NotificationSettings";
import { useUserForm } from "./hooks/useUserForm";
import type { ActionData, LoaderData, UserFormData } from "./types/user-form.types";
import { useEffect } from "react";

interface UserFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<UserFormData>;
  actionData?: ActionData;
  loaderData: LoaderData;
  onCancel?: () => void;
}

export default function UserForm({ 
  mode, 
  initialData, 
  actionData, 
  loaderData,
  onCancel 
}: UserFormProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const {
    activeTab,
    setActiveTab,
    showPassword,
    togglePasswordVisibility,
    selectedRoles,
    handleRoleToggle,
    formData,
    updateField,
    updateFields,
  } = useUserForm(initialData);

  const { tenants, roles } = loaderData;

  // Sincronizar con valores de actionData si hay errores de validación
  useEffect(() => {
    if (actionData?.values) {
      updateFields(actionData.values);
    }
  }, [actionData?.values, updateFields]);

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      window.history.back();
    }
  };

  // Función para manejar el envío del formulario
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // El formulario se enviará normalmente, pero necesitamos asegurar
    // que todos los valores estén en los campos hidden o sean manejados correctamente
    
    // Agregar campos hidden para todos los valores del estado
    const form = e.currentTarget;
    const existingHiddenInputs = form.querySelectorAll('input[type="hidden"][data-state-field]');
    existingHiddenInputs.forEach(input => input.remove());

    // Agregar campos hidden para valores que podrían no estar en la pestaña actual
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && key !== 'roles') {
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = key;
        hiddenInput.value = typeof value === 'boolean' ? (value ? 'on' : '') : String(value);
        hiddenInput.setAttribute('data-state-field', 'true');
        form.appendChild(hiddenInput);
      }
    });

    // Manejar roles por separado
    if (formData.roles && Array.isArray(formData.roles)) {
      formData.roles.forEach(roleId => {
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'roles';
        hiddenInput.value = roleId;
        hiddenInput.setAttribute('data-state-field', 'true');
        form.appendChild(hiddenInput);
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Form method="post" className="space-y-6" onSubmit={handleSubmit}>
        {/* Contenedor principal del formulario */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
          {/* Pestañas */}
          <FormTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Contenido de las pestañas */}
          <div className="p-6">
            {activeTab === 'basic' && (
              <BasicInfoForm
                errors={actionData?.errors}
                tenants={tenants}
                roles={roles}
                selectedRoles={selectedRoles}
                showPassword={showPassword}
                onRoleToggle={handleRoleToggle}
                onTogglePasswordVisibility={togglePasswordVisibility}
                formData={formData}
                onFieldChange={updateField}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileInfoForm 
                formData={formData}
                onFieldChange={updateField}
              />
            )}

            {activeTab === 'notifications' && (
              <NotificationSettings 
                formData={formData}
                onFieldChange={updateField}
              />
            )}
          </div>
        </div>

        {/* Error general */}
        {actionData?.errors?.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-red-800">{actionData.errors.general}</p>
            </div>
          </div>
        )}

        {/* Indicador de estado del formulario en desarrollo */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <details>
              <summary className="cursor-pointer text-blue-800 font-medium">
                Debug: Estado del formulario
              </summary>
              <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto max-h-40">
                {JSON.stringify(formData, null, 2)}
              </pre>
            </details>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:shadow-md transition-all duration-200"
          >
            <X className="h-4 w-4 inline mr-2" />
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Save className="h-4 w-4 inline mr-2" />
            {isSubmitting 
              ? (mode === 'create' ? 'Creando...' : 'Guardando...') 
              : (mode === 'create' ? 'Crear Usuario' : 'Guardar Cambios')
            }
          </button>
        </div>
      </Form>
    </div>
  );
}