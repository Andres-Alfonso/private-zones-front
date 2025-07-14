// app/components/users/FormTabs.tsx

import { User, FileText, Bell } from "lucide-react";
import type { FormTab, TabConfig } from "./types/user-form.types";

interface FormTabsProps {
  activeTab: FormTab;
  onTabChange: (tab: FormTab) => void;
}

const tabs: TabConfig[] = [
  {
    id: 'basic',
    name: 'Información Básica',
    icon: User,
    description: 'Datos principales del usuario'
  },
  {
    id: 'profile',
    name: 'Perfil',
    icon: FileText,
    description: 'Información adicional del perfil'
  },
  {
    id: 'notifications',
    name: 'Notificaciones',
    icon: Bell,
    description: 'Configuración de notificaciones'
  }
];

export default function FormTabs({ activeTab, onTabChange }: FormTabsProps) {
  return (
    <div className="border-b border-gray-200/50">
      <nav className="flex space-x-8 px-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              title={tab.description}
            >
              <Icon className="h-5 w-5" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}