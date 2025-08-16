
import React from 'react';

interface ErrorMessageProps {
  message: string;
  onClose?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onClose }) => {
  return (
    <div 
      className="bg-error-container text-on-error-container p-4 rounded-lg shadow-md border-l-4 border-error flex justify-between items-start" 
      role="alert"
    >
      <div className="flex items-center">
        <span className="material-symbols-outlined text-error mr-3 text-2xl">error</span>
        <div>
          <p className="font-semibold">Error</p>
          <p className="text-sm">{message}</p>
        </div>
      </div>
      {onClose && (
        <button 
          onClick={onClose} 
          className="ml-4 p-1 text-on-error-container hover:bg-black/10 rounded-full"
          aria-label="Close error message"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>
      )}
    </div>
  );
};
