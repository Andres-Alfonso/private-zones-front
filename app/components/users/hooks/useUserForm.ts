// app/components/users/hooks/useUserForm.ts

import { useState } from 'react';
import type { FormTab, UserFormData } from '../types/user-form.types';

export function useUserForm(initialValues?: Partial<UserFormData>) {
  const [activeTab, setActiveTab] = useState<FormTab>('basic');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(
    initialValues?.roles || []
  );

  const [formData, setFormData] = useState<Partial<UserFormData>>({
    isActive: true,
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
    ...initialValues,
  });

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles(prev => {
      const newRoles = prev.includes(roleId) 
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId];
      
      setFormData(prev => ({ ...prev, roles: newRoles }));
      return newRoles;
    });
  };

  const updateFormData = (data: Partial<UserFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  return {
    activeTab,
    setActiveTab,
    showPassword,
    togglePasswordVisibility,
    selectedRoles,
    handleRoleToggle,
    formData,
    updateFormData,
  };
}