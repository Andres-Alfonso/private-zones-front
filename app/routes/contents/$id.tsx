// app/routes/contents/$id.tsx

import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useRouteError, isRouteErrorResponse, NavLink } from "@remix-run/react";
import { 
  Video, 
  FileText, 
  Image, 
  Globe, 
  Package, 
  Clock, 
  Calendar, 
  Tag,
  Eye,
  PlayCircle,
  Lock,
  ExternalLink,
} from "lucide-react";
import { createApiClientFromRequest } from "~/api/client";
import { ContentAPI } from "~/api/endpoints/contents";
import { ErrorDisplay, NotFoundError, ServerError } from "~/components/ErrorDisplay";

interface ContentItem {
  id: string;
  title: string;
  description: string;
  content: {
    type: 'video' | 'image' | 'document' | 'embed' | 'scorm';
    contentUrl: string;
  };
  module: {
    id: string;
    title: string;
  };
  course: {
    id: string;
    title: string;
    colorTitle: string;
  };
  navigation: {
    previousItem: { id: string; title: string; type: string; referenceId: string } | null;
    nextItem:     { id: string; title: string; type: string; referenceId: string } | null;
  };
  userProgress: {
    isCompleted: boolean;
    completionDate: string | null;
    timeSpent: number;
    bookmarked: boolean;
  };
  metadata: {
    duration: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    tags: string[];
    createdAt: string;
    updatedAt: string;
  };
}

type LoaderData = {
  content: ContentItem;
  resolvedUrl: string;   // URL final (firmada o pública)
  isPrivate: boolean;    // para mostrar indicador visual
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getContentIcon = (type: string) => {
  switch (type) {
    case 'video':    return <Video    className="h-6 w-6" />;
    case 'document': return <FileText className="h-6 w-6" />;
    case 'image':    return <Image    className="h-6 w-6" />;
    case 'embed':    return <Globe    className="h-6 w-6" />;
    case 'scorm':    return <Package  className="h-6 w-6" />;
    default:         return <FileText className="h-6 w-6" />;
  }
};

const getContentTypeColor = (type: string) => {
  switch (type) {
    case 'video':    return 'bg-red-100    text-red-800    border-red-200';
    case 'document': return 'bg-blue-100   text-blue-800   border-blue-200';
    case 'image':    return 'bg-green-100  text-green-800  border-green-200';
    case 'embed':    return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'scorm':    return 'bg-orange-100 text-orange-800 border-orange-200';
    default:         return 'bg-gray-100   text-gray-800   border-gray-200';
  }
};

// ─── ContentRenderer ─────────────────────────────────────────────────────────

const ContentRenderer = ({
  type,
  resolvedUrl,
  isPrivate,
  title,
}: {
  type: ContentItem['content']['type'];
  resolvedUrl: string;
  isPrivate: boolean;
  title: string;
}) => {
  return (
    <div className="space-y-2">
      {/* Indicador de visibilidad */}
      {isPrivate && (
        <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg w-fit">
          <Lock className="h-3 w-3" />
          <span>Contenido privado — acceso exclusivo para usuarios matriculados</span>
        </div>
      )}

      {/* VIDEO */}
      {type === 'video' && (
        <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
          <video
            controls
            controlsList="nodownload"
            className="w-full h-full"
            src={resolvedUrl}
            title={title}
          >
            Tu navegador no soporta la reproducción de video.
          </video>
        </div>
      )}

      {/* EMBED (YouTube, Vimeo, iframes externos) */}
      {type === 'embed' && (
        <div className="aspect-video bg-white rounded-xl overflow-hidden shadow-2xl border border-gray-200/60">
          <iframe
            src={resolvedUrl}
            className="w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            title={title}
          />
        </div>
      )}

      {/* IMAGEN */}
      {type === 'image' && (
        <div className="bg-white rounded-xl overflow-hidden shadow-2xl border border-gray-200/60">
          <img
            src={resolvedUrl}
            alt={title}
            className="w-full h-auto max-h-[600px] object-contain"
          />
        </div>
      )}

      {/* DOCUMENTO — visor inline + botón de apertura */}
      {type === 'document' && (
        <div className="space-y-3">
          {/* Visor inline (funciona para PDFs con URL firmada) */}
          <div className="h-[650px] bg-white rounded-xl overflow-hidden shadow-2xl border border-gray-200/60">
            <iframe
              src={`${resolvedUrl}#toolbar=0&navpanes=0`}
              className="w-full h-full"
              title={title}
            />
          </div>

          {/* Fallback por si el iframe no carga */}
          <div className="flex justify-center">
            <a
              href={resolvedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white text-sm rounded-xl hover:bg-blue-600 transition-colors shadow-md"
            >
              <ExternalLink className="h-4 w-4" />
              Abrir en nueva pestaña
            </a>
          </div>
        </div>
      )}

      {/* SCORM */}
      {type === 'scorm' && (
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-2xl border border-gray-200/60 text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
            <Package className="h-10 w-10 text-orange-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Contenido SCORM</h3>
          <p className="text-gray-500 text-sm">Contenido interactivo de aprendizaje</p>
          <a
            href={resolvedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg"
          >
            <PlayCircle className="h-5 w-5" />
            Iniciar Contenido
          </a>
        </div>
      )}
    </div>
  );
};

// ─── Error Boundary ───────────────────────────────────────────────────────────

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) return <NotFoundError message="El contenido que buscas no existe" />;
    if (error.status === 500) return <ServerError />;
    return <ErrorDisplay status={error.status} message={error.data?.message || "Ha ocurrido un error"} />;
  }

  return <ErrorDisplay title="Error Inesperado" />;
}

// ─── Loader ───────────────────────────────────────────────────────────────────

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const contentId = params.id;

  if (!contentId) {
    throw new Response("ID de contenido no proporcionado", { status: 400 });
  }

  const apiClient = createApiClientFromRequest(request);

  // 1. Cargar el contenido
  const content = await ContentAPI.getById(contentId, undefined, false, apiClient);

  if (!content) {
    throw new Response("Contenido no encontrado", { status: 404 });
  }

  // 2. Resolver la URL según visibilidad
  let resolvedUrl = content.content.contentUrl;
  let isPrivate = false;

  try {
    // Pedir la URL resuelta al backend — él sabe si es pública o privada
    const signedRes = await apiClient.get(`/v1/contents/${contentId}/signed-url`);
    resolvedUrl = signedRes.data.url;
    isPrivate   = signedRes.data.signed === true;
  } catch (err) {
    // Si falla, usar la URL original (puede ser pública o embed)
    console.warn(`[contents/$id] No se pudo obtener URL firmada para ${contentId}:`, err);
  }

  return json<LoaderData>({ content, resolvedUrl, isPrivate });
};

// ─── Componente ───────────────────────────────────────────────────────────────

export default function ContentDetails() {
  const { content, resolvedUrl, isPrivate } = useLoaderData<LoaderData>();

  return (
    <div className="space-y-8 max-w-6xl mx-auto">

      {/* Botón volver */}
      <div className="py-4">
        <NavLink
          to={`/contents/course/${content?.course.id ?? ""}`}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors font-medium bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200/50 hover:bg-white/80 hover:shadow-md"
        >
          <span className="text-lg">←</span>
          Volver al catálogo
        </NavLink>
      </div>

      {/* Encabezado */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 p-6 hover:bg-white/90 hover:shadow-xl transition-all duration-300">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${getContentTypeColor(content.content.type)}`}>
                {getContentIcon(content.content.type)}
                <span className="capitalize">{content.content.type}</span>
              </div>

              {content.metadata.duration > 0 && (
                <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                  <Clock className="h-4 w-4" />
                  <span>{content.metadata.duration} min</span>
                </div>
              )}
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-3">{content.title}</h1>

            {content.description && (
              <p className="text-gray-600 text-lg leading-relaxed">{content.description}</p>
            )}

            {content.metadata.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {content.metadata.tags.map((tag, index) => (
                  <div key={index} className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                    <Tag className="h-3 w-3" />
                    <span>{tag}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Renderizador de contenido */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 p-8 hover:bg-white/90 hover:shadow-xl transition-all duration-300">
        <ContentRenderer
          type={content.content.type}
          resolvedUrl={resolvedUrl}
          isPrivate={isPrivate}
          title={content.title}
        />
      </div>

      {/* Módulo / Curso */}
      {content?.module && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 p-6 hover:bg-white/90 hover:shadow-xl transition-all duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Módulo</h3>
              <p className="text-gray-600">{content.module.title}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Curso</h3>
              <p className="text-gray-600">{content.course.title}</p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200/30">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Creado: {new Date(content.metadata.createdAt).toLocaleDateString('es-CO')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Actualizado: {new Date(content.metadata.updatedAt).toLocaleDateString('es-CO')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}