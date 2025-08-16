
import React, { useState, useEffect, useRef } from 'react';
import type { AIProvider, AIProviderModel, CreationMode } from '../../types';
import { ModelSelectorDropdown } from './ModelSelectorDropdown';

interface PromptInputWithModelSelectorProps {
  onSubmit: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
  initialValue?: string;
  currentProvider: AIProvider;
  currentModelId: AIProviderModel;
  onSelectModel: (provider: AIProvider, modelId: AIProviderModel) => void;
  onTextAreaPaste?: (file: File) => void; 
  textAreaRows?: number;
  creationMode: CreationMode;
  onEnhancePrompt: (originalPrompt: string, mode: CreationMode) => Promise<string>;
}

export const PromptInputWithModelSelector: React.FC<PromptInputWithModelSelectorProps> = ({
  onSubmit,
  isLoading,
  placeholder,
  initialValue = '',
  currentProvider,
  currentModelId,
  onSelectModel,
  onTextAreaPaste,
  textAreaRows = 4,
  creationMode,
  onEnhancePrompt,
}) => {
  const [message, setMessage] = useState(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);

  useEffect(() => {
    setMessage(initialValue);
  }, [initialValue]);

  const canSubmit = !isLoading && !isEnhancing && message.trim().length > 0;

  const doSubmit = () => {
    if (canSubmit) {
      onSubmit(message.trim());
      // Optionally clear message: setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Ctrl+Enter or Cmd+Enter
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        if (canSubmit) {
            e.preventDefault();
            doSubmit();
        }
    }
  };

  const handleEnhanceClick = async () => {
    if (!message.trim() || isLoading || isEnhancing) return;
    setIsEnhancing(true);
    try {
      const enhancedPrompt = await onEnhancePrompt(message, creationMode);
      setMessage(enhancedPrompt);
    } catch (error) {
      // Error is handled globally by App.tsx's error state
      console.error("Prompt enhancement failed in component:", error);
    } finally {
      setIsEnhancing(false);
    }
  };

  // Auto-resize textarea height
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; 
      textarea.style.height = `${textarea.scrollHeight}px`; 
    }
  }, [message, textAreaRows]);

  // Paste handling for images
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea || !onTextAreaPaste) return;

    const handlePaste = (event: ClipboardEvent) => {
      if (isLoading) return;
      const items = event.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const file = items[i].getAsFile();
            if (file) {
              onTextAreaPaste(file);
              event.preventDefault(); 
              break; 
            }
          }
        }
      }
    };
    textarea.addEventListener('paste', handlePaste);
    return () => textarea.removeEventListener('paste', handlePaste);
  }, [onTextAreaPaste, isLoading]);

  const controlButtonClass = "p-2 sm:p-2.5 rounded-lg text-on-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface-1 disabled:opacity-60 disabled:cursor-not-allowed transition-all";

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="w-full bg-surface-1 rounded-2xl shadow-lg border border-outline-variant/50 p-3 sm:p-4 space-y-3"
    >
      <div className="flex justify-end items-center space-x-2">
        <button
            type="button"
            onClick={handleEnhanceClick}
            disabled={isLoading || isEnhancing || !message.trim()}
            className={`${controlButtonClass} bg-secondary hover:bg-opacity-90`}
            title="Enhance prompt with AI"
            aria-label="Enhance prompt"
        >
            {isEnhancing ? (
                <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : (
                <span className="material-symbols-outlined text-base sm:text-xl leading-none">auto_fix_high</span>
            )}
        </button>
        <ModelSelectorDropdown
          currentProvider={currentProvider}
          currentModelId={currentModelId}
          onSelectModel={onSelectModel}
          disabled={isLoading || isEnhancing}
        />
        <button
          type="button"
          onClick={doSubmit}
          disabled={!canSubmit}
          className={`${controlButtonClass} bg-primary hover:bg-opacity-90`}
          aria-label="Send prompt"
          title="Submit (Ctrl+Enter or ⌘+Enter)"
        >
          {isLoading && !isEnhancing ? ( // Show main loading spinner only if not enhancing
            <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <span className="material-symbols-outlined text-base sm:text-xl leading-none">arrow_upward</span>
          )}
        </button>
      </div>
      <textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || "How can I help you today?"}
        rows={textAreaRows}
        className="w-full text-sm md:text-base bg-transparent text-text-primary placeholder-placeholder border-none focus:ring-0 focus:outline-none resize-none overflow-y-hidden scrollbar-thin scrollbar-thumb-outline-variant scrollbar-track-transparent"
        disabled={isLoading || isEnhancing}
        aria-label="Prompt input"
      />
       <div className="text-right text-xs text-placeholder -mt-2 pr-1">
        Ctrl+Enter or ⌘+Enter to send
      </div>
    </form>
  );
};
