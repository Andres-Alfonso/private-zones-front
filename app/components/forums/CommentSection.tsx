// app/components/forums/CommentSection.tsx

import { MessageSquare } from "lucide-react";
import type { ForumData } from "~/api/types/forum.types";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";

interface CommentSectionProps {
  forum: ForumData;
  currentUserId?: string;
  isSubmitting: boolean;
}

export default function CommentSection({
  forum,
  currentUserId,
  isSubmitting,
}: CommentSectionProps) {
  // Filtrar solo comentarios raíz (sin padre)
  const rootComments = forum.comments.filter((c) => !c.parentCommentId);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-gray-900 text-lg flex items-center space-x-2">
          <MessageSquare className="h-5 w-5" />
          <span>
            Comentarios ({forum.comments.length})
          </span>
        </h3>
      </div>

      {/* Formulario para nuevo comentario */}
      <div className="mb-8">
        <CommentForm
          action="add-comment"
          placeholder="Escribe tu comentario..."
          buttonText="Comentar"
          isSubmitting={isSubmitting}
        />
      </div>

      {/* Lista de comentarios */}
      <div className="space-y-6">
        {rootComments.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">
              Sé el primero en comentar
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Comparte tus ideas y participa en la discusión
            </p>
          </div>
        ) : (
          rootComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              isSubmitting={isSubmitting}
              depth={0}
            />
          ))
        )}
      </div>
    </div>
  );
}