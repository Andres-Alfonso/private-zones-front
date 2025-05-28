// app/routes/checkout.success.tsx
import { useSearchParams, Link } from "@remix-run/react";

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <div className="max-w-lg mx-auto my-12 p-6 bg-white rounded-lg shadow-md">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
          <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-4">¡Pago realizado con éxito!</h1>
        
        <p className="text-gray-600 mb-8">
          Tu pedido ha sido procesado correctamente. Te hemos enviado un correo electrónico con los detalles de tu compra.
        </p>
        
        {sessionId && (
          <p className="text-sm text-gray-500 mb-6">
            Referencia de pago: {sessionId}
          </p>
        )}
        
        <div className="space-y-3">
          <a
            href="/products"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            Ver más productos
          </a>
          
          <Link
            to="/"
            className="block w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}