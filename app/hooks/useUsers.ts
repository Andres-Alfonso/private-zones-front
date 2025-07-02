// app/api/hooks/useUsers.ts

import { useState, useEffect, useCallback } from 'react';
import { UsersAPI } from '../endpoints/users';
import { User, UserFilters, UserStats, CreateUserRequest, UpdateUserRequest } from '../types/user.types';

interface UseUsersState {
  users: User[];
  stats: UserStats | null;
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
}

const initialState: UseUsersState = {
  users: [],
  stats: null,
  isLoading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 20,
};

export function useUsers(initialFilters?: UserFilters) {
  const [state, setState] = useState<UseUsersState>(initialState);
  const [filters, setFilters] = useState<UserFilters>(initialFilters || {});

  // Cargar usuarios
  const loadUsers = useCallback(async (newFilters?: UserFilters) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const currentFilters = newFilters || filters;
      const response = await UsersAPI.getAll(currentFilters);
      
      setState(prev => ({
        ...prev,
        users: response.data,
        total: response.total,
        page: response.page,
        limit: response.limit,
        isLoading: false,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Error al cargar usuarios',
        isLoading: false,
      }));
    }
  }, [filters]);

  // Cargar estadísticas
  const loadStats = useCallback(async () => {
    try {
      const stats = await UsersAPI.getStats();
      setState(prev => ({ ...prev, stats }));
    } catch (error: any) {
      console.error('Error loading user stats:', error);
    }
  }, []);

  // Crear usuario
  const createUser = useCallback(async (userData: CreateUserRequest): Promise<User | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const newUser = await UsersAPI.create(userData);
      
      // Actualizar la lista de usuarios
      setState(prev => ({
        ...prev,
        users: [newUser, ...prev.users],
        total: prev.total + 1,
        isLoading: false,
      }));

      return newUser;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Error al crear usuario',
        isLoading: false,
      }));
      return null;
    }
  }, []);

  // Actualizar usuario
  const updateUser = useCallback(async (id: string, userData: UpdateUserRequest): Promise<User | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const updatedUser = await UsersAPI.update(id, userData);
      
      // Actualizar en la lista
      setState(prev => ({
        ...prev,
        users: prev.users.map(user => 
          user.id === id ? updatedUser : user
        ),
        isLoading: false,
      }));

      return updatedUser;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Error al actualizar usuario',
        isLoading: false,
      }));
      return null;
    }
  }, []);

  // Eliminar usuario
  const deleteUser = useCallback(async (id: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await UsersAPI.delete(id);
      
      // Remover de la lista
      setState(prev => ({
        ...prev,
        users: prev.users.filter(user => user.id !== id),
        total: prev.total - 1,
        isLoading: false,
      }));

      return true;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Error al eliminar usuario',
        isLoading: false,
      }));
      return false;
    }
  }, []);

  // Toggle estado activo
  const toggleUserActive = useCallback(async (id: string): Promise<boolean> => {
    try {
      const updatedUser = await UsersAPI.toggleActive(id);
      
      // Actualizar en la lista
      setState(prev => ({
        ...prev,
        users: prev.users.map(user => 
          user.id === id ? updatedUser : user
        ),
      }));

      return true;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Error al cambiar estado del usuario',
      }));
      return false;
    }
  }, []);

  // Acciones masivas
  const bulkAction = useCallback(async (
    action: 'delete' | 'activate' | 'deactivate' | 'assign-role',
    userIds: string[],
    data?: any
  ): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await UsersAPI.bulkActions(action, userIds, data);
      
      // Recargar la lista después de acciones masivas
      await loadUsers();
      
      return true;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Error en acción masiva',
        isLoading: false,
      }));
      return false;
    }
  }, [loadUsers]);

  // Actualizar filtros
  const updateFilters = useCallback((newFilters: Partial<UserFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    loadUsers(updatedFilters);
  }, [filters, loadUsers]);

  // Limpiar filtros
  const clearFilters = useCallback(() => {
    const clearedFilters = { page: 1, limit: filters.limit || 20 };
    setFilters(clearedFilters);
    loadUsers(clearedFilters);
  }, [filters.limit, loadUsers]);

  // Cambiar página
  const changePage = useCallback((newPage: number) => {
    updateFilters({ page: newPage });
  }, [updateFilters]);

  // Cambiar límite por página
  const changeLimit = useCallback((newLimit: number) => {
    updateFilters({ limit: newLimit, page: 1 });
  }, [updateFilters]);

  // Limpiar errores
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    loadUsers();
    loadStats();
  }, []);

  return {
    // Estado
    users: state.users,
    stats: state.stats,
    isLoading: state.isLoading,
    error: state.error,
    total: state.total,
    page: state.page,
    limit: state.limit,
    filters,

    // Acciones
    loadUsers,
    loadStats,
    createUser,
    updateUser,
    deleteUser,
    toggleUserActive,
    bulkAction,

    // Filtros y navegación
    updateFilters,
    clearFilters,
    changePage,
    changeLimit,

    // Utilidades
    clearError,
    refresh: () => loadUsers(),
  };
}

// Hook específico para un usuario individual
export function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUser = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const userData = await UsersAPI.getById(userId);
      setUser(userData);
    } catch (error: any) {
      setError(error.message || 'Error al cargar usuario');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const updateUser = useCallback(async (userData: UpdateUserRequest): Promise<boolean> => {
    if (!userId) return false;

    setIsLoading(true);
    setError(null);

    try {
      const updatedUser = await UsersAPI.update(userId, userData);
      setUser(updatedUser);
      return true;
    } catch (error: any) {
      setError(error.message || 'Error al actualizar usuario');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const changePassword = useCallback(async (newPassword: string, forceChange?: boolean): Promise<boolean> => {
    if (!userId) return false;

    try {
      await UsersAPI.changePassword(userId, newPassword, forceChange);
      return true;
    } catch (error: any) {
      setError(error.message || 'Error al cambiar contraseña');
      return false;
    }
  }, [userId]);

  const assignRoles = useCallback(async (roles: string[]): Promise<boolean> => {
    if (!userId) return false;

    try {
      const updatedUser = await UsersAPI.assignRoles(userId, roles);
      setUser(updatedUser);
      return true;
    } catch (error: any) {
      setError(error.message || 'Error al asignar roles');
      return false;
    }
  }, [userId]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return {
    user,
    isLoading,
    error,
    loadUser,
    updateUser,
    changePassword,
    assignRoles,
    clearError: () => setError(null),
  };
}

// Hook para búsqueda de usuarios
export function useUserSearch() {
  const [results, setResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string, filters?: Partial<UserFilters>) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const searchResults = await UsersAPI.search(query, filters);
      setResults(searchResults);
    } catch (error: any) {
      setError(error.message || 'Error en la búsqueda');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    isSearching,
    error,
    search,
    clearSearch,
  };
}

// Hook para validación de email
export function useEmailValidation() {
  const [isValidating, setIsValidating] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  const validateEmail = useCallback(async (email: string, excludeUserId?: string) => {
    if (!email.trim()) {
      setIsAvailable(null);
      return;
    }

    setIsValidating(true);

    try {
      const result = await UsersAPI.validateEmail(email, excludeUserId);
      setIsAvailable(result.isAvailable);
    } catch (error) {
      setIsAvailable(null);
    } finally {
      setIsValidating(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsAvailable(null);
    setIsValidating(false);
  }, []);

  return {
    isValidating,
    isAvailable,
    validateEmail,
    reset,
  };
}