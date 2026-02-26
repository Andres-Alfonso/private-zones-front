// app/routes/api/contents/$contentId/signed-url.tsx
import { LoaderFunction, json } from '@remix-run/node';
import { createApiClientFromRequest } from '~/api/client';

export const loader: LoaderFunction = async ({ request, params }) => {
    const apiClient = createApiClientFromRequest(request);

    try {
        const response = await apiClient.get(
            `/v1/contents/${params.contentId}/signed-url`
        );
        return json(response.data);
    } catch (error: any) {
        return json(
            { error: error.response?.data?.message || 'Error al obtener URL' },
            { status: error.response?.status || 500 }
        );
    }
};