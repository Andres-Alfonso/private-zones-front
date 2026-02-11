// app/components/forums/ForumHeader.tsx

import { Pin, Calendar, Eye, User, Tag, Clock } from "lucide-react";
import type { ForumData } from "~/api/types/forum.types";

interface ForumHeaderProps {
  forum: ForumData;
}

export default function ForumHeader({ forum }: ForumHeaderProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const isExpired =
    forum.expirationDate && new Date(forum.expirationDate) < new Date();

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
      {/* Thumbnail si existe */}
      {forum.thumbnail && (
        <div className="w-full h-64 bg-gray-100">
          <img
            src={forum.thumbnail}
            alt={forum.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-6">
        {/* Badges y metadatos */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {forum.isPinned && (
            <span className="flex items-center space-x-1 px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full">
              <Pin className="h-4 w-4" />
              <span>Fijado</span>
            </span>
          )}

          {forum.category && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
              {forum.category}
            </span>
          )}

          {isExpired && (
            <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded-full">
              Expirado
            </span>
          )}

          <div className="flex items-center space-x-1 text-gray-500 text-sm">
            <Eye className="h-4 w-4" />
            <span>{forum.viewCount} vistas</span>
          </div>
        </div>

        {/* Título y descripción */}
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {forum.title}
        </h2>

        {forum.description && (
          <p className="text-gray-600 text-lg mb-6 leading-relaxed">
            {forum.description}
          </p>
        )}

        {/* Información del autor y fecha */}
        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            {forum.author.avatar ? (
              <img
                src={forum.author.avatar}
                alt={`${forum.author.firstName} ${forum.author.lastName}`}
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                {forum.author.firstName[0]}
                {forum.author.lastName[0]}
              </div>
            )}
            <div>
              <div className="font-medium text-gray-900">
                {forum.author.firstName} {forum.author.lastName}
              </div>
              <div className="text-xs text-gray-500">Autor del tema</div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <div>
              <div className="font-medium">Publicado</div>
              <div className="text-xs">{formatDate(forum.createdAt)}</div>
            </div>
          </div>

          {forum.expirationDate && (
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <div>
                <div className="font-medium">
                  {isExpired ? "Expiró" : "Expira"}
                </div>
                <div className="text-xs">
                  {formatDate(forum.expirationDate)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tags */}
        {forum.tags && forum.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-200">
            <Tag className="h-4 w-4 text-gray-400" />
            {forum.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}