import { NavLink } from 'react-router-dom';
import { BookOpen, MessageSquare, FileText, ClipboardCheck, Sparkles, Layers, BarChart3, Shield } from 'lucide-react';

const NavigationMenu = ({ course, className = "" }) => {
  const menuItems = [
    { name: 'Contenidos', route: `/contents/course/${course?.id}`, icon: BookOpen, isActive: () => location.pathname.startsWith('/contents/course/') },
    { name: 'Foros', route: `/forums/course/${course?.id}`, icon: MessageSquare, isActive: () => location.pathname.startsWith('/forums/course/') },
    { name: 'Tareas', route: `/tasks/courses/${course?.id}`, icon: FileText, isActive: () => location.pathname.startsWith('/tasks/courses/') },
    { name: 'Evaluaciones', route: `/assessments/course/${course?.id}`, icon: ClipboardCheck, isActive: () => location.pathname.startsWith('/assessments/course/') },
    { name: 'Actividades', route: `/activities/course/${course?.id}`, icon: Sparkles, isActive: () => location.pathname.startsWith('/activities/courses/') },
    { name: 'Módulos', route: `/make/courses/${course?.id || ''}`, icon: Layers, isActive: () => location.pathname.startsWith('/make/courses/') || location.pathname.startsWith('/modules/course/') },
    { name: 'Métricas', route: `/analysis/course/${course?.id}`, icon: BarChart3, isActive: () => location.pathname.startsWith('/analysis/courses/') },
    { name: 'Permisos', route: `/permits/course/${course?.id}`, icon: Shield, isActive: () => location.pathname.startsWith('/permits/courses/') }
  ];

  return (
    <nav className={`relative z-10 mx-auto ${className}`}>
      <div className="bg-white shadow-md border-b-4 border-gray-300 py-4 px-6">
        <ul className="flex flex-wrap justify-center gap-3">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = item.isActive?.() || false;
            
            return (
              <li key={index}>
                <NavLink 
                  to={item.route}
                  className={`
                    inline-flex items-center gap-2
                    px-5 py-2.5 rounded-full
                    text-sm font-medium
                    transition-all duration-200 ease-out
                    no-underline
                    ${isActive 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-600 shadow-sm'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default NavigationMenu;