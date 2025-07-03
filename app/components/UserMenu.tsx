// app/components/UserMenu.tsx

import React, { useState } from 'react';
import { useAuth, useCurrentUser } from '~/context/AuthContext';
import { RoleGuard } from './AuthGuard';
import { ChevronDown } from 'lucide-react';

export function UserMenu() {
  const { logout } = useAuth();
  const { user, isAuthenticated } = useCurrentUser();
  const [isOpen, setIsOpen] = useState(false);

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Obtener iniciales del usuario
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Obtener color del avatar según el rol
  const getAvatarColor = (roles: string[]) => {
    if (roles.includes('admin')) return 'from-red-500 to-red-600';
    if (roles.includes('instructor')) return 'from-purple-500 to-purple-600';
    if (roles.includes('student')) return 'from-blue-500 to-blue-600';
    return 'from-gray-500 to-gray-600';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-xl text-white/90 hover:text-white hover:bg-white/10 focus:outline-none transition-all duration-200 group"
      >
        {/* Avatar mejorado */}
        <div className={`w-10 h-10 bg-gradient-to-br ${getAvatarColor(user.roles)} rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-105`}>
          {getInitials(user.name)}
        </div>
        
        <span className="hidden md:block font-medium">{user.name}</span>
        
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 z-50">
          {/* Menú con tema moderno */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 py-1 overflow-hidden">
            {/* Header del usuario */}
            <div className="px-4 py-3 text-xs text-gray-600 border-b border-gray-200/50 bg-gray-50/50">
              <div className="flex items-center space-x-2">
                <div className={`w-6 h-6 bg-gradient-to-br ${getAvatarColor(user.roles)} rounded-lg flex items-center justify-center text-white text-xs font-bold`}>
                  {getInitials(user.name)}
                </div>
                <span className="truncate">{user.email}</span>
              </div>
            </div>
            
            <a
              href="/profile"
              className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100/50 transition-colors duration-200"
            >
              Mi Perfil
            </a>
            
            <RoleGuard requiredRole="admin">
              <a
                href="/admin"
                className="block px-4 py-3 text-sm text-gray-700 hover:bg-purple-50/50 transition-colors duration-200"
              >
                Panel Admin
              </a>
            </RoleGuard>
            
            <div className="border-t border-gray-200/50 my-1"></div>
            
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50/50 transition-colors duration-200"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}