// app/components/courses/CourseActions.tsx
import { useState } from 'react';
import { Form, Link } from '@remix-run/react';
import { Edit, Trash2, Eye, EyeOff, MoreVertical, Settings, BarChart3 } from 'lucide-react';
import { Course } from '~/api/types/course.types';

interface CourseActionsProps {
  course: Course;
  isSubmitting?: boolean;
  variant?: 'dropdown' | 'inline' | 'buttons';
  showToggleActive?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  showView?: boolean;
  showAnalytics?: boolean;
  onDeleteClick?: () => void;
}

export function CourseActions({
  course,
  isSubmitting = false,
  variant = 'inline',
  showToggleActive = true,
  showEdit = true,
  showDelete = true,
  showView = true,
  showAnalytics = false,
  onDeleteClick
}: CourseActionsProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  const actions = [
    {
      type: 'view',
      show: showView,
      icon: Eye,
      label: 'Ver',
      to: `/courses/${course.id}`,
      className: 'text-blue-600 hover:text-blue-900'
    },
    {
      type: 'edit',
      show: showEdit,
      icon: Edit,
      label: 'Editar',
      to: `/courses/${course.id}/edit`,
      className: 'text-gray-600 hover:text-gray-900'
    },
    {
      type: 'analytics',
      show: showAnalytics,
      icon: BarChart3,
      label: 'Analíticas',
      to: `/courses/${course.id}/analytics`,
      className: 'text-purple-600 hover:text-purple-900'
    }
  ];

  if (variant === 'dropdown') {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <MoreVertical className="h-4 w-4" />
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200/50 py-2 z-10">
            {actions.map((action) => 
              action.show && action.to ? (
                <Link
                  key={action.type}
                  to={action.to}
                  className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowDropdown(false)}
                >
                  <action.icon className="h-4 w-4" />
                  <span>{action.label}</span>
                </Link>
              ) : null
            )}

            {showToggleActive && (
              <Form method="post" className="block">
                <input type="hidden" name="_action" value="toggle-active" />
                <input type="hidden" name="courseId" value={course.id} />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left disabled:opacity-50"
                  onClick={() => setShowDropdown(false)}
                >
                  {course.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span>{course.isActive ? 'Desactivar' : 'Activar'}</span>
                </button>
              </Form>
            )}

            {showDelete && (
              <button
                onClick={() => {
                  setShowDropdown(false);
                  onDeleteClick?.();
                }}
                className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
              >
                <Trash2 className="h-4 w-4" />
                <span>Eliminar</span>
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  if (variant === 'buttons') {
    return (
      <div className="flex items-center space-x-2">
        {actions.map((action) => 
          action.show && action.to ? (
            <Link
              key={action.type}
              to={action.to}
              className={`p-2 rounded-lg transition-colors hover:bg-gray-100 ${action.className}`}
              title={action.label}
            >
              <action.icon className="h-4 w-4" />
            </Link>
          ) : null
        )}

        {showToggleActive && (
          <Form method="post" className="inline">
            <input type="hidden" name="_action" value="toggle-active" />
            <input type="hidden" name="courseId" value={course.id} />
            <button
              type="submit"
              disabled={isSubmitting}
              className={`p-2 rounded-lg transition-colors hover:bg-gray-100 disabled:opacity-50 ${
                course.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
              }`}
              title={course.isActive ? 'Desactivar' : 'Activar'}
            >
              {course.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </Form>
        )}

        {showDelete && (
          <button
            onClick={onDeleteClick}
            className="p-2 rounded-lg transition-colors hover:bg-gray-100 text-red-600 hover:text-red-900"
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }

  // inline variant (default)
  return (
    <div className="flex items-center space-x-2">
      {actions.map((action) => 
        action.show && action.to ? (
          <Link
            key={action.type}
            to={action.to}
            className={`${action.className} transition-colors`}
          >
            <action.icon className="h-4 w-4" />
          </Link>
        ) : null
      )}

      {showToggleActive && (
        <Form method="post" className="inline">
          <input type="hidden" name="_action" value="toggle-active" />
          <input type="hidden" name="courseId" value={course.id} />
          <button
            type="submit"
            disabled={isSubmitting}
            className={`transition-colors disabled:opacity-50 ${
              course.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
            }`}
          >
            {course.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </Form>
      )}

      {showDelete && (
        <button
          onClick={onDeleteClick}
          className="text-red-600 hover:text-red-900 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}