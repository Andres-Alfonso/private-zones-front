// app/routes/productos.tsx con loader del servidor

import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import type { MetaFunction, LoaderFunction } from "@remix-run/node";
import ProductCard from '~/components/ui/ProductCard';
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

export default function ProductosPage() {
  const { products, error } = useLoaderData<{
    products: StripeProductListResponse['data'],
    error: string | null
  }>();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Nuestros Productos</h1>
      
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
    </div>
  );
}