// app/routes/dashboard.tsx

import AuthGuard from '~/components/AuthGuard';
import { useCurrentUser } from '~/context/AuthContext';
import { RoleGuard } from '~/components/AuthGuard';

export default function Dashboard() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}

function DashboardContent() {
  const { user, hasRole } = useCurrentUser();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Información del usuario */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Mi Información</h2>
          <p><strong>Nombre:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Roles:</strong> {user?.roles.join(', ')}</p>
        </div>

        {/* Panel solo para usuarios */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Mis Productos</h2>
          <p>Ver mis compras y suscripciones</p>
          <a href="/products" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded">
            Ver Productos
          </a>
        </div>

        {/* Panel solo para admins */}
        <RoleGuard requiredRoles={['superadmin', 'admin']}>
          <div className="bg-yellow-50 p-6 rounded-lg shadow border border-yellow-200">
            <h2 className="text-xl font-semibold mb-4 text-yellow-800">Panel Admin</h2>
            <p className="text-yellow-700">Gestión de usuarios y productos</p>
            <div className="mt-4 space-x-2">
              <button className="bg-yellow-600 text-white px-4 py-2 rounded">
                Usuarios
              </button>
              <button className="bg-yellow-600 text-white px-4 py-2 rounded">
                Productos
              </button>
            </div>
          </div>
        </RoleGuard>
      </div>
    </div>
  );
}