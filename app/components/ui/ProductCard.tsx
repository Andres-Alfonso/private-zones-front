// app/components/ProductCard.tsx

import { Form } from "@remix-run/react";
import { StripeProduct } from '~/api/types/stripe.types';

interface ProductCardProps {
  product: StripeProduct;
  price?: string; // Añadimos un campo para el precio (si está disponible)
}

export default function ProductCard({ product, price }: ProductCardProps) {
  // Formatear la fecha de creación
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Si hay imágenes, mostrar la primera */}
      {product.images && product.images.length > 0 ? (
        <div className="h-48 overflow-hidden">
          <img 
            src={product.images[0]} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="h-48 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500">Sin imagen</span>
        </div>
      )}
      
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{product.name}</h2>
          {product.active ? (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              Activo
            </span>
          ) : (
            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
              Inactivo
            </span>
          )}
        </div>
        
        <p className="text-gray-600 mt-2">{product.description}</p>
        
        <div className="mt-3 text-sm text-gray-500">
          <p>Tipo: {product.type}</p>
          <p>Creado: {formatDate(product.created)}</p>
          {price && <p className="text-lg font-semibold text-gray-800 mt-2">${price}</p>}
        </div>
        
        <Form method="POST" action="/checkout">
          <input type="hidden" name="productId" value={product.id} />
          <button 
            type="submit" 
            className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Comprar ahora
          </button>
        </Form>
      </div>
    </div>
  );
}