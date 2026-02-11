// app/api/types/forum.types.ts

export enum ReactionType {
  LIKE = 'like',
  NOT_LIKE = 'not_like',
  FUNNY = 'funny',
  LOVE = 'love',
}

export enum CommentReactionType {
  LIKE = 'like',
  HELPFUL = 'helpful',
}

export interface ForumAuthor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

export interface ForumReaction {
  id: string;
  type: ReactionType;
  userId: string;
  user?: ForumAuthor;
  createdAt: string;
}

export interface CommentReaction {
  id: string;
  type: CommentReactionType;
  userId: string;
  user?: ForumAuthor;
  createdAt: string;
}

export interface ForumComment {
  id: string;
  content: string;
  isEdited: boolean;
  authorId: string;
  author: ForumAuthor;
  parentCommentId?: string;
  replies: ForumComment[];
  reactions: CommentReaction[];
  createdAt: string;
  updatedAt: string;
}

export interface ForumData {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  category: string | null;
  tags: string[];
  viewCount: number;
  isPinned: boolean;
  isActive: boolean;
  expirationDate: string | null;
  authorId: string;
  author: ForumAuthor;
  courseId: string;
  course: {
    id: string;
    title: string;
    colorTitle: string;
  };
  comments: ForumComment[];
  reactions: ForumReaction[];
  createdAt: string;
  updatedAt: string;
  navigation: {
    previousItem?: {
      id: string;
      title: string;
      type: string;
      referenceId: string;
    };
    nextItem?: {
      id: string;
      title: string;
      type: string;
      referenceId: string;
    };
  };
  userInteraction: {
    hasReacted: boolean;
    reactionType?: ReactionType;
    hasCommented: boolean;
  };
}

export interface CreateCommentDto {
  content: string;
  parentCommentId?: string;
}

export interface UpdateCommentDto {
  content: string;
}

export interface CreateReactionDto {
  type: ReactionType;
}

export interface CreateCommentReactionDto {
  type: CommentReactionType;
}