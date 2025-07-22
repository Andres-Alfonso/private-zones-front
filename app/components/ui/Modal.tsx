// components/ui/Modal.tsx
import React, { useEffect } from "react";
import { createPortal } from "react-dom";

export default function Modal({ title, children, isOpen, onClose }: {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}) {
  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-[95vw] h-[95vh] p-8 relative flex flex-col max-w-4xl">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl z-10 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          onClick={onClose}
        >
          ✕
        </button>
        <h3 className="text-2xl font-bold mb-6 pr-8">{title}</h3>
        <div className="flex-1 overflow-y-auto text-sm text-gray-700 space-y-2">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}