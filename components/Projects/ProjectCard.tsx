

import React from 'react';
import type { Project } from '../../types';

interface ProjectCardProps {
  project: Project;
  onLoad: (projectId: string) => void;
  onDelete: (projectId: string) => void;
  isLoading: boolean;
  isSelected: boolean;
  onToggleSelect: () => void;
  theme?: 'pixel' | 'terminal' | 'binary';
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onLoad, onDelete, isLoading, isSelected, onToggleSelect, theme = 'pixel' }) => {
  const formattedDate = new Date(project.lastSaved).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const handleLoad = () => {
    if (!isLoading) onLoad(project.id);
  };

  const handleDelete = () => {
    if (!isLoading && window.confirm(`Are you sure you want to delete project "${project.appName}"? This cannot be undone.`)) {
      onDelete(project.id);
    }
  };
  
  const isMonospaceTheme = theme === 'terminal' || theme === 'binary';
  const buttonBaseClass = `flex items-center justify-center px-4 py-2 text-xs font-medium rounded-full focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-surface-1 transition-colors duration-150 disabled:opacity-60 ${!isMonospaceTheme ? 'shadow-sm' : ''}`;
  const cardBaseClass = `bg-surface-1 border rounded-lg p-4 transition-all duration-200 flex items-center space-x-3 ${!isMonospaceTheme ? 'shadow-md hover:shadow-lg' : 'hover:bg-surface-2'}`;
  const selectedCardClass = isSelected ? "border-primary bg-primary-container/30" : "border-outline-variant";

  return (
    <div className={`${cardBaseClass} ${selectedCardClass}`}>
      <div className="flex-shrink-0">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          disabled={isLoading}
          className="h-5 w-5 accent-primary bg-surface-2 border-outline rounded-sm focus:ring-primary focus:ring-2 focus:ring-offset-1 focus:ring-offset-surface-1 disabled:opacity-60 cursor-pointer"
          aria-label={`Select project ${project.appName} for mixing`}
        />
      </div>
      <div className="flex-grow min-w-0">
        <h3 className="text-lg font-semibold text-text-primary truncate" title={project.appName}>
          {project.appName}
        </h3>
        <p className="text-xs text-text-secondary truncate mt-0.5" title={project.appDescription}>
          {project.appDescription || "No description"}
        </p>
        <p className="text-xs text-placeholder mt-1">
          Last Saved: {formattedDate} <span className="mx-1">&bull;</span> Mode: {project.creationMode}
        </p>
      </div>
      <div className="flex-shrink-0 flex items-center space-x-2">
        <button 
          onClick={handleLoad} 
          disabled={isLoading}
          className={`${buttonBaseClass} bg-primary hover:bg-opacity-90 text-on-primary focus:ring-primary`}
          aria-label={`Load project ${project.appName}`}
        >
          <span className="material-symbols-outlined text-base mr-1.5 leading-none">file_open</span> Load
        </button>
        <button 
          onClick={handleDelete} 
          disabled={isLoading}
          className={`${buttonBaseClass} bg-error-container hover:bg-opacity-80 text-on-error-container focus:ring-error`}
          aria-label={`Delete project ${project.appName}`}
        >
          <span className="material-symbols-outlined text-base mr-1.5 leading-none">delete</span> Delete
        </button>
      </div>
    </div>
  );
};