// app/components/forums/ReactionButton.tsx

import { Form } from "@remix-run/react";
import type { LucideIcon } from "lucide-react";

interface ReactionButtonProps {
  icon: LucideIcon;
  label: string;
  count: number;
  isActive: boolean;
  action: string;
  targetId: string;
  reactionType?: string;
  colorClasses: {
    active: string;
    inactive: string;
  };
}

export default function ReactionButton({
  icon: Icon,
  label,
  count,
  isActive,
  action,
  targetId,
  reactionType,
  colorClasses,
}: ReactionButtonProps) {
  return (
    <Form method="post">
      <input type="hidden" name="_action" value={action} />
      <input type="hidden" name="targetId" value={targetId} />
      {reactionType && !isActive && (
        <input type="hidden" name="type" value={reactionType} />
      )}

      <button
        type="submit"
        className={`flex items-center space-x-2 px-4 py-2 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 ${
          isActive ? colorClasses.active : colorClasses.inactive
        }`}
      >
        <Icon className="h-5 w-5" />
        <span className="font-medium">{label}</span>
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
}