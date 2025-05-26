// app/components/UserMenu.tsx
// Ejemplo de componente que usa los hooks de auth

import React, { useState } from 'react';
import { useAuth, useCurrentUser } from '~/context/AuthContext';
import { RoleGuard } from './AuthGuard';

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

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
      >
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <span className="hidden md:block">{user.name}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
          <div className="px-4 py-2 text-xs text-gray-500 border-b">
            {user.email}
          </div>
          
          <a
            href="/profile"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Mi Perfil
          </a>
          
          <RoleGuard requiredRole="admin">
            <a
              href="/admin"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Panel Admin
            </a>
          </RoleGuard>
          
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  );
}