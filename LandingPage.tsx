import React, { useState, useEffect, useRef } from 'react';
import type { UploadedFile, CreationMode, Project, AIProvider, AIProviderModel } from '../types';
import { FileInputButton } from './common/FileInputButton';
import { ErrorMessage } from './common/ErrorMessage';
import { ProjectsList } from './Projects/ProjectsList'; 
import { PromptInputWithModelSelector } from './common/PromptInputWithModelSelector';

type Theme = 'pixel' | 'terminal' | 'binary';

const TerminalLogo: React.FC = () => {
    const asciiLogo = `
* Welcome to Vortex Code research preview!
▗▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▖
▐█                                                                            █▌
▐█      ██╗   ██╗ ██████╗ ██████╗ ████████╗██╗  ██╗██╗   ██╗                  █▌
▐█      ██║   ██║██╔═══██╗██╔══██╗╚══██╔══╝██║  ██║╚██╗ ██╔╝                  █▌
▐█      ██║   ██║██║   ██║██████╔╝   ██║   ███████║ ╚████╔╝                   █▌
▐█      ╚██╗ ██╔╝██║   ██║██╔══██╗   ██║   ██╔══██║  ╚██╔╝                    █▌
▐█       ╚████╔╝ ╚██████╔╝██║  ██║   ██║   ██║  ██║   ██║                     █▌
▐█        ╚═══╝   ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝   ╚═╝                     █▌
▐█                                                                            █▌
▐█  AI-Powered Generation. From idea to reality, instantly.                     █▌
▐▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▌
`;
    return (
        <pre className="text-primary font-mono text-xs sm:text-sm leading-tight text-center select-none">
            {asciiLogo}
        </pre>
    );
};

const PixelLogo: React.FC = () => {
     return (
        <div className="flex flex-col items-center">
            <h1 className="text-6xl sm:text-7xl font-bold text-text-primary tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Vortex</h1>
            <p className="text-sm text-text-secondary mt-2">AI-Powered Generation. From idea to reality, instantly.</p>
        </div>
    );
}


interface LandingPageProps {
  theme: Theme;
  onGenerate: (description: string) => void;
  isLoading: boolean;
  initialError?: string | null;
  uploadedFile: UploadedFile | null;
  onFileUpload: (file: File) => void;
  onFileRemove: () => void;
  browserInspirationUrl: string | null;
  onSetBrowserInspiration: (url: string | null) => void;
  figmaInspiration: string | null;
  onSetFigmaInspiration: (description: string | null) => void;
  creationMode: CreationMode;
  onSetCreationMode: (mode: CreationMode) => void;
  savedProjects: Project[];
  onLoadProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  selectedProjectIdsForMixing: string[];
  onToggleProjectSelectionForMixing: (projectId: string) => void;
  onMixProjects: () => void;
  aiProvider: AIProvider;
  currentModelId: AIProviderModel;
  onSelectModel: (provider: AIProvider, modelId: AIProviderModel) => void;
  onEnhancePrompt: (originalPrompt: string, mode: CreationMode) => Promise<string>;
  isPlanModeEnabled: boolean;
  onTogglePlanMode: () => void;
  onStartVisualBuild: () => void;
}

const creationModeOptions: { mode: CreationMode; label: string; icon: string; placeholder: string }[] = [
  { mode: 'app', label: 'App', icon: 'apps', placeholder: "Describe the application you want to build..." },
  { mode: 'component', label: 'Component', icon: 'widgets', placeholder: "Describe a UI component (e.g., 'a login form with validation')..." },
  { mode: 'animation', label: 'Animation', icon: 'animation', placeholder: "Describe an animation (e.g., 'a bouncing ball using GSAP')... or use /gsap <idea>" },
  { mode: 'landing_page', label: 'Landing Page', icon: 'web', placeholder: "Describe your landing page (e.g., 'for a new SaaS product')..." },
  { mode: 'interactive_element', label: 'Interactive', icon: 'touch_app', placeholder: "Describe an interactive element (e.g., 'a draggable color picker')..." },
  { mode: 'data_viz', label: 'Data Viz', icon: 'monitoring', placeholder: "Describe a data visualization (e.g., 'a bar chart of user signups')..." },
];

export const LandingPage: React.FC<LandingPageProps> = ({ 
  theme, onGenerate, isLoading, initialError,
  uploadedFile, onFileUpload, onFileRemove,
  browserInspirationUrl, onSetBrowserInspiration,
  figmaInspiration, onSetFigmaInspiration,
  creationMode, onSetCreationMode,
  savedProjects, onLoadProject, onDeleteProject,
  selectedProjectIdsForMixing, onToggleProjectSelectionForMixing, onMixProjects,
  aiProvider, currentModelId, onSelectModel, onEnhancePrompt,
  isPlanModeEnabled, onTogglePlanMode, onStartVisualBuild
}) => {
  const [showProjects, setShowProjects] = useState<boolean>(true);
  const isMonospaceTheme = theme === 'terminal' || theme === 'binary';
  
  const currentModePlaceholder = creationModeOptions.find(opt => opt.mode === creationMode)?.placeholder || "Describe what you want to create...";
  const mainPlaceholder = `${currentModePlaceholder} You can also use /scrap <url> <idea> or /gsap <animation idea>`;

  const getChipButtonClasses = (isActive: boolean) => {
    const base = "flex items-center px-4 py-2 text-sm font-medium rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-main focus:ring-primary transition-all duration-150 disabled:opacity-60";
    if (isMonospaceTheme) {
        return `${base} border ${isActive ? 'bg-primary-container/50 text-on-primary-container border-primary' : 'bg-transparent text-text-secondary hover:bg-surface-3 border-outline-variant'}`;
    }
    return `${base} shadow-sm ${isActive ? 'bg-primary-container text-on-primary-container border border-primary-container' : 'bg-surface-2 text-text-secondary hover:bg-surface-3 border border-outline-variant'}`;
  };

  const mixButtonClass = isMonospaceTheme
    ? "flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-primary bg-transparent hover:bg-primary-container border border-primary rounded-lg shadow-none focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg-main transition-all duration-150 disabled:opacity-70 disabled:cursor-not-allowed"
    : "flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-on-primary bg-primary hover:bg-opacity-90 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg-main transition-all duration-150 disabled:opacity-70 disabled:cursor-not-allowed";

  const handleLaunchWebBrowser = () => {
    const url = window.prompt("Enter the URL of the website for inspiration:", browserInspirationUrl || "https://");
    if (url !== null) { 
        onSetBrowserInspiration(url.trim() ? url.trim() : null);
        if (url.trim()) window.open(url.trim(), '_blank');
    }
  };

  const handleLaunchFigmaImport = () => {
    const figmaDesc = window.prompt("Enter the public Figma share URL or a detailed description of your Figma design:", figmaInspiration || "");
     if (figmaDesc !== null) { 
        onSetFigmaInspiration(figmaDesc.trim() ? figmaDesc.trim() : null);
    }
  };


  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 pt-12 sm:pt-16 md:pt-20 pb-20 text-center relative overflow-y-auto bg-bg-main">
      
      <header className="mb-8 md:mb-12 z-10">
        {isMonospaceTheme ? <TerminalLogo /> : <PixelLogo />}
      </header>

      <main className="w-full max-w-xl md:max-w-2xl lg:max-w-3xl z-10 flex flex-col items-center space-y-6">
        <PromptInputWithModelSelector
          onSubmit={onGenerate}
          isLoading={isLoading}
          placeholder={mainPlaceholder}
          currentProvider={aiProvider}
          currentModelId={currentModelId}
          onSelectModel={onSelectModel}
          onTextAreaPaste={onFileUpload}
          creationMode={creationMode}
          onEnhancePrompt={onEnhancePrompt}
        />
        
        <div className="w-full flex flex-col items-start space-y-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <FileInputButton 
                  uploadedFile={uploadedFile}
                  onFileUpload={onFileUpload}
                  onFileRemove={onFileRemove}
                  isLoading={isLoading}
                  label="Attach"
                  theme={theme}
              />
              <button
                  type="button"
                  onClick={handleLaunchWebBrowser}
                  disabled={isLoading}
                  className={getChipButtonClasses(!!browserInspirationUrl)}
                  title="Set website URL for inspiration"
                >
                  <span className="material-symbols-outlined text-xl mr-1.5 leading-none">public</span>
                  <span className="hidden sm:inline">Browser</span>
                   <span className="sm:hidden">Web</span>
                </button>
               <button
                  type="button"
                  onClick={handleLaunchFigmaImport}
                  disabled={isLoading}
                  className={getChipButtonClasses(!!figmaInspiration)}
                  title="Set Figma design URL or description"
                >
                  <span className="material-symbols-outlined text-xl mr-1.5 leading-none">stylus_note</span>
                  <span className="hidden sm:inline">Figma</span>
                </button>
          </div>

          {(browserInspirationUrl || figmaInspiration) && (
            <div className="flex flex-wrap gap-2 text-xs">
              {browserInspirationUrl && (
                <div className="flex items-center bg-primary-container text-on-primary-container px-3 py-1.5 rounded-full border border-primary-container/80">
                  <span className="material-symbols-outlined text-base mr-1">public</span>
                  <span className="truncate max-w-[150px] sm:max-w-[200px]">{browserInspirationUrl}</span>
                  <button onClick={() => onSetBrowserInspiration(null)} className="ml-1.5 p-0.5 rounded-full hover:bg-black/10"><span className="material-symbols-outlined text-sm">close</span></button>
                </div>
              )}
              {figmaInspiration && (
                <div className="flex items-center bg-primary-container text-on-primary-container px-3 py-1.5 rounded-full border border-primary-container/80">
                   <span className="material-symbols-outlined text-base mr-1">stylus_note</span>
                   <span className="truncate max-w-[150px] sm:max-w-[200px]">{figmaInspiration}</span>
                  <button onClick={() => onSetFigmaInspiration(null)} className="ml-1.5 p-0.5 rounded-full hover:bg-black/10"><span className="material-symbols-outlined text-sm">close</span></button>
                </div>
              )}
            </div>
          )}

          <div className="pt-1 w-full space-y-3">
             <div className="flex items-center space-x-6">
                <label htmlFor="plan-mode-toggle" className="flex items-center cursor-pointer select-none">
                  <span className="text-sm text-text-secondary mr-3">Plan Mode</span>
                  <div className="relative">
                    <input type="checkbox" id="plan-mode-toggle" className="sr-only" checked={isPlanModeEnabled} onChange={onTogglePlanMode} disabled={isLoading} />
                    <div className={`block w-12 h-6 rounded-full transition-colors ${isPlanModeEnabled ? 'bg-primary' : 'bg-surface-3'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-on-primary w-4 h-4 rounded-full transition-transform ${isPlanModeEnabled ? 'translate-x-6' : ''}`}></div>
                  </div>
                </label>
             </div>
             <p className="text-left text-xs text-placeholder">
                {isPlanModeEnabled && "First, generate a blueprint. Then, build the app. "}
             </p>
             
             <div className="flex items-center pt-2">
              <span className="text-sm text-text-secondary mr-2">Build Mode:</span>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {creationModeOptions.map(opt => (
                <button
                  key={opt.mode}
                  type="button"
                  onClick={() => onSetCreationMode(opt.mode)}
                  disabled={isLoading}
                  className={getChipButtonClasses(creationMode === opt.mode)}
                  title={`Set creation mode to: ${opt.label}`}
                >
                  <span className="material-symbols-outlined text-xl mr-1.5 leading-none">{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

         {initialError && !isLoading && (
          <div className="mt-4 w-full max-w-full">
            <ErrorMessage message={initialError} onClose={() => { /* This should be handled by App.tsx */ }} />
          </div>
        )}
        <p className="mt-4 text-xs text-placeholder/80">
          Tip: Use <code className="bg-surface-2 text-text-secondary px-1 py-0.5 rounded-sm text-xs">/scrap &lt;url&gt; &lt;idea&gt;</code> or <code className="bg-surface-2 text-text-secondary px-1 py-0.5 rounded-sm text-xs">/gsap &lt;animation idea&gt;</code>. You can also paste images into the text area.
        </p>
      </main>

      <div className="my-6 text-center w-full max-w-3xl z-10">
        <div className="flex items-center">
            <div className="flex-grow border-t border-outline-variant"></div>
            <span className="flex-shrink mx-4 text-sm text-text-secondary">OR</span>
            <div className="flex-grow border-t border-outline-variant"></div>
        </div>
        <button 
            onClick={onStartVisualBuild} 
            disabled={isLoading} 
            className="mt-6 group inline-flex flex-col items-center justify-center px-8 py-4 text-base font-semibold bg-secondary-container text-on-secondary-container rounded-2xl shadow-lg border-2 border-transparent hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg-main transition-all duration-200 ease-in-out transform hover:-translate-y-1 disabled:opacity-60 disabled:cursor-not-allowed"
        >
            <div className="flex items-center">
                <span className="material-symbols-outlined text-3xl mr-3 text-primary group-hover:animate-pulse">hub</span>
                <span>Launch Visual Builder</span>
            </div>
            <span className="text-xs font-normal text-on-secondary-container/80 mt-1">Visually design your app with nodes, like Scratch but for apps.</span>
        </button>
      </div>


      <section className="mt-8 md:mt-12 w-full max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-5xl z-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-text-primary">My Projects</h2>
          <div className="flex items-center space-x-3">
            {selectedProjectIdsForMixing.length >= 2 && (
              <button
                onClick={onMixProjects}
                disabled={isLoading}
                className={mixButtonClass}
                title="Combine selected projects into a new one"
              >
                <span className="material-symbols-outlined text-xl mr-1.5 leading-none">model_training</span>
                Mix Selected ({selectedProjectIdsForMixing.length})
              </button>
            )}
            {savedProjects.length > 0 && (
              <button 
                onClick={() => setShowProjects(!showProjects)}
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                {showProjects ? 'Hide Projects' : 'Show Projects'}
              </button>
            )}
          </div>
        </div>
        {showProjects && (
          <ProjectsList 
            projects={savedProjects}
            onLoadProject={onLoadProject}
            onDeleteProject={onDeleteProject}
            isLoading={isLoading}
            selectedProjectIdsForMixing={selectedProjectIdsForMixing}
            onToggleProjectSelectionForMixing={onToggleProjectSelectionForMixing}
            theme={theme}
          />
        )}
      </section>

    </div>
  );
};
