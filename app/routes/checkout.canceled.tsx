// app/routes/checkout.canceled.tsx
import { Link } from "@remix-run/react";

export default function CheckoutCanceled() {
  return (
    <div className="max-w-lg mx-auto my-12 p-6 bg-white rounded-lg shadow-md">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-6">
          <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Pago cancelado</h1>
        
        <p className="text-gray-600 mb-8">
          Has cancelado el proceso de pago. No te preocupes, no se ha realizado ningún cargo.
        </p>
        
        <div className="space-y-3">
          <Link
            to="/products"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            Volver a los productos
          </Link>
          
          <Link
            to="/"
            className="block w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded transition-colors"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}