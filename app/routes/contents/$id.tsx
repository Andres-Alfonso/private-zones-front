// app/routes/contents/$id.tsx

import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useRouteError, isRouteErrorResponse, NavLink } from "@remix-run/react";
import { 
  Video, 
  FileText, 
  Image, 
  Globe, 
  Package, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  Calendar, 
  Tag,
  Bookmark,
  BookmarkCheck,
  Star,
  Users,
  PlayCircle,
  Eye,
  Download
} from "lucide-react";
import { createApiClientFromRequest } from "~/api/client";
import { ContentAPI } from "~/api/endpoints/contents";
import { ErrorDisplay, NotFoundError, ServerError } from "~/components/ErrorDisplay";
import { useCurrentUser } from "~/context/AuthContext";

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
    previousItem: {
      id: string;
      title: string;
      type: string;
      referenceId: string;
    } | null;
    nextItem: {
      id: string;
      title: string;
      type: string;
      referenceId: string;
    } | null;
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
};

// Funciones auxiliares reutilizadas del índice
const getContentIcon = (type: string) => {
  switch (type) {
    case 'video':
      return <Video className="h-6 w-6" />;
    case 'document':
      return <FileText className="h-6 w-6" />;
    case 'image':
      return <Image className="h-6 w-6" />;
    case 'embed':
      return <Globe className="h-6 w-6" />;
    case 'scorm':
      return <Package className="h-6 w-6" />;
    default:
      return <FileText className="h-6 w-6" />;
  }
};

const getContentTypeColor = (type: string) => {
  switch (type) {
    case 'video':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'document':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'image':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'embed':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'scorm':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'intermediate':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'advanced':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Componente para renderizar el contenido según su tipo
const ContentRenderer = ({ content }: { content: ContentItem['content'] }) => {
  const { type, contentUrl } = content;

  const commonClasses = "w-full rounded-xl border border-gray-200/60 shadow-lg hover:shadow-xl transition-all duration-300";

  switch (type) {
    case 'video':
      return (
        <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
          <iframe
            src={contentUrl}
            className="w-full h-full"
            allowFullScreen
            title="Video content"
          />
        </div>
      );

    case 'embed':
      return (
        <div className="aspect-video bg-white rounded-xl overflow-hidden shadow-2xl border border-gray-200/60">
          <iframe
            src={contentUrl}
            className="w-full h-full"
            title="Embedded content"
          />
        </div>
      );

    case 'image':
      return (
        <div className="bg-white rounded-xl overflow-hidden shadow-2xl border border-gray-200/60">
          <img
            src={contentUrl}
            alt="Content image"
            className="w-full h-auto max-h-[600px] object-contain"
          />
        </div>
      );

    case 'document':
      return (
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-2xl border border-gray-200/60 text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
            <FileText className="h-10 w-10 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Documento PDF</h3>
          <p className="text-gray-600">Haz clic en el botón para abrir el documento</p>
          <a
            href={contentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Eye className="h-5 w-5" />
            <span>Ver Documento</span>
          </a>
        </div>
      );

    case 'scorm':
      return (
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-2xl border border-gray-200/60 text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
            <Package className="h-10 w-10 text-orange-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Contenido SCORM</h3>
          <p className="text-gray-600">Contenido interactivo de aprendizaje</p>
          <a
            href={contentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <PlayCircle className="h-5 w-5" />
            <span>Iniciar Contenido</span>
          </a>
        </div>
      );

    default:
      return (
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-2xl border border-gray-200/60 text-center">
          <p className="text-gray-600">Tipo de contenido no soportado</p>
        </div>
      );
  }
};

// // Componente de progreso del usuario
// const UserProgressCard = ({ userProgress }: { userProgress: ContentItem['userProgress'] }) => (
//   <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 p-6 hover:bg-white/90 hover:shadow-xl transition-all duration-300">
//     <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
//       <Clock className="h-5 w-5 text-blue-600" />
//       <span>Tu Progreso</span>
//     </h3>
    
//     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//       <div className="text-center">
//         <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-2 ${
//           userProgress.isCompleted ? 'bg-green-100' : 'bg-gray-100'
//         }`}>
//           {userProgress.isCompleted ? (
//             <CheckCircle className="h-8 w-8 text-green-600" />
//           ) : (
//             <Clock className="h-8 w-8 text-gray-400" />
//           )}
//         </div>
//         <p className="text-sm font-medium text-gray-900">
//           {userProgress.isCompleted ? 'Completado' : 'En progreso'}
//         </p>
//         {userProgress.completionDate && (
//           <p className="text-xs text-gray-600 mt-1">
//             {new Date(userProgress.completionDate).toLocaleDateString()}
//           </p>
//         )}
//       </div>

//       <div className="text-center">
//         <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2">
//           <Clock className="h-8 w-8 text-blue-600" />
//         </div>
//         <p className="text-sm font-medium text-gray-900">
//           {userProgress.timeSpent} min
//         </p>
//         <p className="text-xs text-gray-600">Tiempo dedicado</p>
//       </div>

//       <div className="text-center">
//         <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-2 ${
//           userProgress.bookmarked ? 'bg-yellow-100' : 'bg-gray-100'
//         }`}>
//           {userProgress.bookmarked ? (
//             <BookmarkCheck className="h-8 w-8 text-yellow-600" />
//           ) : (
//             <Bookmark className="h-8 w-8 text-gray-400" />
//           )}
//         </div>
//         <p className="text-sm font-medium text-gray-900">
//           {userProgress.bookmarked ? 'Guardado' : 'No guardado'}
//         </p>
//         <p className="text-xs text-gray-600">Marcador</p>
//       </div>
//     </div>
//   </div>
// );

// Componente de navegación
// const NavigationCard = ({ navigation, courseId }: { 
//   navigation: ContentItem['navigation'], 
//   courseId: string 
// }) => (
//   <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 p-6 hover:bg-white/90 hover:shadow-xl transition-all duration-300">
//     <h3 className="text-lg font-semibold text-gray-900 mb-4">Navegación</h3>
    
//     <div className="flex justify-between items-center">
//       {navigation.previousItem ? (
//         <NavLink
//           to={`/contents/${navigation.previousItem.referenceId}`}
//           className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm"
//         >
//           <ArrowLeft className="h-4 w-4" />
//           <div className="text-left">
//             <p className="text-xs opacity-90">Anterior</p>
//             <p className="font-medium truncate max-w-32">{navigation.previousItem.title}</p>
//           </div>
//         </NavLink>
//       ) : (
//         <div className="w-40"></div>
//       )}

//       {navigation.nextItem ? (
//         <NavLink
//           to={`/contents/${navigation.nextItem.referenceId}`}
//           className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm"
//         >
//           <div className="text-right">
//             <p className="text-xs opacity-90">Siguiente</p>
//             <p className="font-medium truncate max-w-32">{navigation.nextItem.title}</p>
//           </div>
//           <ArrowRight className="h-4 w-4" />
//         </NavLink>
//       ) : (
//         <div className="w-40"></div>
//       )}
//     </div>
//   </div>
// );

export function ErrorBoundary() {
  const error = useRouteError();
  
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return <NotFoundError message="El contenido que buscas no existe" />;
    }
    if (error.status === 500) {
      return <ServerError />;
    }
    return (
      <ErrorDisplay
        status={error.status}
        message={error.data?.message || "Ha ocurrido un error"}
      />
    );
  }

  return <ErrorDisplay title="Error Inesperado" />;
}

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  try {
    const contentId = params.id as string;

    if (!contentId) {
      throw new Response("ID de contenido no proporcionado", { 
        status: 400,
        statusText: "Bad Request"
      });
    }

    const authenticatedApiClient = createApiClientFromRequest(request);
    const content = await ContentAPI.getById(contentId, undefined, false, authenticatedApiClient);
    
    if (!content) {
      throw new Response("Contenido no encontrado", { 
        status: 404,
        statusText: "Not Found"
      });
    }

    return json<LoaderData>({ content });

  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
    
    console.error("Error cargando contenido:", error);
    throw new Response("Error interno del servidor", { 
      status: 500,
      statusText: "Internal Server Error"
    });
  }
};

export default function ContentDetails() {
  const { content } = useLoaderData<LoaderData>();

  return (
    <div className="space-y-8 max-w-6xl mx-auto">

        <div className="py-4">
            <div className="flex items-center justify-between">
                <NavLink
                to={`/contents/course/${content?.course.id ?? ""}`}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 transition-colors font-medium bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200/50 hover:bg-white/80 hover:shadow-md"
                >
                <span className="text-lg">←</span>
                <span>Volver al catálogo</span>
                </NavLink>
            </div>
        </div>
      {/* Breadcrumb y encabezado */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 p-6 hover:bg-white/90 hover:shadow-xl transition-all duration-300">
        {/* <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
          <NavLink to={`/contents/${content.course.id}`} className="hover:text-blue-600 transition-colors">
            {content.course.title}
          </NavLink>
          <span>/</span>
          <span>{content.module.title}</span>
          <span>/</span>
          <span className="font-medium text-gray-900">{content.title}</span>
        </div> */}
        
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border text-sm font-medium ${
                getContentTypeColor(content.content.type)
              }`}>
                {getContentIcon(content.content.type)}
                <span className="capitalize">{content.content.type}</span>
              </div>
              
              {/* <div className={`px-3 py-1 rounded-full border text-sm font-medium ${
                getDifficultyColor(content.metadata.difficulty)
              }`}>
                <span className="capitalize">{content.metadata.difficulty}</span>
              </div> */}

              {content.metadata.duration > 0 && (
                <div className="flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                  <Clock className="h-4 w-4" />
                  <span>{content.metadata.duration} min</span>
                </div>
              )}
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-3">{content.title}</h1>
            
            {content.description && (
              <p className="text-gray-600 text-lg leading-relaxed">{content.description}</p>
            )}

            {/* Tags */}
            {content.metadata.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {content.metadata.tags.map((tag, index) => (
                  <div key={index} className="flex items-center space-x-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                    <Tag className="h-3 w-3" />
                    <span>{tag}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 p-8 hover:bg-white/90 hover:shadow-xl transition-all duration-300">
        <ContentRenderer content={content.content} />
      </div>

      {/* Grid de información adicional */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <UserProgressCard userProgress={content.userProgress} />
        <NavigationCard navigation={content.navigation} courseId={content.course.id} />
      </div> */}

      {/* Información del módulo y curso */}

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
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Creado: {new Date(content.metadata.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Actualizado: {new Date(content.metadata.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}