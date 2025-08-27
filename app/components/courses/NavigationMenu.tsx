import { NavLink } from 'react-router-dom';

const NavigationMenu = ({ course, className = "" }) => {
  const menuItems = [
    { name: 'Contenidos', route: `/contents/course/${course?.id}`, isActive: () => location.pathname.startsWith('/contents/course/') },
    { name: 'Foros', route: `/forums/course/${course?.id}`, isActive: () => location.pathname.startsWith('/forums/courses/') },
    { name: 'Tareas', route: `/tasks/course/${course?.id}`, isActive: () => location.pathname.startsWith('/tasks/courses/') },
    { name: 'Evaluaciones', route: `/evaluations/course/${course?.id}`, isActive: () => location.pathname.startsWith('/evaluations/courses/') },
    { name: 'Actividades Didácticas', route: `/activities/course/${course?.id}`, isActive: () => location.pathname.startsWith('/activities/courses/') },
    { name: 'Módulos', route: `/make/courses/${course?.id || ''}`, isActive: () => location.pathname.startsWith('/make/courses/') || location.pathname.startsWith('/modules/course/') },
    { name: 'Métricas', route: `/analysis/course/${course?.id}`, isActive: () => location.pathname.startsWith('/analysis/courses/') },
    { name: 'Permisos', route: `/permits/course/${course?.id}`, isActive: () => location.pathname.startsWith('/permits/courses/') }
  ];

  return (
    <nav className={`relative z-10 container mx-auto px-4 ${className}`}>
      <ul className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3 md:gap-4 pb-4">
        {menuItems.map((item, index) => (
          <li key={index} className="col-span-1">
            <NavLink 
              to={item.route}
              className={() => 
                `block w-full text-center font-semibold border-2 rounded-3xl px-3 py-2.5 text-sm
                 transform transition-all duration-300 ease-in-out
                 active:scale-95 
                 focus:outline-none focus:ring-4 focus:ring-blue-400/50 focus:ring-offset-2
                 backdrop-blur-md no-underline ${
                   item.isActive?.() || false
                     ? 'text-white bg-gradient-to-r from-blue-600 to-blue-700 border-blue-600 shadow-xl shadow-blue-600/30 scale-105' 
                     : 'text-gray-700 bg-white/95 border-gray-300 shadow-md hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/20 hover:scale-105 hover:-translate-y-1'
                 }`
              }
            >
              {item.name}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default NavigationMenu;