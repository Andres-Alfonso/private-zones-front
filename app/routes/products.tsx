// app/routes/products.tsx con protección de autenticación

import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import type { MetaFunction, LoaderFunction } from "@remix-run/node";
import ProductCard from '~/components/ui/ProductCard';
import AuthGuard from '~/components/AuthGuard';
import { useAuth, useCurrentUser } from '~/context/AuthContext';
import { StripeProductListResponse } from '~/api/types/stripe.types';
import { API_CONFIG } from '~/api/config';

export const meta: MetaFunction = () => {
  return [
    { title: "Productos - Mi Tienda" },
    { name: "description", content: "Catálogo de productos disponibles" },
  ];
};

// Loader para cargar datos desde el servidor
export const loader: LoaderFunction = async () => {
  try {
    // Usando fetch directamente en el servidor
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PAYMENTS.STRIPE.FIND_ALL}`);
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const data: StripeProductListResponse = await response.json();
    return json({ products: data.data, error: null });
  } catch (error: any) {
    console.error('Error loading products:', error);
    return json({ products: [], error: error.message || 'Error al cargar los productos' });
  }
};

// Componente interno con la lógica de productos
function ProductsContent() {
  const { products, error } = useLoaderData<{
    products: StripeProductListResponse['data'],
    error: string | null
  }>();
  
  const { user } = useCurrentUser();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header con información del usuario */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Nuestros Productos</h1>
          
          {user && (
            <div className="text-right">
              <p className="text-sm text-gray-600">Bienvenido,</p>
              <p className="font-semibold text-gray-800">{user.name}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {user.roles.map((role) => (
                  <span 
                    key={role}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Estado de error */}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
          Error: {error}
        </div>
      )}
      
      {/* Si no hay productos */}
      {products.length === 0 && !error && (
        <div className="text-center py-10">
          <p className="text-gray-600 text-lg">No hay productos disponibles en este momento.</p>
        </div>
      )}
      
      {/* Grid de productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      {/* Panel de administración solo para admins */}
      <AdminPanel />
    </div>
  );
}

// Componente que solo se muestra para administradores
function AdminPanel() {
  const { user, hasRole } = useCurrentUser();
  const { logout } = useAuth();
  
  // Solo mostrar si el usuario es admin
  if (!hasRole('admin')) {
    return null;
  }

  return (
    <div className="mt-12 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="text-lg font-semibold text-yellow-800 mb-4">
        Panel de Administración
      </h3>
      <p className="text-yellow-700 mb-4">
        Tienes permisos de administrador. Desde aquí puedes gestionar productos y usuarios.
      </p>
      <div className="space-x-4">
        <button className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition-colors">
          Gestionar Productos
        </button>
        <button className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition-colors">
          Gestionar Usuarios
        </button>
        <button 
          onClick={logout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}

// Componente principal con protección de autenticación
export default function ProductsPage() {
  return (
    <AuthGuard>
      <ProductsContent />
    </AuthGuard>
  );
}