

import React, { useRef } from 'react';
import type { UploadedFile } from '../../types';

interface FileInputButtonProps {
  onFileUpload: (file: File) => void;
  onFileRemove: () => void;
  uploadedFile: UploadedFile | null;
  isLoading: boolean;
  acceptedFileTypes?: string;
  label?: string;
  theme?: 'pixel' | 'terminal' | 'binary';
}

export const FileInputButton: React.FC<FileInputButtonProps> = ({ 
  onFileUpload, 
  onFileRemove, 
  uploadedFile, 
  isLoading, 
  acceptedFileTypes = "image/*,video/*,application/zip,application/x-zip-compressed,.zip", 
  label = "Attach File",
  theme = 'pixel'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  const isMonospaceTheme = theme === 'terminal' || theme === 'binary';
  const chipButtonClass = isMonospaceTheme
    ? "flex items-center px-3 py-1.5 text-xs font-medium rounded-full border border-outline-variant bg-transparent text-text-secondary hover:bg-surface-3 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-transparent focus:ring-primary transition-all duration-150 disabled:opacity-60"
    : "flex items-center px-3 py-1.5 text-xs font-medium rounded-full shadow-sm bg-secondary-container text-on-secondary-container hover:bg-opacity-80 border border-transparent focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-transparent focus:ring-primary transition-all duration-150 disabled:opacity-60";


  return (
    <div className="flex flex-col items-start space-y-2">
      {!uploadedFile && (
        <button
          type="button"
          onClick={triggerFileInput}
          disabled={isLoading}
          className={chipButtonClass}
          title="Attach an image, video, or .zip file"
        >
          <span className="material-symbols-outlined text-base sm:text-lg mr-1.5 leading-none">attach_file</span>
          {label}
        </button>
      )}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept={acceptedFileTypes}
        disabled={isLoading}
      />
      {uploadedFile && (
        <div className="flex items-center space-x-2 p-2 bg-surface-2 rounded-lg border border-outline-variant max-w-xs shadow-sm">
          {(uploadedFile.mimeType.startsWith('image/') && uploadedFile.dataURL) && (
            <img 
              src={uploadedFile.dataURL} 
              alt={uploadedFile.name} 
              className="w-10 h-10 object-cover rounded-md border border-outline-variant" 
            />
          )}
          {(!uploadedFile.mimeType.startsWith('image/') || !uploadedFile.dataURL) && ( 
             <div className="w-10 h-10 flex items-center justify-center bg-surface-3 rounded-md border border-outline-variant">
                <span className="material-symbols-outlined text-2xl text-text-secondary">draft</span>
             </div>
          )}
          <div className="flex-grow min-w-0">
            <p className="text-xs text-text-primary truncate" title={uploadedFile.name}>{uploadedFile.name}</p>
            <p className="text-xs text-text-secondary">{uploadedFile.mimeType.split('/')[1]?.toUpperCase() || uploadedFile.mimeType}</p>
          </div>
          <button
            type="button"
            onClick={onFileRemove}
            disabled={isLoading}
            className="p-1.5 text-text-secondary hover:text-error rounded-full hover:bg-error-container/30 focus:outline-none focus:ring-1 focus:ring-error disabled:opacity-60 transition-colors"
            title="Remove attached file"
          >
            <span className="material-symbols-outlined text-lg leading-none">delete</span>
          </button>
        </div>
      )}
    </div>
  );
};