// app/context/TenantContext.tsx

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Tenant, TenantContext as TenantContextType, TenantStatus } from '../api/types/tenant.types';
import { TenantsAPI } from '~/api/endpoints/tenants';

// Acciones del reducer
type TenantAction =
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_TENANT'; payload: Tenant }
    | { type: 'SET_ERROR'; payload: string }
    | { type: 'SET_INVALID' }
    | { type: 'RESET' };

// Estado inicial
const initialState: TenantContextType = {
    tenant: null,
    isLoading: true,
    error: null,
    isValid: false,
    config: null
};

// Reducer
function tenantReducer(state: TenantContextType, action: TenantAction): TenantContextType {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };

        case 'SET_TENANT':
            return {
                ...state,
                tenant: action.payload,
                config: action.payload.config || null,
                isValid: true,
                isLoading: false,
                error: null
            };

        case 'SET_ERROR':
            return {
                ...state,
                error: action.payload,
                isLoading: false,
                isValid: false,
                tenant: null,
                config: null
            };

        case 'SET_INVALID':
            return {
                ...state,
                isValid: false,
                isLoading: false,
                tenant: null,
                config: null
            };

        case 'RESET':
            return initialState;

        default:
            return state;
    }
}

// Context
const TenantContext = createContext<{
    state: TenantContextType;
    validateTenant: (domain: string) => Promise<void>;
    resetTenant: () => void;
} | null>(null);

// Hook para usar el contexto
export function useTenant() {
    const context = useContext(TenantContext);
    if (!context) {
        throw new Error('useTenant debe ser usado dentro de TenantProvider');
    }
    return context;
}

// Utilidad para extraer el dominio
function getCurrentDomain(): string {
    if (typeof window === 'undefined') {
        return 'localhost'; // Para SSR
    }

    const hostname = window.location.hostname;

    // En desarrollo, manejar casos como cardio.klmsystem.test
    if (hostname.includes('.test') || hostname.includes('.local')) {
        return hostname;
    }

    // En producción, usar el hostname completo
    return hostname;
}

// Provider
interface TenantProviderProps {
    children: React.ReactNode;
    initialDomain?: string;
}

export function TenantProvider({ children, initialDomain }: TenantProviderProps) {
    const [state, dispatch] = useReducer(tenantReducer, initialState);

    const validateTenant = async (domain?: string) => {
        const targetDomain = domain || getCurrentDomain();

        dispatch({ type: 'SET_LOADING', payload: true });

        try {
            const response = await TenantsAPI.validateByDomain(targetDomain);

            if (response.isValid && response.tenant) {
                dispatch({ type: 'SET_TENANT', payload: response.tenant });
            } else {
                dispatch({
                    type: 'SET_ERROR',
                    payload: response.message || 'Cliente no válido'
                });
            }
        } catch (error: any) {
            console.error('Error validating cliente:', error);
            dispatch({
                type: 'SET_ERROR',
                payload: 'Error al validar el cliente'
            });
        }
    };

    const resetTenant = () => {
        dispatch({ type: 'RESET' });
    };

    // Validar tenant al montar el componente
    useEffect(() => {
        const domain = initialDomain || getCurrentDomain();
        validateTenant(domain);
    }, [initialDomain]);

    // Aplicar configuración del tenant a CSS variables
    useEffect(() => {
        if (state.config && typeof document !== 'undefined') {
            const root = document.documentElement;
            root.style.setProperty('--tenant-primary-color', state.config.primaryColor);
            root.style.setProperty('--tenant-secondary-color', state.config.secondaryColor);
        }
    }, [state.config]);

    return (
        <TenantContext.Provider value={{ state, validateTenant, resetTenant }}>
            {children}
        </TenantContext.Provider>
    );
}