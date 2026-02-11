// app/components/forums/CommentForm.tsx

import { useState, useEffect } from "react";
import { Form } from "@remix-run/react";
import { Send, X } from "lucide-react";

interface CommentFormProps {
  action: "add-comment" | "update-comment";
  initialValue?: string;
  commentId?: string;
  parentCommentId?: string;
  placeholder?: string;
  buttonText?: string;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export default function CommentForm({
  action,
  initialValue = "",
  commentId,
  parentCommentId,
  placeholder = "Escribe tu comentario...",
  buttonText = "Comentar",
  onCancel,
  isSubmitting = false,
}: CommentFormProps) {
  const [content, setContent] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);

  // Reset content when initialValue changes (for editing)
  useEffect(() => {
    setContent(initialValue);
  }, [initialValue]);

  // Reset form after successful submission
  useEffect(() => {
    if (!isSubmitting && action === "add-comment") {
      setContent("");
    }
  }, [isSubmitting, action]);

  const isValid = content.trim().length > 0;

  return (
    <Form method="post" onSubmit={() => setContent("")}>
      <input type="hidden" name="_action" value={action} />
      {commentId && <input type="hidden" name="commentId" value={commentId} />}
      {parentCommentId && (
        <input type="hidden" name="parentCommentId" value={parentCommentId} />
      )}

      <div
        className={`bg-white rounded-xl border-2 transition-all duration-200 ${
          isFocused
            ? "border-blue-400 shadow-lg ring-4 ring-blue-100"
            : "border-gray-200 hover:border-gray-300"
        }`}
      >
        <textarea
          name="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          rows={isFocused ? 4 : 3}
          className="w-full px-4 py-3 rounded-t-xl resize-none focus:outline-none text-gray-900 placeholder-gray-400"
          disabled={isSubmitting}
        />

        {/* Character counter */}
        <div className="px-4 py-2 bg-gray-50 rounded-b-xl flex items-center justify-between border-t border-gray-200">
          <div className="text-xs text-gray-500">
            {content.length > 0 && (
              <span
                className={content.length > 1000 ? "text-red-500" : ""}
              >
                {content.length} / 1000
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                <X className="h-4 w-4 inline mr-1" />
                Cancelar
              </button>
            )}

            <button
              type="submit"
              disabled={!isValid || isSubmitting || content.length > 1000}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none"
            >
              <Send className="h-4 w-4" />
              <span>{isSubmitting ? "Enviando..." : buttonText}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Validation message */}
      {content.length > 1000 && (
        <p className="mt-2 text-sm text-red-600">
          El comentario no puede superar los 1000 caracteres
        </p>
      )}
    </Form>
  );
}