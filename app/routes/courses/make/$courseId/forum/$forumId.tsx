// app/routes/courses/make/$courseId/forum/$forumId.tsx

import type {
  MetaFunction,
  LoaderFunction,
  ActionFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  useLoaderData,
  useActionData,
  Link,
  useParams,
  useNavigation,
} from "@remix-run/react";
import {
  ArrowLeft,
  ArrowRight,
  MessageSquare,
  Eye,
  Pin,
  Calendar,
  User,
  Tag,
} from "lucide-react";
import AuthGuard from "~/components/AuthGuard";
import { useCurrentUser } from "~/context/AuthContext";
import { ForumsAPI } from "~/api/endpoints/forums";
import { createApiClientFromRequest } from "~/api/client";
import ForumHeader from "~/components/forums/ForumHeader";
import ForumReactions from "~/components/forums/ForumReactions";
import CommentSection from "~/components/forums/CommentSection";
import type { ForumData } from "~/api/types/forum.types";

interface LoaderData {
  forum: ForumData;
  error: string | null;
}

interface ActionData {
  success?: boolean;
  error?: string;
  action?: string;
}

export const meta: MetaFunction = ({ data }: { data: LoaderData }) => {
  const forum = data?.forum;
  const title = forum?.title || "Foro no encontrado";

  return [
    { title: `${title} - ${forum?.course?.title || "Curso"}` },
    { name: "description", content: forum?.description || "Foro del curso" },
  ];
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const { forumId } = params;

  if (!forumId) {
    throw new Error("Forum ID is required");
  }

  try {
    const authenticatedApiClient = createApiClientFromRequest(request);

    // Obtener datos del foro
    const forum = await ForumsAPI.getById(forumId, authenticatedApiClient);

    // Incrementar contador de vistas
    await ForumsAPI.incrementViewCount(forumId, authenticatedApiClient);

    return json<LoaderData>({
      forum: forum.data,
      error: null,
    });
  } catch (error: any) {
    console.error("Error loading forum:", error);
    return json<LoaderData>({
      forum: {} as ForumData,
      error: error.message || "Error al cargar el foro",
    });
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const action = formData.get("_action") as string;
  const { forumId } = params;

  const authenticatedApiClient = createApiClientFromRequest(request);

  if (!forumId) {
    throw new Error("Forum ID is required");
  }

  try {
    switch (action) {
      case "add-reaction": {
        const type = formData.get("type") as string;
        await ForumsAPI.addReaction(
          forumId,
          { type: type as any },
          authenticatedApiClient
        );
        return json<ActionData>({ success: true, action: "add-reaction" });
      }

      case "remove-reaction": {
        await ForumsAPI.removeReaction(forumId, authenticatedApiClient);
        return json<ActionData>({ success: true, action: "remove-reaction" });
      }

      case "add-comment": {
        const content = formData.get("content") as string;
        const parentCommentId = formData.get("parentCommentId") as string;

        await ForumsAPI.addComment(
          forumId,
          {
            content,
            parentCommentId: parentCommentId || undefined,
          },
          authenticatedApiClient
        );
        return json<ActionData>({ success: true, action: "add-comment" });
      }

      case "update-comment": {
        const commentId = formData.get("commentId") as string;
        const content = formData.get("content") as string;

        await ForumsAPI.updateComment(
          commentId,
          { content },
          authenticatedApiClient
        );
        return json<ActionData>({ success: true, action: "update-comment" });
      }

      case "delete-comment": {
        const commentId = formData.get("commentId") as string;
        await ForumsAPI.deleteComment(commentId, authenticatedApiClient);
        return json<ActionData>({ success: true, action: "delete-comment" });
      }

      case "add-comment-reaction": {
        const commentId = formData.get("commentId") as string;
        const type = formData.get("type") as string;

        await ForumsAPI.addCommentReaction(
          commentId,
          { type: type as any },
          authenticatedApiClient
        );
        return json<ActionData>({
          success: true,
          action: "add-comment-reaction",
        });
      }

      case "remove-comment-reaction": {
        const commentId = formData.get("commentId") as string;
        await ForumsAPI.removeCommentReaction(
          commentId,
          authenticatedApiClient
        );
        return json<ActionData>({
          success: true,
          action: "remove-comment-reaction",
        });
      }

      default:
        throw new Error("Acción no válida");
    }
  } catch (error: any) {
    return json<ActionData>({
      error: error.message || "Error al procesar la acción",
    });
  }
};

export default function ForumView() {
  return (
    <AuthGuard>
      <ForumViewContent />
    </AuthGuard>
  );
}

function ForumViewContent() {
  const { forum, error } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const params = useParams();
  const { user } = useCurrentUser();

  console.log("Loader Data:", { forum, error });

  const isSubmitting = navigation.state === "submitting";

  if (error || !forum) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8 max-w-md mx-auto">
            <MessageSquare className="mx-auto h-16 w-16 text-red-400 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Error al cargar
            </h1>
            <p className="text-gray-600 mb-6">
              {error || "No se pudo cargar el foro"}
            </p>
            <Link
              to={`/make/courses/${params.courseId}`}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Volver al curso
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Forum Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
              <Link
                to={`/make/courses/${forum.course.id}`}
                className="hover:text-blue-600 transition-colors"
              >
                {forum.course.title}
              </Link>
              <span>/</span>
              <span>Foros</span>
              <span>/</span>
              <span className="text-gray-900 font-medium">{forum.title}</span>
            </nav>
            <h1 className="text-2xl font-bold text-gray-900 truncate">
              {forum.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Action Messages */}
      {actionData?.error && (
        <div className="fixed top-4 right-4 z-50 bg-red-50/90 backdrop-blur-sm border border-red-200/50 text-red-700 px-6 py-4 rounded-xl shadow-lg">
          {actionData.error}
        </div>
      )}

      {actionData?.success && (
        <div className="fixed top-4 right-4 z-50 bg-green-50/90 backdrop-blur-sm border border-green-200/50 text-green-700 px-6 py-4 rounded-xl shadow-lg">
          {actionData.action === "add-comment" && "Comentario agregado"}
          {actionData.action === "update-comment" &&
            "Comentario actualizado"}
          {actionData.action === "delete-comment" && "Comentario eliminado"}
          {actionData.action === "add-reaction" && "Reacción agregada"}
          {actionData.action === "remove-reaction" && "Reacción eliminada"}
        </div>
      )}

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Forum Header Component */}
          <ForumHeader forum={forum} />

          {/* Forum Reactions */}
          <ForumReactions forum={forum} currentUserId={user?.id} />

          {/* Comments Section */}
          <CommentSection
            forum={forum}
            currentUserId={user?.id}
            isSubmitting={isSubmitting}
          />

          {/* Navigation */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
            <div className="flex justify-between space-x-4">
              {/* Previous Item */}
              {forum.navigation.previousItem ? (
                <div className="flex-1">
                  <Link
                    to={`/make/courses/${forum.course.id}/${forum.navigation.previousItem.type}/${forum.navigation.previousItem.referenceId}#main-content`}
                    className="flex items-center space-x-3 p-3 rounded-xl border border-gray-200/50 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200 group w-full"
                  >
                    <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-100 transition-colors">
                      <ArrowLeft className="h-4 w-4 text-gray-600 group-hover:text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">
                        Anterior
                      </div>
                      <div className="font-medium text-gray-900 text-sm truncate">
                        {forum.navigation.previousItem.title}
                      </div>
                    </div>
                  </Link>
                </div>
              ) : (
                <div className="flex-1" />
              )}

              {/* Next Item */}
              {forum.navigation.nextItem ? (
                <div className="flex-1 text-right">
                  <Link
                    to={`/make/courses/${forum.course.id}/${forum.navigation.nextItem.type}/${forum.navigation.nextItem.referenceId}#main-content`}
                    className="flex items-center justify-end space-x-3 p-3 rounded-xl bg-green-50/60 border border-green-200/50 hover:border-green-200 hover:bg-green-50/30 transition-all duration-200 group w-full"
                  >
                    <div className="flex-1 min-w-0 text-right">
                      <div className="text-xs text-green-500 uppercase tracking-wide">
                        Siguiente
                      </div>
                      <div className="font-medium text-green-900 text-sm truncate">
                        {forum.navigation.nextItem.title}
                      </div>
                    </div>
                    <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-green-100 transition-colors">
                      <ArrowRight className="h-4 w-4 text-green-600 group-hover:text-green-600" />
                    </div>
                  </Link>
                </div>
              ) : (
                <div className="flex-1" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}