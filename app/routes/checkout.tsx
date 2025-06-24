// app/routes/checkout.tsx
import { redirect, ActionFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { API_CONFIG } from "~/api/config";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  console.log('Form data received:', Object.fromEntries(formData.entries()));
  
  // Extraer todos los datos del formulario
  const productId = formData.get("productId") as string;
  const userId = formData.get("userId") as string;
  const clientId = formData.get("clientId") as string;
  const userEmail = formData.get("userEmail") as string;
  const userName = formData.get("userName") as string;
  const successUrl = formData.get("successUrl") as string;
  const cancelUrl = formData.get("cancelUrl") as string;
  const planTitle = formData.get("planTitle") as string;
  const planPrice = formData.get("planPrice") as string;
  const planType = formData.get("planType") as string;
  
  if (!productId || !userId || !clientId) {
    return new Response("Datos requeridos no proporcionados", { status: 400 });
  }

  try {
    // Llamar al backend con todos los metadatos
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PAYMENTS.STRIPE.CREATE_CHECKOUT_SESSION}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        productId,
        metadata: {
          userId,
          clientId,
          userEmail,
          userName,
          planTitle,
          planPrice,
          planType
        },
        successUrl,
        cancelUrl
      }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const { url } = await response.json();
    return redirect(url);
  } catch (error) {
    console.error("Error al crear la sesión de checkout:", error);
    return new Response("Error al procesar el pago. Por favor, inténtalo de nuevo.", {
      status: 500,
    });
  }
};

export default function CheckoutLayout() {
  return <Outlet />;
}