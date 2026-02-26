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
  tenantId: string | undefined;
  initialData?: Partial<UserFormData>;
  actionData?: ActionData;
  loaderData: LoaderData;
  onCancel?: () => void;
}

export default function UserForm({ 
  mode, 
  tenantId,
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget;
    
    // Eliminar campos hidden anteriores
    const existingHiddenInputs = form.querySelectorAll('input[type="hidden"][data-state-field]');
    existingHiddenInputs.forEach(input => input.remove());

    // Función auxiliar para crear un input hidden
    const createHiddenInput = (name: string, value: string) => {
      const hiddenInput = document.createElement('input');
      hiddenInput.type = 'hidden';
      hiddenInput.name = name;
      hiddenInput.value = value;
      hiddenInput.setAttribute('data-state-field', 'true');
      return hiddenInput;
    };

    let normalizedProfileConfig:any = null;
    if (formData.profileConfig) {
      normalizedProfileConfig = { ...formData.profileConfig };
      
      // Limpiar campos que no deben enviarse si están vacíos
      Object.keys(normalizedProfileConfig).forEach(key => {
        const value = normalizedProfileConfig[key];
        
        // Eliminar campos vacíos o null
        if (value === '' || value === null || value === undefined) {
          delete normalizedProfileConfig[key];
        }
        
        // Validación especial para dateOfBirth
        if (key === 'dateOfBirth' && value) {
          const date = new Date(value);
          // Si la fecha es inválida, eliminarla
          if (isNaN(date.getTime())) {
            delete normalizedProfileConfig[key];
          }
        }
      });
    }

    // Solo serializar objetos complejos (profileConfig, notificationConfig)
    if (formData.profileConfig) {
      form.appendChild(createHiddenInput('profileConfig', JSON.stringify(formData.profileConfig)));
    }
    
    if (formData.notificationConfig) {
      form.appendChild(createHiddenInput('notificationConfig', JSON.stringify(formData.notificationConfig)));
    }

    // Manejar roles específicamente si no hay checkboxes en el form
    if (formData.roleIds && Array.isArray(formData.roleIds)) {
      formData.roleIds.forEach(roleId => {
        form.appendChild(createHiddenInput('roles', roleId));
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Form method="post" className="space-y-6" onSubmit={handleSubmit}>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
          <FormTabs activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="p-6">
            <div className={activeTab === 'basic' ? 'block' : 'hidden'}>
              <BasicInfoForm
                errors={actionData?.errors}
                tenantId={tenantId}
                tenants={tenants}
                roles={roles}
                selectedRoles={selectedRoles}
                showPassword={showPassword}
                onRoleToggle={handleRoleToggle}
                onTogglePasswordVisibility={togglePasswordVisibility}
                formData={formData}
                onFieldChange={updateField}
              />
            </div>

            <div className={activeTab === 'profile' ? 'block' : 'hidden'}>
              <ProfileInfoForm 
                formData={formData}
                onFieldChange={updateField}
              />
            </div>

            <div className={activeTab === 'notifications' ? 'block' : 'hidden'}>
              <NotificationSettings 
                formData={formData}
                onFieldChange={updateField}
              />
            </div>
          </div>
        </div>

        {actionData?.errors?.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-red-800">{actionData.errors.general}</p>
            </div>
          </div>
        )}

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