






import React, { useState, useEffect, useCallback } from 'react';
import { AppPreview } from './AppPreview';
import { FileExplorer } from './FileExplorer';
import { FileEditorPanel } from './FileEditorPanel';
import { DownloadButtons } from './DownloadButtons';
import { TerminalOutput } from './TerminalOutput'; 
import { FileInputButton } from './common/FileInputButton';
import { PromptInputWithModelSelector } from './common/PromptInputWithModelSelector';
import type { GeneratedFile, TerminalMessage, DeviceView as DeviceViewType, UploadedFile, CreationMode, AIProvider, AIProviderModel } from '../types';

type Theme = 'pixel' | 'terminal' | 'binary';

interface IterationViewProps {
  theme: Theme;
  appName: string;
  appDescription: string;
  files: GeneratedFile[];
  entryPoint: string;
  onFileContentChange: (filePath: string, newContent: string) => void;
  onModify: (instruction: string) => void;
  onUpdatePreview: () => void;
  onStartOver: () => void;
  isLoading: boolean;
  previewKey: number;
  terminalMessages: TerminalMessage[];
  onClearTerminal: () => void;
  uploadedFile: UploadedFile | null;
  onFileUpload: (file: File) => void;
  onFileRemove: () => void;
  browserInspirationUrl: string | null;
  onSetBrowserInspiration: (url: string | null) => void;
  figmaInspiration: string | null;
  onSetFigmaInspiration: (description: string | null) => void;
  creationMode: CreationMode;
  onSetCreationMode: (mode: CreationMode) => void;
  aiProvider: AIProvider;
  currentModelId: AIProviderModel;
  onSelectModel: (provider: AIProvider, modelId: AIProviderModel) => void;
  onEnhancePrompt: (originalPrompt: string, mode: CreationMode) => Promise<string>;
  isAgentModeEnabled: boolean;
  onToggleAgentMode: () => void;
}

const creationModeOptionsList: { mode: CreationMode; label: string; shortLabel: string; icon: string; placeholder: string }[] = [
  { mode: 'app', label: 'App', shortLabel: 'App', icon: 'apps', placeholder: "Describe changes to your app..." },
  { mode: 'component', label: 'Component', shortLabel: 'Comp', icon: 'widgets', placeholder: "Refine this UI component..." },
  { mode: 'animation', label: 'Animation', shortLabel: 'Anim', icon: 'animation', placeholder: "Modify the animation..." },
  { mode: 'landing_page', label: 'Landing Page', shortLabel: 'Page', icon: 'web', placeholder: "Adjust the landing page sections..." },
  { mode: 'interactive_element', label: 'Interactive', shortLabel: 'Interact', icon: 'touch_app', placeholder: "Change this interactive element..." },
  { mode: 'data_viz', label: 'Data Viz', shortLabel: 'Viz', icon: 'monitoring', placeholder: "Update the data visualization..." },
];

export const IterationView: React.FC<IterationViewProps> = (props) => {
  const {
    theme, appName, appDescription, files, entryPoint,
    onFileContentChange, onModify, onUpdatePreview, onStartOver,
    isLoading, previewKey, terminalMessages, onClearTerminal,
    uploadedFile, onFileUpload, onFileRemove,
    browserInspirationUrl, onSetBrowserInspiration,
    figmaInspiration, onSetFigmaInspiration,
    creationMode, onSetCreationMode,
    aiProvider, currentModelId, onSelectModel,
    onEnhancePrompt
  } = props;

  const [isCodePanelVisible, setIsCodePanelVisible] = useState(true);
  const [deviceView, setDeviceView] = useState<DeviceViewType>('desktop');
  const [isTerminalVisible, setIsTerminalVisible] = useState(false);
  const [selectedFilePath, setSelectedFilePath] = useState<string>(entryPoint);
  const isMonospaceTheme = theme === 'terminal' || theme === 'binary';

  useEffect(() => {
    if (files.find(f => f.path === entryPoint)) {
        setSelectedFilePath(entryPoint);
    } else if (files.length > 0) {
        setSelectedFilePath(files[0].path);
    } else {
        setSelectedFilePath(''); 
    }
  }, [files, entryPoint]);
  
  const selectedFile = files.find(f => f.path === selectedFilePath);

  const deviceToggleButtons: { name: DeviceViewType; label: string; icon: string }[] = [
    { name: 'desktop', label: 'Desktop', icon: 'desktop_windows' }, 
    { name: 'tv', label: 'TV', icon: 'tv' }, 
    { name: 'tablet', label: 'Tablet', icon: 'tablet_mac' }, 
    { name: 'phone', label: 'Phone', icon: 'smartphone' },
  ];

  const getIconButtonClasses = (isActive: boolean) => {
    const base = "p-2.5 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-1 focus:ring-primary transition-colors duration-150 disabled:opacity-60";
    if (isMonospaceTheme) {
        return `${base} ${isActive ? 'bg-primary-container text-on-primary-container' : 'bg-surface-2 text-text-secondary hover:bg-surface-3'}`;
    }
    return `${base} ${isActive ? 'bg-primary-container text-on-primary-container' : 'bg-surface-2 text-text-secondary hover:bg-surface-3 shadow-sm'}`;
  };
  
  const getHeaderButtonClasses = (variant: 'default' | 'danger') => {
      const base = "flex items-center justify-center px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-1 transition-all duration-150 disabled:opacity-60";
      if (isMonospaceTheme) {
          if(variant === 'danger') return `${base} rounded-lg bg-error-container hover:opacity-80 text-on-error-container focus:ring-error border border-error-container`;
          return `${base} rounded-lg bg-surface-2 hover:bg-surface-3 text-text-secondary border border-outline-variant focus:ring-primary`;
      }
      if(variant === 'danger') return `${base} rounded-full bg-error-container hover:opacity-80 text-on-error-container focus:ring-error shadow-sm`;
      return `${base} rounded-full bg-surface-2 hover:bg-surface-3 text-text-secondary shadow-sm focus:ring-primary`;
  }

  const getChipButtonClasses = (isActive: boolean) => {
      const base = `flex items-center px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-transparent focus:ring-primary transition-all duration-150 disabled:opacity-60`;
      if (isMonospaceTheme) {
          return `${base} rounded-full border ${isActive ? 'bg-primary-container/50 text-on-primary-container border-primary' : 'bg-transparent text-text-secondary hover:bg-surface-3 border-outline-variant'}`;
      }
      return `${base} rounded-full shadow-sm ${isActive ? 'bg-primary-container text-on-primary-container border-primary-container' : 'bg-surface-2 text-text-secondary hover:bg-surface-3 border-outline-variant'} border`;
  };

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
  
  const currentChatPlaceholder = creationModeOptionsList.find(opt => opt.mode === creationMode)?.placeholder || `Tell AI what to change for your ${creationMode}...`;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-bg-main text-text-primary"> 
      <header className="py-3 px-4 sm:px-6 bg-surface-1 sticky top-0 z-30 print:hidden flex-shrink-0 border-b border-outline-variant">
        <div className="max-w-full mx-auto flex justify-between items-center">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary truncate" title={appName}>
              {appName || "My AI App"}
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary truncate max-w-md sm:max-w-lg md:max-w-xl" title={appDescription}>
              {appDescription || "Iterate and refine your AI-generated application."} <span className="hidden md:inline">- Using: {aiProvider.toUpperCase()}</span>
            </p>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            <button onClick={() => setIsTerminalVisible(!isTerminalVisible)} className={getIconButtonClasses(isTerminalVisible)} title={isTerminalVisible ? 'Hide Terminal' : 'Show Terminal'}> <span className="material-symbols-outlined">terminal</span> </button>
            <button onClick={() => setIsCodePanelVisible(!isCodePanelVisible)} className={getHeaderButtonClasses('default')}> <span className="material-symbols-outlined text-lg mr-1.5">{isCodePanelVisible ? 'visibility_off' : 'code'}</span> {isCodePanelVisible ? 'Hide' : 'View'} Code </button>
            <button onClick={onStartOver} disabled={isLoading} className={getHeaderButtonClasses('danger')} title="Start over with a new app idea"> <span className="material-symbols-outlined text-lg mr-1.5">restart_alt</span> Start Over </button>
          </div>
        </div>
      </header>
      
      <div className="flex-shrink-0 py-2 px-4 sm:px-6 bg-surface-1 border-b border-outline-variant flex items-center justify-center space-x-1 sm:space-x-2 print:hidden">
        {deviceToggleButtons.map(device => (
          <button key={device.name} onClick={() => setDeviceView(device.name)} title={`View as ${device.label}`} className={getIconButtonClasses(deviceView === device.name)}> <span className="material-symbols-outlined">{device.icon}</span> </button>
        ))}
      </div>

      <main className="flex-grow flex flex-row gap-4 p-4 sm:p-6 max-w-full overflow-hidden min-h-0">
        <section className={`transition-all duration-300 ease-in-out ${isCodePanelVisible ? 'w-full md:w-3/4 lg:w-2/3 xl:w-3/5' : 'w-full'} h-full rounded-lg shadow-md overflow-hidden bg-surface-1 border border-outline-variant flex flex-col justify-center items-center p-0 md:p-1`}>
          {files.length > 0 && entryPoint ? (
            <AppPreview key={previewKey} files={files} entryPoint={entryPoint} deviceView={deviceView} />
          ) : (
            <div className="text-center text-text-secondary p-8">
              <p>No project files loaded or entry point missing.</p>
              <p className="text-sm">Try generating a new app or loading a project.</p>
            </div>
          )}
        </section>

        {isCodePanelVisible && (
          <section className="w-full md:w-1/4 lg:w-1/3 xl:w-2/5 h-full flex flex-col space-y-3 overflow-hidden">
            
            <div className="flex-grow bg-surface-1 rounded-lg p-3 space-y-3 border border-outline-variant shadow-md flex flex-col overflow-hidden min-h-0">
              <FileExplorer files={files} selectedFilePath={selectedFilePath} onSelectFile={setSelectedFilePath} />
              {selectedFile ? (
                <FileEditorPanel
                  key={selectedFile.path}
                  filePath={selectedFile.path}
                  initialContent={selectedFile.content}
                  onContentChange={(newContent) => onFileContentChange(selectedFile.path, newContent)}
                  onUpdatePreview={onUpdatePreview}
                  disabled={isLoading}
                />
              ) : (
                <div className="flex-grow flex items-center justify-center text-center text-sm text-text-secondary p-4">
                  <p>Select a file from the explorer to view or edit its content.</p>
                </div>
              )}
            </div>

            <div className="flex-shrink-0 flex flex-col space-y-3">
               <PromptInputWithModelSelector
                  onSubmit={onModify}
                  isLoading={isLoading}
                  placeholder={currentChatPlaceholder}
                  currentProvider={aiProvider}
                  currentModelId={currentModelId}
                  onSelectModel={onSelectModel}
                  onTextAreaPaste={onFileUpload}
                  textAreaRows={2}
                  creationMode={creationMode}
                  onEnhancePrompt={onEnhancePrompt}
              />
              <div className="flex flex-wrap items-center gap-2 justify-between">
                  <div className="flex items-center gap-2">
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
                          <span className="material-symbols-outlined text-base mr-1 leading-none">public</span>
                          Web
                      </button>
                  </div>
                  <div className="flex items-center gap-2">
                      <DownloadButtons appName={appName} files={files} />
                  </div>
              </div>
            </div>
          </section>
        )}
      </main>
      
      <TerminalOutput messages={terminalMessages} onClear={onClearTerminal} isVisible={isTerminalVisible} />
    </div>
  );
};