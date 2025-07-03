import { Link } from "@remix-run/react";
import { useAuth, useCurrentUser } from '~/context/AuthContext';
import { UserMenu } from './UserMenu';
import { RoleGuard } from './AuthGuard';
import { 
  BookOpen, 
  GraduationCap, 
  Settings, 
  Package, 
  LayoutDashboard,
  Building2,
  ChevronDown,
  Menu,
  X,
  Crown,
  Sparkles,
  User
} from 'lucide-react';
import { useState } from 'react';

const getRoleIcon = (roles: string[]) => {
  if (roles.includes('admin')) return <Crown className="h-3 w-3" />;
  if (roles.includes('instructor')) return <Sparkles className="h-3 w-3" />;
  return <User className="h-3 w-3" />;
};

export default function Header() {
  const { state } = useAuth();
  const { isAuthenticated, user } = useCurrentUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Header principal */}
      <header className="fixed top-0 left-0 right-0 z-50">
        {/* Fondo con blur y gradiente */}
        <div className="absolute inset-0 bg-[#484848] border-b border-white/10"></div>
        
        {/* Contenido del header */}
        <div className="relative">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex items-center justify-between h-16">
              
              {/* Logo y nombre de la app */}
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  <div className="w-12 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <span className="text-white font-bold text-sm">K&LM</span>
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                </div>
                <div className="hidden sm:block">
                  <span className="text-xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                    Mi Aplicación
                  </span>
                  {/* <div className="text-xs text-blue-200/70 -mt-1">
                    Sistema de Gestión
                  </div> */}
                </div>
              </Link>
              
              {/* Navegación principal - Desktop */}
              <nav className="hidden lg:flex items-center space-x-2">
                <NavLink to="/" icon={<LayoutDashboard className="h-4 w-4" />}>
                  Inicio
                </NavLink>
                
                {isAuthenticated && (
                  <>
                    {/* Dropdown de Cursos */}
                    <div className="relative group">
                      <button className="flex items-center space-x-2 px-4 py-2 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200 font-medium group-hover:shadow-lg">
                        <BookOpen className="h-4 w-4" />
                        <span>Cursos</span>
                        <ChevronDown className="h-3 w-3 transition-transform duration-200 group-hover:rotate-180" />
                      </button>
                      
                      {/* Dropdown Menu */}
                      <div className="absolute top-full left-0 mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
                          <div className="p-2">
                            <DropdownLink 
                              to="/courses" 
                              icon={<BookOpen className="h-4 w-4" />}
                              title="Catálogo"
                              description="Explora todos los cursos"
                            />
                            
                            <DropdownLink 
                              to="/courses/my-courses" 
                              icon={<GraduationCap className="h-4 w-4" />}
                              title="Mis Cursos"
                              description="Cursos en progreso"
                            />
                            
                            <RoleGuard requiredRoles={['admin', 'instructor']} requireAll={false}>
                              <div className="border-t border-gray-200/50 my-2"></div>
                              <DropdownLink 
                                to="/courses/create" 
                                icon={<div className="text-green-600 font-bold">+</div>}
                                title="Crear Curso"
                                description="Nuevo contenido"
                              />
                              
                              <DropdownLink 
                                to="/courses/manage" 
                                icon={<Settings className="h-4 w-4" />}
                                title="Gestionar"
                                description="Administrar cursos"
                              />
                            </RoleGuard>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <NavLink to="/products" icon={<Package className="h-4 w-4" />}>
                      Productos
                    </NavLink>
                    
                    <NavLink to="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />}>
                      Dashboard
                    </NavLink>
                    
                    <RoleGuard requiredRole="admin">
                      <NavLink 
                        to="/tenants" 
                        icon={<Building2 className="h-4 w-4" />}
                        variant="primary"
                      >
                        Clientes
                      </NavLink>
                    </RoleGuard>
                  </>
                )}
              </nav>
              
              {/* Sección de autenticación */}
              <div className="flex items-center space-x-4">
                {isAuthenticated ? (
                  <div className="flex items-center space-x-3">
                    {/* Indicador de estado de carga */}
                    {state.isLoading && (
                      <div className="flex items-center space-x-2 px-3 py-1 bg-white/10 rounded-lg backdrop-blur-sm">
                        <div className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin"></div>
                        <span className="text-sm text-white/80 hidden sm:block">Cargando...</span>
                      </div>
                    )}
                    
                    {/* Información rápida del usuario - Desktop */}
                    <div className="hidden xl:block text-right mr-2 space-y-1">
                      {/* Nombre del usuario (opcional, descomenta si lo quieres mostrar) */}
                      {/* <div className="text-sm font-medium text-white">
                        {user?.name}
                      </div> */}

                      {/* Roles del usuario */}
                      <div className="text-xs text-blue-200/80">
                        {user?.roles
                          .map(role => role.charAt(0).toUpperCase() + role.slice(1))
                          .join(', ')}
                      </div>

                      {/* Ícono del rol principal (o compuesto) */}
                      <div className="relative inline-flex items-center justify-center w-5 h-5 bg-white/90 rounded-full shadow-lg">
                        <div className="text-gray-600 text-xs">
                          {getRoleIcon(user?.roles)}
                        </div>
                      </div>
                    </div>

                    {/* Menú de usuario */}
                    <div className="relative">
                      <UserMenu />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Link 
                      to="/auth/login" 
                      className="text-white/80 hover:text-white transition-colors font-medium px-4 py-2 rounded-xl hover:bg-white/10"
                    >
                      Iniciar Sesión
                    </Link>
                    <Link 
                      to="/auth/register" 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      Registrarse
                    </Link>
                  </div>
                )}
                
                {/* Botón menú móvil */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
                >
                  {isMobileMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Navegación móvil */}
      {isAuthenticated && (
        <div className={`fixed top-16 left-0 right-0 z-40 lg:hidden transition-all duration-300 ${
          isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}>
          <div className="bg-[#484848]/98 backdrop-blur-xl border-b border-white/10">
            <div className="container mx-auto px-4 py-6">
              <div className="grid grid-cols-2 gap-3">
                <MobileNavLink 
                  to="/courses" 
                  icon={<BookOpen className="h-5 w-5" />}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Cursos
                </MobileNavLink>
                
                <MobileNavLink 
                  to="/courses/my-courses" 
                  icon={<GraduationCap className="h-5 w-5" />}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Mis Cursos
                </MobileNavLink>
                
                <MobileNavLink 
                  to="/products" 
                  icon={<Package className="h-5 w-5" />}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Productos
                </MobileNavLink>
                
                <MobileNavLink 
                  to="/dashboard" 
                  icon={<LayoutDashboard className="h-5 w-5" />}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </MobileNavLink>
                
                <RoleGuard requiredRoles={['admin', 'instructor']} requireAll={false}>
                  <MobileNavLink 
                    to="/courses/create" 
                    icon={<div className="text-green-400 font-bold text-lg">+</div>}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Crear Curso
                  </MobileNavLink>
                  
                  <MobileNavLink 
                    to="/courses/manage" 
                    icon={<Settings className="h-5 w-5" />}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Gestionar
                  </MobileNavLink>
                </RoleGuard>
                
                <RoleGuard requiredRole="admin">
                  <MobileNavLink 
                    to="/tenants" 
                    icon={<Building2 className="h-5 w-5" />}
                    variant="primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Clientes
                  </MobileNavLink>
                </RoleGuard>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Spacer para el contenido */}
      <div className="h-16"></div>
    </>
  );
}

// Componente para enlaces de navegación principal
function NavLink({ 
  to, 
  children, 
  icon, 
  variant = "default" 
}: { 
  to: string; 
  children: React.ReactNode; 
  icon?: React.ReactNode;
  variant?: "default" | "primary";
}) {
  const baseClasses = "flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:scale-105";
  const variantClasses = variant === "primary" 
    ? "bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg hover:shadow-xl hover:from-gray-700 hover:to-gray-800"
    : "text-white/90 hover:text-white hover:bg-white/10 hover:shadow-lg";

  return (
    <Link to={to} className={`${baseClasses} ${variantClasses}`}>
      {icon}
      <span>{children}</span>
    </Link>
  );
}

// Componente para enlaces del dropdown
function DropdownLink({ 
  to, 
  icon, 
  title, 
  description 
}: { 
  to: string; 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <Link 
      to={to} 
      className="block px-4 py-3 rounded-xl hover:bg-gray-100/50 transition-all duration-200 group"
    >
      <div className="flex items-start space-x-3">
        <div className="p-2 rounded-lg bg-gray-100/50 group-hover:bg-gray-200/50 transition-colors">
          {icon}
        </div>
        <div>
          <div className="font-medium text-gray-900 group-hover:text-gray-800">
            {title}
          </div>
          <div className="text-xs text-gray-600 mt-0.5">
            {description}
          </div>
        </div>
      </div>
    </Link>
  );
}

// Componente para navegación móvil
function MobileNavLink({ 
  to, 
  children, 
  icon, 
  variant = "default",
  onClick 
}: { 
  to: string; 
  children: React.ReactNode; 
  icon?: React.ReactNode;
  variant?: "default" | "primary";
  onClick?: () => void;
}) {
  const baseClasses = "flex items-center space-x-3 p-4 rounded-xl transition-all duration-200 group";
  const variantClasses = variant === "primary" 
    ? "bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg hover:shadow-xl"
    : "text-white/90 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10";

  return (
    <Link 
      to={to} 
      className={`${baseClasses} ${variantClasses}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors">
        {icon}
      </div>
      <span className="font-medium">{children}</span>
    </Link>
  );
}