// app/routes/api/contents/upload.tsx
import { ActionFunction, json } from "@remix-run/node";
import { createApiClientFromRequest } from "~/api/client";

// Solo acepta POST
export const action: ActionFunction = async ({ request }) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const contentType = formData.get("contentType") as string | null;
  const courseId = formData.get("courseId") as string | null;

  if (!file || !contentType) {
    return json({ error: "Faltan parámetros: file y contentType son requeridos" }, { status: 400 });
  }

  try {
    // Reutiliza el mismo auth que el resto de tu app
    const apiClient = createApiClientFromRequest(request);

    // Reconstruir FormData para reenviar al NestJS
    const backendFormData = new FormData();
    backendFormData.append("file", file);
    backendFormData.append("contentType", contentType);
    if (courseId) backendFormData.append("courseId", courseId);

    const response = await apiClient.post("/v1/contents/upload", backendFormData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 10 * 60 * 1000, // 10 min para videos grandes
    });

    return json(response.data);

  } catch (error: any) {
    console.error("[upload proxy] Error:", error.message);

    const status = error.response?.status || 500;
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Error al subir el archivo";

    return json({ error: message }, { status });
  }
};

// Bloquear GET u otros métodos
export const loader = () => {
  return json({ error: "Not found" }, { status: 404 });
};