

import React from 'react';
import type { GeneratedFile } from '../types';

interface DownloadButtonsProps {
  appName: string;
  files: GeneratedFile[];
}

export const DownloadButtons: React.FC<DownloadButtonsProps> = ({ appName, files }) => {
  const safeAppName = appName.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'generated_project';
  
  const handleDownloadZip = async () => {
    const JSZip = (window as any).JSZip;
    if (!JSZip) {
      alert("JSZip library not found. Please ensure it's loaded to download as ZIP.");
      return;
    }
    if (!files || files.length === 0) {
      alert("No files to download.");
      return;
    }

    const zip = new JSZip();
    files.forEach(file => {
      zip.file(file.path, file.content);
    });

    try {
        const content = await zip.generateAsync({ type: "blob" });
        const element = document.createElement('a');
        const url = URL.createObjectURL(content);
        element.setAttribute('href', url);
        element.setAttribute('download', `${safeAppName}.zip`);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Error generating ZIP:", error);
        alert(`Error generating ZIP file: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const buttonClass = "flex-1 w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface-1 transition-all duration-150 ease-in-out border bg-secondary-container text-on-secondary-container hover:bg-opacity-80 border-transparent disabled:opacity-60";

  return (
    <div className="flex flex-wrap gap-2">
       <button
        onClick={handleDownloadZip}
        className={buttonClass}
        title="Download all project files as .zip"
        disabled={!files || files.length === 0}
      >
        <span className="material-symbols-outlined text-lg mr-1.5 leading-none">folder_zip</span>
        Download Project ZIP
      </button>
    </div>
  );
};
