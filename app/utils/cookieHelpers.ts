// app/utils/cookieHelpers.ts
// Utilidades para manejar cookies

export interface CookieOptions {
  expires?: Date;
  maxAge?: number;
  domain?: string;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

export const cookieHelpers = {
  // Obtener una cookie por nombre
  get: (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    
    if (parts.length === 2) {
      const cookieValue = parts.pop()?.split(';').shift();
      return cookieValue ? decodeURIComponent(cookieValue) : null;
    }
    
    return null;
  },

  // Establecer una cookie
  set: (name: string, value: string, options: CookieOptions = {}): void => {
    if (typeof document === 'undefined') return;
    
    const {
      expires,
      maxAge,
      domain,
      path = '/',
      secure = process.env.NODE_ENV === 'production',
      sameSite = 'lax'
    } = options;

    let cookieString = `${name}=${encodeURIComponent(value)}`;
    
    if (expires) {
      cookieString += `; expires=${expires.toUTCString()}`;
    }
    
    if (maxAge) {
      cookieString += `; max-age=${maxAge}`;
    }
    
    if (domain) {
      cookieString += `; domain=${domain}`;
    }
    
    cookieString += `; path=${path}`;
    
    if (secure) {
      cookieString += `; secure`;
    }
    
    cookieString += `; samesite=${sameSite}`;
    
    document.cookie = cookieString;
  },

  // Eliminar una cookie
  remove: (name: string, options: Partial<CookieOptions> = {}): void => {
    if (typeof document === 'undefined') return;
    
    const { domain, path = '/' } = options;
    
    let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
    
    if (domain) {
      cookieString += `; domain=${domain}`;
    }
    
    document.cookie = cookieString;
  },

  // Obtener y parsear cookie JSON
  getJSON: (name: string): any => {
    const value = cookieHelpers.get(name);
    if (!value) return null;
    
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  },

  // Establecer cookie con valor JSON
  setJSON: (name: string, value: any, options: CookieOptions = {}): void => {
    try {
      const jsonString = JSON.stringify(value);
      cookieHelpers.set(name, jsonString, options);
    } catch (error) {
      console.error('Error setting JSON cookie:', error);
    }
  },

  // Limpiar todas las cookies de autenticación
  clearAuth: (): void => {
    cookieHelpers.remove('auth_tokens');
    cookieHelpers.remove('auth_user');
  }
};