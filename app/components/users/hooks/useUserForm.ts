// app/components/users/hooks/useUserForm.ts

import { useState, useCallback, useEffect } from 'react';
import type { FormTab } from '../types/user-form.types';
import type { UserFormData } from '~/api/types/user.types';

export function useUserForm(initialValues?: Partial<UserFormData>) {
  const [activeTab, setActiveTab] = useState<FormTab>('basic');
  const [showPassword, setShowPassword] = useState(false);
  
  // Valores por defecto que coinciden exactamente con UserFormData
  const defaultValues: Partial<UserFormData> = {
    email: '',
    name: '',
    lastName: '',
    password: '',
    tenantId: '',
    roleIds: [],
    isActive: true,
    
    profileConfig: {
      phoneNumber: '',
      dateOfBirth: '',
      bio: '',
      gender: '',
      charge: '',
      type_document: '',
      documentNumber: '',
      organization: '',
      address: '',
      city: '',
      country: '',
    },
    
    notificationConfig: {
      enableNotifications: true,
      smsNotifications: false,
      browserNotifications: false,
      securityAlerts: true,
      accountUpdates: false,
      systemUpdates: true,
      marketingEmails: false,
      newsletterEmails: false,
      reminders: true,
      mentions: true,
      directMessages: true,
    },
  };

  // Función para fusionar valores de manera profunda y segura
  const deepMerge = (target: any, source: any): any => {
    if (!source || typeof source !== 'object') {
      return target;
    }
    
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] !== null && source[key] !== undefined) {
        if (typeof source[key] === 'object' && !Array.isArray(source[key]) && source[key] !== null) {
          result[key] = deepMerge(target[key] || {}, source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }
    
    return result;
  };

  // Estado centralizado para todos los campos del formulario
  const [formData, setFormData] = useState<Partial<UserFormData>>(() => {
    if (initialValues) {
      // console.log('useUserForm - Valores iniciales recibidos:', initialValues);
      const merged = deepMerge(defaultValues, initialValues);
      // console.log('useUserForm - Valores después del merge:', merged);
      return merged;
    }
    // console.log('useUserForm - Usando valores por defecto');
    return defaultValues;
  });

  // Efecto para actualizar cuando cambien los valores iniciales
  useEffect(() => {
    if (initialValues) {
      // console.log('useUserForm - Actualizando con nuevos valores iniciales:', initialValues);
      const merged = deepMerge(defaultValues, initialValues);
      // console.log('useUserForm - Estado actualizado:', merged);
      setFormData(merged);
    }
  }, [initialValues]);

  // Función para actualizar cualquier campo del formulario
  const updateField = useCallback((field: keyof UserFormData, value: any) => {
    // console.log(`useUserForm - Actualizando campo ${field}:`, value);
    setFormData(prev => {
      let updated;
      
      if (field === 'profileConfig' && typeof value === 'object') {
        // Para profileConfig, hacer merge con el objeto existente
        updated = {
          ...prev,
          profileConfig: {
            ...prev.profileConfig,
            ...value
          }
        };
      } else if (field === 'notificationConfig' && typeof value === 'object') {
        // Para notificationConfig, hacer merge con el objeto existente
        updated = {
          ...prev,
          notificationConfig: {
            ...prev.notificationConfig,
            ...value
          }
        };
      } else {
        // Para otros campos, actualización directa
        updated = {
          ...prev,
          [field]: value
        };
      }
      
      // console.log('useUserForm - Estado después de actualización:', updated);
      return updated;
    });
  }, []);

  // Función para actualizar múltiples campos a la vez
  const updateFields = useCallback((updates: Partial<UserFormData>) => {
    // console.log('useUserForm - Actualizando múltiples campos:', updates);
    setFormData(prev => {
      const merged = deepMerge(prev, updates);
      // console.log('useUserForm - Estado después de múltiples actualizaciones:', merged);
      return merged;
    });
  }, []);

  // Función para manejar roles
  const handleRoleToggle = useCallback((roleId: string) => {
    console.log('useUserForm - Toggle role:', roleId);
    setFormData(prev => {
      const currentRoles = prev.roleIds || [];
      const newRoles = currentRoles.includes(roleId) 
        ? currentRoles.filter(id => id !== roleId)
        : [...currentRoles, roleId];
      
      const updated = {
        ...prev,
        roleIds: newRoles
      };
      
      // console.log('useUserForm - Roles actualizados:', newRoles);
      return updated;
    });
  }, []);

  // Función para alternar visibilidad de contraseña
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // Función para resetear el formulario
  const resetForm = useCallback(() => {
    // console.log('useUserForm - Reseteando formulario');
    setFormData(defaultValues);
  }, []);

  // Obtener valor de un campo específico
  const getFieldValue = useCallback((field: keyof UserFormData) => {
    return formData[field];
  }, [formData]);

  // Obtener todos los valores como FormData para envío
  const getFormDataForSubmit = useCallback(() => {
    const submitData = new FormData();
    
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'roleIds' && Array.isArray(value)) {
          // Manejar roles como array
          value.forEach(role => submitData.append('roles', role));
        } else if (key === 'profileConfig' && typeof value === 'object') {
          // Manejar profileConfig
          Object.entries(value).forEach(([profileKey, profileValue]) => {
            if (profileValue !== undefined && profileValue !== null && profileValue !== '') {
              submitData.append(profileKey, String(profileValue));
            }
          });
        } else if (key === 'notificationConfig' && typeof value === 'object') {
          // Manejar notificationConfig
          Object.entries(value).forEach(([notifKey, notifValue]) => {
            if (typeof notifValue === 'boolean') {
              if (notifValue) {
                submitData.append(notifKey, 'on');
              }
            }
          });
        } else if (typeof value === 'boolean') {
          // Manejar checkboxes
          if (value) {
            submitData.append(key, 'on');
          }
        } else if (value !== '') {
          submitData.append(key, String(value));
        }
      }
    });
    
    return submitData;
  }, [formData]);

  return {
    // Estado de pestañas
    activeTab,
    setActiveTab,
    
    // Estado de contraseña
    showPassword,
    togglePasswordVisibility,
    
    // Estado del formulario
    formData,
    updateField,
    updateFields,
    resetForm,
    getFieldValue,
    getFormDataForSubmit,
    
    // Funciones específicas
    handleRoleToggle,
    
    // Valores calculados
    selectedRoles: formData.roleIds || [],
  };
}