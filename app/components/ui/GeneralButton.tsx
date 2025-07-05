// components/ui/GeneralButton.js
import React from 'react';

const GeneralButton = ({ icon: Icon, children, className = '', ...props }) => {
  return (
    <button
      className={`flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors ${className}`}
      {...props}
    >
      {Icon && <Icon className="h-4 w-4" />}
      <span>{children}</span>
    </button>
  );
};

export default GeneralButton;
