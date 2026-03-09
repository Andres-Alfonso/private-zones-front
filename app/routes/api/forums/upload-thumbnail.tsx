// app/routes/api/forums/upload-thumbnail.tsx
import { ActionFunction, json } from "@remix-run/node";
import { createApiClientFromRequest } from "~/api/client";

export const action: ActionFunction = async ({ request }) => {
    if (request.method !== "POST") {
        return json({ error: "Method not allowed" }, { status: 405 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const courseId = formData.get("courseId") as string | null;

    if (!file) {
        return json({ error: "El archivo es requerido" }, { status: 400 });
    }

    try {
        const apiClient = createApiClientFromRequest(request);

        const backendFormData = new FormData();
        backendFormData.append("file", file);
        if (courseId) backendFormData.append("courseId", courseId);

        const response = await apiClient.post(
            "/v1/forums/upload-thumbnail",
            backendFormData,
            {
                headers: { "Content-Type": "multipart/form-data" },
                timeout: 3 * 60 * 1000, // 3 min (imágenes no necesitan más)
            },
        );

        return json(response.data);
    } catch (error: any) {
        console.error("[forum thumbnail proxy] Error:", error.message);

        const status = error.response?.status || 500;
        const message =
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            "Error al subir la imagen";

        return json({ error: message }, { status });
    }
};

export const loader = () => json({ error: "Not found" }, { status: 404 });