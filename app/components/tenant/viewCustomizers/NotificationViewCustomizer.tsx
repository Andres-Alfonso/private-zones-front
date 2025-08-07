// ~/components/tenant/viewCustomizers/NotificationViewCustomizer.tsx

import { useState } from 'react';
import { Bell, Mail, Settings, Info } from 'lucide-react';
import Checkbox from '~/components/ui/Checkbox';

interface NotificationSettings {
  enableEmailNotifications: boolean;
  // Puedes agregar más configuraciones de notificaciones aquí en el futuro
  // enableSMSNotifications: boolean;
  // enablePushNotifications: boolean;
  // notificationFrequency: string;
}

interface NotificationViewCustomizerProps {
  onChange: (field: string, value: any) => void;
  isSubmitting: boolean;
  errors: Record<string, string>;
  settings: NotificationSettings;
}

export default function NotificationViewCustomizer({
  onChange,
  isSubmitting,
  errors,
  settings
}: NotificationViewCustomizerProps) {

  const handleChange = (field: string, value: any) => {
    onChange(field, value);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Configuración de Notificaciones */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900">Configuración de Notificaciones</h3>
        </div>

        <div className="space-y-4">
          <Checkbox
            id="enableEmailNotifications"
            name="enableEmailNotifications"
            label="Notificaciones por Email"
            checked={settings.enableEmailNotifications}
            onChange={(checked) => handleChange('enableEmailNotifications', checked)}
            disabled={isSubmitting}
            helperText="Permitir el envío de notificaciones por correo electrónico a los usuarios"
          />

          {/* Aquí puedes agregar más tipos de notificaciones en el futuro */}
          {/* 
          <Checkbox
            id="enableSMSNotifications"
            name="enableSMSNotifications"
            label="Notificaciones por SMS"
            checked={settings.enableSMSNotifications}
            onChange={(checked) => handleChange('enableSMSNotifications', checked)}
            disabled={isSubmitting}
            helperText="Permitir el envío de notificaciones por SMS"
          />

          <Checkbox
            id="enablePushNotifications"
            name="enablePushNotifications"
            label="Notificaciones Push"
            checked={settings.enablePushNotifications}
            onChange={(checked) => handleChange('enablePushNotifications', checked)}
            disabled={isSubmitting}
            helperText="Permitir notificaciones push en la aplicación"
          />
          */}
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <Info className="h-5 w-5 text-blue-400 mt-0.5" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Información sobre notificaciones
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Las notificaciones por email incluyen: bienvenida, restablecimiento de contraseña</li>
                <li>Los usuarios pueden personalizar sus preferencias de notificación desde su perfil</li>
                {/* <li>Las notificaciones críticas del sistema siempre se enviarán independientemente de esta configuración</li> */}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Sección para futuras configuraciones */}
      <div className="border-t pt-6">
        <div className="flex items-center space-x-2 mb-4">
          <Settings className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-400">Configuraciones Avanzadas</h3>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Próximamente</span>
        </div>
        
        <div className="text-sm text-gray-500">
          En futuras versiones podrás configurar:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Frecuencia de notificaciones</li>
            <li>Plantillas de email personalizadas</li>
            {/* <li>Integración con servicios de terceros</li> */}
            {/* <li>Notificaciones SMS y Push</li> */}
          </ul>
        </div>
      </div>
    </div>
  );
}