
import React from 'react';
import { AICodingEffect } from './AICodingEffect';

interface LoadingSpinnerProps {
  message?: string;
  isOverlay?: boolean;
  userPrompt?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = "Loading...", isOverlay = false, userPrompt }) => {
  const spinnerContent = (
    <div className="flex flex-col justify-center items-center space-y-4 p-6 sm:p-8 bg-surface-1 border border-outline-variant rounded-xl shadow-lg max-w-md w-full">
      <div className="flex items-center space-x-3">
        <svg className="animate-spin h-8 w-8 sm:h-10 sm:w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-base sm:text-lg font-medium text-text-primary">{message}</span>
      </div>
      {isOverlay && (
        <div className="mt-4 w-full">
          <AICodingEffect isActive={true} userPrompt={userPrompt} />
        </div>
      )}
    </div>
  );

  if (isOverlay) {
    return (
      <div 
        className="fixed inset-0 z-50 flex justify-center items-center bg-bg-main/70 backdrop-blur-sm p-4"
        role="status" 
        aria-live="polite"
        aria-label={message}
      >
        {spinnerContent}
      </div>
    );
  }

  return (
     <div className="flex justify-center items-center p-8" role="status" aria-live="polite">
       {spinnerContent}
     </div>
  );
};
