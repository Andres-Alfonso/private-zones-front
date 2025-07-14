// app/components/users/index.ts

// Componentes principales
export { default as UserForm } from './UserForm';
export { default as FormTabs } from './FormTabs';
export { default as BasicInfoForm } from './BasicInfoForm';
export { default as ProfileInfoForm } from './ProfileInfoForm';
export { default as NotificationSettings } from './NotificationSettings';

// Hooks
export { useUserForm } from './hooks/useUserForm';

// Tipos
export type {
  FormTab,
  Tenant,
  Role,
  FormErrors,
  UserFormData,
  LoaderData,
  ActionData,
  TabConfig
} from './types/user-form.types';