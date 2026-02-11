// app/components/forums/CommentItem.tsx

import { useState } from "react";
import { Form } from "@remix-run/react";
import {
  ThumbsUp,
  Star,
  Reply,
  Edit,
  Trash2,
  MoreVertical,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { ForumComment } from "~/api/types/forum.types";
import { CommentReactionType } from "~/api/types/forum.types";
import CommentForm from "./CommentForm";

interface CommentItemProps {
  comment: ForumComment;
  currentUserId?: string;
  isSubmitting: boolean;
  depth?: number;
}

const MAX_DEPTH = 3; // Nivel máximo de anidación

export default function CommentItem({
  comment,
  currentUserId,
  isSubmitting,
  depth = 0,
}: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  const isAuthor = comment.authorId === currentUserId;
  const canReply = depth < MAX_DEPTH;

  const userReaction = comment.reactions.find((r) => r.userId === currentUserId);

  const getReactionCount = (type: CommentReactionType) => {
    return comment.reactions.filter((r) => r.type === type).length;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "ahora mismo";
    if (diffInMinutes < 60) return `hace ${diffInMinutes}m`;
    if (diffInMinutes < 1440)
      return `hace ${Math.floor(diffInMinutes / 60)}h`;

    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className={`${depth > 0 ? "ml-8 mt-4" : ""}`}>
      <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
        {/* Comment Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            {/* Avatar */}
            {comment.author.avatar ? (
              <img
                src={comment.author.avatar}
                alt={`${comment.author.firstName} ${comment.author.lastName}`}
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                {comment.author.firstName[0]}
                {comment.author.lastName[0]}
              </div>
            )}

            {/* Author info */}
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-900">
                  {comment.author.firstName} {comment.author.lastName}
                </span>
                {isAuthor && (
                  <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full font-medium">
                    Tú
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>{formatDate(comment.createdAt)}</span>
                {comment.isEdited && <span>• Editado</span>}
              </div>
            </div>
          </div>

          {/* Menu dropdown para autor */}
          {isAuthor && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MoreVertical className="h-5 w-5 text-gray-400" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Editar</span>
                  </button>

                  <Form method="post">
                    <input type="hidden" name="_action" value="delete-comment" />
                    <input type="hidden" name="commentId" value={comment.id} />
                    <button
                      type="submit"
                      onClick={(e) => {
                        if (
                          !confirm(
                            "¿Estás seguro de que quieres eliminar este comentario?"
                          )
                        ) {
                          e.preventDefault();
                        }
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Eliminar</span>
                    </button>
                  </Form>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Comment Content */}
        {isEditing ? (
          <div className="mb-3">
            <CommentForm
              action="update-comment"
              initialValue={comment.content}
              commentId={comment.id}
              placeholder="Edita tu comentario..."
              buttonText="Guardar"
              onCancel={() => setIsEditing(false)}
              isSubmitting={isSubmitting}
            />
          </div>
        ) : (
          <div className="mb-3">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </p>
          </div>
        )}

        {/* Comment Actions */}
        <div className="flex items-center space-x-4 pt-2 border-t border-gray-100">
          {/* Reaction buttons */}
          <div className="flex items-center space-x-2">
            <Form method="post">
              <input
                type="hidden"
                name="_action"
                value={
                  userReaction?.type === CommentReactionType.LIKE
                    ? "remove-comment-reaction"
                    : "add-comment-reaction"
                }
              />
              <input type="hidden" name="commentId" value={comment.id} />
              {userReaction?.type !== CommentReactionType.LIKE && (
                <input
                  type="hidden"
                  name="type"
                  value={CommentReactionType.LIKE}
                />
              )}

              <button
                type="submit"
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  userReaction?.type === CommentReactionType.LIKE
                    ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <ThumbsUp className="h-4 w-4" />
                <span>Me gusta</span>
                {getReactionCount(CommentReactionType.LIKE) > 0 && (
                  <span className="text-xs font-bold">
                    {getReactionCount(CommentReactionType.LIKE)}
                  </span>
                )}
              </button>
            </Form>

            <Form method="post">
              <input
                type="hidden"
                name="_action"
                value={
                  userReaction?.type === CommentReactionType.HELPFUL
                    ? "remove-comment-reaction"
                    : "add-comment-reaction"
                }
              />
              <input type="hidden" name="commentId" value={comment.id} />
              {userReaction?.type !== CommentReactionType.HELPFUL && (
                <input
                  type="hidden"
                  name="type"
                  value={CommentReactionType.HELPFUL}
                />
              )}

              <button
                type="submit"
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  userReaction?.type === CommentReactionType.HELPFUL
                    ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Star className="h-4 w-4" />
                <span>Útil</span>
                {getReactionCount(CommentReactionType.HELPFUL) > 0 && (
                  <span className="text-xs font-bold">
                    {getReactionCount(CommentReactionType.HELPFUL)}
                  </span>
                )}
              </button>
            </Form>
          </div>

          {/* Reply button */}
          {canReply && (
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Reply className="h-4 w-4" />
              <span>Responder</span>
            </button>
          )}

          {/* Toggle replies button */}
          {comment.replies && comment.replies.length > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors ml-auto"
            >
              {showReplies ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              <span>
                {comment.replies.length}{" "}
                {comment.replies.length === 1 ? "respuesta" : "respuestas"}
              </span>
            </button>
          )}
        </div>

        {/* Reply Form */}
        {isReplying && (
          <div className="mt-4 pl-4 border-l-2 border-blue-200">
            <CommentForm
              action="add-comment"
              parentCommentId={comment.id}
              placeholder="Escribe tu respuesta..."
              buttonText="Responder"
              onCancel={() => setIsReplying(false)}
              isSubmitting={isSubmitting}
            />
          </div>
        )}
      </div>

      {/* Nested Replies */}
      {showReplies && comment.replies && comment.replies.length > 0 && (
        <div className="space-y-4 mt-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              isSubmitting={isSubmitting}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}