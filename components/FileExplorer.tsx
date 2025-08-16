

import React from 'react';
import type { GeneratedFile } from '../types';

interface FileExplorerProps {
  files: GeneratedFile[];
  selectedFilePath: string;
  onSelectFile: (filePath: string) => void;
}

const getFileIconName = (filePath: string): string => {
  if (filePath.endsWith('.html') || filePath.endsWith('.htm')) return 'code'; 
  if (filePath.endsWith('.css')) return 'css'; 
  if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) return 'javascript'; 
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) return 'javascript'; // No specific TSX icon, JS is close
  if (filePath.endsWith('.json')) return 'data_object'; 
  if (filePath.endsWith('.svg')) return 'image'; 
  if (filePath.endsWith('.png') || filePath.endsWith('.jpg') || filePath.endsWith('.jpeg') || filePath.endsWith('.gif') || filePath.endsWith('.webp')) return 'image'; 
  if (filePath.endsWith('.mp4') || filePath.endsWith('.webm') || filePath.endsWith('.mov')) return 'videocam';
  if (filePath.endsWith('.md')) return 'article';
  // Check for common directory structures
  if (filePath.includes('/components/') || filePath.includes('/src/') || filePath.includes('/public/')) {
    // Basic heuristic: if it doesn't have a common file extension and is in a path, might be a folder context
    // Though this component lists files not folders.
  }
  return 'draft'; // Default icon
};

export const FileExplorer: React.FC<FileExplorerProps> = ({ files, selectedFilePath, onSelectFile }) => {
  if (!files || files.length === 0) {
    return <p className="text-xs text-placeholder p-2">No files in project.</p>;
  }

  const sortedFiles = [...files].sort((a, b) => a.path.localeCompare(b.path));

  return (
    <div className="h-48 max-h-64 overflow-y-auto bg-surface-2 border border-outline-variant rounded-md p-1.5 space-y-0.5 scrollbar-thin scrollbar-thumb-outline-variant scrollbar-track-transparent">
      {sortedFiles.map((file) => (
        <button
          key={file.path}
          onClick={() => onSelectFile(file.path)}
          className={`w-full text-left px-2 py-1.5 text-xs rounded-sm flex items-center
            ${selectedFilePath === file.path 
              ? 'bg-primary text-on-primary' 
              : 'text-text-secondary hover:bg-surface-3 hover:text-text-primary'}
            focus:outline-none focus:ring-1 focus:ring-primary transition-colors duration-100`}
          title={file.path}
        >
          <span className="material-symbols-outlined text-lg mr-1.5 leading-none">{getFileIconName(file.path)}</span>
          <span className="truncate">{file.path.split('/').pop() || file.path}</span>
        </button>
      ))}
    </div>
  );
};
