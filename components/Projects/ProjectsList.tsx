

import React from 'react';
import type { Project, CreationMode } from '../../types';
import { ProjectCard } from './ProjectCard';

interface ProjectsListProps {
  projects: Project[];
  onLoadProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  isLoading: boolean;
  selectedProjectIdsForMixing: string[];
  onToggleProjectSelectionForMixing: (projectId: string) => void;
  theme?: 'pixel' | 'terminal' | 'binary';
}

const projectFolders: { mode: CreationMode; displayName: string }[] = [
  { mode: 'app', displayName: 'Full Applications' },
  { mode: 'landing_page', displayName: 'Landing Pages' },
  { mode: 'component', displayName: 'UI Components' },
  { mode: 'animation', displayName: 'Animations' },
  { mode: 'interactive_element', displayName: 'Interactive Elements' },
  { mode: 'data_viz', displayName: 'Data Visualizations' },
];

export const ProjectsList: React.FC<ProjectsListProps> = ({ 
  projects, 
  onLoadProject, 
  onDeleteProject, 
  isLoading,
  selectedProjectIdsForMixing,
  onToggleProjectSelectionForMixing,
  theme = 'pixel'
}) => {
  if (projects.length === 0) {
    return (
      <div className="text-center py-8 px-4 bg-surface-2 rounded-lg border border-outline-variant shadow-sm">
        <span className="material-symbols-outlined text-4xl text-placeholder mb-3">folder_off</span>
        <p className="text-text-secondary text-sm">No projects saved yet.</p>
        <p className="text-xs text-placeholder mt-1">Create an app, and it will appear here!</p>
      </div>
    );
  }

  let hasRenderedAnyProject = false;

  return (
    <div className="space-y-6">
      {projectFolders.map(folder => {
        const projectsInFolder = projects
          .filter(p => p.creationMode === folder.mode)
          .sort((a, b) => new Date(b.lastSaved).getTime() - new Date(a.lastSaved).getTime());

        if (projectsInFolder.length > 0) {
          hasRenderedAnyProject = true;
          return (
            <div key={folder.mode}>
              <h3 className="text-xl font-semibold text-text-primary mb-3 pt-2 border-t border-outline-variant first-of-type:border-t-0 first-of-type:pt-0">
                {folder.displayName}
              </h3>
              <div className="space-y-3">
                {projectsInFolder.map(project => (
                  <ProjectCard 
                    key={project.id}
                    project={project}
                    onLoad={onLoadProject}
                    onDelete={onDeleteProject}
                    isLoading={isLoading}
                    isSelected={selectedProjectIdsForMixing.includes(project.id)}
                    onToggleSelect={() => onToggleProjectSelectionForMixing(project.id)}
                    theme={theme}
                  />
                ))}
              </div>
            </div>
          );
        }
        return null;
      })}
      {!hasRenderedAnyProject && projects.length > 0 && (
         <div className="text-center py-8 px-4 bg-surface-2 rounded-lg border border-outline-variant shadow-sm">
            <span className="material-symbols-outlined text-4xl text-placeholder mb-3">info</span>
            <p className="text-text-secondary text-sm">No projects match the defined categories, but projects exist.</p>
            <p className="text-xs text-placeholder mt-1">Check project creation modes if this is unexpected.</p>
        </div>
      )}
    </div>
  );
};