// app/hooks/useCommentManagement.ts

import { useState, useCallback } from "react";

interface CommentState {
  replyingTo: string | null;
  editing: string | null;
  showReplies: Record<string, boolean>;
}

export function useCommentManagement() {
  const [state, setState] = useState<CommentState>({
    replyingTo: null,
    editing: null,
    showReplies: {},
  });

  const startReply = useCallback((commentId: string) => {
    setState((prev) => ({
      ...prev,
      replyingTo: commentId,
      editing: null,
    }));
  }, []);

  const cancelReply = useCallback(() => {
    setState((prev) => ({ ...prev, replyingTo: null }));
  }, []);

  const startEdit = useCallback((commentId: string) => {
    setState((prev) => ({
      ...prev,
      editing: commentId,
      replyingTo: null,
    }));
  }, []);

  const cancelEdit = useCallback(() => {
    setState((prev) => ({ ...prev, editing: null }));
  }, []);

  const toggleReplies = useCallback((commentId: string) => {
    setState((prev) => ({
      ...prev,
      showReplies: {
        ...prev.showReplies,
        [commentId]: !prev.showReplies[commentId],
      },
    }));
  }, []);

  return {
    state,
    startReply,
    cancelReply,
    startEdit,
    cancelEdit,
    toggleReplies,
  };
}