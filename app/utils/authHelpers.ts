// app/utils/authHelpers.ts
// Utilidades adicionales para autenticación

export const authHelpers = {
  // Verificar si el usuario tiene permisos para una acción específica
  canPerformAction: (userRoles: string[], requiredRoles: string[], requireAll = false): boolean => {
    if (!userRoles || userRoles.length === 0) return false;
    
    return requireAll 
      ? requiredRoles.every(role => userRoles.includes(role))
      : requiredRoles.some(role => userRoles.includes(role));
  },

  // Formatear información del usuario para mostrar
  formatUserInfo: (user: any) => {
    if (!user) return null;
    
    return {
      initials: user.name.split(' ').map((n: string) => n.charAt(0)).join('').toUpperCase(),
      fullName: user.name,
      email: user.email,
      primaryRole: user.roles?.[0] || 'user',
      roleCount: user.roles?.length || 0,
    };
  },

  // Verificar si la sesión está próxima a expirar
  isSessionExpiring: (token: string, bufferMinutes = 5): boolean => {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();
      const bufferTime = bufferMinutes * 60 * 1000;
      
      return (expirationTime - currentTime) < bufferTime;
    } catch {
      return true;
    }
  },

  // Obtener información del token sin verificar la firma
  getTokenInfo: (token: string) => {
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        userId: payload.sub,
        email: payload.email,
        roles: payload.roles || [],
        issuedAt: new Date(payload.iat * 1000),
        expiresAt: new Date(payload.exp * 1000),
      };
    } catch {
      return null;
    }
  },
};