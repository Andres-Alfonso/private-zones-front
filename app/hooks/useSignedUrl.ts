// app/hooks/useSignedUrl.ts
import { useState, useEffect, useRef } from 'react';

interface SignedUrlResult {
    url: string | null;
    loading: boolean;
    error: string | null;
    refresh: () => void;
}

export function useSignedUrl(contentId: string | null): SignedUrlResult {
    const [url, setUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fetchUrl = async () => {
        if (!contentId) return;

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/contents/${contentId}/signed-url`);
            if (!res.ok) throw new Error('No se pudo obtener el acceso al contenido');

            const data = await res.json();
            setUrl(data.url);

            // Si es firmada, refrescar 5 minutos antes de que expire
            if (data.signed && data.expiresIn) {
                const refreshIn = (data.expiresIn - 300) * 1000; // 5min antes
                timerRef.current = setTimeout(fetchUrl, refreshIn);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUrl();
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [contentId]);

    return { url, loading, error, refresh: fetchUrl };
}