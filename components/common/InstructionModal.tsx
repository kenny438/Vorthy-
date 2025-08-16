

import React from 'react';

interface InstructionModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}

export const InstructionModal: React.FC<InstructionModalProps> = ({ title, children, onClose }) => {
  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose} 
      role="dialog"
      aria-modal="true"
      aria-labelledby="instruction-modal-title"
    >
      <div 
        className="bg-surface-3 border border-outline-variant rounded-2xl shadow-xl max-w-lg w-full p-6 sm:p-8 text-left relative"
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="flex justify-between items-start mb-4">
          <h2 id="instruction-modal-title" className="text-xl sm:text-2xl font-semibold text-text-primary">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-text-secondary hover:text-text-primary rounded-full hover:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface-3"
            aria-label="Close instructions"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-outline-variant scrollbar-track-transparent text-text-secondary text-sm space-y-3">
            {children}
        </div>

        <div className="mt-6 sm:mt-8 text-right">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-primary text-on-primary font-medium text-sm sm:text-base rounded-full shadow-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface-3 transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};
