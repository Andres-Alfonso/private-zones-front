// Interfaces compartidas con el backend

export interface LoginRequest {
    email: string;
    password: string;
  }
  
  export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
  }
  
  export interface LoginResponse {
    token: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
  }
  
  export interface AuthState {
    user: LoginResponse['user'] | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
  }