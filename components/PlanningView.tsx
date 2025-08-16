

import React from 'react';
import type { CreationMode } from '../types';
import { creationModeToLabel } from '../types';
import { MarkdownRenderer } from './common/MarkdownRenderer';

type Theme = 'pixel' | 'terminal' | 'binary';

interface PlanningViewProps {
  theme: Theme;
  plan: string;
  onAccept: () => void;
  onDecline: () => void;
  onCancel: () => void;
  originalPrompt: string;
  creationMode: CreationMode;
}

export const PlanningView: React.FC<PlanningViewProps> = ({ 
  theme, plan, onAccept, onDecline, onCancel, originalPrompt, creationMode 
}) => {
  const isMonospaceTheme = theme === 'terminal' || theme === 'binary';

  const getButtonClass = (variant: 'primary' | 'secondary' | 'danger') => {
    let styles = "w-full sm:w-auto flex items-center justify-center px-6 py-3 text-base font-semibold rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-main transition-all duration-150 disabled:opacity-60 ";

    if (isMonospaceTheme) {
       styles += `border-2 rounded-lg `;
        switch(variant) {
            case 'primary': return styles + `bg-primary text-on-primary border-primary hover:bg-opacity-90`;
            case 'secondary': return styles + `bg-surface-3 text-text-primary border-outline-variant hover:bg-surface-2`;
            case 'danger': return styles + `bg-transparent text-error border-error hover:bg-error-container`;
        }
    } else {
        styles += `shadow-md hover:shadow-lg `;
         switch(variant) {
            case 'primary': return styles + `bg-primary text-on-primary hover:bg-opacity-90 focus:ring-primary`;
            case 'secondary': return styles + `bg-secondary-container text-on-secondary-container hover:bg-opacity-80 focus:ring-secondary`;
            case 'danger': return styles + `bg-surface-3 text-text-secondary hover:bg-error-container hover:text-on-error-container focus:ring-error`;
        }
    }
    return styles;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-main p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl bg-surface-1 rounded-2xl shadow-xl border border-outline-variant overflow-hidden flex flex-col">
        
        <header className="p-5 sm:p-6 border-b border-outline-variant">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Project Blueprint</h1>
          <p className="text-sm text-text-secondary mt-1">
            The AI has generated a plan for your <span className="font-semibold">{creationModeToLabel(creationMode)}</span> based on your prompt: 
            <em className="truncate"> "{originalPrompt.substring(0, 80)}..."</em>
          </p>
        </header>

        <main className="flex-grow p-5 sm:p-6 overflow-y-auto max-h-[60vh] scrollbar-thin scrollbar-thumb-outline-variant scrollbar-track-transparent">
            <MarkdownRenderer markdown={plan} />
        </main>
        
        <footer className="p-5 sm:p-6 bg-surface-2 border-t border-outline-variant">
            <p className="text-center text-text-secondary text-base mb-4">How would you like to proceed?</p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <button onClick={onCancel} className={getButtonClass('danger')}>
                    <span className="material-symbols-outlined mr-2">cancel</span>
                    Cancel & Start Over
                </button>
                 <button onClick={onDecline} className={getButtonClass('secondary')}>
                    <span className="material-symbols-outlined mr-2">fast_rewind</span>
                    Decline & Build from Prompt
                </button>
                <button onClick={onAccept} className={getButtonClass('primary')}>
                    <span className="material-symbols-outlined mr-2">rocket_launch</span>
                    Accept & Build from Plan
                </button>
            </div>
        </footer>
      </div>
    </div>
  );
};