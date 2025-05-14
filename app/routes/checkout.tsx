// app/routes/checkout.tsx
import { redirect, ActionFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { API_CONFIG } from "~/api/config";

// Esta acción se ejecutará cuando se envíe el formulario desde el ProductCard
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const productId = formData.get("productId") as string;
  
  // Comprobar que tenemos el ID del producto
  if (!productId) {
    return new Response("ID de producto no proporcionado", { status: 400 });
  }

  try {
    // Llamamos a nuestro backend para crear la sesión de checkout
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PAYMENTS.STRIPE.CREATE_CHECKOUT_SESSION}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    // Obtenemos la URL de la sesión de checkout
    const { url } = await response.json();
    
    // Redirigimos al usuario a la página de checkout de Stripe
    return redirect(url);
  } catch (error) {
    console.error("Error al crear la sesión de checkout:", error);
    return new Response("Error al procesar el pago. Por favor, inténtalo de nuevo.", {
      status: 500,
    });
  }
};

// Convertimos este componente en un layout que renderizará las rutas hijas
export default function CheckoutLayout() {
  return <Outlet />;
}