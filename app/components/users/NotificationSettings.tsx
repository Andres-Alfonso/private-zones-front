// app/components/users/NotificationSettings.tsx

import type { UserFormData } from "./types/user-form.types";

interface NotificationSettingsProps {
  formData: Partial<UserFormData>;
  onFieldChange: (field: keyof UserFormData, value: any) => void;
}

interface SettingItem {
  name: keyof UserFormData;
  label: string;
  defaultChecked: boolean;
}

export default function NotificationSettings({ 
  formData, 
  onFieldChange 
}: NotificationSettingsProps) {
  
  const generalSettings: SettingItem[] = [
    { name: 'enableNotifications', label: 'Habilitar notificaciones', defaultChecked: true },
    { name: 'smsNotifications', label: 'Notificaciones SMS', defaultChecked: false },
    { name: 'browserNotifications', label: 'Notificaciones del navegador', defaultChecked: false },
  ];

  const categorySettings: SettingItem[] = [
    { name: 'securityAlerts', label: 'Alertas de seguridad', defaultChecked: true },
    { name: 'accountUpdates', label: 'Actualizaciones de cuenta', defaultChecked: false },
    { name: 'systemUpdates', label: 'Actualizaciones del sistema', defaultChecked: true },
    { name: 'marketingEmails', label: 'Emails de marketing', defaultChecked: false },
    { name: 'newsletterEmails', label: 'Newsletter', defaultChecked: false },
    { name: 'reminders', label: 'Recordatorios', defaultChecked: true },
    { name: 'mentions', label: 'Menciones', defaultChecked: true },
    { name: 'directMessages', label: 'Mensajes directos', defaultChecked: true },
  ];

  const getValue = (name: keyof UserFormData, fallback: boolean) => {
    return formData[name] !== undefined ? formData[name] as boolean : fallback;
  };

  const handleToggleChange = (name: keyof UserFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    onFieldChange(name, e.target.checked);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración de Notificaciones</h3>
        
        <div className="space-y-6">
          {/* Configuraciones generales */}
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-3">Configuración General</h4>
            <div className="space-y-3">
              {generalSettings.map((setting) => (
                <SettingToggle
                  key={setting.name}
                  name={setting.name}
                  label={setting.label}
                  checked={getValue(setting.name, setting.defaultChecked)}
                  onChange={handleToggleChange(setting.name)}
                />
              ))}
            </div>
          </div>

          {/* Categorías de notificaciones */}
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-3">Categorías de Notificaciones</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {categorySettings.map((setting) => (
                <SettingToggle
                  key={setting.name}
                  name={setting.name}
                  label={setting.label}
                  checked={getValue(setting.name, setting.defaultChecked)}
                  onChange={handleToggleChange(setting.name)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SettingToggleProps {
  name: keyof UserFormData;
  label: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function SettingToggle({ name, label, checked, onChange }: SettingToggleProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div>
        <label htmlFor={name} className="font-medium text-gray-700 cursor-pointer">
          {label}
        </label>
      </div>
      <input
        type="checkbox"
        id={name}
        name={name}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
      />
    </div>
  );
}