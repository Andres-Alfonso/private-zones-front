// app/components/forums/ForumSettings.tsx

import { Settings, Calendar, Pin, Eye } from "lucide-react";

interface ForumSettingsProps {
  isActive: boolean;
  isPinned: boolean;
  expirationDate: string;
  onIsActiveChange: (value: boolean) => void;
  onIsPinnedChange: (value: boolean) => void;
  onExpirationDateChange: (value: string) => void;
}

export function ForumSettings({
  isActive,
  isPinned,
  expirationDate,
  onIsActiveChange,
  onIsPinnedChange,
  onExpirationDateChange
}: ForumSettingsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Settings className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Configuración</h2>
          <p className="text-sm text-gray-600">Opciones avanzadas del foro</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Estado Activo */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Eye className="h-5 w-5 text-gray-600" />
            <div>
              <label htmlFor="isActive" className="text-sm font-medium text-gray-900">
                Foro Activo
              </label>
              <p className="text-xs text-gray-600">
                Los usuarios podrán ver y participar en este foro
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => onIsActiveChange(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        {/* Foro Fijado */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Pin className="h-5 w-5 text-gray-600" />
            <div>
              <label htmlFor="isPinned" className="text-sm font-medium text-gray-900">
                Fijar Foro
              </label>
              <p className="text-xs text-gray-600">
                El foro aparecerá al inicio de la lista
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              id="isPinned"
              checked={isPinned}
              onChange={(e) => onIsPinnedChange(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        {/* Fecha de Expiración */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3 mb-3">
            <Calendar className="h-5 w-5 text-gray-600" />
            <div>
              <label htmlFor="expirationDate" className="text-sm font-medium text-gray-900">
                Fecha de Expiración
              </label>
              <p className="text-xs text-gray-600">
                El foro se cerrará automáticamente en esta fecha
              </p>
            </div>
          </div>
          <input
            type="datetime-local"
            id="expirationDate"
            value={expirationDate}
            onChange={(e) => onExpirationDateChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>
    </div>
  );
}