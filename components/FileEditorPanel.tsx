

import React, { useState, useEffect } from 'react';

interface FileEditorPanelProps {
  filePath: string;
  initialContent: string;
  onContentChange: (newContent: string) => void;
  onUpdatePreview: () => void;
  disabled?: boolean;
}

export const FileEditorPanel: React.FC<FileEditorPanelProps> = ({ 
    filePath, initialContent, onContentChange, onUpdatePreview, disabled 
}) => {
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent, filePath]); 

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    onContentChange(e.target.value); 
  };
  
  let language = 'text';
  if (filePath.endsWith('.html')) language = 'html';
  else if (filePath.endsWith('.css')) language = 'css';
  else if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) language = 'javascript';
  else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) language = 'typescript';
  else if (filePath.endsWith('.json')) language = 'json';
  else if (filePath.endsWith('.md')) language = 'markdown';

  return (
    <div className="flex flex-col h-full space-y-2 flex-grow min-h-0">
      <div className="flex justify-between items-center">
        <p className="text-xs text-text-secondary truncate" title={filePath}>
          Editing: <span className="font-medium text-text-primary">{filePath}</span> 
        </p>
        <span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container rounded-full text-xxs font-medium">{language.toUpperCase()}</span>
      </div>
      <textarea
        value={content}
        onChange={handleTextChange}
        className="w-full flex-grow p-2.5 border border-code-border rounded-md font-mono text-xs bg-code-bg text-code-text placeholder-placeholder focus:ring-1 focus:ring-primary focus:border-primary scrollbar-thin scrollbar-thumb-code-border scrollbar-track-transparent resize-none"
        aria-label={`Code editor for ${filePath}`}
        spellCheck="false"
        disabled={disabled}
      />
      <button
        onClick={onUpdatePreview}
        disabled={disabled}
        className="w-full mt-auto px-4 py-2.5 text-sm font-semibold bg-primary hover:bg-opacity-90 text-on-primary rounded-full shadow-md transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface-1 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        Update Preview with Manual Edits
      </button>
    </div>
  );
};
