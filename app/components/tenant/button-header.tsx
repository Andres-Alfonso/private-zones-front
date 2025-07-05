// components/NavTabs.js
import React from 'react';
import { NavLink } from 'react-router-dom';

const NavTabs = ({ items }) => {
  return (
    <div className="flex items-center space-x-2">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/80 hover:shadow-md hover:scale-105 backdrop-blur-sm border border-gray-200/50'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            <span className="hidden sm:block">{item.name}</span>
          </NavLink>
        );
      })}
    </div>
  );
};

export default NavTabs;
