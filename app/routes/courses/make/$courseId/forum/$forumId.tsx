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
    const forum = await ForumsAPI.getById(forumId, authenticatedApiClient, true);

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

        console.log("add-comment payload:", { content, parentCommentId, forumId });

        try {
          const result = await ForumsAPI.addComment(
            forumId,
            {
              content,
              parentCommentId: parentCommentId || undefined,
            },
            authenticatedApiClient
          );
          console.log("add-comment result:", result); // <-- agrega esto
        } catch (err: any) {
          console.error("add-comment error:", {
            message: err.message,
            status: err.response?.status,
            data: err.response?.data,   // <-- esto te mostrará el error del backend
          });
          throw err;
        }

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

  console.log("Rendering forum view with data:", forum);

  return (
    <div className="min-h-screen bg-white">

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
              

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}