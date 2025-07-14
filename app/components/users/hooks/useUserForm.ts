// app/components/users/hooks/useUserForm.ts

import { useState, useCallback } from 'react';
import type { FormTab, UserFormData } from '../types/user-form.types';

export function useUserForm(initialValues?: Partial<UserFormData>) {
  const [activeTab, setActiveTab] = useState<FormTab>('basic');
  const [showPassword, setShowPassword] = useState(false);
  
  // Estado centralizado para todos los campos del formulario
  const [formData, setFormData] = useState<Partial<UserFormData>>({
    // Valores por defecto
    isActive: true,
    roles: [],
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
    // Valores iniciales si existen
    ...initialValues,
  });

  // Función para actualizar cualquier campo del formulario
  const updateField = useCallback((field: keyof UserFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Función para actualizar múltiples campos a la vez
  const updateFields = useCallback((updates: Partial<UserFormData>) => {
    setFormData(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  // Función para manejar roles
  const handleRoleToggle = useCallback((roleId: string) => {
    setFormData(prev => {
      const currentRoles = prev.roles || [];
      const newRoles = currentRoles.includes(roleId) 
        ? currentRoles.filter(id => id !== roleId)
        : [...currentRoles, roleId];
      
      return {
        ...prev,
        roles: newRoles
      };
    });
  }, []);

  // Función para alternar visibilidad de contraseña
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // Función para resetear el formulario
  const resetForm = useCallback(() => {
    setFormData({
      isActive: true,
      roles: [],
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
    });
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
        if (key === 'roles' && Array.isArray(value)) {
          // Manejar roles como array
          value.forEach(role => submitData.append('roles', role));
        } else if (typeof value === 'boolean') {
          // Manejar checkboxes
          if (value) {
            submitData.append(key, 'on');
          }
        } else {
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
    selectedRoles: formData.roles || [],
  };
}