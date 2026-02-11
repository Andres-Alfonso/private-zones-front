// app/components/forums/ForumReactions.tsx

import { Form } from "@remix-run/react";
import { ThumbsUp, ThumbsDown, Laugh, Heart } from "lucide-react";
import { ReactionType, type ForumData } from "~/api/types/forum.types";

interface ForumReactionsProps {
  forum: ForumData;
  currentUserId?: string;
}

const reactionConfig = {
  [ReactionType.LIKE]: {
    icon: ThumbsUp,
    label: "Me gusta",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    hoverColor: "hover:bg-blue-200",
  },
  [ReactionType.NOT_LIKE]: {
    icon: ThumbsDown,
    label: "No me gusta",
    color: "text-red-600",
    bgColor: "bg-red-100",
    hoverColor: "hover:bg-red-200",
  },
  [ReactionType.FUNNY]: {
    icon: Laugh,
    label: "Divertido",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    hoverColor: "hover:bg-yellow-200",
  },
  [ReactionType.LOVE]: {
    icon: Heart,
    label: "Me encanta",
    color: "text-pink-600",
    bgColor: "bg-pink-100",
    hoverColor: "hover:bg-pink-200",
  },
};

export default function ForumReactions({
  forum,
  currentUserId,
}: ForumReactionsProps) {
  const userReaction = forum.reactions.find((r) => r.userId === currentUserId);

  const getReactionCount = (type: ReactionType) => {
    return forum.reactions.filter((r) => r.type === type).length;
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
      <h3 className="font-semibold text-gray-900 text-lg mb-4">Reacciones</h3>

      <div className="flex flex-wrap gap-3">
        {Object.entries(reactionConfig).map(([type, config]) => {
          const Icon = config.icon;
          const count = getReactionCount(type as ReactionType);
          const isActive = userReaction?.type === type;

          return (
            <Form method="post" key={type}>
              <input
                type="hidden"
                name="_action"
                value={isActive ? "remove-reaction" : "add-reaction"}
              />
              {!isActive && <input type="hidden" name="type" value={type} />}

              <button
                type="submit"
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 ${
                  isActive
                    ? `${config.bgColor} ${config.color} border-current shadow-md`
                    : `border-gray-200 text-gray-600 hover:border-gray-300 ${config.hoverColor}`
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{config.label}</span>
                {count > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      isActive ? "bg-white/50" : "bg-gray-100"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            </Form>
          );
        })}
      </div>

      {/* Resumen de reacciones */}
      {forum.reactions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">{forum.reactions.length}</span>{" "}
            {forum.reactions.length === 1 ? "persona ha" : "personas han"}{" "}
            reaccionado a este tema
          </p>
        </div>
      )}
    </div>
  );
}